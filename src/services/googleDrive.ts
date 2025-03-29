import fs from 'fs';
import path from 'path';

import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
];

const TOKEN_PATH = path.join(process.cwd(), 'data', 'token.json');

export class GoogleDriveService {
  private static instance: GoogleDriveService;
  private auth: OAuth2Client | null = null;
  private spreadsheetId: string | null = null;

  private constructor() {
    this.auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google/callback`
    );
  }

  public static getInstance(): GoogleDriveService {
    if (!GoogleDriveService.instance) {
      GoogleDriveService.instance = new GoogleDriveService();
    }
    return GoogleDriveService.instance;
  }

  public async getAuthUrl(): Promise<string> {
    if (!this.auth) throw new Error('OAuth2Client not initialized');
    return this.auth.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });
  }

  public async handleAuthCallback(code: string): Promise<void> {
    if (!this.auth) throw new Error('OAuth2Client not initialized');

    const { tokens } = await this.auth.getToken(code);
    this.auth.setCredentials(tokens);

    // Save the tokens
    const tokenDir = path.dirname(TOKEN_PATH);
    if (!fs.existsSync(tokenDir)) {
      fs.mkdirSync(tokenDir, { recursive: true });
    }
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
  }

  private async loadSavedCredentialsIfExist(): Promise<boolean> {
    try {
      if (!fs.existsSync(TOKEN_PATH)) return false;
      const content = fs.readFileSync(TOKEN_PATH, 'utf-8');
      const credentials = JSON.parse(content);
      this.auth?.setCredentials(credentials);
      return true;
    } catch (err) {
      console.error('Error loading saved credentials:', err);
      return false;
    }
  }

  public async initialize(): Promise<void> {
    const hasCredentials = await this.loadSavedCredentialsIfExist();
    if (!hasCredentials) {
      throw new Error('Authentication required. Please authenticate first.');
    }
  }

  public async createOrGetSpreadsheet(): Promise<string> {
    if (!this.auth) throw new Error('Not authenticated');
    if (this.spreadsheetId) return this.spreadsheetId;

    const sheets = google.sheets({ version: 'v4', auth: this.auth });

    // Check if we have saved the spreadsheet ID
    const configPath = path.join(
      process.cwd(),
      'data',
      'spreadsheet-config.json'
    );
    try {
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        if (config.spreadsheetId) {
          this.spreadsheetId = config.spreadsheetId;
          if (this.spreadsheetId) return this.spreadsheetId;
        }
      }
    } catch (err) {
      console.error('Error reading config:', err);
    }

    // Create a new spreadsheet
    const spreadsheet = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title: 'Expense Tracker Data',
        },
        sheets: [
          {
            properties: {
              title: 'Expenses',
            },
          },
        ],
      },
    });

    if (!spreadsheet.data.spreadsheetId) {
      throw new Error('Failed to create spreadsheet');
    }

    this.spreadsheetId = spreadsheet.data.spreadsheetId;
    fs.writeFileSync(
      configPath,
      JSON.stringify({ spreadsheetId: this.spreadsheetId })
    );

    return this.spreadsheetId;
  }

  public async readData(): Promise<any[][]> {
    if (!this.auth) throw new Error('Not authenticated');
    const spreadsheetId = await this.createOrGetSpreadsheet();
    const sheets = google.sheets({ version: 'v4', auth: this.auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Expenses!A:Z',
    });

    return response.data.values || [];
  }

  public async appendData(values: any[][]): Promise<void> {
    if (!this.auth) throw new Error('Not authenticated');
    const spreadsheetId = await this.createOrGetSpreadsheet();
    const sheets = google.sheets({ version: 'v4', auth: this.auth });

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Expenses!A:Z',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values,
      },
    });
  }

  public async updateData(range: string, values: any[][]): Promise<void> {
    if (!this.auth) throw new Error('Not authenticated');
    const spreadsheetId = await this.createOrGetSpreadsheet();
    const sheets = google.sheets({ version: 'v4', auth: this.auth });

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values,
      },
    });
  }
}
