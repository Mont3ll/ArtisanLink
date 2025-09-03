import { Button } from "@/components/ui/button"
import { Eye, Settings } from "lucide-react"

export function AdminDashboardHeader() {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p>Manage ArtisanLink platform and users</p>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="outline">
          <Eye className="w-4 h-4 mr-2" />
          System Reports
        </Button>
        <Button>
          <Settings className="w-4 h-4 mr-2" />
          Platform Settings
        </Button>
      </div>
    </div>
  )
}
