const postmark = require('postmark');

let postmarkClient = null;

const initializeClient = () => {
  if (postmarkClient) {
    return postmarkClient;
  }

  const apiKey = process.env.POSTMARK_API_KEY;

  if (!apiKey || apiKey === 'placeholder-key') {
    return null;
  }

  try {
    postmarkClient = new postmark.ServerClient(apiKey);
    return postmarkClient;
  } catch (error) {
    console.warn('Failed to initialize Postmark client:', error.message);
    return null;
  }
};

const getClient = () => initializeClient();

const isPostmarkConfigured = () => Boolean(getClient());

const sendTemplatedEmail = async ({ to, templateAlias, templateModel, from }) => {
  const client = getClient();

  if (!client) {
    console.log(`Postmark not configured - skipped sending template "${templateAlias}" to ${to}`);
    return {
      skipped: true,
    };
  }

  try {
    await client.sendEmailWithTemplate({
      From: from || process.env.FROM_EMAIL || 'brewtokens@triviarat.com',
      To: to,
      TemplateAlias: templateAlias,
      TemplateModel: templateModel,
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error(`Failed to send Postmark template "${templateAlias}" to ${to}:`, error.message);
    return {
      success: false,
      error,
    };
  }
};

const sendPlainEmail = async ({ to, subject, textBody, htmlBody = null, from }) => {
  const client = getClient();

  if (!client) {
    console.log(`Postmark not configured - skipped sending email "${subject}" to ${to}`);
    return {
      skipped: true,
    };
  }

  try {
    await client.sendEmail({
      From: from || process.env.FROM_EMAIL || 'brewtokens@triviarat.com',
      To: to,
      Subject: subject,
      TextBody: textBody,
      HtmlBody: htmlBody || undefined,
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error(`Failed to send Postmark email "${subject}" to ${to}:`, error.message);
    return {
      success: false,
      error,
    };
  }
};

const formatDate = (date) => {
  if (!(date instanceof Date)) {
    return '';
  }

  return date.toISOString().split('T')[0];
};

const sendAdminWelcomeEmail = async ({
  toEmail,
  organizationName,
  adminFirstName,
  adminLastName,
  loginEmail,
  magicLoginUrl,
  trialLengthDays = 14,
}) => {
  if (!toEmail) {
    return {
      success: false,
      error: new Error('Recipient email is required'),
    };
  }

  if (!magicLoginUrl) {
    return {
      success: false,
      error: new Error('Magic login URL is required'),
    };
  }

  const today = new Date();
  const trialEndsAt = new Date(today);
  trialEndsAt.setDate(trialEndsAt.getDate() + trialLengthDays);

  const templateModel = {
    product_url: 'https://brewtokens.com',
    product_name: 'BrewTokens',
    name: [adminFirstName, adminLastName].filter(Boolean).join(' ') || organizationName || 'BrewTokens Admin',
    magic_login_url: magicLoginUrl,
    support_email: 'support@brewtokens.com',
    help_url: 'https://brewtokens.com/support',
    live_chat_url: 'https://brewtokens.com/chat',
    sender_name: 'The BrewTokens Team',
    company_name: organizationName || 'BrewTokens',
    company_address: '522 Colbert St, Hamilton, ON L8P 4V5',
    action_url: magicLoginUrl,
    login_url: 'https://brewtokens.com/login',
    username: loginEmail || toEmail,
    trial_length: `${trialLengthDays} days`,
    trial_start_date: formatDate(today),
    trial_end_date: formatDate(trialEndsAt),
  };

  return sendTemplatedEmail({
    to: toEmail,
    templateAlias: 'welcome-magic',
    templateModel,
  });
};

const sendMagicLoginEmail = async ({
  toEmail,
  adminFirstName,
  adminLastName,
  organizationName,
  magicLoginUrl,
}) => {
  if (!toEmail) {
    return {
      success: false,
      error: new Error('Recipient email is required'),
    };
  }

  if (!magicLoginUrl) {
    return {
      success: false,
      error: new Error('Magic login URL is required'),
    };
  }

  const friendlyName = [adminFirstName, adminLastName].filter(Boolean).join(' ') || organizationName || 'there';

  const subject = 'Your BrewTokens magic login link';
  const textBody = [
    `Hi ${friendlyName},`,
    '',
    'Here is your one-click BrewTokens admin login link:',
    magicLoginUrl,
    '',
    'This link does not expire and you can use it any time to access your BrewTokens dashboard without entering a password.',
    '',
    'If you did not request this link, you can safely ignore this message.',
    '',
    '— The BrewTokens Team',
  ].join('\n');

  return sendPlainEmail({
    to: toEmail,
    subject,
    textBody,
  });
};

module.exports = {
  isPostmarkConfigured,
  sendAdminWelcomeEmail,
  sendMagicLoginEmail,
  sendPlainEmail,
};


