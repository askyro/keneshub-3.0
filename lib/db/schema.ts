import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { v4 as uuidv4 } from 'uuid';

export const USER_ROLES = ['borrower', 'creditor', 'collector', 'lawyer', 'ombudsman'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => uuidv4()),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role', { enum: USER_ROLES }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const debts = sqliteTable('debts', {
  id: text('id').primaryKey().$defaultFn(() => uuidv4()),
  borrowerId: text('borrower_id').notNull().references(() => users.id),
  creditorId: text('creditor_id').notNull().references(() => users.id),
  collectorId: text('collector_id').references(() => users.id),
  amount: real('amount').notNull(),
  currency: text('currency').default('KZT'),
  status: text('status', { enum: ['active', 'negotiation', 'resolved', 'defaulted'] }).default('active'),
  description: text('description'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const negotiations = sqliteTable('negotiations', {
  id: text('id').primaryKey().$defaultFn(() => uuidv4()),
  debtId: text('debt_id').notNull().references(() => debts.id),
  status: text('status').default('open'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const messages = sqliteTable('messages', {
  id: text('id').primaryKey().$defaultFn(() => uuidv4()),
  negotiationId: text('negotiation_id').notNull().references(() => negotiations.id),
  senderId: text('sender_id').notNull().references(() => users.id),
  content: text('content').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});
