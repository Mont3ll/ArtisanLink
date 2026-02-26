'use client'

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Shield, 
  Clock, 
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  MapPin,
  Calendar,
  Download,
  Loader2,
  User,
  Mail,
  Phone,
  AlertCircle,
  ExternalLink,
} from "lucide-react"
import {
  useAdminVerification,
  useProcessVerification,
  getInitials,
  formatDate,
  type PendingArtisan,
} from "@/lib/hooks/use-admin-verification"

// Check if URL is a PDF
function isPdfUrl(url: string): boolean {
  return /\.pdf(\?|$)/i.test(url)
}

// Document Preview Component
function DocumentPreview({ url, label }: { url: string; label: string }) {
  if (isPdfUrl(url)) {
    return (
      <div className="space-y-2">
        <p className="font-medium">{label}:</p>
        <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
          <FileText className="h-10 w-10 text-muted-foreground flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">PDF Document</p>
            <p className="text-xs text-muted-foreground truncate">{url.split('/').pop()?.split('?')[0]}</p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <a href={url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3 w-3 mr-1" />
              Open
            </a>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <p className="font-medium">{label}:</p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block relative group rounded-lg border overflow-hidden bg-muted/30 max-w-xs"
      >
        <img
          src={url}
          alt={label}
          className="w-full h-auto max-h-48 object-contain"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
            <ExternalLink className="h-3 w-3" />
            Open full size
          </span>
        </div>
      </a>
    </div>
  )
}

// Skeleton Components
function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-1" />
        <Skeleton className="h-3 w-24" />
      </CardContent>
    </Card>
  )
}

function TableRowSkeleton() {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center space-x-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div>
            <Skeleton className="h-4 w-32 mb-1" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
      </TableCell>
      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
      <TableCell><Skeleton className="h-8 w-16" /></TableCell>
      <TableCell><Skeleton className="h-8 w-16" /></TableCell>
    </TableRow>
  )
}

