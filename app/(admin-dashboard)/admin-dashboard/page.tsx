import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Hammer, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Eye,
  Settings,
  Shield,
  FileText,
  MapPin
} from "lucide-react";

// Mock data for demonstration - replace with actual database queries
const mockData = {
  systemStats: {
    totalUsers: 2847,
    totalArtisans: 1245,
    totalClients: 1602,
    pendingVerifications: 23,
    activeSubscriptions: 1156,
    monthlyRevenue: 2340000,
    monthlyGrowth: 12.5,
    systemUptime: 99.9,
  },
  recentActivity: [
    {
      id: 1,
      type: "registration",
      user: "John Kamau",
      role: "artisan",
      action: "New artisan registration",
      location: "Nairobi",
      timestamp: "5 minutes ago",
    },
    {
      id: 2,
      type: "verification",
      user: "Mary Wanjiku",
      role: "artisan",
      action: "Certificate submitted for verification",
      location: "Mombasa",
      timestamp: "12 minutes ago",
    },
    {
      id: 3,
      type: "subscription",
      user: "Peter Ochieng",
      role: "artisan",
      action: "M-Pesa subscription payment received",
      location: "Kisumu",
      timestamp: "1 hour ago",
    },
  ],
  pendingApprovals: [
    {
      id: 1,
      artisan: "Grace Muthoni",
      profession: "Tailor",
      location: "Nakuru",
      certificateStatus: "pending",
      portfolioItems: 8,
      submissionDate: "2024-08-29",
    },
    {
      id: 2,
      artisan: "David Kiprop",
      profession: "Electrician",
      location: "Eldoret",
      certificateStatus: "pending",
      portfolioItems: 12,
      submissionDate: "2024-08-28",
    },
  ],
  subscriptionStats: {
    totalRevenue: 2340000,
    activeSubscriptions: 1156,
    expiringSoon: 45,
    failedPayments: 12,
  },
  systemHealth: {
    uptime: 99.9,
    responseTime: 245,
    errorRate: 0.02,
    activeConnections: 1847,
  },
};

export default async function AdminDashboardPage() {
  const { userId, sessionClaims } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
    return null;
  }
  
  const role = (sessionClaims?.publicMetadata as { role?: string })?.role;
  
  if (role !== "admin") {
    if (role === "client") {
      redirect("/client-dashboard");
    } else if (role === "artisan") {
      redirect("/artisan-dashboard");
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
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage ArtisanLink platform and users</p>
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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.systemStats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-green-500" />
              +{mockData.systemStats.monthlyGrowth}% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Artisans</CardTitle>
            <Hammer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.systemStats.totalArtisans.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {mockData.systemStats.activeSubscriptions} with active subscriptions
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              KSh {mockData.systemStats.monthlyRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">From M-Pesa subscriptions</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.systemStats.pendingVerifications}</div>
            <p className="text-xs text-muted-foreground">Require immediate attention</p>
          </CardContent>
        </Card>
      </div>

      {/* System Health & Subscription Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Real-time platform performance metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">System Uptime</span>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm font-bold">{mockData.systemHealth.uptime}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Average Response Time</span>
              <span className="text-sm font-bold">{mockData.systemHealth.responseTime}ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Error Rate</span>
              <span className="text-sm font-bold">{mockData.systemHealth.errorRate}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Active Connections</span>
              <span className="text-sm font-bold">{mockData.systemHealth.activeConnections.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription Overview</CardTitle>
            <CardDescription>M-Pesa subscription analytics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Active Subscriptions</span>
              <span className="text-sm font-bold">{mockData.subscriptionStats.activeSubscriptions.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Monthly Revenue</span>
              <span className="text-sm font-bold">KSh {mockData.subscriptionStats.totalRevenue.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Expiring Soon</span>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-bold">{mockData.subscriptionStats.expiringSoon}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Failed Payments</span>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-sm font-bold">{mockData.subscriptionStats.failedPayments}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Approvals */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Artisan Approvals</CardTitle>
            <CardDescription>Artisans awaiting verification</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockData.pendingApprovals.map((approval) => (
              <div key={approval.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{approval.artisan}</p>
                    <Badge variant="outline">{approval.profession}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {approval.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {approval.portfolioItems} portfolio items
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">Submitted: {approval.submissionDate}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    Review
                  </Button>
                  <Button size="sm">
                    Approve
                  </Button>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full">
              View All Pending ({mockData.systemStats.pendingVerifications})
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent System Activity</CardTitle>
            <CardDescription>Latest platform events and user actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockData.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-4 border rounded-lg">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  {activity.type === "registration" && <Users className="w-4 h-4 text-blue-600" />}
                  {activity.type === "verification" && <Shield className="w-4 h-4 text-amber-600" />}
                  {activity.type === "subscription" && <DollarSign className="w-4 h-4 text-green-600" />}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{activity.user}</span>
                    <Badge variant="outline" className="text-xs">
                      {activity.role}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {activity.location}
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">{activity.timestamp}</p>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full">
              View Activity Logs
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Actions</CardTitle>
          <CardDescription>Platform management and oversight tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Users className="w-6 h-6" />
              User Management
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Shield className="w-6 h-6" />
              Verify Artisans
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <DollarSign className="w-6 h-6" />
              M-Pesa Subscriptions
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Settings className="w-6 h-6" />
              System Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
