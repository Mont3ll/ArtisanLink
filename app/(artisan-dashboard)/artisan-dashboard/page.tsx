import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  MapPin, 
  MessageSquare, 
  Calendar, 
  Star, 
  Eye, 
  DollarSign, 
  Clock, 
  Upload,
  Settings,
  CheckCircle,
} from "lucide-react";

// Mock data for demonstration - replace with actual database queries
const mockData = {
  artisanProfile: {
    name: "John Kamau",
    profession: "Carpenter",
    rating: 4.8,
    totalReviews: 127,
    joinDate: "2023-01-15",
    location: "Nairobi, Kenya",
    isAvailable: true,
    isVerified: true,
    subscriptionStatus: "Active",
    subscriptionExpiry: "2024-12-31",
  },
  recentInquiries: [
    {
      id: 1,
      client: "Mary Wanjiku",
      project: "Kitchen Cabinet Installation",
      location: "Kiambu",
      budget: "KSh 45,000",
      timestamp: "2 hours ago",
      status: "new",
    },
    {
      id: 2,
      client: "Peter Mwangi",
      project: "Office Furniture",
      location: "Nairobi CBD",
      budget: "KSh 80,000",
      timestamp: "5 hours ago",
      status: "responded",
    },
  ],
  activeProjects: [
    {
      id: 1,
      client: "Grace Muthoni",
      project: "Living Room Renovation",
      status: "In Progress",
      startDate: "2024-08-20",
      deadline: "2024-09-15",
      location: "Westlands",
      progress: 60,
    },
    {
      id: 2,
      client: "David Kiprop",
      project: "Custom Wardrobe",
      status: "Starting Soon",
      startDate: "2024-09-01",
      deadline: "2024-09-10",
      location: "Kilimani",
      progress: 0,
    },
  ],
  stats: {
    totalProjects: 45,
    activeProjects: 2,
    completedProjects: 43,
    monthlyViews: 234,
    monthlyEarnings: 125000,
    responseRate: 95,
  },
  portfolio: {
    totalWorks: 28,
    recentUploads: 3,
  },
};

export default async function ArtisanDashboardPage() {
  const { userId, sessionClaims } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
    return null;
  }
  
  const role = (sessionClaims?.publicMetadata as { role?: string })?.role;
  
  if (role !== "artisan") {
    if (role === "client") {
      redirect("/client-dashboard");
    } else if (role === "admin") {
      redirect("/admin-dashboard");
    } else {
      redirect("/sign-in");
    }
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {mockData.artisanProfile.name}!
          </h1>
          <p className="text-gray-600">Manage your artisan profile and projects</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Available for work</span>
            <Switch defaultChecked={mockData.artisanProfile.isAvailable} />
          </div>
          <Button>
            <Settings className="w-4 h-4 mr-2" />
            Profile Settings
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.stats.monthlyViews}</div>
            <p className="text-xs text-muted-foreground">Profile views this month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KSh {mockData.stats.monthlyEarnings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This month&apos;s income</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.stats.activeProjects}</div>
            <p className="text-xs text-muted-foreground">Currently working on</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.stats.responseRate}%</div>
            <p className="text-xs text-muted-foreground">Client response rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Profile Status & Subscription */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Status</CardTitle>
            <CardDescription>Your verification and availability status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Verified Artisan</span>
              </div>
              <Badge variant="success">Active</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span>Rating: {mockData.artisanProfile.rating}/5</span>
              </div>
              <Badge variant="secondary">{mockData.artisanProfile.totalReviews} reviews</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-500" />
                <span>Location</span>
              </div>
              <span className="text-sm text-gray-600">{mockData.artisanProfile.location}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
            <CardDescription>Your M-Pesa subscription status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Status</span>
              <Badge variant="success">{mockData.artisanProfile.subscriptionStatus}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Expires</span>
              <span className="text-sm text-gray-600">{mockData.artisanProfile.subscriptionExpiry}</span>
            </div>
            <Button variant="outline" className="w-full">
              Manage Subscription
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Portfolio</CardTitle>
            <CardDescription>Showcase your best work</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Total Works</span>
              <span className="font-bold">{mockData.portfolio.totalWorks}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Recent Uploads</span>
              <span className="font-bold">{mockData.portfolio.recentUploads}</span>
            </div>
            <Button variant="outline" className="w-full">
              <Upload className="w-4 h-4 mr-2" />
              Upload New Work
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Inquiries */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Inquiries</CardTitle>
            <CardDescription>New project requests from clients</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockData.recentInquiries.map((inquiry) => (
              <div key={inquiry.id} className="flex items-start justify-between p-4 border rounded-lg">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{inquiry.project}</p>
                    {inquiry.status === "new" && (
                      <Badge variant="destructive" className="text-xs">New</Badge>
                    )}
                    {inquiry.status === "responded" && (
                      <Badge variant="secondary" className="text-xs">Responded</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">by {inquiry.client}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {inquiry.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      {inquiry.budget}
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">{inquiry.timestamp}</p>
                </div>
                <Button size="sm">
                  {inquiry.status === "new" ? "Respond" : "View"}
                </Button>
              </div>
            ))}
            <Button variant="outline" className="w-full">
              View All Inquiries
            </Button>
          </CardContent>
        </Card>

        {/* Active Projects */}
        <Card>
          <CardHeader>
            <CardTitle>Active Projects</CardTitle>
            <CardDescription>Your current ongoing projects</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockData.activeProjects.map((project) => (
              <div key={project.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{project.project}</p>
                    <p className="text-sm text-gray-600">for {project.client}</p>
                  </div>
                  <Badge variant={project.status === "In Progress" ? "default" : "secondary"}>
                    {project.status}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {project.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Due {project.deadline}
                  </div>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full">
              View All Projects
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks to manage your artisan business</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Upload className="w-6 h-6" />
              Upload Portfolio
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <MessageSquare className="w-6 h-6" />
              Message Clients
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Calendar className="w-6 h-6" />
              Update Availability
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <DollarSign className="w-6 h-6" />
              Subscription
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
