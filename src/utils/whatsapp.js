const dotenv = require('dotenv');
const twilio = require('twilio');

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;

if (!accountSid || !authToken || !whatsappNumber) {
  throw new Error('Missing Twilio credentials');
}

const client = twilio(accountSid, authToken);

async function sendWhatsAppMessage(to, message) {
  try {
    await client.messages.create({
      body: message,
      from: `whatsapp:${whatsappNumber}`,
      to: `whatsapp:${to}`,
    });
    return true;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return false;
  }
}

async function sendDailyReminder(to) {
  const message = `Hi! It's time to log your expenses for today. 
Please send your expenses in this format:
Expense: [amount] [category] [note]

Example: Expense: 25.50 Food & Dining Lunch at cafe

Categories available:
- Food & Dining
- Transportation
- Shopping
- Bills & Utilities
- Entertainment
- Health
- Other`;

  return sendWhatsAppMessage(to, message);
}

function parseExpenseMessage(message) {
  const regex = /Expense:\s*(\d+(?:\.\d{1,2})?)\s+([A-Za-z\s&]+)\s+(.+)/;
  const match = message.match(regex);

  if (!match) {
    return null;
  }

  const [, amount, category, note] = match;
  const normalizedCategory = category.trim();

  return {
    amount: parseFloat(amount),
    category: normalizedCategory,
    note: note.trim(),
  };
}

module.exports = {
  sendWhatsAppMessage,
  sendDailyReminder,
  parseExpenseMessage,
};
