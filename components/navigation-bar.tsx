"use client"

import { useAuth } from "@/components/auth-provider";
import { Home, User, FileText, Bell, MessageSquare, LogOut, LightbulbIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";

export function NavigationBar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user || pathname === '/') return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-2">
      <div className="max-w-screen-xl mx-auto flex justify-around items-center">
        <Link href="/home" className="flex flex-col items-center p-2">
          <Home className="h-6 w-6" />
          <span className="text-xs">Home</span>
        </Link>
        <Link href="/profile" className="flex flex-col items-center p-2">
          <User className="h-6 w-6" />
          <span className="text-xs">Profile</span>
        </Link>
        <Link href="/ai-resume" className="flex flex-col items-center p-2">
          <FileText className="h-6 w-6" />
          <span className="text-xs">AI Resume</span>
        </Link>
        <Link href="/suggestions" className="flex flex-col items-center p-2">
          <LightbulbIcon className="h-6 w-6" />
          <span className="text-xs">Suggestions</span>
        </Link>
        <Link href="/notifications" className="flex flex-col items-center p-2">
          <Bell className="h-6 w-6" />
          <span className="text-xs">Notifications</span>
        </Link>
        <Link href="/messages" className="flex flex-col items-center p-2">
          <MessageSquare className="h-6 w-6" />
          <span className="text-xs">Messages</span>
        </Link>
        <div className="flex flex-col items-center p-2">
          <ThemeToggle />
        </div>
        <button onClick={logout} className="flex flex-col items-center p-2">
          <LogOut className="h-6 w-6" />
          <span className="text-xs">Logout</span>
        </button>
      </div>
    </nav>
  );
}