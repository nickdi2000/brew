# BrewTokens Waitlist Setup with Postmark

## Backend Setup

### 1. Environment Variables

Create a `.env` file in the `/be` directory with the following variables:

```env
# MongoDB Connection
MONGODB_URL=mongodb://localhost:27017/brewbucks

# Server Configuration
PORT=3000

# Postmark Configuration
POSTMARK_API_KEY=your_postmark_api_key_here
FROM_EMAIL=brewtokens@triviarat.com
```

### 2. Postmark Account Setup

1. Sign up for a [Postmark account](https://postmarkapp.com/)
2. Create a new server in your Postmark dashboard
3. Get your Server API Token from the API Tokens section
4. Add your API token to the `POSTMARK_API_KEY` environment variable
5. Verify your sending domain (triviarat.com) in Postmark

### 3. Domain Verification

- Add the required DNS records to verify `triviarat.com` domain
- This allows you to send emails from `brewtokens@triviarat.com`

## API Endpoint

The waitlist endpoint is available at:
```
POST http://localhost:3000/api/waitlist
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Successfully joined the waitlist! Check your email for confirmation."
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error message here"
}
```

## Frontend Integration

The frontend form automatically:
- Validates email addresses
- Shows loading state while submitting
- Displays success/error messages
- Clears form on successful submission
- Allows joining another email after success

## Email Templates

The system sends:
1. **Notification email** to brewtokens@triviarat.com when someone joins the waitlist
2. **No confirmation email** is sent to the user who signed up

## Testing

1. Start the backend: `cd be && npm run dev`
2. Start the frontend: `cd fe && npm run dev`
3. Fill out the waitlist form on the homepage
4. Check that emails are sent via Postmark dashboard

## Production Considerations

- Update the axios URL in the frontend to your production API URL
- Ensure CORS is properly configured for your production domain
- Set up proper error logging and monitoring
- Consider rate limiting for the waitlist endpoint
