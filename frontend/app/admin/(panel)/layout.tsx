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
    <div className="flex h-screen bg-muted/20">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="mx-auto max-w-6xl space-y-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
