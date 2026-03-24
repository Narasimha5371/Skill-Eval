"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, LayoutDashboard, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { SignInButton, SignOutButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "./ui/Button";

export function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { label: "Candidate", href: "/candidate", icon: LayoutDashboard },
    { label: "Manager", href: "/manager", icon: Users },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/20 bg-white/40 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-blue-600 p-1.5 rounded-lg group-hover:rotate-12 transition-transform shadow-lg shadow-blue-200">
              <Zap className="h-5 w-5 text-white fill-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Skilleval <span className="text-blue-600">AI</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all",
                  pathname.startsWith(item.href)
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <SignedOut>
            <SignInButton mode="modal">
              <Button size="sm" className="rounded-full px-6">
                Sign In
              </Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </nav>
  );
}
