
'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { UPNDUser, UserRole } from '../types';
import { signIn, signOut, useSession } from 'next-auth/react';

interface AuthContextType {
  user: UPNDUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (role: UserRole) => boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const permissions: Record<UserRole, string[]> = {
  'National Admin': [
    'view_all', 'approve_all', 'manage_users', 'generate_reports',
    'export_data', 'approve_members', 'system_settings', 'manage_disciplinary',
    'manage_events'
  ],
  'Provincial Admin': [
    'view_province', 'approve_members', 'manage_province_users',
    'generate_reports', 'export_data', 'manage_districts', 'manage_branches',
    'manage_officials', 'manage_events', 'view_performance', 'manage_disciplinary'
  ],
  'District Admin': [
    'view_district', 'approve_members', 'manage_district_users',
    'generate_reports', 'manage_constituencies', 'manage_events'
  ],
  'Constituency Admin': [
    'view_constituency', 'approve_members', 'manage_constituency_users',
    'generate_reports', 'manage_wards', 'manage_events'
  ],
  'Ward Admin': [
    'view_ward', 'approve_members', 'manage_ward_users',
    'generate_reports', 'manage_branches', 'manage_events'
  ],
  'Branch Admin': [
    'view_branch', 'approve_members', 'manage_branch_users',
    'generate_reports', 'manage_sections', 'manage_events'
  ],
  'Section Admin': [
    'view_section', 'review_applications', 'generate_reports'
  ],
  'Member': [
    'view_profile', 'update_profile'
  ]
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const user = (session?.user as unknown as UPNDUser) || null;

  const login = async (email: string, password: string): Promise<boolean> => {
    const res = await signIn('credentials', { email, password, redirect: false });
    return res?.ok === true;
  };

  const logout = () => { void signOut({ redirect: false }); };

  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    const userPermissions = permissions[user.role] || [];
    return userPermissions.includes(permission);
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated,
      hasRole,
      hasPermission
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
