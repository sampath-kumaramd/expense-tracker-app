import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action');
  const accessToken = searchParams.get('accessToken');

  if (!accessToken) {
    return NextResponse.json(
      { error: 'Access token is required' },
      { status: 401 }
    );
  }

  oauth2Client.setCredentials({ access_token: accessToken });

  try {
    switch (action) {
      case 'list':
        const drive = google.drive({ version: 'v3', auth: oauth2Client });
        const response = await drive.files.list({
          q: "mimeType='application/vnd.google-apps.spreadsheet'",
          fields: 'files(id, name, webViewLink)',
        });

        return NextResponse.json({
          sheets: (response.data.files || []).map((file) => ({
            spreadsheetId: file.id,
            title: file.name,
            url: file.webViewLink,
          })),
        });

      case 'create':
        const sheets = google.sheets({ version: 'v4', auth: oauth2Client });
        const spreadsheet = await sheets.spreadsheets.create({
          requestBody: {
            properties: {
              title: 'Expense Tracker',
            },
          },
        });

        return NextResponse.json({
          spreadsheetId: spreadsheet.data.spreadsheetId,
          title: spreadsheet.data.properties?.title,
          url: spreadsheet.data.spreadsheetUrl,
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Google Sheets API error:', error);
    return NextResponse.json(
      { error: 'Failed to interact with Google Sheets' },
      { status: 500 }
    );
  }
}
