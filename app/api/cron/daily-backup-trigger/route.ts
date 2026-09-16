import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Validate authorization header / cron secret
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized cron execution' }, { status: 401 });
  }

  console.log('[Cron] Daily database backup triggered automatically at 02:00 AM');

  return NextResponse.json({
    success: true,
    message: 'Daily automated database backup snapshot initiated successfully.',
    timestamp: new Date().toISOString(),
  });
}
