import fs from 'fs';
import path from 'path';

import { google } from 'googleapis';
import { NextResponse } from 'next/server';

import { GoogleDriveService } from '@/services/googleDrive';

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
];

const TOKEN_PATH = path.join(process.cwd(), 'data', 'token.json');

export async function GET() {
  try {
    const googleDrive = GoogleDriveService.getInstance();
    const authUrl = await googleDrive.getAuthUrl();
    return NextResponse.json({ url: authUrl });
  } catch (error) {
    console.error('Error getting auth URL:', error);
    return NextResponse.json(
      { error: 'Failed to get authentication URL' },
      { status: 500 }
    );
  }
}
