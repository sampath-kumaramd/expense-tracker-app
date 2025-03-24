# Expense Tracker MVP

A streamlined expense tracking system that combines WhatsApp messaging with Excel spreadsheets, wrapped in a modern Next.js web interface.

## Features

- Daily WhatsApp reminders at 9 PM
- Simple expense logging via WhatsApp messages
- Beautiful web dashboard for expense visualization
- Automatic Excel file generation
- Date range filtering and category breakdowns

## Prerequisites

- Node.js 18 or later
- npm or yarn
- Twilio account with WhatsApp sandbox enabled
- A public URL for webhook endpoints (e.g., ngrok for local development)

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=your_whatsapp_number
```

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd expense-tracker
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables as described above.

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Start the reminder script:
   ```bash
   npm run reminders
   ```

## Usage

1. **WhatsApp Integration**:

   - Join your Twilio WhatsApp sandbox by sending the code to the provided number
   - Send expenses in the format: `Expense: [amount] [category] [note]`
   - Example: `Expense: 25.50 Food & Dining Lunch at cafe`

2. **Web Dashboard**:
   - Open `http://localhost:3000` in your browser
   - View your expenses, filter by date range, and see category breakdowns
   - Excel files are automatically generated in the `data/expenses` directory

## Development

- `npm run dev`: Start the development server
- `npm run build`: Build the production application
- `npm run start`: Start the production server
- `npm run reminders`: Start the daily reminder script
- `npm run lint`: Run ESLint
- `npm run lint:fix`: Fix ESLint issues

## Project Structure

```
src/
├── app/              # Next.js app directory
├── components/       # React components
├── lib/             # Utility functions and shared code
├── scripts/         # Node.js scripts (e.g., reminders)
├── types/           # TypeScript type definitions
└── utils/           # Helper functions
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
