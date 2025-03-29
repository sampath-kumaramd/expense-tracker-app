import { NextResponse } from 'next/server';

import { GoogleDriveService } from '@/services/googleDrive';
import { Expense } from '@/types/expense';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Initialize Google Drive service
    const googleDrive = await GoogleDriveService.getInstance();

    // Read data from Google Sheets
    const data = await googleDrive.readData();

    // Convert sheet data to expenses
    const expenses: Expense[] = data
      .slice(1)
      .map((row, index) => ({
        id: `expense-${index}`,
        date: new Date(row[0]),
        amount: Number(row[1]),
        category: row[2] as Expense['category'],
        note: row[3],
        userId: row[4],
      }))
      .filter((expense) => expense.userId === userId);

    // Filter expenses by date range if provided
    let filteredExpenses = expenses;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      filteredExpenses = expenses.filter(
        (expense) => expense.date >= start && expense.date <= end
      );
    }

    return NextResponse.json({ expenses: filteredExpenses });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
