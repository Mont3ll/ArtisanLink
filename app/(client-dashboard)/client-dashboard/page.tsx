import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ChartAreaInteractive } from "@/components/shared/chart-area-interactive";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Search, MessageSquare, Calendar, Star, Users, Hammer } from "lucide-react";

// Mock data for demonstration - replace with actual database queries
const mockData = {
  recentSearches: [
    { id: 1, query: "Carpenter in Nairobi", timestamp: "2 hours ago" },
    { id: 2, query: "Electrician near me", timestamp: "1 day ago" },
    { id: 3, query: "Plumber in Mombasa", timestamp: "3 days ago" },
  ],
  activeProjects: [
    {
      id: 1,
      artisan: "John Kamau",
      service: "Kitchen Cabinet Installation",
      status: "In Progress",
      startDate: "2024-08-25",
      location: "Nairobi",
    },
    {
      id: 2,
      artisan: "Mary Wanjiku",
      service: "House Painting",
      status: "Scheduled",
      startDate: "2024-09-01",
      location: "Kiambu",
    },
  ],
  savedArtisans: [
    {
      id: 1,
      name: "Peter Ochieng",
      profession: "Electrician",
      rating: 4.9,
      location: "Nairobi",
      avatar: "/api/placeholder/40/40",
    },
    {
      id: 2,
      name: "Grace Muthoni",
      profession: "Tailor",
      rating: 4.8,
      location: "Mombasa",
      avatar: "/api/placeholder/40/40",
    },
  ],
  stats: {
    totalProjects: 12,
    activeProjects: 2,
    completedProjects: 10,
    savedArtisans: 8,
  },
};

export default async function ClientDashboardPage() {
  const { userId, sessionClaims } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
    return null;
  }
  
  const role = (sessionClaims?.publicMetadata as { role?: string })?.role;
  
  if (role !== "client") {
    if (role === "artisan") {
      redirect("/artisan-dashboard");
    } else if (role === "admin") {
      redirect("/admin-dashboard");
    } else {
      redirect("/sign-in");
    }
    return null;
  }

  return (
    <div className="flex-1 space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back!</h1>
          <p className="text-muted-foreground">Find and hire skilled artisans for your projects</p>
        </div>
        <Button className="w-fit">
          <Search className="w-4 h-4 mr-2" />
          Find Artisans
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <Hammer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.stats.totalProjects}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.stats.activeProjects}</div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.stats.completedProjects}</div>
            <p className="text-xs text-muted-foreground">Successfully finished</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saved Artisans</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.stats.savedArtisans}</div>
            <p className="text-xs text-muted-foreground">In your favorites</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Project Activity</CardTitle>
            <CardDescription>Your project trends and hiring patterns</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartAreaInteractive />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks to get you started</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              <Button variant="outline" className="h-16 flex items-center gap-3 justify-start">
                <MapPin className="w-5 h-5" />
                Find Nearby Artisans
              </Button>
              <Button variant="outline" className="h-16 flex items-center gap-3 justify-start">
                <Calendar className="w-5 h-5" />
                Schedule Service
              </Button>
              <Button variant="outline" className="h-16 flex items-center gap-3 justify-start">
                <MessageSquare className="w-5 h-5" />
                Message History
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Searches */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Searches</CardTitle>
          <CardDescription>Your recent artisan searches</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockData.recentSearches.map((search) => (
              <div key={search.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{search.query}</span>
                </div>
                <span className="text-sm text-muted-foreground">{search.timestamp}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Projects and Saved Artisans */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Active Projects</CardTitle>
            <CardDescription>Your ongoing and scheduled projects</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockData.activeProjects.map((project) => (
              <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">{project.service}</p>
                  <p className="text-sm text-muted-foreground">by {project.artisan}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    {project.location}
                    <Calendar className="w-3 h-3 ml-2" />
                    {project.startDate}
                  </div>
                </div>
                <Badge variant={project.status === "In Progress" ? "default" : "secondary"}>
                  {project.status}
                </Badge>
              </div>
            ))}
            <Button variant="outline" className="w-full">
              View All Projects
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Saved Artisans</CardTitle>
            <CardDescription>Your favorite artisans for quick hiring</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockData.savedArtisans.map((artisan) => (
              <div key={artisan.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{artisan.name}</p>
                    <p className="text-sm text-muted-foreground">{artisan.profession}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      {artisan.rating}
                      <MapPin className="w-3 h-3 ml-1" />
                      {artisan.location}
                    </div>
                  </div>
                </div>
                <Button size="sm">
                  <MessageSquare className="w-3 h-3 mr-1" />
                  Contact
                </Button>
              </div>
            ))}
            <Button variant="outline" className="w-full">
              View All Saved
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
