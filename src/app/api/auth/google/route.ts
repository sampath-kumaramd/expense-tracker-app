import { NextResponse } from 'next/server';

import { oauth2Client, SCOPES } from '@/config/google';

export async function GET() {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  return NextResponse.json({ url: authUrl });
}
