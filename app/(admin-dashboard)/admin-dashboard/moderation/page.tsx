'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Shield, 
  AlertTriangle, 
  Flag,
  User,
  Check,
  X,
  RefreshCw,
  Loader2,
  Star
} from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  useAdminModeration,
  useActivityLogs,
  useModerationAction,
  getModerationStatusBadgeClass,
  getActionLabel,
  type ModerationItem,
} from '@/lib/hooks'

export default function ModerationPage() {
  const [selectedItem, setSelectedItem] = useState<ModerationItem | null>(null)
  const [actionType, setActionType] = useState<string | null>(null)

  const { data: moderationData, isLoading, isError, error, refetch, dataUpdatedAt } = useAdminModeration('pending')
  const { data: activityData } = useActivityLogs(10)
  const moderationAction = useModerationAction()

  const items = moderationData?.items || []
  const stats = moderationData?.stats || { pendingReviews: 0, pendingUsers: 0, suspendedUsers: 0, total: 0 }
  const activityLogs = activityData?.logs || []

  // Handle moderation action
  const handleAction = async (item: ModerationItem, action: string) => {
    try {
      await moderationAction.mutateAsync({
        id: item.id,
        action,
        type: item.type,
        reason: `${action} via moderation dashboard`
      })
      setSelectedItem(null)
      setActionType(null)
    } catch {
      // Error handled by mutation state
    }
  }

  // Open confirmation dialog
  const openActionDialog = (item: ModerationItem, action: string) => {
    setSelectedItem(item)
    setActionType(action)
  }

  const getStatusBadge = (status: string) => {
    const badgeClass = getModerationStatusBadgeClass(status)
    const labels: Record<string, string> = {
      pending: 'Pending',
      approved: 'Approved',
      hidden: 'Hidden',
      suspended: 'Suspended',
      active: 'Active',
    }
    return badgeClass ? (
      <Badge className={badgeClass}>{labels[status] || status}</Badge>
    ) : (
      <Badge variant="outline">{status}</Badge>
    )
  }

  // Separate items by type
  const reviewItems = items.filter(item => item.type === 'review')
  const userItems = items.filter(item => item.type === 'user')

  const lastUpdated = dataUpdatedAt ? new Date(dataUpdatedAt) : null

  return (
    <div className="px-4 lg:px-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Moderation</h1>
          <p className="text-muted-foreground">Review and moderate platform content and user reports</p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-sm text-muted-foreground">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <Button onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {isError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-700">
              {error instanceof Error ? error.message : 'An error occurred'}
            </p>
          </CardContent>
        </Card>
      )}

      {moderationAction.isError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-700">
              {moderationAction.error instanceof Error ? moderationAction.error.message : 'Action failed'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats.pendingReviews}</div>
            )}
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Users</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats.pendingUsers}</div>
            )}
            <p className="text-xs text-muted-foreground">Awaiting verification</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspended Users</CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats.suspendedUsers}</div>
            )}
            <p className="text-xs text-muted-foreground">Currently suspended</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pending</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats.total}</div>
            )}
            <p className="text-xs text-muted-foreground">Items requiring action</p>
          </CardContent>
        </Card>
      </div>

      {/* Moderation Tabs */}
      <Tabs defaultValue="reviews" className="space-y-6">
        <TabsList>
          <TabsTrigger value="reviews">
            Pending Reviews {!isLoading && reviewItems.length > 0 && `(${reviewItems.length})`}
          </TabsTrigger>
          <TabsTrigger value="users">
            Users {!isLoading && userItems.length > 0 && `(${userItems.length})`}
          </TabsTrigger>
          <TabsTrigger value="actions">Moderation Log</TabsTrigger>
        </TabsList>

        <TabsContent value="reviews" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Reviews</CardTitle>
              <CardDescription>Reviews awaiting approval before being published</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="flex items-start gap-4">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-48" />
                          <Skeleton className="h-3 w-40" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : reviewItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Check className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No pending reviews</p>
                </div>
              ) : (
                reviewItems.map((item) => (
                  <div key={item.id} className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Star className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {item.content.rating}/5 stars
                          </span>
                          {item.content.projectTitle && (
                            <span className="text-muted-foreground">
                              for &quot;{item.content.projectTitle}&quot;
                            </span>
                          )}
                        </div>
                        {item.content.comment && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            &quot;{item.content.comment}&quot;
                          </p>
                        )}
                        <div className="text-sm text-muted-foreground mt-2">
                          For artisan: <span className="font-medium">{item.content.artisan?.name}</span>
                          {item.content.artisan?.profession && (
                            <span className="text-muted-foreground"> ({item.content.artisan.profession})</span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          By: <span className="font-medium">{item.targetUser?.name}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                          {new Date(item.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(item.status)}
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => openActionDialog(item, 'approve')}
                        disabled={moderationAction.isPending}
                      >
                        {moderationAction.isPending && moderationAction.variables?.id === item.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => openActionDialog(item, 'reject')}
                        disabled={moderationAction.isPending}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Moderation</CardTitle>
              <CardDescription>Users requiring attention or action</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="flex items-start gap-4">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-48" />
                          <Skeleton className="h-3 w-40" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-8 w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : userItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Check className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No users requiring moderation</p>
                </div>
              ) : (
                userItems.map((item) => (
                  <div key={item.id} className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">
                          {item.content.firstName} {item.content.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {item.content.email}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Role: <span className="font-medium">{item.content.role}</span>
                          {item.content.profile?.profession && (
                            <span> • {item.content.profile.profession}</span>
                          )}
                        </div>
                        {item.content.profile?.city && (
                          <div className="text-sm text-muted-foreground">
                            Location: {item.content.profile.city}, {item.content.profile.county}
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground mt-2">
                          Joined: {new Date(item.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(item.status)}
                      {item.status === 'pending' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => openActionDialog(item, 'activate')}
                          disabled={moderationAction.isPending}
                        >
                          Activate
                        </Button>
                      )}
                      {item.status === 'suspended' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => openActionDialog(item, 'unsuspend')}
                          disabled={moderationAction.isPending}
                        >
                          Unsuspend
                        </Button>
                      )}
                      {item.status !== 'suspended' && item.status !== 'banned' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => openActionDialog(item, 'suspend')}
                          disabled={moderationAction.isPending}
                        >
                          Suspend
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
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
              {activityLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No recent moderation actions</p>
                </div>
              ) : (
                activityLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                      <Shield className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">
                        {log.action.replace(/_/g, ' ')}
                      </div>
                      {log.description && (
                        <p className="text-sm text-muted-foreground">{log.description}</p>
                      )}
                      <div className="text-sm text-muted-foreground mt-1">
                        By: {log.adminEmail} • Target: {log.targetType} ({log.targetId.slice(0, 8)}...)
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(log.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Confirmation Dialog */}
      <AlertDialog open={!!selectedItem && !!actionType} onOpenChange={() => { setSelectedItem(null); setActionType(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Action</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {getActionLabel(actionType || '').toLowerCase()} this {selectedItem?.type}?
              {actionType === 'reject' && ' This will hide the review from public view.'}
              {actionType === 'suspend' && ' The user will not be able to access the platform.'}
              {actionType === 'ban' && ' This action is permanent and the user will be blocked.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedItem && actionType && handleAction(selectedItem, actionType)}
              className={actionType === 'approve' || actionType === 'activate' || actionType === 'unsuspend' 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-red-600 hover:bg-red-700'}
            >
              {getActionLabel(actionType || '')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
