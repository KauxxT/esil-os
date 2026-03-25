'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';

export default function AttendancePage() {
  const { user, loading } = useAuth();
  const [code, setCode] = useState('');
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [selectedLesson, setSelectedLesson] = useState('');
  const [generatedCode, setGeneratedCode] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);

  useEffect(() => {
    api.get('/schedule').then(r => setLessons(r.data)).catch(() => {});
  }, [user]);

  const handleMark = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/attendance/mark', { code });
      setMessage({ text: 'Посещаемость отмечена!', ok: true });
      setCode('');
    } catch (err: any) {
      setMessage({ text: err.response?.data?.message || 'Ошибка', ok: false });
    }
  };

  const handleGenerate = async () => {
    if (!selectedLesson) return;
    try {
      const res = await api.post('/attendance/generate', { lessonId: selectedLesson, ttlMinutes: 15 });
      setGeneratedCode(res.data);
      fetchRecords(selectedLesson);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Ошибка');
    }
  };

  const fetchRecords = (lessonId: string) => {
    api.get(`/attendance/${lessonId}`).then(r => setRecords(r.data)).catch(() => {});
  };

  const handleSelectLesson = (id: string) => {
    setSelectedLesson(id);
    setGeneratedCode(null);
    setRecords([]);
    if (id) fetchRecords(id);
  };

  if (loading) return <DashboardLayout><div>Загрузка...</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Посещаемость</h1>

      {user?.role === 'STUDENT' && (
        <div className="card max-w-md">
          <h2 className="font-semibold text-gray-900 mb-4">Отметить посещаемость</h2>
          <form onSubmit={handleMark} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Код от преподавателя</label>
              <input
                className="input text-2xl tracking-widest text-center font-mono"
                placeholder="000000"
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                required
              />
            </div>
            {message && (
              <div className={`flex items-center gap-2 text-sm p-3 rounded-lg ${message.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {message.ok ? <CheckCircle size={16} /> : <XCircle size={16} />}
                {message.text}
              </div>
            )}
            <button type="submit" className="btn-primary w-full" disabled={code.length !== 6}>
              Отметиться
            </button>
          </form>
        </div>
      )}

      {user?.role === 'TEACHER' && (
        <div className="space-y-5">
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4">Генерация кода</h2>
            <div className="flex gap-3">
              <select
                className="input flex-1"
                value={selectedLesson}
                onChange={e => handleSelectLesson(e.target.value)}
              >
                <option value="">Выберите занятие</option>
                {lessons.map(l => (
                  <option key={l.id} value={l.id}>
                    {l.subjectName} — {l.group?.name}
                  </option>
                ))}
              </select>
              <button
                onClick={handleGenerate}
                disabled={!selectedLesson}
                className="btn-primary flex items-center gap-2"
              >
                <RefreshCw size={16} />
                Генерировать
              </button>
            </div>

            {generatedCode && (
              <div className="mt-5 p-5 bg-primary-50 rounded-xl text-center">
                <p className="text-sm text-gray-500 mb-2">Код для студентов (действует 15 мин)</p>
                <p className="text-5xl font-mono font-bold text-primary-700 tracking-widest">
                  {generatedCode.code}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Истекает: {new Date(generatedCode.expiresAt).toLocaleTimeString('ru')}
                </p>
              </div>
            )}
          </div>

          {selectedLesson && records.length > 0 && (
            <div className="card">
              <h2 className="font-semibold text-gray-900 mb-3">
                Отметившиеся студенты ({records.length})
              </h2>
              <div className="space-y-2">
                {records.map(r => (
                  <div key={r.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{r.student?.name}</p>
                      <p className="text-xs text-gray-500">{r.student?.email}</p>
                    </div>
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle size={14} />
                      <span className="text-xs">{new Date(r.markedAt).toLocaleTimeString('ru')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
