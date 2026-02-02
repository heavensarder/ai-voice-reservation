"use client";

import { Bell, User } from "lucide-react";
import AdminMobileSidebar from "./AdminMobileSidebar";

export default function AdminHeader() {
  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b h-16 flex items-center justify-between px-4 md:px-8">
      <div className="flex items-center gap-3">
          <AdminMobileSidebar />
          <div className="font-semibold text-lg text-foreground hidden md:block">
            Overview
          </div>
          <div className="font-semibold text-lg text-foreground md:hidden">
            DineAI
          </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-background"></span>
        </button>
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
           <User className="w-4 h-4 text-primary" />
        </div>
      </div>
    </header>
  );
}
