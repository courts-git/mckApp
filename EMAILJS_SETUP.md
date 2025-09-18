# EmailJS Setup Instructions

## Overview
The contact form now uses EmailJS to send emails directly to `moroccancourtkings@gmail.com`. Follow these steps to set up EmailJS:

## Step 1: Create EmailJS Account
1. Go to [EmailJS.com](https://www.emailjs.com/)
2. Sign up for a free account
3. Confirm your email address

## Step 2: Add Email Service
1. In your EmailJS dashboard, go to **Email Services**
2. Click **Add New Service**
3. Choose **Gmail** (or your preferred email provider)
4. Follow the authentication process to connect your Gmail account
5. Copy the **Service ID** (e.g., `service_abc123`)

## Step 3: Create Email Template
1. Go to **Email Templates** in your dashboard
2. Click **Create New Template**
3. Use this template content:

**Subject:** New MCK Contact Form Message

**Body:**
```
Hello,

You have received a new message from the MCK website contact form:

Name: {{from_name}}
Email: {{from_email}}
Subject: {{subject}}

Message:
{{message}}

Best regards,
MCK Website
```

4. Save the template and copy the **Template ID** (e.g., `template_xyz789`)

## Step 4: Get Public Key
1. Go to **Account** in your dashboard
2. Find the **Public Key** (e.g., `user_ABC123DEF456`)

## Step 5: Update Your Code
Replace the placeholder values in `src/pages/Contact/Contact.tsx`:

```typescript
const EMAILJS_SERVICE_ID = 'your_actual_service_id'; // Replace with your Service ID
const EMAILJS_TEMPLATE_ID = 'your_actual_template_id'; // Replace with your Template ID
const EMAILJS_PUBLIC_KEY = 'your_actual_public_key'; // Replace with your Public Key
```

## Step 6: Test
1. Restart your development server
2. Fill out and submit the contact form
3. Check `moroccancourtkings@gmail.com` for the test email

## Fallback Behavior
If EmailJS is not configured, the form will fallback to opening the user's email client with a pre-filled message (mailto link).

## Free Tier Limits
- EmailJS free tier: 200 emails/month
- Perfect for a contact form!

## Troubleshooting
- Check browser console for any error messages
- Ensure your Gmail account allows "less secure app access" if using Gmail
- Verify all IDs are copied correctly (no extra spaces)
