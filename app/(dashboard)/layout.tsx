import { requireAuth } from '@/lib/actions';
import Sidebar from '@/components/Sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-stone-900">
      <div className="fixed h-screen w-64">
        <Sidebar />
      </div>
      <main className="flex-1 p-8 ml-64 overflow-y-auto h-screen">
        {children}
      </main>
    </div>
  );
}
