'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { Calendar, BookOpen, Bell, CheckSquare } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [stats, setStats] = useState({ assignments: 0, notifications: 0, lessons: 0 });

  useEffect(() => {
    if (!user) return;
    Promise.all([
      api.get('/assignments').catch(() => ({ data: [] })),
      api.get('/notifications').catch(() => ({ data: [] })),
      api.get('/schedule').catch(() => ({ data: [] })),
    ]).then(([a, n, s]) => {
      setStats({
        assignments: a.data.filter((x: any) => {
          const st = x.statuses?.[0]?.status;
          return !st || st !== 'DONE';
        }).length,
        notifications: n.data.filter((x: any) => !x.isRead).length,
        lessons: s.data.length,
      });
    });
  }, [user]);

  if (loading) return <DashboardLayout><div className="animate-pulse">Загрузка...</div></DashboardLayout>;

  const cards = [
    { label: 'Активных заданий', value: stats.assignments, icon: BookOpen, href: '/assignments', color: 'bg-blue-50 text-blue-600' },
    { label: 'Непрочитанных уведомлений', value: stats.notifications, icon: Bell, href: '/notifications', color: 'bg-yellow-50 text-yellow-600' },
    { label: 'Занятий в расписании', value: stats.lessons, icon: Calendar, href: '/schedule', color: 'bg-green-50 text-green-600' },
  ];

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Добро пожаловать, {user?.name}! 👋
        </h1>
        <p className="text-gray-500 mt-1">{format(new Date(), 'EEEE, d MMMM yyyy', { locale: ru })}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {cards.map(({ label, value, icon: Icon, href, color }) => (
          <Link key={href} href={href} className="card hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${color}`}>
                <Icon size={22} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-sm text-gray-500">{label}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Быстрые действия</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { href: '/schedule', label: 'Расписание', icon: Calendar },
            { href: '/assignments', label: 'Задания', icon: BookOpen },
            { href: '/attendance', label: 'Посещаемость', icon: CheckSquare },
            { href: '/certificates', label: 'Справки', icon: BookOpen },
          ].map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 hover:border-primary-200 hover:bg-primary-50 transition-colors text-sm font-medium text-gray-700">
              <Icon size={20} className="text-primary-600" />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
