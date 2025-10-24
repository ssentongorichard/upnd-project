'use client';

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, Menu } from 'lucide-react';

interface HeaderProps {
  onMenuToggle: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) return null;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-4 md:px-6 py-4">
        <div className="flex items-center space-x-2 md:space-x-4">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 text-gray-600 hover:text-upnd-red hover:bg-gray-50 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center space-x-3">
            <img 
              src="https://upload.wikimedia.org/wikipedia/en/thumb/3/36/Logo_of_the_United_Party_for_National_Development.svg/400px-Logo_of_the_United_Party_for_National_Development.svg.png"
              alt="UPND Logo"
              className="w-10 h-10 object-contain"
            />
            <div>
              <h1 className="text-base md:text-xl font-bold text-upnd-black">UPND Membership Platform</h1>
              <p className="text-xs md:text-sm text-upnd-yellow font-medium hidden sm:block">Unity, Work, Progress</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 md:space-x-4">
          <div className="hidden md:flex items-center space-x-3">
            <div className="w-10 h-10 bg-upnd-red-light rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-upnd-black">{user.name}</p>
              <p className="text-xs text-gray-500">{user.role}</p>
              {user.partyPosition && (
                <p className="text-xs text-upnd-red font-medium">{user.partyPosition}</p>
              )}
            </div>
          </div>

          <button
            onClick={logout}
            className="flex items-center space-x-2 px-3 md:px-4 py-2 text-gray-600 hover:text-upnd-red hover:bg-gray-50 rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}