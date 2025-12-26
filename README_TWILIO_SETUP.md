# Twilio SMS Setup for Phone Number Authentication

## Overview

This project uses Twilio to send SMS OTP codes for phone number verification in the driver authentication flow.

## Environment Variables Required

Add these environment variables to your `.env` file:

```env
# Twilio SMS Configuration
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=[Your-AuthToken]
TWILIO_PHONE_NUMBER=+1234567890
```

## How to Get Twilio Credentials

1. **Sign up for Twilio**: Go to [twilio.com](https://www.twilio.com/) and create an account
2. **Get Account SID and Auth Token**:
   - Go to your [Twilio Console Dashboard](https://console.twilio.com/)
   - Copy the "Account SID" and "Auth Token" from the dashboard
3. **Purchase a Phone Number**:
   - In the Twilio Console, go to Phone Numbers > Manage
   - Buy a phone number that can send SMS
   - Use this phone number as `TWILIO_PHONE_NUMBER`

## Testing SMS

Once configured, SMS OTP codes will be sent automatically when users:

1. Sign up with a phone number (driver registration)
2. Request phone number verification during login

## Fallback Behavior

If Twilio credentials are not configured, the system will:
- Log OTP codes to the console instead of sending SMS
- Display a warning in the server logs
- Allow development/testing without SMS costs

## Cost Information

- Twilio charges per SMS sent (typically $0.0075-$0.015 per message)
- Check current pricing on the [Twilio Pricing page](https://www.twilio.com/pricing)

## Troubleshooting

1. **SMS not being sent**: Check that all three environment variables are set correctly
2. **Invalid phone number**: Ensure phone numbers are in E.164 format (+country code)
3. **Auth token issues**: Regenerate your Auth Token in Twilio Console if needed
