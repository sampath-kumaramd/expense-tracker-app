import { google } from 'googleapis';

export const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
];

export const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export const sheets = google.sheets({ version: 'v4', auth: oauth2Client });
export const drive = google.drive({ version: 'v3', auth: oauth2Client });
