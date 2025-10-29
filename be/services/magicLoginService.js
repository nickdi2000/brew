const crypto = require('crypto');

const MagicLoginToken = require('../models/MagicLoginToken');
const User = require('../models/User');
const { sendMagicLoginEmail } = require('./postmarkService');

const normalizeEmail = (email) => {
  if (!email) {
    return '';
  }
  return String(email).trim().toLowerCase();
};

const deriveTokenHash = (token) => {
  return crypto.createHash('sha256').update(token, 'utf8').digest('hex');
};

const buildMagicLoginUrl = (token) => {
  const baseUrl = process.env.ADMIN_APP_URL || process.env.FRONTEND_URL || 'https://brewtokens.com';
  return `${String(baseUrl).replace(/\/$/, '')}/magic-login/${token}`;
};

const findAdminByEmail = async (email) => {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    return null;
  }

  return User.findOne({ email: normalizedEmail, isAdmin: true }).populate('organizations');
};

const createMagicTokenForUser = async ({ user, metadata = null, ttlSeconds = null }) => {
  if (!user) {
    throw new Error('User is required to create a magic login token');
  }

  const userId = user._id || user;

  const generateToken = () => {
    if (typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID().replace(/-/g, '') + crypto.randomBytes(16).toString('hex');
    }
    return crypto.randomBytes(48).toString('hex');
  };

  let rawToken = generateToken();
  let tokenHash = deriveTokenHash(rawToken);

  let existingToken = await MagicLoginToken.findOne({ tokenHash });
  let guard = 0;
  while (existingToken && guard < 5) {
    rawToken = generateToken();
    tokenHash = deriveTokenHash(rawToken);
    existingToken = await MagicLoginToken.findOne({ tokenHash });
    guard += 1;
  }

  if (existingToken) {
    throw new Error('Failed to generate a unique magic login token');
  }

  const tokenPayload = {
    user: userId,
    tokenHash,
    ttlSeconds: ttlSeconds ?? null,
  };

  if (metadata && typeof metadata === 'object') {
    tokenPayload.metadata = metadata;
  }

  const magicToken = await MagicLoginToken.create(tokenPayload);
  const magicLoginUrl = buildMagicLoginUrl(rawToken);

  return {
    rawToken,
    magicToken,
    magicLoginUrl,
  };
};

const issueMagicLinkForEmail = async ({ email, requestIp = null, userAgent = null } = {}) => {
  const user = await findAdminByEmail(email);

  if (!user) {
    return {
      user: null,
      magicToken: null,
      magicLoginUrl: null,
      emailResult: null,
    };
  }

  const { rawToken, magicToken, magicLoginUrl } = await createMagicTokenForUser({
    user,
    metadata: {
      source: 'admin-login-request',
      requestIp: requestIp || null,
      userAgent: userAgent || null,
      createdAt: new Date(),
    },
  });

  const emailResult = await sendMagicLoginEmail({
    toEmail: user.email,
    adminFirstName: user.firstName,
    adminLastName: user.lastName,
    organizationName: user.organizations?.[0]?.name,
    magicLoginUrl,
  });

  return {
    user,
    rawToken,
    magicToken,
    magicLoginUrl,
    emailResult,
  };
};

const findActiveMagicTokenByRawToken = async (rawToken) => {
  if (!rawToken) {
    return null;
  }

  const tokenHash = deriveTokenHash(rawToken);
  return MagicLoginToken.findOne({ tokenHash, disabledAt: null }).populate('user');
};

const recordMagicTokenUsage = async (magicToken, { ip = null, userAgent = null } = {}) => {
  if (!magicToken) {
    return;
  }

  magicToken.lastUsedAt = new Date();
  magicToken.lastUsedIp = ip || null;
  magicToken.lastUsedUserAgent = userAgent || null;
  magicToken.usageCount = (magicToken.usageCount || 0) + 1;

  try {
    await magicToken.save();
  } catch (error) {
    console.error('Failed to record magic token usage:', error);
  }
};

module.exports = {
  normalizeEmail,
  deriveTokenHash,
  buildMagicLoginUrl,
  findAdminByEmail,
  createMagicTokenForUser,
  issueMagicLinkForEmail,
  findActiveMagicTokenByRawToken,
  recordMagicTokenUsage,
};

