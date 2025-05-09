'use client';

import { useEffect, useState } from 'react';

import dateFormat from 'dateformat';
import type { DateRange } from 'react-day-picker';

import { GoogleSheetInput } from '@/components/GoogleSheetInput';
import { Button } from '@/components/ui/button';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { GoogleDriveService } from '@/services/googleDrive';
import { Expense, ExpenseCategory } from '@/types/expense';

export default function Dashboard() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reminderStatus, setReminderStatus] = useState<string>('');
  const [sheetId, setSheetId] = useState<string>('');

  // For demo purposes, using a hardcoded user ID
  const userId = '+94760937443';

  const {
    data,
    isLoading,
    error: googleSheetsError,
    appendData,
    updateData,
  } = useGoogleSheets(sheetId, {
    onError: (error: Error) => {
      console.error('Google Sheets error:', error.message);
    },
  });

  const handleSheetUrlSubmit = (id: string) => {
    console.log('handleSheetUrlSubmit', id);
    localStorage.setItem('sheetId', id);
    GoogleDriveService.getInstance().setSpreadsheetId(id);
    setSheetId(id);
  };

  useEffect(() => {
    if (data) {
      fetchExpenses();
    }
  }, [dateRange, data]);

  const triggerTestReminder = async () => {
    try {
      setReminderStatus('Sending reminder...');
      const response = await fetch('/api/reminders', {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to send reminder');
      }
      setReminderStatus('Reminder sent successfully!');
    } catch (error) {
      setReminderStatus('Failed to send reminder');
      console.error('Error sending reminder:', error);
    }
  };

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ userId });
      if (dateRange?.from) {
        params.append('startDate', dateRange.from.toISOString());
      }
      if (dateRange?.to) {
        params.append('endDate', dateRange.to.toISOString());
      }

      const response = await fetch(`/api/expenses?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch expenses');
      }

      const data = await response.json();
      setExpenses(data.expenses);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'An error occurred';
      setError(message);
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );
  const expensesByCategory = expenses.reduce(
    (acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    },
    {} as Record<ExpenseCategory, number>
  );

  const handleAddExpense = async (expense: any) => {
    await appendData([
      [
        new Date().toISOString(),
        expense.amount,
        expense.category,
        expense.description,
      ],
    ]);
  };

  // if (loading) {
  //   return <div className="p-8">Loading...</div>;
  // }

  // if (error) {
  //   return <div className="p-8 text-red-500">Error: {error}</div>;
  // }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Expense Dashboard</h1>

      <div className="mb-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
        <div className="flex items-center gap-4">
          <Button
            onClick={triggerTestReminder}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Send Test Reminder
          </Button>
          {reminderStatus && (
            <span
              className={`text-sm ${
                reminderStatus.includes('success')
                  ? 'text-green-600'
                  : 'text-blue-600'
              }`}
            >
              {reminderStatus}
            </span>
          )}
        </div>
      </div>

      <div className="mb-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">
          Google Sheets Integration
        </h2>
        <p className="text-gray-600 mb-4">
          Connect your Google Sheets to export and manage your expenses.
        </p>
      </div>
      <GoogleSheetInput onSheetUrlSubmit={handleSheetUrlSubmit} />
      <div className="mb-8">
        <DateRangePicker
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Total Expenses</h2>
          <p className="text-3xl font-bold text-green-600">
            ${totalExpenses.toFixed(2)}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Expenses by Category</h2>
          <div className="space-y-2">
            {Object.entries(expensesByCategory).map(([category, amount]) => (
              <div key={category} className="flex justify-between">
                <span>{category}</span>
                <span className="font-semibold">${amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Expenses</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Date</th>
                  <th className="text-left py-2">Amount</th>
                  <th className="text-left py-2">Category</th>
                  <th className="text-left py-2">Note</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id} className="border-b">
                    <td className="py-2">
                      {dateFormat(expense.date, 'dd/mm/yyyy')}
                    </td>
                    <td className="py-2">${expense.amount.toFixed(2)}</td>
                    <td className="py-2">{expense.category}</td>
                    <td className="py-2">{expense.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
