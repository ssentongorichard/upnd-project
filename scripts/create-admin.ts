/**
 * Script to create an admin user
 * Run with: npx tsx scripts/create-admin.ts
 */

import { db } from '../src/db';
import { users } from '../src/db/schema';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

async function createAdminUser() {
  try {
    const email = 'admin@upnd.zm';
    const password = 'upnd2024';
    const name = 'UPND Admin';

    // Check if admin already exists
    const existingAdmin = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingAdmin) {
      console.log('❌ Admin user already exists with email:', email);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const [newAdmin] = await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
      role: 'National Admin',
      jurisdiction: 'National',
      level: 'National',
      isActive: true,
      partyPosition: 'System Administrator',
    }).returning();

    console.log('✅ Admin user created successfully!');
    console.log('');
    console.log('Login credentials:');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('');
    console.log('⚠️  Please change the password after first login!');

  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }

  process.exit(0);
}

createAdminUser();
