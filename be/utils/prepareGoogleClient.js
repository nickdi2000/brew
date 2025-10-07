const { OAuth2Client } = require('google-auth-library');

let client = null;

const createClient = () => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    throw new Error('Missing GOOGLE_CLIENT_ID environment variable');
  }

  return new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
};

const getClient = () => {
  if (!client) {
    client = createClient();
  }

  return client;
};

const verifyGoogleIdToken = async (token) => {
  const googleClient = getClient();

  const ticket = await googleClient.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID
  });

  return ticket.getPayload();
};

module.exports = {
  getClient,
  verifyGoogleIdToken
};

