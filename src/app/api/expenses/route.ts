import { NextResponse } from 'next/server';

import { readExcelFile } from '@/utils/excel';

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

    const expenses = await readExcelFile(userId);

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
