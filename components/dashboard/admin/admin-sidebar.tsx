"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import { 
  Home, 
  Users, 
  Shield, 
  DollarSign, 
  BarChart3, 
  Settings,
  Menu,
  X,
  Hammer,
  AlertTriangle,
  FileText,
  Activity,
  Database,
  MapPin
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/admin-dashboard", icon: Home },
  { name: "User Management", href: "/admin-dashboard/users", icon: Users },
  { name: "Artisan Verification", href: "/admin-dashboard/verification", icon: Shield },
  { name: "Subscriptions", href: "/admin-dashboard/subscriptions", icon: DollarSign },
  { name: "Analytics", href: "/admin-dashboard/analytics", icon: BarChart3 },
  { name: "Reports", href: "/admin-dashboard/reports", icon: FileText },
  { name: "System Health", href: "/admin-dashboard/system", icon: Activity },
  { name: "Content Moderation", href: "/admin-dashboard/moderation", icon: AlertTriangle },
  { name: "Location Management", href: "/admin-dashboard/locations", icon: MapPin },
  { name: "Database", href: "/admin-dashboard/database", icon: Database },
  { name: "Settings", href: "/admin-dashboard/settings", icon: Settings },
];

export default function AdminSidebar() {
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
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <Hammer className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-gray-900">ArtisanLink</h1>
              <p className="text-xs text-gray-500">Admin Portal</p>
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
                      ? "bg-red-50 text-red-700 border border-red-200"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* System Status */}
          <div className="px-4 py-3 border-t border-gray-200">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700">System Online</span>
              </div>
              <p className="text-xs text-green-600 mt-1">Uptime: 99.9%</p>
            </div>
          </div>

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
                <p className="text-sm font-medium text-gray-900 truncate">Administrator</p>
                <p className="text-xs text-gray-500">System management</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
