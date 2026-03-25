'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { format, isPast, isWithinInterval, addHours } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Plus, Trash2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  NOT_STARTED: { label: 'Не начато', color: 'bg-gray-100 text-gray-600' },
  IN_PROGRESS: { label: 'В процессе', color: 'bg-yellow-100 text-yellow-700' },
  DONE: { label: 'Выполнено', color: 'bg-green-100 text-green-700' },
};

export default function AssignmentsPage() {
  const { user, loading } = useAuth();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>('ALL');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', groupId: '', deadline: '' });

  const fetchAll = () => {
    api.get('/assignments').then(r => setAssignments(r.data)).catch(() => {});
  };

  useEffect(() => {
    fetchAll();
    api.get('/groups').then(r => setGroups(r.data)).catch(() => {});
  }, [user]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/assignments', form);
      setShowForm(false);
      setForm({ title: '', description: '', groupId: '', deadline: '' });
      fetchAll();
    } catch (err: any) { alert(err.response?.data?.message || 'Ошибка'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить задание?')) return;
    await api.delete(`/assignments/${id}`);
    fetchAll();
  };

  const handleStatusChange = async (id: string, status: string) => {
    await api.patch(`/assignments/${id}/status`, { status });
    fetchAll();
  };

  const getMyStatus = (a: any) => a.statuses?.[0]?.status || 'NOT_STARTED';

  const filtered = assignments.filter(a => {
    if (filter === 'ALL') return true;
    return getMyStatus(a) === filter;
  });

  const isUrgent = (deadline: string) => {
    const d = new Date(deadline);
    return !isPast(d) && isWithinInterval(new Date(), { start: new Date(), end: addHours(d, -24) });
  };

  if (loading) return <DashboardLayout><div>Загрузка...</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Задания</h1>
        {user?.role === 'TEACHER' && (
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-1">
            <Plus size={16} /> Добавить
          </button>
        )}
      </div>

      {/* Filter tabs */}
      {user?.role === 'STUDENT' && (
        <div className="flex gap-2 mb-5">
          {['ALL', 'NOT_STARTED', 'IN_PROGRESS', 'DONE'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={cn('px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                filter === s ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50')}>
              {s === 'ALL' ? 'Все' : STATUS_LABELS[s].label}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="card text-center text-gray-500 py-12">Заданий нет</div>
        )}
        {filtered.map(a => {
          const deadline = new Date(a.deadline);
          const overdue = isPast(deadline);
          const urgent = isUrgent(a.deadline);
          const myStatus = getMyStatus(a);

          return (
            <div key={a.id} className={cn('card', overdue && myStatus !== 'DONE' && 'border-red-200 bg-red-50')}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{a.title}</h3>
                    {urgent && !overdue && <span className="badge bg-orange-100 text-orange-700"><Clock size={10} className="mr-1" />Скоро</span>}
                    {overdue && myStatus !== 'DONE' && <span className="badge bg-red-100 text-red-700">Просрочено</span>}
                  </div>
                  {a.description && <p className="text-sm text-gray-500 mb-2">{a.description}</p>}
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>Группа: {a.group?.name}</span>
                    <span>Дедлайн: {format(deadline, 'd MMM yyyy, HH:mm', { locale: ru })}</span>
                    {a.teacher && <span>Преподаватель: {a.teacher.name}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {user?.role === 'STUDENT' && (
                    <select
                      className="text-sm border border-gray-200 rounded-lg px-2 py-1"
                      value={myStatus}
                      onChange={e => handleStatusChange(a.id, e.target.value)}
                    >
                      {Object.entries(STATUS_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>{v.label}</option>
                      ))}
                    </select>
                  )}
                  {user?.role === 'STUDENT' && (
                    <span className={cn('badge', STATUS_LABELS[myStatus]?.color)}>
                      {STATUS_LABELS[myStatus]?.label}
                    </span>
                  )}
                  {user?.role === 'TEACHER' && (
                    <button onClick={() => handleDelete(a.id)} className="text-red-400 hover:text-red-600">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card w-full max-w-md">
            <h2 className="font-semibold mb-4">Новое задание</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <input className="input" placeholder="Название" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
              <textarea className="input resize-none" rows={3} placeholder="Описание (необязательно)" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              <select className="input" value={form.groupId} onChange={e => setForm(p => ({ ...p, groupId: e.target.value }))} required>
                <option value="">Выберите группу</option>
                {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Дедлайн</label>
                <input type="datetime-local" className="input" value={form.deadline} onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))} required />
              </div>
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
