'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import api from '@/lib/api';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    api.get('/notifications')
      .then(res => setUnreadCount(res.data.filter((n: any) => !n.isRead).length))
      .catch(() => {});
  }, []);

  return (
    <div className="flex min-h-screen">
      <Sidebar unreadCount={unreadCount} />
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto p-6">{children}</div>
      </main>
    </div>
  );
}
