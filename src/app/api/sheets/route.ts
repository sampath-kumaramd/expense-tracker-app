import { NextRequest, NextResponse } from 'next/server';

import { GoogleDriveService } from '@/services/googleDrive';

export async function POST(request: NextRequest) {
  try {
    const { action, values, range, sheetId } = await request.json();
    const service = GoogleDriveService.getInstance();

    if (sheetId) {
      service.setSpreadsheetId(sheetId);
    }

    switch (action) {
      case 'append':
        await service.appendData(values);
        break;
      case 'update':
        await service.updateData(range, values);
        break;
      default:
        throw new Error('Invalid action');
    }

    const data = await service.readData();
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in sheets API:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const sheetId = searchParams.get('sheetId');

    if (!sheetId) {
      return NextResponse.json(
        { error: 'Sheet ID is required' },
        { status: 400 }
      );
    }

    const service = GoogleDriveService.getInstance();
    service.setSpreadsheetId(sheetId);
    const data = await service.readData();

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in sheets API:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