export default function VerificationPage() {
  const [selectedArtisan, setSelectedArtisan] = useState<PendingArtisan | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [adminNotes, setAdminNotes] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)

  // React Query hooks
  const { pendingArtisans, stats, isLoading, error, refetch } = useAdminVerification()
  const processVerification = useProcessVerification()

  // Filtered artisans
  const filteredArtisans = useMemo(() => {
    return pendingArtisans.filter(artisan =>
      artisan.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artisan.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artisan.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artisan.profile?.profession?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [pendingArtisans, searchTerm])

  // Handle verification action
  const handleVerification = async (artisanId: string, action: 'APPROVE' | 'REJECT') => {
    processVerification.mutate(
      { 
        artisanId, 
        action, 
        reason: action === 'REJECT' ? rejectionReason : undefined,
        adminNotes: adminNotes || undefined,
      },
      {
        onSuccess: () => {
          setSelectedArtisan(null)
          setRejectionReason("")
          setAdminNotes("")
          setDialogOpen(false)
        },
      }
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Failed to load verifications</h2>
          <p className="text-muted-foreground mb-4">There was an error loading the verification data.</p>
          <Button onClick={() => refetch()}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 lg:px-6 space-y-6">
      {/* Header - Always visible */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Artisan Verification</h1>
          <p className="text-muted-foreground">Review and verify artisan certificates and profiles</p>
        </div>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Pending Verification Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Verification</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-12 mb-1" />
                <Skeleton className="h-3 w-24" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.totalPending || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.pendingThisWeek || 0} new this week
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        {/* Verified Artisans Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Artisans</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-12 mb-1" />
                <Skeleton className="h-3 w-28" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.totalVerified || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.verifiedThisWeek || 0} verified this week
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        {/* Rejected Applications Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected Applications</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-12 mb-1" />
                <Skeleton className="h-3 w-20" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.totalRejected || 0}</div>
                <p className="text-xs text-muted-foreground">Total rejected</p>
              </>
            )}
          </CardContent>
        </Card>
        
        {/* Avg Processing Time Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-24" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.avgProcessingTime || 0} days</div>
                <p className="text-xs text-muted-foreground">Average review time</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pending Verifications */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Verifications</CardTitle>
          <CardDescription>Review artisan applications and certificates</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-6">
            <Input
              placeholder="Search by name, email, or profession..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Artisan</TableHead>
                  <TableHead>Profession</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead>Certificate</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} />)
                ) : filteredArtisans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        {searchTerm ? 'No artisans match your search' : 'No pending verifications found'}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredArtisans.map((artisan) => (
                    <TableRow key={artisan.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={artisan.profile?.profileImage || ""} />
                            <AvatarFallback>{getInitials(artisan.firstName, artisan.lastName)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{artisan.firstName} {artisan.lastName}</div>
                            <div className="text-sm text-muted-foreground">{artisan.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{artisan.profile?.profession || 'Not specified'}</TableCell>
                      <TableCell>{artisan.profile?.experience ? `${artisan.profile.experience} years` : 'Not specified'}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1 text-muted-foreground" />
                          {artisan.profile?.city || 'Not specified'}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(artisan.createdAt)}</TableCell>
                      <TableCell>
                        {artisan.profile?.certificateUrl ? (
                          <Button variant="outline" size="sm" asChild>
                            <a href={artisan.profile.certificateUrl} target="_blank" rel="noopener noreferrer">
                              <FileText className="h-3 w-3 mr-1" />
                              View
                            </a>
                          </Button>
                        ) : (
                          <span className="text-muted-foreground text-sm">No certificate</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog open={dialogOpen && selectedArtisan?.id === artisan.id} onOpenChange={(open) => {
                          setDialogOpen(open)
                          if (!open) {
                            setSelectedArtisan(null)
                            setRejectionReason("")
                            setAdminNotes("")
                          }
                        }}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedArtisan(artisan)
                                setDialogOpen(true)
                              }}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Review
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Artisan Verification Review</DialogTitle>
                              <DialogDescription>
                                Review the artisan&apos;s profile and certificate before making a decision
                              </DialogDescription>
                            </DialogHeader>
                            
                            {selectedArtisan && (
                              <div className="space-y-6">
                                {/* Personal Information */}
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                      <User className="h-4 w-4 text-muted-foreground" />
                                      <span className="font-medium">Name:</span>
                                    </div>
                                    <p>{selectedArtisan.firstName} {selectedArtisan.lastName}</p>
                                  </div>
                                  <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                      <Mail className="h-4 w-4 text-muted-foreground" />
                                      <span className="font-medium">Email:</span>
                                    </div>
                                    <p>{selectedArtisan.email}</p>
                                  </div>
                                  <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                      <Phone className="h-4 w-4 text-muted-foreground" />
                                      <span className="font-medium">Phone:</span>
                                    </div>
                                    <p>{selectedArtisan.phone || 'Not provided'}</p>
                                  </div>
                                  <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                      <MapPin className="h-4 w-4 text-muted-foreground" />
                                      <span className="font-medium">Location:</span>
                                    </div>
                                    <p>{selectedArtisan.profile?.city || 'Not specified'}</p>
                                  </div>
                                </div>

                                {/* Professional Information */}
                                <div className="space-y-4">
                                  <h4 className="font-medium">Professional Information</h4>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <p className="font-medium">Profession:</p>
                                      <p>{selectedArtisan.profile?.profession || 'Not specified'}</p>
                                    </div>
                                    <div>
                                      <p className="font-medium">Experience:</p>
                                      <p>{selectedArtisan.profile?.experience ? `${selectedArtisan.profile.experience} years` : 'Not specified'}</p>
                                    </div>
                                  </div>
                                  {selectedArtisan.profile?.bio && (
                                    <div>
                                      <p className="font-medium">Bio:</p>
                                      <p className="text-sm text-muted-foreground">{selectedArtisan.profile.bio}</p>
                                    </div>
                                  )}
                                </div>

                                {/* Certificate */}
                                {selectedArtisan.profile?.certificateUrl && (
                                  <DocumentPreview
                                    url={selectedArtisan.profile.certificateUrl}
                                    label="Certificate"
                                  />
                                )}

                                {/* ID Document */}
                                {selectedArtisan.profile?.idDocumentUrl && (
                                  <div>
                                    <DocumentPreview
                                      url={selectedArtisan.profile.idDocumentUrl}
                                      label="ID Document"
                                    />
                                    {selectedArtisan.profile.idDocumentType && (
                                      <p className="text-sm text-muted-foreground mt-1">
                                        Type: {selectedArtisan.profile.idDocumentType.replace(/_/g, ' ')}
                                      </p>
                                    )}
                                  </div>
                                )}

                                {/* Rejection Reason (user-facing) */}
                                <div className="space-y-2">
                                  <label className="font-medium">Rejection Reason (shown to artisan):</label>
                                  <Textarea
                                    placeholder="Explain why the application is being rejected (required for rejection)..."
                                    value={rejectionReason}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRejectionReason(e.target.value)}
                                  />
                                </div>

                                {/* Admin Notes (internal) */}
                                <div className="space-y-2">
                                  <label className="font-medium">Admin Notes (internal only):</label>
                                  <Textarea
                                    placeholder="Add internal notes about this verification decision..."
                                    value={adminNotes}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAdminNotes(e.target.value)}
                                  />
                                </div>

                                {/* Actions */}
                                <div className="flex justify-end space-x-3">
                                  <Button
                                    variant="destructive"
                                    onClick={() => handleVerification(selectedArtisan.id, 'REJECT')}
                                    disabled={processVerification.isPending}
                                  >
                                    {processVerification.isPending ? (
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                      <XCircle className="h-4 w-4 mr-2" />
                                    )}
                                    Reject
                                  </Button>
                                  <Button
                                    onClick={() => handleVerification(selectedArtisan.id, 'APPROVE')}
                                    disabled={processVerification.isPending}
                                  >
                                    {processVerification.isPending ? (
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                    )}
                                    Approve
                                  </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
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
