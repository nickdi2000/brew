const postmark = require('postmark');

// Initialize Postmark client
const client = new postmark.ServerClient(process.env.POSTMARK_API_KEY);

const joinWaitlist = async (req, res) => {

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please enter a valid email address' 
      });
    }

    // Send notification email to brewtokens@triviarat.com
    await client.sendEmail({
      From: process.env.FROM_EMAIL || 'brewtokens@triviarat.com',
      To: 'nickdifelice+brewtokens@gmail.com',
      Subject: 'New BrewTokens Waitlist Signup',
      HtmlBody: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1e40af; font-size: 28px; margin-bottom: 10px;">New Waitlist Signup!</h1>
            <p style="color: #64748b; font-size: 16px;">Someone just joined the BrewTokens waitlist</p>
          </div>
          
          <div style="background: #f8fafc; padding: 25px; border-radius: 10px; margin-bottom: 25px;">
            <h2 style="color: #334155; font-size: 20px; margin-bottom: 15px;">Signup Details</h2>
            <p style="color: #64748b; font-size: 16px; margin-bottom: 10px;">
              <strong>Email:</strong> <a href="mailto:${email}" style="color: #1e40af;">${email}</a>
            </p>
            <p style="color: #64748b; font-size: 16px; margin-bottom: 10px;">
              <strong>Signup Time:</strong> ${new Date().toLocaleString()}
            </p>
            <p style="color: #64748b; font-size: 16px;">
              <strong>IP Address:</strong> ${req.ip || req.connection.remoteAddress || 'Unknown'}
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #64748b; font-size: 14px;">
              This signup was automatically generated from the BrewTokens website.
            </p>
          </div>
        </div>
      `,
      TextBody: `
New BrewTokens Waitlist Signup!

Email: ${email}
Signup Time: ${new Date().toLocaleString()}
IP Address: ${req.ip || req.connection.remoteAddress || 'Unknown'}

This signup was automatically generated from the BrewTokens website.
      `
    });

    res.json({ 
      success: true, 
      message: 'Successfully joined the waitlist! We\'ll notify you when BrewTokens launches.' 
    });

  } catch (error) {
    console.error('Waitlist signup error:', error);
    
    // Handle specific Postmark errors
    if (error.code === 300) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email address' 
      });
    }

    res.status(500).json({ 
      success: false, 
      message: 'Something went wrong. Please try again.' 
    });
  }
};

module.exports = {
  joinWaitlist
};
