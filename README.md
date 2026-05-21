# Gmail Notifier (Call & Vibrate)

This program monitors your Gmail for specific emails and notifies you by calling your phone and sending a high-priority vibration notification.

## Setup Instructions

### 1. Google Cloud (Gmail API)
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project.
3. Search for **Gmail API** and enable it.
4. Go to **APIs & Services > OAuth consent screen**.
   - Choose "External" (or "Internal" if you have a Google Workspace).
   - Fill in app info.
   - Add the scope: `https://www.googleapis.com/auth/gmail.readonly`.
5. Go to **APIs & Services > Credentials**.
   - Click **Create Credentials > OAuth client ID**.
   - Application type: **Web application**.
   - Add Authorized redirect URIs: `http://localhost:3000/oauth2callback`.
6. Copy the **Client ID** and **Client Secret** into the `.env` file (rename `.env.example` to `.env`).

### 2. Twilio (For Phone Calls)
1. Sign up for [Twilio](https://www.twilio.com/).
2. Get your **Account SID**, **Auth Token**, and a **Twilio Phone Number**.
3. Add these to your `.env` file.
4. Ensure `MY_PHONE_NUMBER` is your personal number in E.164 format (e.g., `+1234567890`).

### 3. Pushover (For Vibration)
1. Download the **Pushover** app on your phone.
2. Go to [pushover.net](https://pushover.net/) and get your **User Key**.
3. Create an "Application" to get an **API Token**.
4. Add these to your `.env` file.

## Running the Program

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set up your `.env` file.
3. Run the app:
   ```bash
   node index.js
   ```
4. On the first run, it will provide a link. Open it in your browser, authorize, and copy the code back into the terminal.

## Customizing Filters
Change the `EMAIL_QUERY` in `.env`:
- `is:unread from:boss@company.com`
- `is:unread subject:"URGENT"`
- `is:unread "Security alert"`
