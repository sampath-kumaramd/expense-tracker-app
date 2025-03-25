import { NextRequest, NextResponse } from 'next/server';

import { oauth2Client } from '@/config/google';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Return an HTML response that will handle the token and redirect
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Connecting to Google Sheets...</title>
        </head>
        <body>
          <script>
            // Store the tokens
            localStorage.setItem('google_access_token', '${tokens.access_token}');
            if ('${tokens.refresh_token}') {
              localStorage.setItem('google_refresh_token', '${tokens.refresh_token}');
            }
            // Redirect to the main page
            window.location.href = '/';
          </script>
          <div style="display: flex; justify-content: center; align-items: center; height: 100vh;">
            <div style="text-align: center;">
              <div style="border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
              <p>Connecting to Google Sheets...</p>
            </div>
          </div>
          <style>
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          </style>
        </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('Error getting tokens:', error);
    return NextResponse.json(
      { error: 'Failed to get tokens' },
      { status: 500 }
    );
  }
}
