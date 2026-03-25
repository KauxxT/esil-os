'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { format, addDays, startOfWeek } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';

const DAYS = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

export default function SchedulePage() {
  const { user, loading } = useAuth();
  const [lessons, setLessons] = useState<any[]>([]);
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [mode, setMode] = useState<'week' | 'day'>('week');
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [groups, setGroups] = useState<any[]>([]);
  const [form, setForm] = useState({ subjectName: '', groupId: '', room: '', startTime: '', endTime: '', dayOfWeek: 1, weekType: 'BOTH' });

  const fetchLessons = () => {
    api.get('/schedule').then(r => setLessons(r.data)).catch(() => {});
  };

  useEffect(() => {
    fetchLessons();
    api.get('/groups').then(r => setGroups(r.data)).catch(() => {});
  }, [user]);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const displayDays = mode === 'week' ? weekDays : [selectedDay];

  const getLessonsForDay = (day: Date) => {
    const dow = day.getDay();
    return lessons.filter(l => l.dayOfWeek === dow);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/schedule', form);
      setShowForm(false);
      fetchLessons();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Ошибка');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить занятие?')) return;
    await api.delete(`/schedule/${id}`);
    fetchLessons();
  };

  if (loading) return <DashboardLayout><div>Загрузка...</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Расписание</h1>
        <div className="flex gap-2">
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button onClick={() => setMode('week')} className={`px-3 py-1.5 text-sm ${mode === 'week' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600'}`}>Неделя</button>
            <button onClick={() => setMode('day')} className={`px-3 py-1.5 text-sm ${mode === 'day' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600'}`}>День</button>
          </div>
          {user?.role === 'TEACHER' && (
            <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-1">
              <Plus size={16} /> Добавить
            </button>
          )}
        </div>
      </div>

      {/* Week navigation */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => setWeekStart(d => addDays(d, -7))} className="p-1.5 rounded-lg hover:bg-gray-100"><ChevronLeft size={18} /></button>
        <span className="text-sm font-medium text-gray-700">
          {format(weekStart, 'd MMM', { locale: ru })} — {format(addDays(weekStart, 6), 'd MMM yyyy', { locale: ru })}
        </span>
        <button onClick={() => setWeekStart(d => addDays(d, 7))} className="p-1.5 rounded-lg hover:bg-gray-100"><ChevronRight size={18} /></button>
      </div>

      <div className={`grid gap-3 ${mode === 'week' ? 'grid-cols-7' : 'grid-cols-1 max-w-md'}`}>
        {displayDays.map(day => {
          const dayLessons = getLessonsForDay(day);
          const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
          return (
            <div key={day.toISOString()} className="min-w-0">
              <div className={`text-center py-2 px-1 rounded-lg mb-2 text-sm font-medium ${isToday ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                <div>{DAYS[day.getDay()]}</div>
                <div className="text-xs">{format(day, 'd')}</div>
              </div>
              <div className="space-y-2">
                {dayLessons.length === 0 ? (
                  <div className="text-xs text-gray-400 text-center py-4">—</div>
                ) : dayLessons.map(lesson => (
                  <div key={lesson.id} className="bg-blue-50 border border-blue-100 rounded-lg p-2 text-xs group relative">
                    <p className="font-medium text-blue-900 truncate">{lesson.subjectName}</p>
                    <p className="text-blue-600">{format(new Date(lesson.startTime), 'HH:mm')}–{format(new Date(lesson.endTime), 'HH:mm')}</p>
                    <p className="text-gray-500 truncate">Ауд. {lesson.room}</p>
                    {user?.role === 'TEACHER' && (
                      <button onClick={() => handleDelete(lesson.id)} className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600">
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card w-full max-w-md">
            <h2 className="font-semibold mb-4">Добавить занятие</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <input className="input" placeholder="Название предмета" value={form.subjectName} onChange={e => setForm(p => ({ ...p, subjectName: e.target.value }))} required />
              <select className="input" value={form.groupId} onChange={e => setForm(p => ({ ...p, groupId: e.target.value }))} required>
                <option value="">Выберите группу</option>
                {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
              <input className="input" placeholder="Аудитория" value={form.room} onChange={e => setForm(p => ({ ...p, room: e.target.value }))} required />
              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-xs text-gray-500 mb-1 block">Начало</label><input type="datetime-local" className="input" value={form.startTime} onChange={e => setForm(p => ({ ...p, startTime: e.target.value }))} required /></div>
                <div><label className="text-xs text-gray-500 mb-1 block">Конец</label><input type="datetime-local" className="input" value={form.endTime} onChange={e => setForm(p => ({ ...p, endTime: e.target.value }))} required /></div>
              </div>
              <select className="input" value={form.dayOfWeek} onChange={e => setForm(p => ({ ...p, dayOfWeek: Number(e.target.value) }))}>
                {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
              </select>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="btn-primary flex-1">Создать</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Отмена</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
