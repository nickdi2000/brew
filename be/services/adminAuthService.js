const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const User = require('../models/User');
const Organization = require('../models/Organization');
const QRCode = require('../models/QRCode');
const Reward = require('../models/Reward');

class ServiceError extends Error {
  constructor(message, status = 400, meta = null) {
    super(message);
    this.status = status;
    this.meta = meta;
  }
}

const sanitizeOrganization = (organization) => {
  if (!organization) {
    return null;
  }

  return {
    id: organization._id,
    name: organization.name,
    code: organization.code,
    description: organization.description
  };
};

const sanitizeDefaultQRCode = (qrCode) => {
  if (!qrCode) {
    return null;
  }

  return {
    id: qrCode._id,
    code: qrCode.code,
    name: qrCode.name,
    points: qrCode.points
  };
};

const sanitizeDefaultReward = (reward) => {
  if (!reward) {
    return null;
  }

  return {
    id: reward._id,
    name: reward.name,
    description: reward.description,
    pointsCost: reward.pointsCost
  };
};

const sanitizeUser = (user) => {
  const organizations = Array.isArray(user.organizations)
    ? user.organizations.map((org) => ({
        id: org._id || org,
        name: org.name || undefined
      }))
    : [];

  return {
    id: user._id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    isAdmin: user.isAdmin,
    organizations,
    sso: user.sso || null
  };
};

const generateRandomPassword = () => crypto.randomBytes(16).toString('hex');

const generateQRCodeString = () => crypto.randomBytes(4).toString('hex').toUpperCase();

const createDefaultQRCode = async (organizationId, organizationName, overrideCode = null) => {
  try {
    const qrCode = await QRCode.create({
      organization: organizationId,
      code: overrideCode || generateQRCodeString(),
      name: 'Earn 100 Points!',
      points: 100,
      isActive: true,
      expiresAt: null
    });
    console.log(`✅ Created default QR code for ${organizationName}:`, qrCode.code);
    return qrCode;
  } catch (error) {
    console.error(`❌ Failed to create default QR code for ${organizationName}:`, error);
    return null;
  }
};

const createDefaultReward = async (organizationId, organizationName) => {
  try {
    const reward = await Reward.create({
      name: 'Free Drink!',
      description: 'Redeem 1000 points for a free drink reward!',
      pointsCost: 1000,
      type: 'product',
      imageUrl: 'https://brewtokens.com/images/brewery-beers-coins.png',
      isActive: true,
      organizationId,
      redemptionInstructions: 'Show this reward to the staff to redeem.',
      termsAndConditions: 'No cash value. Cannot be combined with other offers.'
    });
    console.log(`✅ Created default reward for ${organizationName}`);
    return reward;
  } catch (error) {
    console.error(`❌ Failed to create default reward for ${organizationName}:`, error);
    return null;
  }
};

const generateOrganizationCode = async () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const maxAttempts = 10;
  let attempts = 0;

  while (attempts < maxAttempts) {
    let code = '';
    for (let i = 0; i < 6; i += 1) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const existing = await Organization.findOne({ code }).lean();
    if (!existing) {
      return code;
    }

    attempts += 1;
  }

  throw new ServiceError('Failed to generate unique organization code', 500);
};

const createOrganizationWithDefaults = async ({ breweryName, email, qrCode }) => {
  const code = await generateOrganizationCode();

  console.log(`Generated organization code: ${code}`);

  const organization = await Organization.create({
    name: breweryName,
    email,
    description: `${breweryName} - A cool brewery, if I've ever seen one`,
    code
  });

  console.log(`✅ Created organization: ${organization.name} with code: ${organization.code}`);

  const defaultQRCode = await createDefaultQRCode(organization._id, organization.name, qrCode || undefined);
  const defaultReward = await createDefaultReward(organization._id, organization.name);

  return { organization, defaultQRCode, defaultReward };
};

