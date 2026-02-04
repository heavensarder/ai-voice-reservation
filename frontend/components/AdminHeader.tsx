"use client";

import { Bell, User } from "lucide-react";
import AdminMobileSidebar from "./AdminMobileSidebar";
import NotificationDropdown from "./NotificationDropdown";
import ProfileDropdown from "./ProfileDropdown";

export default function AdminHeader() {
  return (
    <header className="sticky top-0 z-40 h-24 flex items-center justify-between px-8 py-4">
      <div className="flex items-center gap-4">
        <AdminMobileSidebar />
        <div className="font-bold text-2xl text-slate-800 hidden md:block">
          Overview
        </div>
        <div className="font-bold text-xl text-slate-800 md:hidden">
          Bhojone<span className="text-emerald-600">.</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <NotificationDropdown />
        <ProfileDropdown />
      </div>
    </header >
  );
}
