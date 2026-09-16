/**
 * LINE Notification & Messaging API Helper for Tomvis Clinic
 */

export interface LineAlertParams {
  title: string;
  message: string;
  level: 'INFO' | 'WARNING' | 'CRITICAL';
}

export async function sendLineAlert({ title, message, level }: LineAlertParams): Promise<{ success: boolean; error?: string }> {
  const lineToken = process.env.LINE_NOTIFY_TOKEN;
  
  if (!lineToken) {
    console.log(`[MOCK LINE NOTIFY ALERT - ${level}] ${title}: ${message}`);
    return { success: true };
  }

  try {
    const formattedMessage = `\n[Tomvis Clinic Alert - ${level}]\n📌 ${title}\n💬 ${message}\n⏰ ${new Date().toLocaleString('th-TH')}`;
    
    const response = await fetch('https://notify-api.line.me/api/notify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Bearer ${lineToken}`,
      },
      body: new URLSearchParams({ message: formattedMessage }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return { success: false, error: errText };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Failed to send LINE notification:', error);
    return { success: false, error: error.message };
  }
}

export async function sendAppointmentReminder(patientPhone: string, patientName: string, appointmentTime: string): Promise<{ success: boolean }> {
  console.log(`[LINE OA MESSAGE] Reminding ${patientName} (${patientPhone}) for appointment at ${appointmentTime}`);
  return { success: true };
}
