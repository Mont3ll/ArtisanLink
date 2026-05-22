'use client'

import { useState, useMemo } from "react"
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Users, 
  Hammer, 
  UserCheck, 
  UserX,
  Search,
  MoreHorizontal,
  Eye,
  Download,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useUsers, useUserStats, type User } from "@/lib/hooks/use-users"
import { DataNumber, StatCardWithSkeleton, UserRowSkeleton } from "@/components/loading"

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // React Query hooks - data fetches independently
  const { data: users = [], isLoading: usersLoading } = useUsers()
  const { data: stats, isLoading: statsLoading } = useUserStats()
  const queryClient = useQueryClient()

  const handleUserAction = async (userId: string, action: 'suspend' | 'unsuspend') => {
    try {
      const res = await fetch(`/api/admin/moderation/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (!res.ok) throw new Error('Action failed')
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success(action === 'suspend' ? 'User suspended' : 'User activated')
    } catch {
      toast.error('Failed to update user status')
    }
  }

  // Filter users based on search and filters
  const filteredUsers = useMemo(() => {
    return users.filter((user: User) => {
      const matchesSearch = 
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesRole = roleFilter === "all" || user.role === roleFilter
      const matchesStatus = statusFilter === "all" || user.status === statusFilter

      return matchesSearch && matchesRole && matchesStatus
    })
  }, [users, searchTerm, roleFilter, statusFilter])

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="px-4 lg:px-6 space-y-6">
      {/* Header - Always visible */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Manage all platform users, clients, and artisans</p>
        </div>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Export Users
        </Button>
      </div>

      {/* Stats Cards - Static labels visible, values show skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCardWithSkeleton
          title="Total Users"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          isLoading={statsLoading}
        >
          <DataNumber 
            value={stats?.totalUsers} 
            isLoading={statsLoading}
            format={(v) => Number(v).toLocaleString()}
            className="text-2xl font-bold"
          />
          <p className="text-xs text-muted-foreground">
            +{stats?.growthRate ?? 0}% from last month
          </p>
        </StatCardWithSkeleton>
        
        <StatCardWithSkeleton
          title="Clients"
          icon={<UserCheck className="h-4 w-4 text-muted-foreground" />}
          isLoading={statsLoading}
        >
          <DataNumber 
            value={stats?.totalClients} 
            isLoading={statsLoading}
            format={(v) => Number(v).toLocaleString()}
            className="text-2xl font-bold"
          />
          <p className="text-xs text-muted-foreground">Active clients</p>
        </StatCardWithSkeleton>
        
        <StatCardWithSkeleton
          title="Artisans"
          icon={<Hammer className="h-4 w-4 text-muted-foreground" />}
          isLoading={statsLoading}
        >
          <DataNumber 
            value={stats?.totalArtisans} 
            isLoading={statsLoading}
            format={(v) => Number(v).toLocaleString()}
            className="text-2xl font-bold"
          />
          <p className="text-xs text-muted-foreground">Registered artisans</p>
        </StatCardWithSkeleton>
        
        <StatCardWithSkeleton
          title="Pending Users"
          icon={<UserX className="h-4 w-4 text-muted-foreground" />}
          isLoading={statsLoading}
        >
          <DataNumber 
            value={stats?.pendingUsers} 
            isLoading={statsLoading}
            className="text-2xl font-bold"
          />
          <p className="text-xs text-muted-foreground">Awaiting approval</p>
        </StatCardWithSkeleton>
      </div>

      {/* Filters and Search - Always visible and interactive */}
      <Card>
        <CardHeader>
          <CardTitle>User Directory</CardTitle>
          <CardDescription>Search and filter users by role, status, and other criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="CLIENT">Clients</SelectItem>
                <SelectItem value="ARTISAN">Artisans</SelectItem>
                <SelectItem value="ADMIN">Admins</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="SUSPENDED">Suspended</SelectItem>
                <SelectItem value="BANNED">Banned</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table - Header always visible, rows show skeleton */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersLoading ? (
                  // Show skeleton rows while loading
                  Array.from({ length: 5 }).map((_, i) => (
                    <UserRowSkeleton key={i} columns={7} />
                  ))
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <p className="text-muted-foreground">No users found matching your criteria.</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user: User) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src="" />
                            <AvatarFallback>{getInitials(user.firstName, user.lastName)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.firstName} {user.lastName}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                            {user.profile?.profession && (
                              <div className="text-xs text-muted-foreground">{user.profile.profession}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            user.status === 'ACTIVE' ? 'default' :
                            user.status === 'PENDING' ? 'secondary' :
                            user.status === 'SUSPENDED' ? 'destructive' : 'outline'
                          }
                        >
                          {user.status}
                        </Badge>
                        {user.role === 'ARTISAN' && user.profile?.artisanStatus && (
                          <Badge variant="outline" className="ml-1">
                            {user.profile.artisanStatus}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{user.profile?.city || 'Not specified'}</TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                      <TableCell>{user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never'}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <a href={user.role === 'ARTISAN' ? `/artisans/${user.id}` : '#'} target="_blank" rel="noopener">
                                <Eye className="mr-2 h-4 w-4" />
                                View Profile
                              </a>
                            </DropdownMenuItem>
                            {user.status === 'ACTIVE' ? (
                              <DropdownMenuItem
                                className="text-orange-600"
                                onClick={() => handleUserAction(user.id, 'suspend')}
                              >
                                <UserX className="mr-2 h-4 w-4" />
                                Suspend User
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                className="text-green-600"
                                onClick={() => handleUserAction(user.id, 'unsuspend')}
                              >
                                <UserCheck className="mr-2 h-4 w-4" />
                                Activate User
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
