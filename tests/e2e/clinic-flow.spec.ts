import { test, expect } from '@playwright/test';

test.describe('Klinik Full Lifecycle E2E Test Suite', () => {

  test('Patient Booking -> Examination -> Prescription -> Dispense -> Payment Flow', async ({ page }) => {
    // 1. Visit Clinic Portal
    await page.goto('http://localhost:3000');
    await expect(page).toHaveTitle(/Klinik/i);

    // 2. Patient Registration / Booking
    await page.goto('http://localhost:3000/booking');
    await page.fill('input[name="nationalId"]', '1100400123456');
    await page.fill('input[name="firstName"]', 'ประณีต');
    await page.fill('input[name="lastName"]', 'สุขใจ');
    await page.fill('input[name="phone"]', '0867890123');
    await page.click('button[type="submit"]');

    // 3. Nurse Screening / Vitals Check
    await page.goto('http://localhost:3000/nurse/screening');
    await page.click('text=ประณีต สุขใจ');
    await page.fill('input[name="bpSys"]', '120');
    await page.fill('input[name="bpDia"]', '80');
    await page.fill('input[name="temp"]', '37.5');
    await page.click('button:has-text("บันทึกสัญญาณชีพ")');

    // 4. Doctor Examination & Diagnosis
    await page.goto('http://localhost:3000/doctor/consultation');
    await page.click('text=ประณีต สุขใจ');
    await page.fill('textarea[name="chiefComplaint"]', 'เจ็บคอ มีไข้');
    await page.fill('input[name="diagnosisCode"]', 'J02.9');
    await page.click('button:has-text("สั่งจ่ายยา")');

    // 5. Pharmacy Dispensing
    await page.goto('http://localhost:3000/pharmacy');
    await page.click('text=ประณีต สุขใจ');
    await page.click('button:has-text("ยืนยันการจัดยา")');

    // 6. Cashier Billing & Payment
    await page.goto('http://localhost:3000/cashier');
    await page.click('text=ประณีต สุขใจ');
    await page.click('button:has-text("ชำระเงิน")');
    await expect(page.locator('.invoice-success')).toBeVisible();

    // 7. PDPA Data Access Request Check
    await page.goto('http://localhost:3000/pdpa/data-request');
    await page.fill('input[name="phone"]', '0867890123');
    await page.click('button:has-text("ขอดาวน์โหลดข้อมูลส่วนบุคคล")');
    await expect(page.locator('.request-status')).toContainText('บันทึกคำขอแล้ว');
  });

});
