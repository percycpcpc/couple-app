const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const users = await prisma.user.findMany({ select: { id: true, email: true, coupleId: true, bucketId: true } });
  console.log('USERS:', JSON.stringify(users));
  const couples = await prisma.couple.findMany({ include: { users: { select: { email: true } } } });
  console.log('COUPLES:', JSON.stringify(couples.map(c => ({ id: c.id, inviteCode: c.inviteCode, currency: c.currency, members: c.users.map(u => u.email) }))));
  await prisma.$disconnect();
})().catch(e => { console.error(e.message); process.exit(1); });
