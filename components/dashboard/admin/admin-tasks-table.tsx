'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { 
  User,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Eye,
  MoreHorizontal
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface PendingVerification {
  id: string
  name: string
  email: string
  profession: string
  location: string
  submittedAt: string
  certificateUrl?: string
}

interface RecentActivity {
  id: string
  type: 'user_joined' | 'subscription_paid' | 'review_submitted' | 'message_sent'
  description: string
  user: string
  timestamp: string
  status: 'completed' | 'pending' | 'failed'
}

interface SystemAlert {
  id: string
  title: string
  type: 'error' | 'warning' | 'info'
  description: string
  timestamp: string
  resolved: boolean
}

interface AdminTasksTableProps {
  pendingVerifications: PendingVerification[]
  recentActivity: RecentActivity[]
  systemAlerts: SystemAlert[]
}

export function AdminTasksTable({ 
  pendingVerifications = [],
  recentActivity = [],
  systemAlerts = []
}: AdminTasksTableProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_joined':
        return <User className="h-4 w-4 text-blue-500" />
      case 'subscription_paid':
        return <DollarSign className="h-4 w-4 text-green-500" />
      case 'review_submitted':
        return <MessageSquare className="h-4 w-4 text-purple-500" />
      case 'message_sent':
        return <MessageSquare className="h-4 w-4 text-blue-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'info':
        return <AlertTriangle className="h-4 w-4 text-blue-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />
    }
  }

  const filteredVerifications = pendingVerifications.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.profession.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredActivity = recentActivity.filter(item =>
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.user.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredAlerts = systemAlerts.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Tabs defaultValue="verifications" className="w-full">
      <div className="flex items-center justify-between mb-4">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="verifications">
            Verifications
            <Badge variant="secondary" className="ml-2">
              {pendingVerifications.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="activity">
            Activity
            <Badge variant="secondary" className="ml-2">
              {recentActivity.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="alerts">
            Alerts
            <Badge variant="secondary" className="ml-2">
              {systemAlerts.filter(a => !a.resolved).length}
            </Badge>
          </TabsTrigger>
        </TabsList>
        
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
      </div>

      <TabsContent value="verifications">
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Artisan</TableHead>
                <TableHead>Profession</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Certificate</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVerifications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No pending verifications
                  </TableCell>
                </TableRow>
              ) : (
                filteredVerifications.map((verification) => (
                  <TableRow key={verification.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{verification.name}</div>
                        <div className="text-sm text-muted-foreground">{verification.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{verification.profession}</Badge>
                    </TableCell>
                    <TableCell>{verification.location}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(verification.submittedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {verification.certificateUrl ? (
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      ) : (
                        <span className="text-muted-foreground text-sm">No certificate</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            Reject
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Message
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </TabsContent>

      <TabsContent value="activity">
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Activity</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredActivity.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No recent activity
                  </TableCell>
                </TableRow>
              ) : (
                filteredActivity.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getActivityIcon(activity.type)}
                        <span>{activity.description}</span>
                      </div>
                    </TableCell>
                    <TableCell>{activity.user}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(activity.status)}
                        <Badge variant={activity.status === 'completed' ? 'default' : 'secondary'}>
                          {activity.status}
                        </Badge>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </TabsContent>

      <TabsContent value="alerts">
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Alert</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAlerts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No system alerts
                  </TableCell>
                </TableRow>
              ) : (
                filteredAlerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{alert.title}</div>
                        <div className="text-sm text-muted-foreground">{alert.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getAlertIcon(alert.type)}
                        <Badge variant={alert.type === 'error' ? 'destructive' : 'secondary'}>
                          {alert.type}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(alert.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={alert.resolved ? 'default' : 'secondary'}>
                        {alert.resolved ? 'Resolved' : 'Open'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark Resolved
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </TabsContent>
    </Tabs>
  )
}
