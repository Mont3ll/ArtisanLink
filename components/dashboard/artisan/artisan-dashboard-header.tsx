"use client"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import Link from "next/link"

export function ArtisanDashboardHeader() {
  const { user } = useUser()
  const firstName = user?.firstName || "there"

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {firstName}!
        </h1>
        <p className="text-muted-foreground">Manage your artisan profile and projects</p>
      </div>
      <div className="flex items-center gap-4">
        <Button asChild>
          <Link href="/artisan-dashboard/settings">
            <Settings className="w-4 h-4 mr-2" />
            Profile Settings
          </Link>
        </Button>
      </div>
    </div>
  )
}
