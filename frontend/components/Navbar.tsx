"use client";

import Link from "next/link";
import { UtensilsCrossed } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold text-xl tracking-tight text-primary">
          <div className="bg-primary/10 p-2 rounded-lg">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <span>DineAI</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link 
            href="/admin" 
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Admin Dashboard
          </Link>
          <Link
            href="/"
            className="hidden md:inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}
