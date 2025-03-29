import { google } from 'googleapis';

export class GoogleDriveService {
  private static instance: GoogleDriveService;
  private spreadsheetId: string | null = null;

  private constructor() {}

  public static getInstance(): GoogleDriveService {
    if (!GoogleDriveService.instance) {
      GoogleDriveService.instance = new GoogleDriveService();
    }
    return GoogleDriveService.instance;
  }

  public setSpreadsheetId(id: string) {
    this.spreadsheetId = id;
  }

  public async readData(): Promise<any[][]> {
    if (!this.spreadsheetId) throw new Error('No spreadsheet ID provided');

    const sheets = google.sheets({ version: 'v4' });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: 'Expenses!A:Z',
      key: process.env.GOOGLE_API_KEY,
    });

    return response.data.values || [];
  }

  public async appendData(values: any[][]): Promise<void> {
    if (!this.spreadsheetId) throw new Error('No spreadsheet ID provided');

    const sheets = google.sheets({ version: 'v4' });

    await sheets.spreadsheets.values.append({
      spreadsheetId: this.spreadsheetId,
      range: 'Expenses!A:Z',
      valueInputOption: 'USER_ENTERED',
      key: process.env.GOOGLE_API_KEY,
      requestBody: {
        values,
      },
    });
  }

  public async updateData(range: string, values: any[][]): Promise<void> {
    if (!this.spreadsheetId) throw new Error('No spreadsheet ID provided');

    const sheets = google.sheets({ version: 'v4' });

    await sheets.spreadsheets.values.update({
      spreadsheetId: this.spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      key: process.env.GOOGLE_API_KEY,
      requestBody: {
        values,
      },
    });
  }
}
