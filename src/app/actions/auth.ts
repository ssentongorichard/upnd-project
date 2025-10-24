'use server';

import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { registerSchema, type RegisterInput } from '@/lib/validations';

// Register new user/admin
export async function registerUser(data: RegisterInput) {
  try {
    const validatedData = registerSchema.parse(data);

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, validatedData.email),
    });

    if (existingUser) {
      return { success: false, error: 'User with this email already exists' };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Create user
    const [newUser] = await db.insert(users).values({
      name: validatedData.name,
      email: validatedData.email,
      password: hashedPassword,
      role: validatedData.role || 'Member',
      isActive: true,
    }).returning();

    // Don't return password
    const { password, ...userWithoutPassword } = newUser;

    return { success: true, data: userWithoutPassword };
  } catch (error: any) {
    console.error('Error registering user:', error);
    if (error.name === 'ZodError') {
      return { success: false, error: 'Validation failed', details: error.errors };
    }
    return { success: false, error: 'Failed to register user' };
  }
}

// Get user by email
export async function getUserByEmail(email: string) {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Don't return password
    const { password, ...userWithoutPassword } = user;

    return { success: true, data: userWithoutPassword };
  } catch (error) {
    console.error('Error fetching user:', error);
    return { success: false, error: 'Failed to fetch user' };
  }
}

// Update user role and permissions
export async function updateUserRole(
  userId: string,
  role: string,
  jurisdiction?: string,
  level?: string,
  partyPosition?: string
) {
  try {
    const [updatedUser] = await db
      .update(users)
      .set({
        role,
        jurisdiction,
        level,
        partyPosition,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    const { password, ...userWithoutPassword } = updatedUser;

    return { success: true, data: userWithoutPassword };
  } catch (error) {
    console.error('Error updating user role:', error);
    return { success: false, error: 'Failed to update user role' };
  }
}
