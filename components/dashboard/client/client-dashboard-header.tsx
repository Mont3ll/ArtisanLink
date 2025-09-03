import { Button } from "@/components/ui/button"
import { Plus, Search, MapPin } from "lucide-react"

// Mock data - replace with actual user data
const mockClientData = {
  name: "Mary Wanjiku",
}

export function ClientDashboardHeader() {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {mockClientData.name}!
        </h1>
        <p className="text-muted-foreground">Find and hire skilled artisans for your projects</p>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="outline">
          <MapPin className="w-4 h-4 mr-2" />
          Browse Map
        </Button>
        <Button variant="outline">
          <Search className="w-4 h-4 mr-2" />
          Find Artisans
        </Button>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Post Project
        </Button>
      </div>
    </div>
  )
}
