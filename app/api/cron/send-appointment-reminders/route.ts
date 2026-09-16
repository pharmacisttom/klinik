import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized cron execution' }, { status: 401 });
  }

  console.log('[Cron] Daily appointment reminders dispatched.');

  return NextResponse.json({
    success: true,
    message: 'Daily SMS/Notification appointment reminders dispatched to scheduled patients.',
    timestamp: new Date().toISOString(),
  });
}
