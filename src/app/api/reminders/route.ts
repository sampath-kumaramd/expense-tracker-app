import { NextResponse } from 'next/server';

import { sendTestMessage } from '@/scripts/send-reminders';

export async function POST() {
  try {
    await sendTestMessage();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending test reminder:', error);
    return NextResponse.json(
      { error: 'Failed to send test reminder' },
      { status: 500 }
    );
  }
}
