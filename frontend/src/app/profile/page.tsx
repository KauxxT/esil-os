'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { User, Mail, BookOpen, Users } from 'lucide-react';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    api.get('/users/profile').then(r => setProfile(r.data)).catch(() => {});
  }, [user]);

  if (loading || !profile) return <DashboardLayout><div>Загрузка...</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Профиль</h1>

      <div className="grid gap-5 max-w-2xl">
        <div className="card">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-2xl font-bold text-primary-600">
              {profile.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{profile.name}</h2>
              <span className={`badge mt-1 ${profile.role === 'TEACHER' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                {profile.role === 'TEACHER' ? 'Преподаватель' : 'Студент'}
              </span>
            </div>
          </div>
        </div>

        <div className="card space-y-4">
          <h3 className="font-semibold text-gray-900">Контактная информация</h3>
          <div className="flex items-center gap-3 text-sm">
            <Mail size={16} className="text-gray-400" />
            <span className="text-gray-700">{profile.email}</span>
          </div>
          {profile.group && (
            <div className="flex items-center gap-3 text-sm">
              <Users size={16} className="text-gray-400" />
              <span className="text-gray-700">Группа: <strong>{profile.group.name}</strong> ({profile.group.course} курс)</span>
            </div>
          )}
          <div className="flex items-center gap-3 text-sm">
            <User size={16} className="text-gray-400" />
            <span className="text-gray-500">Зарегистрирован: {new Date(profile.createdAt).toLocaleDateString('ru')}</span>
          </div>
        </div>

        {profile.subjects?.length > 0 && (
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <BookOpen size={16} />
              Предметы
            </h3>
            <div className="space-y-2">
              {profile.subjects.map((s: any, i: number) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-900">{s.subjectName}</span>
                  {s.teacher && <span className="text-xs text-gray-500">{s.teacher.name}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
