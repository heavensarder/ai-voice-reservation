"use client";

import { Bell, User } from "lucide-react";
import AdminMobileSidebar from "./AdminMobileSidebar";

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
        <button className="relative p-2.5 rounded-full bg-white hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-colors shadow-sm border border-slate-100">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center border-2 border-white shadow-sm">
          <User className="w-5 h-5 text-emerald-600" />
        </div>
      </div>
    </header>
  );
}
