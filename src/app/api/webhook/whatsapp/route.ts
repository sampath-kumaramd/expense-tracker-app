import { NextResponse } from 'next/server';

import { Expense } from '@/types/expense';
import { createOrUpdateExcelFile, readExcelFile } from '@/utils/excel';
import { parseExpenseMessage, sendWhatsAppMessage } from '@/utils/whatsapp';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const messageStatus = formData.get('MessageStatus');
    const body = formData.get('Body') as string;
    const from = formData.get('From') as string;
    const userId = from.replace('whatsapp:', '');

    // Log the incoming webhook data for debugging
    console.log('Webhook received:', {
      messageStatus,
      body,
      from,
      userId,
      formData: Object.fromEntries(formData.entries()),
    });

    // If this is a status update, just acknowledge it
    if (messageStatus) {
      return NextResponse.json({
        success: true,
        message: 'Status update received',
      });
    }

    // Process only actual messages
    if (!body || !from) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const parsedExpense = parseExpenseMessage(body);
    if (!parsedExpense) {
      await sendWhatsAppMessage(
        userId,
        "Sorry, I couldn't understand your message. Please use the format: Expense: [amount] [category] [note]"
      );
      return NextResponse.json(
        { error: 'Invalid message format' },
        { status: 400 }
      );
    }

    // Read existing expenses
    const existingExpenses = await readExcelFile(userId);

    // Create new expense
    const newExpense: Expense = {
      id: `expense-${Date.now()}`,
      ...parsedExpense,
      date: new Date(),
      userId,
    };

    // Update Excel file with new expense
    await createOrUpdateExcelFile(userId, [...existingExpenses, newExpense]);

    // Send confirmation message
    await sendWhatsAppMessage(
      userId,
      `✅ Expense recorded successfully!\nAmount: ${parsedExpense.amount}\nCategory: ${parsedExpense.category}\nNote: ${parsedExpense.note}`
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
