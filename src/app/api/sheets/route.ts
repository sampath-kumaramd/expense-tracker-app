import { NextResponse } from 'next/server';

import { readSheetData, appendSheetData, updateSheetData } from './actions';

export async function GET() {
  try {
    const data = await readSheetData();
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
    const { values, action, range } = await request.json();

    let data;
    if (action === 'append') {
      data = await appendSheetData(values);
    } else if (action === 'update' && range) {
      data = await updateSheetData(range, values);
    } else {
      throw new Error('Invalid action');
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
