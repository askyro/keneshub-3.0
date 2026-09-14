import { db } from './index';
import { users, debts } from './schema';
import { hashPassword } from '../auth/password';

async function seed() {
  console.log('Seeding KenesHub database...');

  const demoPasswordHash = await hashPassword('password123');

  // Create Users
  const borrower = await db.insert(users).values({
    name: 'Алибек Нурланов',
    email: 'alibek@example.kz',
    passwordHash: demoPasswordHash,
    role: 'borrower',
  }).returning().get();

  const bank = await db.insert(users).values({
    name: 'Kaspi Bank',
    email: 'support@kaspi.kz',
    passwordHash: demoPasswordHash,
    role: 'creditor',
  }).returning().get();

  const collector = await db.insert(users).values({
    name: 'Collector Express',
    email: 'info@collector.kz',
    passwordHash: demoPasswordHash,
    role: 'collector',
  }).returning().get();

  // Create Debts
  await db.insert(debts).values({
    borrowerId: borrower.id,
    creditorId: bank.id,
    amount: 1250000,
    status: 'negotiation',
    description: 'Потребительский кредит #442',
  });

  await db.insert(debts).values({
    borrowerId: borrower.id,
    creditorId: bank.id,
    collectorId: collector.id,
    amount: 850000,
    status: 'active',
    description: 'Рассрочка на технику',
  });

  console.log('Seed completed successfully.');
}

seed().catch(console.error);
