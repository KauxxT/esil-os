'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { Bell, BookOpen, Clock, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const TYPE_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  NEW_ASSIGNMENT: { label: 'Новое задание', icon: BookOpen, color: 'bg-blue-100 text-blue-600' },
  DEADLINE_APPROACHING: { label: 'Дедлайн приближается', icon: Clock, color: 'bg-orange-100 text-orange-600' },
  SCHEDULE_CHANGED: { label: 'Изменение расписания', icon: Calendar, color: 'bg-purple-100 text-purple-600' },
};

export default function NotificationsPage() {
  const { loading } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);

  const fetchAll = () => {
    api.get('/notifications').then(r => setNotifications(r.data)).catch(() => {});
  };

  useEffect(() => { fetchAll(); }, []);

  const markRead = async (id: string) => {
    await api.patch(`/notifications/${id}/read`);
    fetchAll();
  };

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.isRead);
    await Promise.all(unread.map(n => api.patch(`/notifications/${n.id}/read`)));
    fetchAll();
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) return <DashboardLayout><div>Загрузка...</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Уведомления</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-500 mt-0.5">{unreadCount} непрочитанных</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="btn-secondary text-sm">
            Прочитать все
          </button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.length === 0 && (
          <div className="card text-center py-12">
            <Bell size={32} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">Уведомлений пока нет</p>
          </div>
        )}

        {notifications.map(n => {
          const config = TYPE_CONFIG[n.type] || { label: n.type, icon: Bell, color: 'bg-gray-100 text-gray-600' };
          const Icon = config.icon;
          return (
            <div
              key={n.id}
              onClick={() => !n.isRead && markRead(n.id)}
              className={cn(
                'card cursor-pointer transition-all',
                !n.isRead ? 'border-primary-200 bg-primary-50/30 hover:bg-primary-50' : 'opacity-70 hover:opacity-100'
              )}
            >
              <div className="flex gap-4">
                <div className={cn('p-2.5 rounded-xl shrink-0 h-fit', config.color)}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-medium text-gray-500">{config.label}</span>
                      <h3 className="font-medium text-gray-900">{n.title}</h3>
                    </div>
                    {!n.isRead && (
                      <span className="w-2 h-2 bg-primary-500 rounded-full shrink-0 mt-1.5" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5">{n.body}</p>
                  <p className="text-xs text-gray-400 mt-1.5">
                    {format(new Date(n.createdAt), 'd MMM, HH:mm', { locale: ru })}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
