const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Member = require('../models/Member');
const { formatResponse, formatError } = require('../utils/responseFormatter');
const { fetchAndCompressImage } = require('../utils/imageUtils');
const { verifyGoogleIdToken } = require('../utils/prepareGoogleClient');
const { registerAdminAccount, ServiceError, issueAdminSession, applyGoogleProfile } = require('../services/adminAuthService');

exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    
    let payload;
    
    // Check if this is a demo token (development only)
    const isDemoToken = token && token.includes('demo-signature-not-real');
    const isDevelopment = process.env.NODE_ENV !== 'production';
    
    if (isDemoToken && isDevelopment) {
      console.log('[GoogleAuth] Processing demo token (development only)');
      
      // Decode the fake JWT token manually
      try {
        const parts = token.split('.');
        if (parts.length !== 3) {
          throw new Error('Invalid demo token format');
        }
        
        // Decode the payload (second part)
        const decodedPayload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        payload = decodedPayload;
        console.log('[GoogleAuth] Demo token payload:', payload);
      } catch (decodeError) {
        console.error('[GoogleAuth] Failed to decode demo token:', decodeError);
        throw new Error('Invalid demo token');
      }
    } else {
      payload = await verifyGoogleIdToken(token);
    }
    
    const { sub: googleId, email, name, picture, given_name, family_name, email_verified, locale, hd } = payload;

    // Find or create user
    let user = await User.findOne({ googleId });
    
    if (!user) {
      // Check if admin flow (no organization code means admin portal)
      const isAdminFlow = !req.body.code && !req.body.organizationCode;

      if (isAdminFlow) {
        try {
          // Use breweryName from request body if provided, otherwise derive from Google profile
          const breweryName = req.body.breweryName || payload.name || (payload.hd ? payload.hd.split('.')[0] : email.split('@')[0]);
          const qrCode = req.body.qrCode || null;
          
          const { payload: registrationPayload, message } = await registerAdminAccount({
            breweryName,
            email,
            password: null,
            qrCode,
            googleProfile: payload
          });

          return res.status(201).json(formatResponse({
            data: registrationPayload,
            message
          }));
        } catch (err) {
          if (err instanceof ServiceError) {
            return res.status(err.status).json(formatError(err.message, err.meta));
          }
          console.error('[GoogleAuth] Admin registration via Google failed:', err);
          return res.status(500).json(formatError('Failed to complete Google registration'));
        }
      }

      // Member flow: fall back to existing behavior
      user = await User.findOne({ email });

      if (user) {
        // Link Google account to existing user
        user.googleId = googleId;
        user.picture = picture;
        await user.save();
      } else {
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
      applyGoogleProfile(user, payload);
      await user.save();
    } catch (e) {
      console.error('[GoogleAuth] Failed to persist SSO profile:', e);
    }

    // Ensure membership exists for this organization
    const organizationCode = req.body.code || req.body.organizationCode;
    console.log('[GoogleAuth] Incoming organizationCode:', organizationCode);
    let member = null;
    if (organizationCode) {
      // Find organization by code (case-insensitive exact match)
      const Organization = require('../models/Organization');
      const escaped = String(organizationCode).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const codeRegex = new RegExp(`^${escaped}$`, 'i');
      const organization = await Organization.findOne({ code: codeRegex });
      console.log('[GoogleAuth] Organization lookup by code result:', organization ? organization._id : 'not-found');
      
      if (!organization) {
        return res.status(404).json(
          formatError('Organization not found')
        );
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

    // Admin login flow (no organization code present)
    if (!organizationCode) {
      try {
        const sessionPayload = await issueAdminSession(user);
        return res.json(formatResponse({
          success: true,
          message: 'Login successful',
          data: sessionPayload
        }));
      } catch (err) {
        console.error('[GoogleAuth] Admin session issuance failed:', err);
        return res.status(500).json(formatError('Failed to create session'));
      }
    }

    // Member login response remains the same
    const sessionPayload = await issueAdminSession(user);

    res.json(
      formatResponse({
        success: true,
        message: 'Login successful',
        data: {
          token: sessionPayload.token,
          refreshToken: sessionPayload.refreshToken,
          refreshTokenExpiresAt: sessionPayload.refreshTokenExpiresAt,
          user: sessionPayload.user,
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
