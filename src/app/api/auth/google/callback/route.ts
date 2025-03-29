import { NextRequest, NextResponse } from 'next/server';

import { GoogleDriveService } from '@/services/googleDrive';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { error: 'No authorization code provided' },
        { status: 400 }
      );
    }

    const googleDrive = GoogleDriveService.getInstance();
    await googleDrive.handleAuthCallback(code);

    // Redirect to the home page after successful authentication
    return NextResponse.redirect(new URL('/', request.url));
  } catch (error) {
    console.error('Error handling auth callback:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
