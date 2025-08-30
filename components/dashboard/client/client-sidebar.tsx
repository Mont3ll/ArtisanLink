"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import { 
  Home, 
  Search, 
  MapPin, 
  MessageSquare, 
  Calendar, 
  Heart, 
  History, 
  Settings,
  Menu,
  X,
  Hammer
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/client-dashboard", icon: Home },
  { name: "Find Artisans", href: "/client-dashboard/find-artisans", icon: Search },
  { name: "Map View", href: "/client-dashboard/map", icon: MapPin },
  { name: "Messages", href: "/client-dashboard/messages", icon: MessageSquare },
  { name: "My Projects", href: "/client-dashboard/projects", icon: Calendar },
  { name: "Saved Artisans", href: "/client-dashboard/saved", icon: Heart },
  { name: "History", href: "/client-dashboard/history", icon: History },
  { name: "Settings", href: "/client-dashboard/settings", icon: Settings },
];

export default function ClientSidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </Button>
      </div>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed top-0 left-0 z-40 h-full w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out",
        "lg:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Hammer className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-gray-900">ArtisanLink</h1>
              <p className="text-xs text-gray-500">Client Portal</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8"
                  }
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">Client Account</p>
                <p className="text-xs text-gray-500">Manage your profile</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
