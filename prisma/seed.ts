import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('demo1234', 12);

  const user = await prisma.user.upsert({
    where: { email: 'demo@wordflow.app' },
    update: {},
    create: {
      name: 'Demo Writer',
      email: 'demo@wordflow.app',
      password: hashedPassword,
      emailVerified: true,
      emailVerifiedAt: new Date(),
    },
  });

  console.log('Built-in demo account created/verified:');
  console.log(`  Email: demo@wordflow.app`);
  console.log(`  Password: demo1234`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
