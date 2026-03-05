import React from 'react';
import Sidebar from '../components/Sidebar';
import type { Role } from '../types';

interface MainLayoutProps {
  role: Role;
  page: string;
  setPage: (page: string) => void;
  children: React.ReactNode;
}

export default function MainLayout({ role, page, setPage, children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen bg-slate-50">

      <Sidebar
        role={role}
        page={page}
        setPage={setPage}
      />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-8 py-7">
          {children}
        </div>
      </main>

    </div>
  );
}