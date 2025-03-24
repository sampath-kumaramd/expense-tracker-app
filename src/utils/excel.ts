import fs from 'fs';
import path from 'path';

import ExcelJS from 'exceljs';

import { Expense } from '@/types/expense';

const EXPENSES_DIR = path.join(process.cwd(), 'data', 'expenses');

// Ensure the expenses directory exists
if (!fs.existsSync(EXPENSES_DIR)) {
  fs.mkdirSync(EXPENSES_DIR, { recursive: true });
}

export async function createOrUpdateExcelFile(
  userId: string,
  expenses: Expense[]
) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Expenses');

  // Define columns
  worksheet.columns = [
    { header: 'Date', key: 'date', width: 15 },
    { header: 'Amount', key: 'amount', width: 15 },
    { header: 'Category', key: 'category', width: 20 },
    { header: 'Note', key: 'note', width: 30 },
  ];

  // Add data
  expenses.forEach((expense) => {
    worksheet.addRow({
      date: expense.date.toISOString().split('T')[0],
      amount: expense.amount,
      category: expense.category,
      note: expense.note,
    });
  });

  // Style the header row
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' },
  };

  // Save the file
  const filePath = path.join(EXPENSES_DIR, `${userId}_expenses.xlsx`);
  await workbook.xlsx.writeFile(filePath);
  return filePath;
}

export async function readExcelFile(userId: string): Promise<Expense[]> {
  const filePath = path.join(EXPENSES_DIR, `${userId}_expenses.xlsx`);

  if (!fs.existsSync(filePath)) {
    return [];
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.getWorksheet('Expenses');

  if (!worksheet) {
    return [];
  }

  const expenses: Expense[] = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // Skip header row

    expenses.push({
      id: `expense-${rowNumber}`,
      date: new Date(row.getCell(1).value as string),
      amount: row.getCell(2).value as number,
      category: row.getCell(3).value as Expense['category'],
      note: row.getCell(4).value as string,
      userId,
    });
  });

  return expenses;
}
