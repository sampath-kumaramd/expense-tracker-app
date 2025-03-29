'use server';

import fs from 'fs';
import path from 'path';

import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
];

const TOKEN_PATH = path.join(process.cwd(), 'data', 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'data', 'credentials.json');

export class GoogleDriveService {
  private static instance: GoogleDriveService;
  private auth: OAuth2Client | null = null;
  private spreadsheetId: string | null = null;

  private constructor() {}

  public static getInstance(): GoogleDriveService {
    if (!GoogleDriveService.instance) {
      GoogleDriveService.instance = new GoogleDriveService();
    }
    return GoogleDriveService.instance;
  }

  private async loadSavedCredentialsIfExist(): Promise<OAuth2Client | null> {
    try {
      if (!fs.existsSync(TOKEN_PATH)) return null;
      const content = fs.readFileSync(TOKEN_PATH, 'utf-8');
      const credentials = JSON.parse(content);
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
      );
      oauth2Client.setCredentials(credentials);
      return oauth2Client;
    } catch (err) {
      return null;
    }
  }

  private async saveCredentials(client: OAuth2Client): Promise<void> {
    const content = await fs.promises.readFile(CREDENTIALS_PATH);
    const keys = JSON.parse(content.toString());
    const key = keys.installed || keys.web;
    const payload = JSON.stringify({
      type: 'authorized_user',
      client_id: key.client_id,
      client_secret: key.client_secret,
      refresh_token: client.credentials.refresh_token,
    });
    await fs.promises.writeFile(TOKEN_PATH, payload);
  }

  public async initialize(): Promise<void> {
    this.auth = await this.loadSavedCredentialsIfExist();
    if (!this.auth) {
      throw new Error('Authentication required. Please authenticate first.');
    }
  }

  public async createOrGetSpreadsheet(): Promise<string> {
    if (!this.auth) throw new Error('Not authenticated');
    if (this.spreadsheetId) return this.spreadsheetId;

    const sheets = google.sheets({ version: 'v4', auth: this.auth });
    const drive = google.drive({ version: 'v3', auth: this.auth });

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
          return this.spreadsheetId as string;
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

    // Save the spreadsheet ID
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
