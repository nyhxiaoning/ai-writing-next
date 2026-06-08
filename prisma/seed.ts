import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { WHITELIST_ACCOUNTS } from '../lib/whitelist';

const prisma = new PrismaClient();

async function main() {
  // 1. Seed demo account
  const demoPassword = await bcrypt.hash('demo1234', 12);

  await prisma.user.upsert({
    where: { email: 'demo@wordflow.app' },
    update: {},
    create: {
      name: 'Demo Writer',
      email: 'demo@wordflow.app',
      password: demoPassword,
      emailVerified: true,
      emailVerifiedAt: new Date(),
    },
  });

  console.log('Built-in demo account created/verified:');
  console.log(`  Email: demo@wordflow.app`);
  console.log(`  Password: demo1234`);

  // 2. Seed whitelist accounts
  for (const account of WHITELIST_ACCOUNTS) {
    const hashedPassword = await bcrypt.hash(account.password, 12);

    await prisma.user.upsert({
      where: { email: account.email },
      update: {
        password: hashedPassword,
        name: account.name || account.email.split('@')[0],
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
      create: {
        email: account.email,
        name: account.name || account.email.split('@')[0],
        password: hashedPassword,
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });

    console.log(`Whitelist account created/verified:`);
    console.log(`  Email: ${account.email}`);
    console.log(`  Password: ${account.password}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
