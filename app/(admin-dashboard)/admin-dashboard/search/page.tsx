'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Search, 
  Filter,
  Clock,
  User,
  FileText,
  Settings,
  TrendingUp,
  MoreVertical
} from 'lucide-react'

const searchResults = {
  users: [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'ARTISAN',
      status: 'VERIFIED',
      joinDate: '2024-01-15'
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'CLIENT',
      status: 'ACTIVE',
      joinDate: '2024-02-20'
    }
  ],
  projects: [
    {
      id: '1',
      title: 'Custom Furniture Design',
      client: 'Jane Smith',
      artisan: 'John Doe',
      status: 'IN_PROGRESS',
      budget: 5000,
      createdAt: '2024-03-01'
    },
    {
      id: '2',
      title: 'Kitchen Cabinet Installation',
      client: 'Mike Johnson',
      artisan: 'Sarah Wilson',
      status: 'COMPLETED',
      budget: 8000,
      createdAt: '2024-02-15'
    }
  ],
  activities: [
    {
      id: '1',
      action: 'USER_VERIFIED',
      details: 'John Doe verified as artisan',
      timestamp: '2024-03-15T10:30:00Z',
      type: 'verification'
    },
    {
      id: '2',
      action: 'PROJECT_CREATED',
      details: 'New project: Custom Furniture Design',
      timestamp: '2024-03-14T14:20:00Z',
      type: 'project'
    }
  ]
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    setIsSearching(true)
    // Simulate API call
    setTimeout(() => {
      setIsSearching(false)
    }, 1000)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
      case 'ACTIVE':
      case 'COMPLETED':
        return <Badge className="bg-green-100 text-green-800">{status}</Badge>
      case 'IN_PROGRESS':
        return <Badge className="bg-blue-100 text-blue-800">{status}</Badge>
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800">{status}</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <div className="px-4 lg:px-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Search</h1>
          <p className="text-gray-600 mt-2">Search across users, projects, activities, and more</p>
        </div>
      </div>

      {/* Search Input */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search users, projects, activities, settings..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Search Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Searches</CardTitle>
          <CardDescription>Popular searches and suggestions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setSearchQuery('verified artisans')}>
              <User className="h-3 w-3 mr-2" />
              Verified Artisans
            </Button>
            <Button variant="outline" size="sm" onClick={() => setSearchQuery('active projects')}>
              <FileText className="h-3 w-3 mr-2" />
              Active Projects
            </Button>
            <Button variant="outline" size="sm" onClick={() => setSearchQuery('recent activities')}>
              <Clock className="h-3 w-3 mr-2" />
              Recent Activities
            </Button>
            <Button variant="outline" size="sm" onClick={() => setSearchQuery('system settings')}>
              <Settings className="h-3 w-3 mr-2" />
              System Settings
            </Button>
            <Button variant="outline" size="sm" onClick={() => setSearchQuery('trending')}>
              <TrendingUp className="h-3 w-3 mr-2" />
              Trending
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Results</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Users Results */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Users</CardTitle>
                  <CardDescription>{searchResults.users.length} results found</CardDescription>
                </div>
                <Button variant="ghost" size="sm">View All</Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {searchResults.users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-600">{user.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(user.status)}
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Projects Results */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Projects</CardTitle>
                  <CardDescription>{searchResults.projects.length} results found</CardDescription>
                </div>
                <Button variant="ghost" size="sm">View All</Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {searchResults.projects.map((project) => (
                  <div key={project.id} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-medium">{project.title}</div>
                      {getStatusBadge(project.status)}
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>Client: {project.client}</div>
                      <div>Artisan: {project.artisan}</div>
                      <div>Budget: {formatCurrency(project.budget)}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Activities Results */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activities</CardTitle>
              <CardDescription>{searchResults.activities.length} results found</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {searchResults.activities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <Clock className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{activity.action}</div>
                    <div className="text-sm text-gray-600">{activity.details}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <Badge variant="outline">{activity.type}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Search Results</CardTitle>
              <CardDescription>Found {searchResults.users.length} users</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {searchResults.users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-lg">{user.name}</div>
                      <div className="text-gray-600">{user.email}</div>
                      <div className="text-sm text-gray-500">
                        Joined: {new Date(user.joinDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{user.role}</Badge>
                    {getStatusBadge(user.status)}
                    <Button variant="outline" size="sm">View Profile</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Search Results</CardTitle>
              <CardDescription>Found {searchResults.projects.length} projects</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {searchResults.projects.map((project) => (
                <div key={project.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-medium text-lg">{project.title}</div>
                      <div className="text-gray-600">Budget: {formatCurrency(project.budget)}</div>
                    </div>
                    {getStatusBadge(project.status)}
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Client:</span> {project.client}
                    </div>
                    <div>
                      <span className="text-gray-500">Artisan:</span> {project.artisan}
                    </div>
                    <div>
                      <span className="text-gray-500">Created:</span> {new Date(project.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="mt-3">
                    <Button variant="outline" size="sm">View Details</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Activity Search Results</CardTitle>
              <CardDescription>Found {searchResults.activities.length} activities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {searchResults.activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <Clock className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="font-medium">{activity.action}</div>
                      <Badge variant="outline">{activity.type}</Badge>
                    </div>
                    <div className="text-gray-600 mb-2">{activity.details}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <Button variant="outline" size="sm">View</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
