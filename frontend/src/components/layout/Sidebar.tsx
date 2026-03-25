'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Calendar, BookOpen, CheckSquare,
  Bell, FileText, User, Home, Users, MessageSquare, LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  { href: '/dashboard', label: 'Главная', icon: LayoutDashboard },
  { href: '/schedule', label: 'Расписание', icon: Calendar },
  { href: '/assignments', label: 'Задания', icon: BookOpen },
  { href: '/attendance', label: 'Посещаемость', icon: CheckSquare },
  { href: '/notifications', label: 'Уведомления', icon: Bell, badge: true },
  { href: '/certificates', label: 'Справки', icon: FileText },
  { href: '/profile', label: 'Профиль', icon: User },
  { href: '/dormitory', label: 'Общежитие', icon: Home, stub: true },
  { href: '/groups', label: 'Группы', icon: Users, stub: true },
  { href: '/chats', label: 'Чаты', icon: MessageSquare, stub: true },
];

export default function Sidebar({ unreadCount = 0 }: { unreadCount?: number }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-100 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-xl font-bold text-primary-600">Esil OS</h1>
        <p className="text-xs text-gray-500 mt-0.5">Campus Platform</p>
      </div>

      {/* User info */}
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
        <span className={cn('badge mt-1', user?.role === 'TEACHER' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700')}>
          {user?.role === 'TEACHER' ? 'Преподаватель' : 'Студент'}
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon, badge, stub }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                stub && 'opacity-60'
              )}
            >
              <Icon size={18} />
              <span className="flex-1">{label}</span>
              {badge && unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
              {stub && <span className="text-xs text-gray-400">скоро</span>}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut size={18} />
          Выйти
        </button>
      </div>
    </aside>
  );
}
