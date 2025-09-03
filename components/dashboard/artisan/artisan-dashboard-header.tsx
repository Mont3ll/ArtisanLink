import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Settings } from "lucide-react"

// Mock data - replace with actual user data
const mockArtisanData = {
  name: "John Kamau",
  isAvailable: true,
}

export function ArtisanDashboardHeader() {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {mockArtisanData.name}!
        </h1>
        <p className="text-muted-foreground">Manage your artisan profile and projects</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Available for work</span>
          <Switch defaultChecked={mockArtisanData.isAvailable} />
        </div>
        <Button>
          <Settings className="w-4 h-4 mr-2" />
          Profile Settings
        </Button>
      </div>
    </div>
  )
}
