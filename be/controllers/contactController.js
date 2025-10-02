const postmark = require('postmark');
const Message = require('../models/Message');
const { formatResponse, formatError } = require('../utils/responseFormatter');

let mailClient = null;
if (process.env.POSTMARK_API_KEY && process.env.POSTMARK_API_KEY !== 'placeholder-key') {
  try {
    mailClient = new postmark.ServerClient(process.env.POSTMARK_API_KEY);
  } catch (error) {
    console.warn('Failed to initialize Postmark client for contact messages:', error.message);
  }
}

const emailPattern = /[^\s@]+@[^\s@]+\.[^\s@]+/;

exports.createContactMessage = async (req, res) => {
  try {
    const { email, message } = req.body;

    if (!email || !emailPattern.test(email)) {
      return res.status(400).json(formatError('A valid email address is required.'));
    }

    if (!message || !message.trim()) {
      return res.status(400).json(formatError('Please share how we can help in the comments field.'));
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedMessage = message.trim();

    const savedMessage = await Message.create({
      email: normalizedEmail,
      comments: normalizedMessage,
      metadata: {
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip || req.connection?.remoteAddress || null,
      },
    });

    if (mailClient) {
      try {
        await mailClient.sendEmail({
          From: process.env.FROM_EMAIL || 'brewtokens@triviarat.com',
          To: process.env.CONTACT_TEAM_EMAIL || 'nickdifelice+brewtokens@gmail.com',
          Subject: 'New BrewTokens Contact Request',
          HtmlBody: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #1e40af; font-size: 26px; margin-bottom: 10px;">New Contact Request</h1>
                <p style="color: #475569; font-size: 16px;">Someone reached out from the BrewTokens website</p>
              </div>
              <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                <p style="color: #334155; font-size: 16px;"><strong>Email:</strong> <a href="mailto:${normalizedEmail}" style="color: #1e40af;">${normalizedEmail}</a></p>
                <p style="color: #334155; font-size: 16px;"><strong>Message:</strong></p>
                <p style="color: #475569; white-space: pre-line;">${normalizedMessage}</p>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                <p style="color: #64748b; font-size: 14px;"><strong>Submitted:</strong> ${new Date(savedMessage.createdAt).toLocaleString()}</p>
                <p style="color: #64748b; font-size: 14px;"><strong>IP:</strong> ${savedMessage.metadata.ipAddress || 'Unavailable'}</p>
                <p style="color: #64748b; font-size: 14px;"><strong>User-Agent:</strong> ${savedMessage.metadata.userAgent || 'Unavailable'}</p>
              </div>
            </div>
          `,
          TextBody: `New BrewTokens Contact Request\n\nEmail: ${normalizedEmail}\nSubmitted: ${new Date(savedMessage.createdAt).toLocaleString()}\nIP: ${savedMessage.metadata.ipAddress || 'Unavailable'}\nUser-Agent: ${savedMessage.metadata.userAgent || 'Unavailable'}\n\nMessage:\n${normalizedMessage}`,
        });
      } catch (mailError) {
        console.error('Failed to send contact notification via Postmark:', mailError.message);
      }
    } else {
      console.log('Postmark not configured - contact email notification skipped.');
    }

    return res.status(201).json(
      formatResponse({
        data: { id: savedMessage._id },
        message: 'Thanks for getting in touch! Our team will reach out shortly.',
      })
    );
  } catch (error) {
    console.error('Contact message error:', error);
    return res.status(500).json(formatError('Something went wrong while submitting your message. Please try again.'));
  }
};
