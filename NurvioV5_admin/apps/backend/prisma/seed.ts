import { PrismaClient, RoleName } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // roles
  for (const name of Object.values(RoleName)) {
    await prisma.role.upsert({ where: { name }, update: {}, create: { name } });
  }

  const admins = [
    { email: 'orange.admin@nurvio.de', username: 'orange.admin', password: 'Root.Orange!', roles: ['SUPERADMIN'] },
    { email: 'vez.admin@nurvio.de', username: 'vez.admin', password: 'Root.Vez!', roles: ['ADMIN'] },
  ];

  for (const a of admins) {
    const passwordHash = await bcrypt.hash(a.password, 12);
    await prisma.user.upsert({
      where: { email: a.email },
      update: { username: a.username, passwordHash, roles: { set: [], connect: a.roles.map((r) => ({ name: r as RoleName })) } },
      create: {
        email: a.email,
        username: a.username,
        passwordHash,
        roles: { connect: a.roles.map((r) => ({ name: r as RoleName })) },
      },
    });
  }

  console.log('Seed complete');
}

main().finally(async () => {
  await prisma.$disconnect();
});