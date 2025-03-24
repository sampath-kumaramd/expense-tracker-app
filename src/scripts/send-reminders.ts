const cron = require('node-cron');

const { sendDailyReminder } = require('../utils/whatsapp');

// For demo purposes, using a hardcoded list of users
// In a production environment, this would come from a database
const USERS = ['+94760937443']; // Replace with your actual WhatsApp number

// Function to send immediate test message
async function sendTestMessage() {
  console.log('Sending test message...');

  for (const user of USERS) {
    try {
      const success = await sendDailyReminder(user);
      if (success) {
        console.log(`Test message sent successfully to ${user}`);
      } else {
        console.error(`Failed to send test message to ${user}`);
      }
    } catch (error) {
      console.error(`Error sending test message to ${user}:`, error);
    }
  }
}

// Send test message immediately when script starts
sendTestMessage();

// Also keep the scheduled reminder
cron.schedule('0 21 * * *', sendTestMessage);

console.log('Reminder scheduler started. Will send reminders at 9 PM daily.');
