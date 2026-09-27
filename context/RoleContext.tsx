'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'admin' | 'volunteer' | 'donor';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  organization: string;
  avatar: string;
}

const DEFAULT_USERS: Record<UserRole, UserProfile> = {
  admin: {
    id: 'admin-1',
    name: 'Sarah Dispatcher',
    role: 'admin',
    organization: 'Central Hub Dispatch',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
  },
  volunteer: {
    id: 'vol-1',
    name: 'Marcus T.',
    role: 'volunteer',
    organization: 'Bay Area Food Runners',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  },
  donor: {
    id: 'donor-1',
    name: 'Boulangerie Bistro',
    role: 'donor',
    organization: 'Boulangerie Bistro #382',
    avatar: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=150&q=80',
  },
};

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  currentUser: UserProfile;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<UserRole>('admin');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    showToast(`Switched active profile to ${newRole.toUpperCase()} mode (${DEFAULT_USERS[newRole].name})`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  return (
    <RoleContext.Provider
      value={{
        role,
        setRole,
        currentUser: DEFAULT_USERS[role],
        toastMessage,
        showToast,
      }}
    >
      {children}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700 flex items-center space-x-3 text-sm animate-bounce">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}
