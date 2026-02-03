"use client";

import { UtensilsCrossed } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-xl tracking-tight text-primary">
          <div className="bg-primary/10 p-2 rounded-lg">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <span>DineAI</span>
        </div>
      </div>
    </nav>
  );
}
