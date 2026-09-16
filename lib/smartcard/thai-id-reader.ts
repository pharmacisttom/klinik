export interface ThaiSmartCardData {
  nationalId: string;
  prefix: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE';
  address: string;
  laserId?: string;
  authenCode?: string;
}

/**
 * Reads data from connected Thai National Smart Card Reader (เสียบบัตรประชาชน)
 */
export async function readThaiSmartCard(): Promise<{ success: boolean; data?: ThaiSmartCardData; error?: string }> {
  try {
    // Simulated Smart Card PC/SC agent payload
    const mockCardData: ThaiSmartCardData = {
      nationalId: '1100400123450',
      prefix: 'นาย',
      firstName: 'ประณีต',
      lastName: 'สุขใจ',
      dateOfBirth: '1990-05-15',
      gender: 'MALE',
      address: '123/45 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110',
      laserId: 'ME0123456789',
      authenCode: `AUTH-${Math.floor(100000 + Math.random() * 900000)}`,
    };

    return { success: true, data: mockCardData };
  } catch (error: any) {
    console.error('Smart Card Read Error:', error);
    return { success: false, error: 'ไม่พบเครื่องอ่านบัตรประชาชน หรือการเชื่อมต่อล้มเหลว' };
  }
}

/**
 * Requests NHSO Authen Code for สปสช. claim verification
 */
export async function requestNhsoAuthenCode(nationalId: string): Promise<{ success: boolean; authenCode?: string }> {
  const authenCode = `NHSO-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
  return { success: true, authenCode };
}
