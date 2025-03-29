import { NextResponse } from 'next/server';

import { GoogleDriveService } from '@/services/googleDrive.server';

export async function GET() {
  try {
    const service = GoogleDriveService.getInstance();
    await service.initialize();
    const data = await service.readData();
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const service = GoogleDriveService.getInstance();
    await service.initialize();
    const { values, action, range } = await request.json();

    if (action === 'append') {
      await service.appendData(values);
    } else if (action === 'update' && range) {
      await service.updateData(range, values);
    } else {
      throw new Error('Invalid action');
    }

    const data = await service.readData();
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
