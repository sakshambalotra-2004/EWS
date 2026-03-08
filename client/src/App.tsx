import React, { useState } from 'react';
import MainLayout from './layouts/MainLayout';
import PageRouter from './router/PageRouter';
import Auth from './pages/Auth';

type Role = 'admin' | 'faculty' | 'counselor' | 'student';

export default function App() {
  const [page, setPage] = useState('Dashboard');

  const token = localStorage.getItem('token');
  const role  = (localStorage.getItem('role') || 'student') as Role;

  if (!token) {
    return <Auth />;
  }

  return (
    <MainLayout role={role} page={page} setPage={setPage}>
      <PageRouter role={role} page={page} />
    </MainLayout>
  );
}