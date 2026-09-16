const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding local SQLite database for Tomvis Clinic...');

  await prisma.coldChainLog.deleteMany();
  await prisma.stockCard.deleteMany();
  await prisma.adrReport.deleteMany();
  await prisma.chronicRegistry.deleteMany();
  await prisma.procedureRecord.deleteMany();
  await prisma.controlledDrugLog.deleteMany();
  await prisma.drugLot.deleteMany();
  await prisma.medicalCertificate.deleteMany();
  await prisma.taxReceipt.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.dataRequest.deleteMany();
  await prisma.consent.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.prescriptionItem.deleteMany();
  await prisma.prescription.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.medication.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.user.deleteMany();

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@klinik.local',
      name: 'System Administrator',
      passwordHash: '$2a$12$eImiTXuWVxfM37uY4JANjO5E.y/tLlh4Y./1m2P78zF9Jd0bXWJ.m',
      role: 'ADMIN',
      phone: '0812345678',
    },
  });

  const doctorUser = await prisma.user.create({
    data: {
      email: 'doctor.somchai@klinik.local',
      name: 'Dr. Somchai Jaidee',
      passwordHash: '$2a$12$eImiTXuWVxfM37uY4JANjO5E.y/tLlh4Y./1m2P78zF9Jd0bXWJ.m',
      role: 'DOCTOR',
      phone: '0823456789',
    },
  });

  const nurseUser = await prisma.user.create({
    data: {
      email: 'nurse.suda@klinik.local',
      name: 'Nurse Suda Care',
      passwordHash: '$2a$12$eImiTXuWVxfM37uY4JANjO5E.y/tLlh4Y./1m2P78zF9Jd0bXWJ.m',
      role: 'NURSE',
      phone: '0834567890',
    },
  });

  const patientUser = await prisma.user.create({
    data: {
      email: 'patient.praneet@example.com',
      name: 'Praneet Sukjai',
      passwordHash: '$2a$12$eImiTXuWVxfM37uY4JANjO5E.y/tLlh4Y./1m2P78zF9Jd0bXWJ.m',
      role: 'PATIENT',
      phone: '0867890123',
    },
  });

  const patient = await prisma.patient.create({
    data: {
      userId: patientUser.id,
      hn: 'HN-690916-0001',
      nationalId: '1100400123450',
      prefix: 'นาย',
      firstName: 'ประณีต',
      lastName: 'สุขใจ',
      dateOfBirth: new Date('1990-05-15'),
      gender: 'MALE',
      bloodGroup: 'O+',
      allergies: JSON.stringify(['Penicillin', 'Amoxicillin']),
      chronicDiseases: JSON.stringify(['Hypertension']),
      phone: '0867890123',
      emergencyContact: '0899998888 (ภรรยา)',
      address: '123/45 ถนนสุขุมวิท กรุงเทพฯ 10110',
    },
  });

  const medPara = await prisma.medication.create({
    data: {
      code: 'MED-PARA-500',
      name: 'Paracetamol 500mg',
      genericName: 'Acetaminophen',
      category: 'Analgesics',
      drugClass: 'ANALGESIC',
      tmtCode: '100000000000000000001234',
      fdaRegNo: '1A 123/45',
      unit: 'Tablet',
      pricePerUnit: 2.5,
      stockQuantity: 1500,
      reorderLevel: 200,
      isControlledDrug: false,
    },
  });

  const medAmox = await prisma.medication.create({
    data: {
      code: 'MED-AMOX-500',
      name: 'Amoxicillin 500mg',
      genericName: 'Amoxicillin Trihydrate',
      category: 'Antibiotics',
      drugClass: 'PENICILLIN',
      tmtCode: '100000000000000000005678',
      fdaRegNo: '1A 456/50',
      unit: 'Capsule',
      pricePerUnit: 5.0,
      stockQuantity: 400,
      reorderLevel: 100,
      isControlledDrug: false,
    },
  });

  const medDiaz = await prisma.medication.create({
    data: {
      code: 'MED-DIAZ-5',
      name: 'Diazepam 5mg (Valium)',
      genericName: 'Diazepam',
      category: 'Sedative / Anxiolytic',
      drugClass: 'BENZODIAZEPINE',
      tmtCode: '100000000000000000009999',
      fdaRegNo: '2A 789/55',
      unit: 'Tablet',
      pricePerUnit: 15.0,
      stockQuantity: 200,
      reorderLevel: 50,
      isControlledDrug: true,
      controlCategory: 'SCHEDULE_4',
    },
  });

  // Create Drug Lots
  await prisma.drugLot.create({
    data: {
      medicationId: medPara.id,
      lotNumber: 'LOT-PAR-2026A',
      expiryDate: new Date('2027-12-31'),
      initialQuantity: 1500,
      currentQuantity: 1500,
    },
  });

  await prisma.drugLot.create({
    data: {
      medicationId: medDiaz.id,
      lotNumber: 'LOT-DIA-2026B',
      expiryDate: new Date('2027-06-30'),
      initialQuantity: 200,
      currentQuantity: 200,
    },
  });

  // Seed sample Controlled Drug Log (ข.ด.9)
  await prisma.controlledDrugLog.create({
    data: {
      medicationId: medDiaz.id,
      patientId: patient.id,
      doctorId: doctorUser.id,
      quantity: 10,
      balanceAfter: 190,
      actionType: 'DISPENSED',
      notes: 'สั่งจ่ายเพื่อรักษาอาการนอนไม่หลับรุนแรง',
    },
  });

  // Seed sample Medical Certificate (ใบรับรองแพทย์ 5 โรค)
  await prisma.medicalCertificate.create({
    data: {
      certificateNumber: 'MC-2026-0001',
      patientId: patient.id,
      doctorId: doctorUser.id,
      type: 'WORK_FITNESS',
      fiveDiseasesChecked: true,
      fitForWork: true,
      restDays: 0,
      diagnosisText: 'ร่างกายสมบูรณ์แข็งแรง ไม่พบอาการของโรคต้องห้ามตามกฎหมายสถานพยาบาล',
      remarks: 'ออกใบรับรองแพทย์เพื่อสมัครงาน',
    },
  });

  // Seed sample Chronic Registry record
  await prisma.chronicRegistry.create({
    data: {
      patientId: patient.id,
      diseaseCode: 'I10',
      diseaseName: 'Essential (primary) hypertension',
      lastHbA1cVal: 6.2,
      lastEgfrVal: 95.0,
      nextDueDate: new Date('2026-12-31'),
    },
  });

  // Seed sample Procedure Record
  await prisma.procedureRecord.create({
    data: {
      procedureCode: '86.59',
      procedureName: 'Wound suture 3 stitches (เย็บแผล 3 เข็ม)',
      patientId: patient.id,
      doctorId: doctorUser.id,
      anesthesiaType: 'LOCAL',
      consentSigned: true,
      notes: 'ทำแผลและเย็บแผลฉีกขาดบริเวณแขนขวา 3 เข็มด้วยความประณีต ปลอดเชื้อ',
    },
  });

  // Seed sample Cold Chain Log
  await prisma.coldChainLog.create({
    data: {
      fridgeId: 'FRIDGE-MAIN-01',
      tempCelsius: 4.2,
      isAlarm: false,
      inspectorName: 'ภก. สมชาย ใจดี',
    },
  });

  // Seed sample Stock Card Record
  await prisma.stockCard.create({
    data: {
      medicationId: medPara.id,
      movementType: 'RECEIVE_LOT',
      inQty: 1500,
      outQty: 0,
      balanceQty: 1500,
      referenceDoc: 'PO-2026-0001',
      operatorName: 'ภก. สมชาย ใจดี',
    },
  });

  // Seed sample ADR Report
  await prisma.adrReport.create({
    data: {
      patientId: patient.id,
      medicationId: medAmox.id,
      reactionDesc: 'Maculopapular rash & Mild urticaria (ผื่นแดงคันตามตัว)',
      severity: 'MODERATE',
      naranjoScore: 6,
      causality: 'PROBABLE',
      reportedToFda: true,
    },
  });

  console.log('✅ Local SQLite database successfully populated with Tomvis Clinic sample data!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
