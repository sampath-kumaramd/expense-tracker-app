const cron = require('node-cron');

const { sendDailyReminder } = require('../utils/whatsapp');

// For demo purposes, using a hardcoded list of users
// In a production environment, this would come from a database
const USERS = ['+94760937443']; // Replace with actual phone numbers

async function sendReminders() {
  console.log('Sending daily reminders...');

  for (const user of USERS) {
    try {
      const success = await sendDailyReminder(user);
      if (success) {
        console.log(`Reminder sent successfully to ${user}`);
      } else {
        console.error(`Failed to send reminder to ${user}`);
      }
    } catch (error) {
      console.error(`Error sending reminder to ${user}:`, error);
    }
  }
}

// Schedule the reminder to run at 9 PM every day
cron.schedule('0 21 * * *', sendReminders);

console.log('Reminder scheduler started. Will send reminders at 9 PM daily.');
