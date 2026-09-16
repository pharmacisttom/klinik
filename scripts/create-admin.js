const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

// Hash password with SHA-256 fallback or bcrypt format
function hashPassword(password) {
  const hash = crypto.createHash('sha256').update(password).digest('hex');
  return `$sha256$${hash}`;
}

async function main() {
  const password = 'Klinik2026';
  const passwordHash = hashPassword(password);

  console.log('Setting up Admin accounts in Tomvis Clinic database...');

  // Create or update account with username 'admin'
  const adminAccount = await prisma.user.upsert({
    where: { email: 'admin' },
    update: {
      name: 'System Administrator',
      passwordHash: passwordHash,
      role: 'ADMIN',
    },
    create: {
      email: 'admin',
      name: 'System Administrator',
      passwordHash: passwordHash,
      role: 'ADMIN',
      phone: '0812345678',
    },
  });

  // Also create/update account with email 'admin@klinik.local'
  const adminEmailAccount = await prisma.user.upsert({
    where: { email: 'admin@klinik.local' },
    update: {
      name: 'System Administrator',
      passwordHash: passwordHash,
      role: 'ADMIN',
    },
    create: {
      email: 'admin@klinik.local',
      name: 'System Administrator',
      passwordHash: passwordHash,
      role: 'ADMIN',
      phone: '0812345678',
    },
  });

  console.log('✅ Admin accounts created successfully!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Username / Email : admin');
  console.log('Email Alternative: admin@klinik.local');
  console.log('Password         : Klinik2026');
  console.log('Role             : ADMIN');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch((e) => {
    console.error('Error creating admin account:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
