require('dotenv').config();
const { google } = require('googleapis');
const { getClient, getAuthUrl, saveToken } = require('./auth');
const { triggerCall, triggerVibration } = require('./notifier');
const cron = require('node-cron');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function checkEmails(auth) {
  const gmail = google.gmail({ version: 'v1', auth });
  const query = process.env.EMAIL_QUERY || 'is:unread';
  
  console.log(`Checking emails with query: ${query}`);
  
  try {
    const res = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults: 1
    });

    const messages = res.data.messages || [];
    if(messages.length === 0) {
      console.log('No new emails found.');
    }
    if (messages.length > 0) {
      console.log(`Found matching email!`);
      
      const msg = await gmail.users.messages.get({
        userId: 'me',
        id: messages[0].id
      });
    

      const subject = msg.data.payload.headers.find(h => h.name === 'Subject').value;
      
      // Notify
      await triggerCall(subject);
      await triggerVibration(subject);

      // Mark as read or archive so we don't notify again
      await gmail.users.messages.batchModify({
        userId: 'me',
        ids: [messages[0].id],
        removeLabelIds: ['UNREAD']
      });
    }
  } catch (err) {
    console.error('Error checking emails:', err.message);
  }
}

async function start() {
  const auth = await getClient();
  
  if (!auth) {
    const tempAuth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    const url = await getAuthUrl(tempAuth);
    console.log('Authorize this app by visiting this url:', url);
    
    rl.question('Enter the code from that page here: ', async (input) => {
      let code = input;
      // If the user pastes the whole URL, extract just the code
      if (input.includes('code=')) {
        const url = new URL(input);
        code = url.searchParams.get('code');
      }
      
      try {
        const finalAuth = await saveToken(tempAuth, code);
        console.log('Token stored!');
        rl.close();
        run(finalAuth);
      } catch (err) {
        console.error('Error exchanging code for token:', err.message);
        console.log('Please try running the app again and pasting just the code (or the whole URL).');
        process.exit(1);
      }
    });
  } else {
    run(auth);
  }
}

function run(auth) {
  const interval = process.env.CHECK_INTERVAL_SECONDS || 60;
  console.log(`Email tracker started. Checking every ${interval} seconds.`);
  
  // Check immediately
  checkEmails(auth);
  
  // Schedule
  cron.schedule(`*/${interval} * * * * *`, () => {
    checkEmails(auth);
  });
}

start();
