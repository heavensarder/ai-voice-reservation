import Link from 'next/link';
import { logoutAdmin } from '@/app/admin/actions';
import { redirect } from 'next/navigation';

import AdminSidebar from "@/components/AdminSidebar";
import AdminHeader from "@/components/AdminHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 selection:bg-emerald-500/20">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden md:pl-80 transition-all duration-300">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-0">
          <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
