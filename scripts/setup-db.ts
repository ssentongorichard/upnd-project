import { db } from '../src/db';
import { users } from '../src/db/schema';
import bcrypt from 'bcryptjs';

async function setupDatabase() {
  try {
    console.log('Setting up database...');
    
    // Create default admin users
    const defaultUsers = [
      {
        name: 'Hakainde Hichilema',
        email: 'admin@upnd.zm',
        role: 'National Admin',
        jurisdiction: 'National',
        level: 'National',
        partyPosition: 'National President',
        isActive: true,
      },
      {
        name: 'Cornelius Mweetwa',
        email: 'provincial@upnd.zm',
        role: 'Provincial Admin',
        jurisdiction: 'Lusaka',
        level: 'Provincial',
        partyPosition: 'Provincial Chairperson',
        isActive: true,
      },
      {
        name: 'Mutale Nalumango',
        email: 'district@upnd.zm',
        role: 'District Admin',
        jurisdiction: 'Lusaka District',
        level: 'District',
        partyPosition: 'District Chairperson',
        isActive: true,
      },
      {
        name: 'Sylvia Masebo',
        email: 'branch@upnd.zm',
        role: 'Branch Admin',
        jurisdiction: 'Kabwata Branch',
        level: 'Branch',
        partyPosition: 'Branch Chairperson',
        isActive: true,
      },
    ];

    for (const userData of defaultUsers) {
      const existingUser = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, userData.email),
      });

      if (!existingUser) {
        await db.insert(users).values(userData);
        console.log(`Created user: ${userData.email}`);
      } else {
        console.log(`User already exists: ${userData.email}`);
      }
    }

    console.log('Database setup completed successfully!');
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

setupDatabase();