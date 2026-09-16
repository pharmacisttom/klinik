const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

function hashPassword(password) {
  const hash = crypto.createHash('sha256').update(password).digest('hex');
  return `$sha256$${hash}`;
}

async function main() {
  const username = 'tomvis';
  const password = '@@35601009741710830856460';
  const passwordHash = hashPassword(password);

  console.log('Creating Tomvis License Admin user...');

  const tomvisAccount = await prisma.user.upsert({
    where: { email: username },
    update: {
      name: 'Tomvis License Master Admin',
      passwordHash: passwordHash,
      role: 'ADMIN',
    },
    create: {
      email: username,
      name: 'Tomvis License Master Admin',
      passwordHash: passwordHash,
      role: 'ADMIN',
      phone: '0812345678',
    },
  });

  // Also upsert for email tomvis@klinik.local
  await prisma.user.upsert({
    where: { email: 'tomvis@klinik.local' },
    update: {
      name: 'Tomvis License Master Admin',
      passwordHash: passwordHash,
      role: 'ADMIN',
    },
    create: {
      email: 'tomvis@klinik.local',
      name: 'Tomvis License Master Admin',
      passwordHash: passwordHash,
      role: 'ADMIN',
      phone: '0812345678',
    },
  });

  console.log('✅ Tomvis License Admin user created successfully!');
  console.log(`Username: ${username}`);
  console.log(`Password: ${password}`);
}

main()
  .catch((e) => {
    console.error('Error creating tomvis license user:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
