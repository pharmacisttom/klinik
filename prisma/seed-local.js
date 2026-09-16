const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding local SQLite database for Klinik...');

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
      allergies: JSON.stringify(['Penicillin']),
      chronicDiseases: JSON.stringify(['Hypertension']),
      phone: '0867890123',
      emergencyContact: '0899998888 (ภรรยา)',
      address: '123/45 ถนนสุขุมวิท กรุงเทพฯ 10110',
    },
  });

  await prisma.medication.createMany({
    data: [
      {
        code: 'MED-PARA-500',
        name: 'Paracetamol 500mg',
        genericName: 'Acetaminophen',
        category: 'Analgesics',
        unit: 'Tablet',
        pricePerUnit: 2.5,
        stockQuantity: 1500,
        reorderLevel: 200,
      },
      {
        code: 'MED-AMOX-500',
        name: 'Amoxicillin 500mg',
        genericName: 'Amoxicillin Trihydrate',
        category: 'Antibiotics',
        unit: 'Capsule',
        pricePerUnit: 5.0,
        stockQuantity: 400,
        reorderLevel: 100,
      },
    ],
  });

  console.log('✅ Local SQLite database successfully populated with initial data!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
