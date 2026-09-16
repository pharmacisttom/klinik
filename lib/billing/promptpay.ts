/**
 * EMVCo PromptPay QR Generator Helper for Thai Clinics
 */
export function generatePromptPayPayload(promptPayId: string, amount?: number): string {
  // Clean target ID (Tax ID / Phone Number)
  const target = promptPayId.replace(/[^0-9]/g, '');
  let targetType = '01'; // 01 = Phone Number, 02 = Tax ID / CID
  let formattedTarget = '';

  if (target.length === 10) {
    targetType = '01';
    formattedTarget = '0066' + target.substring(1);
  } else if (target.length === 13) {
    targetType = '02';
    formattedTarget = target;
  } else {
    formattedTarget = target;
  }

  // Build Payload Format Indicator (00) and Point of Initiation (01)
  const payloadFormat = '000201';
  const poi = amount ? '010212' : '010211'; // 12 = Dynamic, 11 = Static

  // Merchant Account Info - PromptPay AID: A000000677010111
  const aid = '0016A000000677010111';
  const targetLength = formattedTarget.length.toString().padStart(2, '0');
  const merchantInfoValue = `${aid}${targetType}${targetLength}${formattedTarget}`;
  const merchantInfoLength = merchantInfoValue.length.toString().padStart(2, '0');
  const merchantInfo = `29${merchantInfoLength}${merchantInfoValue}`;

  // Currency Code (53) = 764 (THB), Country Code (58) = TH
  const currency = '5303764';
  const country = '5802TH';

  // Amount (54)
  let amountStr = '';
  if (amount && amount > 0) {
    const formattedAmount = amount.toFixed(2);
    const amountLength = formattedAmount.length.toString().padStart(2, '0');
    amountStr = `54${amountLength}${formattedAmount}`;
  }

  // Checksum template header (6304)
  const rawPayload = `${payloadFormat}${poi}${merchantInfo}${currency}${country}${amountStr}6304`;

  // Compute CRC16 CCITT
  const crc = crc16Ccitt(rawPayload);
  return `${rawPayload}${crc.toUpperCase()}`;
}

function crc16Ccitt(data: string): string {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    let x = ((crc >> 8) ^ data.charCodeAt(i)) & 0xff;
    x ^= x >> 4;
    crc = ((crc << 8) ^ (x << 12) ^ (x << 5) ^ x) & 0xffff;
  }
  return crc.toString(16).padStart(4, '0');
}