const applyGoogleProfile = (user, payload) => {
  if (!payload) {
    return;
  }

  user.googleId = payload.sub;
  user.picture = payload.picture || user.picture;
  user.firstName = user.firstName || payload.given_name || payload.name?.split(' ')?.[0] || user.firstName;
  user.lastName = user.lastName || payload.family_name || payload.name?.split(' ')?.slice(1).join(' ') || user.lastName;

  user.sso = user.sso || {};
  user.sso.provider = 'google';
  user.sso.google = {
    id: payload.sub,
    email: payload.email,
    name: payload.name,
    givenName: payload.given_name || null,
    familyName: payload.family_name || null,
    picture: payload.picture || null,
    emailVerified: typeof payload.email_verified === 'boolean' ? payload.email_verified : null,
    locale: payload.locale || null,
    hd: payload.hd || null,
    raw: payload
  };
  user.sso.linkedAt = user.sso.linkedAt || new Date();
  user.sso.lastLoginAt = new Date();
};

const issueAuthTokens = async (user) => {
  await user.populate('organizations');

  const organizations = Array.isArray(user.organizations) ? user.organizations : [];
  const primaryOrganizationId = organizations.length > 0
    ? (organizations[0]._id || organizations[0])
    : null;

  const organizationIds = organizations.map((org) => org._id || org);

  const token = jwt.sign(
    {
      userId: user._id,
      email: user.email,
      isAdmin: user.isAdmin,
      organization: primaryOrganizationId,
      organizations: organizationIds
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  const refreshToken = jwt.sign(
    { userId: user._id },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  const refreshTokenExpiresAt = new Date();
  refreshTokenExpiresAt.setDate(refreshTokenExpiresAt.getDate() + 7);

  user.refreshToken = refreshToken;
  user.refreshTokenExpiresAt = refreshTokenExpiresAt;
  await user.save();

  return {
    token,
    refreshToken,
    refreshTokenExpiresAt,
    organizationId: primaryOrganizationId
  };
};

const buildRegistrationMessage = (defaultQRCode, defaultReward) => {
  const hasQR = Boolean(defaultQRCode);
  const hasReward = Boolean(defaultReward);

  const qrMessage = hasQR ? 'Your first QR code has been created' : '';
  const rewardMessage = hasReward ? 'a "Free Point!" reward is ready for your members' : '';

  if (!hasQR && !hasReward) {
    return 'Registration successful! Welcome to BrewTokens!';
  }

  if (hasQR && hasReward) {
    return `Registration successful! Welcome to BrewTokens! ${qrMessage} and ${rewardMessage}.`;
  }

  return `Registration successful! Welcome to BrewTokens! ${qrMessage || rewardMessage}.`;
};

const registerAdminAccount = async ({ breweryName, email, password, qrCode, googleProfile }) => {
  if (!breweryName) {
    throw new ServiceError('Brewery name is required');
  }
  if (!email) {
    throw new ServiceError('Email is required');
  }

  const normalizedEmail = email.toLowerCase();

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new ServiceError('A user with this email already exists');
  }

  const existingOrganization = await Organization.findOne({ name: breweryName });
  if (existingOrganization) {
    throw new ServiceError('A brewery with this name already exists');
  }

  const { organization, defaultQRCode, defaultReward } = await createOrganizationWithDefaults({
    breweryName,
    email: normalizedEmail,
    qrCode
  });

  const user = new User({
    email: normalizedEmail,
    password: password || generateRandomPassword(),
    firstName: breweryName.split(' ')[0],
    lastName: 'Admin',
    isAdmin: true,
    organizations: [organization._id]
  });

  if (googleProfile) {
    applyGoogleProfile(user, googleProfile);
  }

  await user.save();

  const authTokens = await issueAuthTokens(user);

  const payload = {
    ...authTokens,
    user: sanitizeUser(user),
    organization: sanitizeOrganization(organization),
    defaultQRCode: sanitizeDefaultQRCode(defaultQRCode),
    defaultReward: sanitizeDefaultReward(defaultReward)
  };

  const message = buildRegistrationMessage(defaultQRCode, defaultReward);

  return { payload, message };
};

const issueAdminSession = async (user) => {
  const authTokens = await issueAuthTokens(user);

  const payload = {
    ...authTokens,
    organizationId: authTokens.organizationId,
    user: sanitizeUser(user)
  };

  return payload;
};

module.exports = {
  ServiceError,
  registerAdminAccount,
  issueAdminSession,
  applyGoogleProfile,
  sanitizeUser
};

