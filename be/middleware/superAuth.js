const { formatError } = require('../utils/responseFormatter');

const SUPER_ADMIN_PASSCODE = process.env.SUPER_ADMIN_PASSCODE || 'coolbrew';

module.exports = (req, res, next) => {
  try {
    const headerPasscode = req.headers['x-super-passcode'];
    const queryPasscode = req.query?.passcode;
    const bodyPasscode = req.body?.passcode;

    const providedPasscode = headerPasscode || queryPasscode || bodyPasscode;

    if (!providedPasscode) {
      return res.status(403).json(formatError('Super admin access requires a passcode'));
    }

    if (providedPasscode !== SUPER_ADMIN_PASSCODE) {
      return res.status(403).json(formatError('Invalid super admin passcode'));
    }

    return next();
  } catch (error) {
    return res.status(500).json(formatError('Error validating super admin access', error.message));
  }
};

