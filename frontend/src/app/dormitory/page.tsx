'use client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { Wrench } from 'lucide-react';
export default function DormitoryPage() {
  const { loading } = useAuth();
  if (loading) return <DashboardLayout><div>Загрузка...</div></DashboardLayout>;
  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="bg-gray-100 p-6 rounded-full mb-5"><Wrench size={40} className="text-gray-400" /></div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Общежитие</h1>
        <p className="text-gray-500 max-w-sm">Раздел находится в разработке и будет доступен в следующей версии.</p>
        <span className="mt-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">Скоро</span>
      </div>
    </DashboardLayout>
  );
}
