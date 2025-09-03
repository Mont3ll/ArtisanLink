'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Shield, 
  AlertTriangle, 
  Eye,
  Flag,
  MessageSquare,
  Image,
  User
} from 'lucide-react'

export default function ModerationPage() {
  const moderationData = {
    reports: [
      {
        id: '1',
        type: 'inappropriate_content',
        content: 'Portfolio image contains inappropriate material',
        reporter: 'John Doe',
        reported: 'Jane Smith',
        status: 'pending',
        createdAt: '2024-03-15T10:30:00Z'
      },
      {
        id: '2',
        type: 'spam',
        content: 'User sending spam messages to multiple clients',
        reporter: 'Mike Johnson',
        reported: 'Spam User',
        status: 'resolved',
        createdAt: '2024-03-14T14:20:00Z'
      }
    ],
    flaggedContent: [
      {
        id: '1',
        type: 'portfolio',
        title: 'Custom Furniture Design',
        author: 'Jane Smith',
        reason: 'Inappropriate images',
        status: 'under_review',
        flaggedAt: '2024-03-15T09:15:00Z'
      }
    ]
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'under_review':
        return <Badge className="bg-blue-100 text-blue-800">Under Review</Badge>
      case 'resolved':
        return <Badge className="bg-green-100 text-green-800">Resolved</Badge>
      case 'dismissed':
        return <Badge className="bg-gray-100 text-gray-800">Dismissed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'inappropriate_content':
        // eslint-disable-next-line jsx-a11y/alt-text
        return <Image className="h-4 w-4" />
      case 'spam':
        return <MessageSquare className="h-4 w-4" />
      case 'harassment':
        return <User className="h-4 w-4" />
      default:
        return <Flag className="h-4 w-4" />
    }
  }

  return (
    <div className="px-4 lg:px-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Content Moderation</h1>
          <p className="text-gray-600 mt-2">Review and moderate platform content and user reports</p>
        </div>
        <Button>
          <Shield className="h-4 w-4 mr-2" />
          Moderation Tools
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Require immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged Content</CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">Under review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Cases resolved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4h</div>
            <p className="text-xs text-muted-foreground">Average response time</p>
          </CardContent>
        </Card>
      </div>

      {/* Moderation Tabs */}
      <Tabs defaultValue="reports" className="space-y-6">
        <TabsList>
          <TabsTrigger value="reports">User Reports</TabsTrigger>
          <TabsTrigger value="flagged">Flagged Content</TabsTrigger>
          <TabsTrigger value="actions">Moderation Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Reports</CardTitle>
              <CardDescription>Reports submitted by platform users</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {moderationData.reports.map((report) => (
                <div key={report.id} className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      {getTypeIcon(report.type)}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{report.content}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        Reported by: <span className="font-medium">{report.reporter}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Against: <span className="font-medium">{report.reported}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        {new Date(report.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(report.status)}
                    <Button variant="outline" size="sm">Review</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flagged" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Flagged Content</CardTitle>
              <CardDescription>Content flagged by automated systems or users</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {moderationData.flaggedContent.map((content) => (
                <div key={content.id} className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      {/* eslint-disable-next-line jsx-a11y/alt-text */}
                      <Image className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{content.title}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        By: <span className="font-medium">{content.author}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Reason: {content.reason}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        Flagged: {new Date(content.flaggedAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(content.status)}
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Review
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Moderation Actions</CardTitle>
              <CardDescription>Actions taken by moderators</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8 text-gray-500">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recent moderation actions</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
