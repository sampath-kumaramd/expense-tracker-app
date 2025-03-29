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

let auth: OAuth2Client | null = null;
let spreadsheetId: string | null = null;

async function loadSavedCredentialsIfExist(): Promise<OAuth2Client | null> {
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

async function saveCredentials(client: OAuth2Client): Promise<void> {
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

export async function initialize(): Promise<void> {
  auth = await loadSavedCredentialsIfExist();
  if (!auth) {
    throw new Error('Authentication required. Please authenticate first.');
  }
}

async function createOrGetSpreadsheet(): Promise<string> {
  if (!auth) throw new Error('Not authenticated');
  if (spreadsheetId) return spreadsheetId;

  const sheets = google.sheets({ version: 'v4', auth });

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
        spreadsheetId = config.spreadsheetId;
        if (spreadsheetId) return spreadsheetId;
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

  spreadsheetId = spreadsheet.data.spreadsheetId;
  fs.writeFileSync(configPath, JSON.stringify({ spreadsheetId }));

  return spreadsheetId;
}

export async function readData(): Promise<any[][]> {
  if (!auth) throw new Error('Not authenticated');
  const id = await createOrGetSpreadsheet();
  const sheets = google.sheets({ version: 'v4', auth });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: id,
    range: 'Expenses!A:Z',
  });

  return response.data.values || [];
}

export async function appendData(values: any[][]): Promise<void> {
  if (!auth) throw new Error('Not authenticated');
  const id = await createOrGetSpreadsheet();
  const sheets = google.sheets({ version: 'v4', auth });

  await sheets.spreadsheets.values.append({
    spreadsheetId: id,
    range: 'Expenses!A:Z',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values,
    },
  });
}

export async function updateData(
  range: string,
  values: any[][]
): Promise<void> {
  if (!auth) throw new Error('Not authenticated');
  const id = await createOrGetSpreadsheet();
  const sheets = google.sheets({ version: 'v4', auth });

  await sheets.spreadsheets.values.update({
    spreadsheetId: id,
    range,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values,
    },
  });
}
