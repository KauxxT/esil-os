'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { FileText, Plus, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const CERT_TYPES: Record<string, string> = {
  STUDY_CERTIFICATE: 'Справка об обучении',
  CUSTOM_CERTIFICATE: 'Справка по месту требования',
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  PENDING: { label: 'В обработке', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  READY: { label: 'Готова', color: 'bg-green-100 text-green-700', icon: CheckCircle },
};

export default function CertificatesPage() {
  const { user, loading } = useAuth();
  const [certs, setCerts] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: 'STUDY_CERTIFICATE', comment: '' });

  const fetchAll = () => {
    api.get('/certificates').then(r => setCerts(r.data)).catch(() => {});
  };

  useEffect(() => { fetchAll(); }, [user]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/certificates', form);
      setShowForm(false);
      setForm({ type: 'STUDY_CERTIFICATE', comment: '' });
      fetchAll();
    } catch (err: any) { alert(err.response?.data?.message || 'Ошибка'); }
  };

  const handleStatusChange = async (id: string, status: string) => {
    await api.patch(`/certificates/${id}/status`, { status });
    fetchAll();
  };

  if (loading) return <DashboardLayout><div>Загрузка...</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Справки</h1>
        {user?.role === 'STUDENT' && (
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-1">
            <Plus size={16} /> Запросить
          </button>
        )}
      </div>

      <div className="space-y-3">
        {certs.length === 0 && (
          <div className="card text-center py-12">
            <FileText size={32} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">Запросов справок нет</p>
          </div>
        )}
        {certs.map(c => {
          const status = STATUS_CONFIG[c.status];
          const StatusIcon = status.icon;
          return (
            <div key={c.id} className="card">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-medium text-gray-900">{CERT_TYPES[c.type]}</h3>
                  {c.comment && <p className="text-sm text-gray-500 mt-0.5">{c.comment}</p>}
                  {c.student && (
                    <p className="text-sm text-gray-500 mt-0.5">Студент: {c.student.name} ({c.student.email})</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {format(new Date(c.createdAt), 'd MMM yyyy', { locale: ru })}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={cn('badge flex items-center gap-1', status.color)}>
                    <StatusIcon size={12} />
                    {status.label}
                  </span>
                  {user?.role === 'TEACHER' && c.status === 'PENDING' && (
                    <button
                      onClick={() => handleStatusChange(c.id, 'READY')}
                      className="btn-secondary text-xs py-1 px-2"
                    >
                      Отметить готовой
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
            <h2 className="font-semibold mb-4">Запрос справки</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Тип справки</label>
                <select className="input" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                  {Object.entries(CERT_TYPES).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Примечание (необязательно)</label>
                <textarea className="input resize-none" rows={3} placeholder="Куда предоставляется справка..."
                  value={form.comment} onChange={e => setForm(p => ({ ...p, comment: e.target.value }))} />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="btn-primary flex-1">Отправить запрос</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Отмена</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
