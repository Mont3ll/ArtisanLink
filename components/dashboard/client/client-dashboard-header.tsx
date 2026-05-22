"use client"
import { Button } from "@/components/ui/button"
import { Plus, Search, MapPin } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import Link from "next/link"

export function ClientDashboardHeader() {
  const { user } = useUser()
  const firstName = user?.firstName || "there"

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {firstName}!
        </h1>
        <p className="text-muted-foreground">Find and hire skilled artisans for your projects</p>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="outline" asChild>
          <Link href="/client-dashboard/map">
            <MapPin className="w-4 h-4 mr-2" />
            Browse Map
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/client-dashboard/find-artisans">
            <Search className="w-4 h-4 mr-2" />
            Find Artisans
          </Link>
        </Button>
        <Button asChild>
          <Link href="/client-dashboard/jobs">
            <Plus className="w-4 h-4 mr-2" />
            Post Project
          </Link>
        </Button>
      </div>
    </div>
  )
}
