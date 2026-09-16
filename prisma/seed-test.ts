import { PrismaClient, Role, Gender, AppointmentStatus } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedTestData() {
  console.log('Seeding test data for Klinik...');

  // Clean existing data in reverse order of dependencies
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

  // Create System Staff Users
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@klinik.local',
      name: 'System Administrator',
      passwordHash: '$2a$12$eImiTXuWVxfM37uY4JANjO5E.y/tLlh4Y./1m2P78zF9Jd0bXWJ.m', // 'Password123!'
      role: Role.ADMIN,
      phone: '0812345678',
    },
  });

  const doctorUser = await prisma.user.create({
    data: {
      email: 'doctor.somchai@klinik.local',
      name: 'Dr. Somchai Jaidee',
      passwordHash: '$2a$12$eImiTXuWVxfM37uY4JANjO5E.y/tLlh4Y./1m2P78zF9Jd0bXWJ.m',
      role: Role.DOCTOR,
      phone: '0823456789',
    },
  });

  const nurseUser = await prisma.user.create({
    data: {
      email: 'nurse.suda@klinik.local',
      name: 'Nurse Suda Care',
      passwordHash: '$2a$12$eImiTXuWVxfM37uY4JANjO5E.y/tLlh4Y./1m2P78zF9Jd0bXWJ.m',
      role: Role.NURSE,
      phone: '0834567890',
    },
  });

  const pharmacistUser = await prisma.user.create({
    data: {
      email: 'pharma.manoch@klinik.local',
      name: 'Pharm. Manoch Rx',
      passwordHash: '$2a$12$eImiTXuWVxfM37uY4JANjO5E.y/tLlh4Y./1m2P78zF9Jd0bXWJ.m',
      role: Role.PHARMACIST,
      phone: '0845678901',
    },
  });

  const cashierUser = await prisma.user.create({
    data: {
      email: 'cashier.pim@klinik.local',
      name: 'Cashier Pimpaka',
      passwordHash: '$2a$12$eImiTXuWVxfM37uY4JANjO5E.y/tLlh4Y./1m2P78zF9Jd0bXWJ.m',
      role: Role.CASHIER,
      phone: '0856789012',
    },
  });

  // Create Patient User & Patient Profile
  const patientUser = await prisma.user.create({
    data: {
      email: 'patient.praneet@example.com',
      name: 'Praneet Sukjai',
      passwordHash: '$2a$12$eImiTXuWVxfM37uY4JANjO5E.y/tLlh4Y./1m2P78zF9Jd0bXWJ.m',
      role: Role.PATIENT,
      phone: '0867890123',
    },
  });

  const patient = await prisma.patient.create({
    data: {
      userId: patientUser.id,
      hn: 'HN-690916-0001',
      nationalId: '1100400123456',
      prefix: 'นาย',
      firstName: 'ประณีต',
      lastName: 'สุขใจ',
      dateOfBirth: new Date('1990-05-15'),
      gender: Gender.MALE,
      bloodGroup: 'O+',
      allergies: ['Penicillin'],
      chronicDiseases: ['Hypertension'],
      phone: '0867890123',
      emergencyContact: '0899998888 (ภรรยา)',
      address: '123/45 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110',
    },
  });

  // Create Medications
  const paracetamol = await prisma.medication.create({
    data: {
      code: 'MED-PARA-500',
      name: 'Paracetamol 500mg',
      genericName: 'Acetaminophen',
      category: 'Analgesics / Antipyretics',
      unit: 'Tablet',
      pricePerUnit: 2.5,
      stockQuantity: 1500,
      reorderLevel: 200,
    },
  });

  const amoxicillin = await prisma.medication.create({
    data: {
      code: 'MED-AMOX-500',
      name: 'Amoxicillin 500mg',
      genericName: 'Amoxicillin Trihydrate',
      category: 'Antibiotics',
      unit: 'Capsule',
      pricePerUnit: 5.0,
      stockQuantity: 400,
      reorderLevel: 100,
    },
  });

  const losartan = await prisma.medication.create({
    data: {
      code: 'MED-LOSA-50',
      name: 'Losartan Potassium 50mg',
      genericName: 'Losartan',
      category: 'Antihypertensives',
      unit: 'Tablet',
      pricePerUnit: 8.0,
      stockQuantity: 45, // Below reorder level for low stock alert test
      reorderLevel: 100,
    },
  });

  // Create Appointment
  const appointment = await prisma.appointment.create({
    data: {
      patientId: patient.id,
      doctorId: doctorUser.id,
      scheduledAt: new Date(),
      reason: 'มีไข้ ปวดศีรษะ เจ็บคอ 2 วัน',
      status: AppointmentStatus.IN_CONSULTATION,
      vitals: {
        bpSys: 120,
        bpDia: 80,
        pulse: 78,
        temp: 37.8,
        weight: 68.5,
        height: 172,
      },
      chiefComplaint: 'ไข้สูง มีเสมหะสีเหลือง',
      diagnosisCode: 'J02.9',
      diagnosisDesc: 'Acute pharyngitis, unspecified',
      doctorNotes: 'คอแดงโต พักผ่อนมากๆ ดื่มน้ำอุ่น',
    },
  });

  // Create PDPA Consent Record
  await prisma.consent.create({
    data: {
      patientId: patient.id,
      purpose: 'TREATMENT_AND_RECORDS',
      isGranted: true,
      ipAddress: '127.0.0.1',
    },
  });

  console.log('Seed completed successfully!');
}

if (require.main === module) {
  seedTestData()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
