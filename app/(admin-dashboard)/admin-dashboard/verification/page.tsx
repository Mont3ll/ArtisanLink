'use client'

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
  Phone
} from "lucide-react"

interface PendingArtisan {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  createdAt: string
  profile?: {
    profession?: string
    experience?: number
    city?: string
    county?: string
    bio?: string
    certificateUrl?: string
    certificateUploadedAt?: string
    artisanStatus: 'PENDING' | 'VERIFIED' | 'REJECTED'
  }
}

interface VerificationStats {
  totalPending: number
  totalVerified: number
  totalRejected: number
  avgProcessingTime: number
  pendingThisWeek: number
  verifiedThisWeek: number
}

export default function VerificationPage() {
  const [pendingArtisans, setPendingArtisans] = useState<PendingArtisan[]>([])
  const [stats, setStats] = useState<VerificationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedArtisan, setSelectedArtisan] = useState<PendingArtisan | null>(null)
  const [verificationNotes, setVerificationNotes] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [pendingRes, statsRes] = await Promise.all([
        fetch('/api/admin/verification/pending'),
        fetch('/api/admin/verification/stats')
      ])

      if (pendingRes.ok && statsRes.ok) {
        const [pendingData, statsData] = await Promise.all([
          pendingRes.json(),
          statsRes.json()
        ])
        setPendingArtisans(pendingData)
        setStats(statsData)
      }
    } catch (error) {
      console.error('Error fetching verification data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerification = async (artisanId: string, action: 'approve' | 'reject') => {
    try {
      const response = await fetch(`/api/admin/verification/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          artisanId,
          notes: verificationNotes
        }),
      })

      if (response.ok) {
        // Refresh data
        fetchData()
        setSelectedArtisan(null)
        setVerificationNotes("")
      }
    } catch (error) {
      console.error('Error processing verification:', error)
    }
  }

  const filteredArtisans = pendingArtisans.filter(artisan =>
    artisan.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artisan.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artisan.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artisan.profile?.profession?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="px-4 lg:px-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Artisan Verification</h1>
          <p className="text-muted-foreground">Review and verify artisan certificates and profiles</p>
        </div>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Verification</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPending}</div>
              <p className="text-xs text-muted-foreground">
                {stats.pendingThisWeek} new this week
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified Artisans</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalVerified}</div>
              <p className="text-xs text-muted-foreground">
                {stats.verifiedThisWeek} verified this week
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected Applications</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRejected}</div>
              <p className="text-xs text-muted-foreground">Total rejected</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgProcessingTime} days</div>
              <p className="text-xs text-muted-foreground">Average review time</p>
            </CardContent>
          </Card>
        </div>
      )}

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
                {filteredArtisans.map((artisan) => (
                  <TableRow key={artisan.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src="" />
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
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedArtisan(artisan)}
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
                                <div className="space-y-2">
                                  <p className="font-medium">Certificate:</p>
                                  <Button variant="outline" asChild>
                                    <a href={selectedArtisan.profile.certificateUrl} target="_blank" rel="noopener noreferrer">
                                      <FileText className="h-4 w-4 mr-2" />
                                      View Certificate
                                    </a>
                                  </Button>
                                </div>
                              )}

                              {/* Verification Notes */}
                              <div className="space-y-2">
                                <label className="font-medium">Verification Notes:</label>
                                <Textarea
                                  placeholder="Add notes about your verification decision..."
                                  value={verificationNotes}
                                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setVerificationNotes(e.target.value)}
                                />
                              </div>

                              {/* Actions */}
                              <div className="flex justify-end space-x-3">
                                <Button
                                  variant="destructive"
                                  onClick={() => handleVerification(selectedArtisan.id, 'reject')}
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Reject
                                </Button>
                                <Button
                                  onClick={() => handleVerification(selectedArtisan.id, 'approve')}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Approve
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredArtisans.length === 0 && (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No pending verifications found.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
