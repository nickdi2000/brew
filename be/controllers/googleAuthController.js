const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Member = require('../models/Member');
const { formatResponse, formatError } = require('../utils/responseFormatter');
const { fetchAndCompressImage } = require('../utils/imageUtils');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    
    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture, given_name, family_name, email_verified, locale, hd } = payload;

    // Find or create user
    let user = await User.findOne({ googleId });
    
    if (!user) {
      // Check if user exists with same email
      user = await User.findOne({ email });
      
      if (user) {
        // Link Google account to existing user
        user.googleId = googleId;
        user.picture = picture;
        await user.save();
      } else {
        // Create new user
        const names = name.split(' ');
        user = await User.create({
          email,
          googleId,
          picture,
          firstName: names[0],
          lastName: names.slice(1).join(' ') || '',
          organizations: []
        });
      }
    }

    // Update SSO profile details
    try {
      user.sso = user.sso || {};
      user.sso.provider = 'google';
      user.sso.google = {
        id: googleId,
        email,
        name,
        givenName: given_name || user.firstName || null,
        familyName: family_name || user.lastName || null,
        picture: picture || user.picture || null,
        emailVerified: typeof email_verified === 'boolean' ? email_verified : null,
        locale: locale || null,
        hd: hd || null,
        raw: payload || null
      };
      user.sso.linkedAt = user.sso.linkedAt || new Date();
      user.sso.lastLoginAt = new Date();
      await user.save();
    } catch (e) {
      console.error('[GoogleAuth] Failed to persist SSO profile:', e);
    }

    // Ensure membership exists for this organization
    const organizationCode = req.body.organizationCode;
    console.log('[GoogleAuth] Incoming organizationCode:', organizationCode);
    let member = null;
    if (organizationCode) {
      // Find organization by code
      const Organization = require('../models/Organization');
      const organization = await Organization.findOne({ code: organizationCode });
      console.log('[GoogleAuth] Organization lookup by code result:', organization ? organization._id : 'not-found');
      
      if (!organization) {
        throw new Error('Organization not found');
      }

      // Link org on user for convenience
      if (!user.organizations.includes(organization._id)) {
        user.organizations.push(organization._id);
        await user.save();
      }

      // Create/find member record
      member = await Member.findOne({ user: user._id, organization: organization._id });
      if (!member) {
        console.log('[GoogleAuth] Creating new membership for user/org:', user._id.toString(), organization._id.toString());
        
        // Process avatar if available
        let avatar = null;
        if (picture) {
          try {
            avatar = await fetchAndCompressImage(picture);
            console.log('[GoogleAuth] Successfully processed avatar');
          } catch (err) {
            console.error('[GoogleAuth] Failed to process avatar:', err);
          }
        }

        member = await Member.create({ 
          user: user._id, 
          organization: organization._id, 
          role: 'member',
          avatar 
        });
      } else {
        console.log('[GoogleAuth] Existing membership found:', member._id.toString());
        
        // Update avatar if not present
        if (!member.avatar && picture) {
          try {
            const avatar = await fetchAndCompressImage(picture);
            if (avatar) {
              member.avatar = avatar;
              await member.save();
              console.log('[GoogleAuth] Updated existing member with avatar');
            }
          } catch (err) {
            console.error('[GoogleAuth] Failed to update avatar:', err);
          }
        }
      }
    }

    // Generate JWT token
    const authToken = jwt.sign(
      { 
        userId: user._id.toString(), // Ensure userId is a string
        email: user.email,
        organizations: user.organizations.map(id => id.toString()) // Convert ObjectIds to strings
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('[GoogleAuth] Login success. Returning membership:', member ? member._id.toString() : null);
    res.json(
      formatResponse({
        success: true,
        message: 'Login successful',
        data: {
          token: authToken,
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            picture: user.picture,
            organizations: user.organizations,
            sso: user.sso ? {
              provider: user.sso.provider,
              google: user.sso.google ? {
                id: user.sso.google.id,
                email: user.sso.google.email,
                name: user.sso.google.name,
                picture: user.sso.google.picture
              } : null,
              linkedAt: user.sso.linkedAt,
              lastLoginAt: user.sso.lastLoginAt
            } : null
          },
          membership: member ? {
            id: member._id,
            organization: member.organization,
            role: member.role,
            status: member.status,
            points: member.points
          } : null
        }
      })
    );
  } catch (error) {
    console.error('Google login error:', error);
    res.status(401).json(
      formatError('Authentication failed')
    );
  }
};
