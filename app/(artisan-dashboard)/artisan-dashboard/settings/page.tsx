'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  Plus, 
  Trash2, 
  AlertTriangle,
  RefreshCw,
  Star,
  Briefcase,
  Settings,
  Award,
  MapPin,
  Upload,
  FileCheck,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Save,
  Bell,
  User,
  ImageIcon,
  FileText
} from 'lucide-react'
import NotificationPreferencesCard from '@/components/shared/notification-preferences-card'
import PersonalInfoCard from '@/components/shared/personal-info-card'
import { FileUpload } from '@/components/ui/file-upload'
import {
  useArtisanSettingsProfile,
  useArtisanSpecializations,
  useUpdateArtisanProfile,
  useToggleAvailability,
  useUpdateLocation,
  useUpdateCertificate,
  useAddSpecialization,
  useDeleteSpecialization,
  SKILL_LEVELS,
  KENYAN_COUNTIES,
  getSkillLevel,
} from '@/lib/hooks'

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="p-6"><div className="h-8 w-32 bg-muted rounded animate-pulse" /></div>}>
      <SettingsPageContent />
    </Suspense>
  )
}

function SettingsPageContent() {
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get('tab') || 'profile'
  // React Query hooks
  const { data: profileData, isLoading: profileLoading, error: profileError, refetch: refetchProfile } = useArtisanSettingsProfile()
  const { data: specData, isLoading: specLoading, error: specError, refetch: refetchSpec } = useArtisanSpecializations()
  
  // Mutations
  const toggleAvailability = useToggleAvailability()
  const updateLocation = useUpdateLocation()
  const updateCertificate = useUpdateCertificate()
  const addSpecialization = useAddSpecialization()
  const deleteSpecialization = useDeleteSpecialization()
  const updateProfile = useUpdateArtisanProfile()
  
  // Local state
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [certificateUrl, setCertificateUrl] = useState('')
  
  // Professional info state (bio, profession, hourlyRate, experience)
  const [profInfo, setProfInfo] = useState({
    bio: '',
    profession: '',
    hourlyRate: '',
    experience: '',
  })
  const [profInfoInitialized, setProfInfoInitialized] = useState(false)
  const [profInfoSaving, setProfInfoSaving] = useState(false)
  const [profInfoSuccess, setProfInfoSuccess] = useState<string | null>(null)
  const [profInfoError, setProfInfoError] = useState<string | null>(null)
  
  // Profile image state
  const [profileImage, setProfileImage] = useState('')
  const [coverImage, setCoverImage] = useState('')
  
  // ID document state
  const [idDocumentUrl, setIdDocumentUrl] = useState('')
  const [idDocumentType, setIdDocumentType] = useState<string>('')
  
  // Form state for new specialization
  const [newSpecialization, setNewSpecialization] = useState({
    name: '',
    category: '',
    skillLevel: 3,
    yearsExp: ''
  })
  const [formError, setFormError] = useState<string | null>(null)
  
  // Location form state
  const [locationForm, setLocationForm] = useState({
    county: '',
    city: '',
    address: '',
    latitude: '',
    longitude: ''
  })
  const [locationInitialized, setLocationInitialized] = useState(false)

  // Derived data
  const profile = profileData?.profile
  const specializations = specData?.specializations || []
  const categories = specData?.categories || []
  
  // Initialize location form when profile loads
  if (profile && !locationInitialized) {
    setLocationForm({
      county: profile.county || '',
      city: profile.city || '',
      address: profile.address || '',
      latitude: profile.latitude?.toString() || '',
      longitude: profile.longitude?.toString() || ''
    })
    setCertificateUrl(profile.certificateUrl || '')
    setProfileImage(profile.profileImage || '')
    setCoverImage(profile.coverImage || '')
    setIdDocumentUrl(profile.idDocumentUrl || '')
    setIdDocumentType(profile.idDocumentType || '')
    setLocationInitialized(true)
    if (!profInfoInitialized) {
      setProfInfo({
        bio: profile.bio || '',
        profession: profile.profession || '',
        hourlyRate: profile.hourlyRate?.toString() || '',
        experience: profile.experience?.toString() || '',
      })
      setProfInfoInitialized(true)
    }
  }

  const showSuccess = (message: string) => {
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  const handleSaveProfInfo = async () => {
    setProfInfoError(null)
    setProfInfoSuccess(null)
    if (!profInfo.profession.trim()) {
      setProfInfoError('Profession is required')
      return
    }
    if (profInfo.bio && profInfo.bio.trim().length > 0 && profInfo.bio.trim().length < 50) {
      setProfInfoError('Bio must be at least 50 characters (or leave empty)')
      return
    }
    setProfInfoSaving(true)
    try {
      updateProfile.mutate({
        bio: profInfo.bio.trim() || null,
        profession: profInfo.profession.trim(),
        hourlyRate: profInfo.hourlyRate ? parseFloat(profInfo.hourlyRate) : null,
        experience: profInfo.experience ? parseInt(profInfo.experience, 10) : null,
      }, {
        onSuccess: () => {
          setProfInfoSuccess('Professional info saved!')
          setTimeout(() => setProfInfoSuccess(null), 4000)
          refetchProfile()
        },
        onError: (err: unknown) => {
          setProfInfoError(err instanceof Error ? err.message : 'Failed to save. Please try again.')
        },
        onSettled: () => setProfInfoSaving(false),
      })
    } catch {
      setProfInfoError('Failed to save. Please try again.')
      setProfInfoSaving(false)
    }
  }

  const handleToggleAvailability = async () => {
    if (!profile) return
    
    toggleAvailability.mutate(!profile.isAvailable, {
      onSuccess: () => showSuccess('Availability updated!')
    })
  }

  const handleAddSpecialization = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    
    if (!newSpecialization.name.trim()) {
      setFormError('Skill name is required')
      return
    }
    
    addSpecialization.mutate({
      name: newSpecialization.name.trim(),
      category: newSpecialization.category || null,
      skillLevel: newSpecialization.skillLevel,
      yearsExp: newSpecialization.yearsExp ? parseInt(newSpecialization.yearsExp) : null
    }, {
      onSuccess: () => {
        setNewSpecialization({ name: '', category: '', skillLevel: 3, yearsExp: '' })
        showSuccess('Specialization added!')
      },
      onError: (error) => {
        setFormError(error instanceof Error ? error.message : 'Failed to add')
      }
    })
  }

  const handleDelete = async () => {
    if (!deleteId) return
    
    deleteSpecialization.mutate(deleteId, {
      onSuccess: () => {
        setDeleteId(null)
        showSuccess('Specialization deleted!')
      }
    })
  }

  const handleSaveLocation = async () => {
    updateLocation.mutate({
      county: locationForm.county || null,
      city: locationForm.city || null,
      address: locationForm.address || null,
      latitude: locationForm.latitude ? parseFloat(locationForm.latitude) : null,
      longitude: locationForm.longitude ? parseFloat(locationForm.longitude) : null
    }, {
      onSuccess: () => showSuccess('Location updated!')
    })
  }

  const handleSaveCertificate = async () => {
    if (!certificateUrl.trim()) return
    
    updateCertificate.mutate({
      certificateUrl: certificateUrl.trim(),
    }, {
      onSuccess: () => showSuccess('Certificate saved! It will be reviewed for verification.')
    })
  }

  // Handle profile image upload
  const handleProfileImageChange = (url: string) => {
    setProfileImage(url)
    if (url) {
      updateProfile.mutate({ profileImage: url }, {
        onSuccess: () => showSuccess('Profile photo updated!')
      })
    }
  }

  // Handle cover image upload
  const handleCoverImageChange = (url: string) => {
    setCoverImage(url)
    if (url) {
      updateProfile.mutate({ coverImage: url }, {
        onSuccess: () => showSuccess('Cover image updated!')
      })
    }
  }

  // Handle certificate file upload (replaces URL input)
  const handleCertificateUpload = (url: string) => {
    setCertificateUrl(url)
    if (url) {
      updateCertificate.mutate({
        certificateUrl: url,
      }, {
        onSuccess: () => showSuccess('Certificate uploaded! It will be reviewed for verification.')
      })
    }
  }

  // Handle ID document upload
  const handleIdDocumentUpload = (url: string) => {
    setIdDocumentUrl(url)
  }

  // Save ID document with type
  const handleSaveIdDocument = async () => {
    if (!idDocumentUrl.trim() || !idDocumentType) {
      setFormError('Please upload an ID document and select the document type')
      return
    }
    
    updateProfile.mutate({
      idDocumentUrl: idDocumentUrl.trim(),
      idDocumentType: idDocumentType,
    }, {
      onSuccess: () => {
        setFormError(null)
        showSuccess('ID document saved! It will be reviewed for verification.')
      },
      onError: (error) => {
        setFormError(error instanceof Error ? error.message : 'Failed to save ID document')
      }
    })
  }

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      return
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationForm(prev => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6)
        }))
        showSuccess('Location detected! Click Save to update.')
      }
    )
  }

  const renderSkillStars = (level: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          <Star
            key={i}
            className={`h-4 w-4 ${i <= level ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
          />
        ))}
      </div>
    )
  }

  const getVerificationBadge = () => {
    if (!profile) return null
    
    switch (profile.artisanStatus) {
      case 'VERIFIED':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        )
      case 'PENDING':
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Pending Review
          </Badge>
        )
      case 'REJECTED':
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        )
      default:
        return (
          <Badge variant="outline">
            Not Submitted
          </Badge>
        )
    }
  }

  const hasError = profileError || specError
  const errorMessage = profileError?.message || specError?.message

  return (
    <div className="px-4 lg:px-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your profile settings, availability, and specializations
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle2 className="h-5 w-5" />
              <span>{successMessage}</span>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Error Message */}
      {hasError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              <span>{errorMessage}</span>
              <Button variant="outline" size="sm" onClick={() => {
                refetchProfile()
                refetchSpec()
              }}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue={defaultTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile" className="gap-2">
            <Settings className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="specializations" className="gap-2">
            <Award className="h-4 w-4" />
            Specializations
          </TabsTrigger>
          <TabsTrigger value="location" className="gap-2">
            <MapPin className="h-4 w-4" />
            Location
          </TabsTrigger>
          <TabsTrigger value="verification" className="gap-2">
            <FileCheck className="h-4 w-4" />
            Verification
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          {/* Personal Information Card */}
          <PersonalInfoCard />

          {/* Professional Info Card — bio, profession, hourlyRate, experience */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Professional Information
              </CardTitle>
              <CardDescription>
                Your profession, bio, and rate. This is what clients see on your profile.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {profileLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-28 w-full" />
                  <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <Skeleton className="h-10 w-32" />
                </div>
              ) : (
                <>
                  {profInfoSuccess && (
                    <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      {profInfoSuccess}
                    </div>
                  )}
                  {profInfoError && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                      {profInfoError}
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="profProfession">Profession / Trade *</Label>
                    <Input
                      id="profProfession"
                      value={profInfo.profession}
                      onChange={(e) => setProfInfo(p => ({ ...p, profession: e.target.value }))}
                      placeholder="e.g. Carpenter, Electrician, Plumber"
                      maxLength={100}
                    />
                    <p className="text-xs text-muted-foreground">Your main trade or profession as it will appear in search results</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profBio">Bio / About Me</Label>
                    <Textarea
                      id="profBio"
                      value={profInfo.bio}
                      onChange={(e) => setProfInfo(p => ({ ...p, bio: e.target.value }))}
                      placeholder="Describe your experience, skills, and what makes you stand out. Minimum 50 characters."
                      rows={4}
                      maxLength={2000}
                    />
                    <p className="text-xs text-muted-foreground">
                      {profInfo.bio.length}/2000 characters
                      {profInfo.bio.length > 0 && profInfo.bio.length < 50 && (
                        <span className="text-amber-600 ml-2">({50 - profInfo.bio.length} more needed)</span>
                      )}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="profHourlyRate">Hourly Rate (KES)</Label>
                      <Input
                        id="profHourlyRate"
                        type="number"
                        value={profInfo.hourlyRate}
                        onChange={(e) => setProfInfo(p => ({ ...p, hourlyRate: e.target.value }))}
                        placeholder="e.g. 1200"
                        min="0"
                        max="50000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="profExperience">Years of Experience</Label>
                      <Input
                        id="profExperience"
                        type="number"
                        value={profInfo.experience}
                        onChange={(e) => setProfInfo(p => ({ ...p, experience: e.target.value }))}
                        placeholder="e.g. 5"
                        min="0"
                        max="60"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleSaveProfInfo}
                    disabled={profInfoSaving || updateProfile.isPending || !profInfo.profession.trim()}
                  >
                    {profInfoSaving || updateProfile.isPending ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
                    ) : (
                      <><Save className="h-4 w-4 mr-2" /> Save Professional Info</>
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Availability Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Availability
              </CardTitle>
              <CardDescription>
                Control whether you appear in search results and can receive new inquiries
              </CardDescription>
            </CardHeader>
            <CardContent>
              {profileLoading ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-6 w-12 rounded-full" />
                  </div>
                  <Skeleton className="h-24 w-full rounded-lg" />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="availability">Available for Work</Label>
                      <p className="text-sm text-muted-foreground">
                        {profile?.isAvailable 
                          ? 'You are visible to clients and can receive inquiries'
                          : 'You are hidden from search results'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch
                        id="availability"
                        checked={profile?.isAvailable || false}
                        onCheckedChange={handleToggleAvailability}
                        disabled={toggleAvailability.isPending}
                      />
                      {toggleAvailability.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                    </div>
                  </div>
                  
                  {/* Availability Status Indicator */}
                  <div className="mt-4 p-4 rounded-lg bg-muted">
                    <div className="flex items-center gap-2">
                      <div className={`h-3 w-3 rounded-full ${profile?.isAvailable ? 'bg-green-500' : 'bg-gray-400'}`} />
                      <span className="font-medium">
                        {profile?.isAvailable ? 'Currently Available' : 'Currently Unavailable'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {profile?.isAvailable 
                        ? 'Clients can find you in search results and send you messages.'
                        : 'You won\'t appear in search results. Existing conversations will still work.'}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Profile Photo Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Photo
              </CardTitle>
              <CardDescription>
                Upload a professional photo to help clients recognize you
              </CardDescription>
            </CardHeader>
            <CardContent>
              {profileLoading ? (
                <Skeleton className="h-48 w-full rounded-lg" />
              ) : (
                <FileUpload
                  folder="profile-images"
                  value={profileImage}
                  onChange={handleProfileImageChange}
                  label=""
                  description="Recommended: Square image, at least 400x400 pixels. Max 2MB."
                />
              )}
            </CardContent>
          </Card>

          {/* Cover Image Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Cover Image
              </CardTitle>
              <CardDescription>
                Add a cover image to personalize your profile page
              </CardDescription>
            </CardHeader>
            <CardContent>
              {profileLoading ? (
                <Skeleton className="h-48 w-full rounded-lg" />
              ) : (
                <FileUpload
                  folder="profile-images"
                  value={coverImage}
                  onChange={handleCoverImageChange}
                  label=""
                  description="Recommended: Wide image (16:9), at least 1200x675 pixels. Max 2MB."
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Specializations Tab */}
        <TabsContent value="specializations" className="space-y-6">
          {/* Add Specialization Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add New Specialization
              </CardTitle>
              <CardDescription>
                Add skills and specializations to showcase your expertise
              </CardDescription>
            </CardHeader>
            <CardContent>
              {specLoading ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <Skeleton className="h-10 w-40" />
                </div>
              ) : (
                <form onSubmit={handleAddSpecialization} className="space-y-4">
                  {formError && (
                    <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
                      {formError}
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Skill Name *</Label>
                      <Input
                        id="name"
                        value={newSpecialization.name}
                        onChange={(e) => setNewSpecialization(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Furniture Making"
                        maxLength={100}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={newSpecialization.category}
                        onValueChange={(value) => setNewSpecialization(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Skill Level (1-5)</Label>
                      <div className="flex items-center gap-4">
                        <Select
                          value={newSpecialization.skillLevel.toString()}
                          onValueChange={(value) => setNewSpecialization(prev => ({ ...prev, skillLevel: parseInt(value) }))}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {SKILL_LEVELS.map(level => (
                              <SelectItem key={level.value} value={level.value.toString()}>
                                {level.value} - {level.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {renderSkillStars(newSpecialization.skillLevel)}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="yearsExp">Years of Experience</Label>
                      <Input
                        id="yearsExp"
                        type="number"
                        min="0"
                        max="100"
                        value={newSpecialization.yearsExp}
                        onChange={(e) => setNewSpecialization(prev => ({ ...prev, yearsExp: e.target.value }))}
                        placeholder="e.g., 5"
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={addSpecialization.isPending}>
                    {addSpecialization.isPending ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Specialization
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Specializations List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Your Specializations
              </CardTitle>
              <CardDescription>
                {specLoading ? (
                  <Skeleton className="h-4 w-24" />
                ) : (
                  <>{specializations.length} skill{specializations.length !== 1 ? 's' : ''} added</>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {specLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-4 w-64" />
                      </div>
                      <Skeleton className="h-8 w-8 rounded" />
                    </div>
                  ))}
                </div>
              ) : specializations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p>No specializations added yet.</p>
                  <p className="text-sm">Add your skills above to showcase your expertise.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {specializations.map(spec => (
                    <div
                      key={spec.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-medium">{spec.name}</h3>
                          {spec.category && (
                            <Badge variant="outline">{spec.category}</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <span>Skill Level:</span>
                            {renderSkillStars(spec.skillLevel)}
                            <Badge className={getSkillLevel(spec.skillLevel).color}>
                              {getSkillLevel(spec.skillLevel).label}
                            </Badge>
                          </div>
                          {spec.yearsExp !== null && (
                            <span>{spec.yearsExp} year{spec.yearsExp !== 1 ? 's' : ''} experience</span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(spec.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Category Suggestions */}
          <Card>
            <CardHeader>
              <CardTitle>Suggested Categories</CardTitle>
              <CardDescription>
                Click on a category to quickly add it as a specialization
              </CardDescription>
            </CardHeader>
            <CardContent>
              {specLoading ? (
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <Skeleton key={i} className="h-6 w-24 rounded-full" />
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {categories
                    .filter(cat => !specializations.some(s => s.category === cat))
                    .map(cat => (
                      <Badge
                        key={cat}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                        onClick={() => setNewSpecialization(prev => ({ 
                          ...prev, 
                          name: cat,
                          category: cat 
                        }))}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        {cat}
                      </Badge>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Location Tab */}
        <TabsContent value="location" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Service Location
              </CardTitle>
              <CardDescription>
                Set your location to help clients find you. This will be shown on the map.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {profileLoading ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <Skeleton className="h-20 w-full" />
                  <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <Skeleton className="h-10 w-32" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="county">County *</Label>
                      <Select
                        value={locationForm.county}
                        onValueChange={(value) => setLocationForm(prev => ({ ...prev, county: value }))}
                      >
                        <SelectTrigger id="county">
                          <SelectValue placeholder="Select county" />
                        </SelectTrigger>
                        <SelectContent>
                          {KENYAN_COUNTIES.map(county => (
                            <SelectItem key={county} value={county}>{county}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="city">City/Town</Label>
                      <Input
                        id="city"
                        value={locationForm.city}
                        onChange={(e) => setLocationForm(prev => ({ ...prev, city: e.target.value }))}
                        placeholder="e.g., Westlands, Nairobi"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Address (Optional)</Label>
                    <Textarea
                      id="address"
                      value={locationForm.address}
                      onChange={(e) => setLocationForm(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Your workshop or office address"
                      rows={2}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>GPS Coordinates (for precise map location)</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleGetCurrentLocation}
                      >
                        <MapPin className="h-4 w-4 mr-2" />
                        Use My Location
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="latitude">Latitude</Label>
                        <Input
                          id="latitude"
                          type="number"
                          step="any"
                          value={locationForm.latitude}
                          onChange={(e) => setLocationForm(prev => ({ ...prev, latitude: e.target.value }))}
                          placeholder="-1.2921"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="longitude">Longitude</Label>
                        <Input
                          id="longitude"
                          type="number"
                          step="any"
                          value={locationForm.longitude}
                          onChange={(e) => setLocationForm(prev => ({ ...prev, longitude: e.target.value }))}
                          placeholder="36.8219"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Button onClick={handleSaveLocation} disabled={updateLocation.isPending}>
                    {updateLocation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Location
                      </>
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Verification Tab */}
        <TabsContent value="verification" className="space-y-6">
          {/* Verification Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5" />
                Verification Status
              </CardTitle>
              <CardDescription>
                Get verified to build trust with clients and appear higher in search results
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {profileLoading ? (
                <div className="space-y-6">
                  <Skeleton className="h-16 w-full rounded-lg" />
                  <Skeleton className="h-32 w-full rounded-lg" />
                </div>
              ) : (
                <>
                  {/* Current Status */}
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">Current Status</p>
                      <p className="text-sm text-muted-foreground">
                        {profile?.verifiedAt 
                          ? `Verified on ${new Date(profile.verifiedAt).toLocaleDateString()}`
                          : 'Not yet verified'}
                      </p>
                    </div>
                    {getVerificationBadge()}
                  </div>
                  
                  {/* Rejection Reason */}
                  {profile?.artisanStatus === 'REJECTED' && profile?.rejectionReason && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2 text-red-800">
                        <XCircle className="h-5 w-5" />
                        <span className="font-medium">Verification Rejected</span>
                      </div>
                      <p className="text-sm text-red-700 mt-2">
                        <strong>Reason:</strong> {profile.rejectionReason}
                      </p>
                      <p className="text-xs text-red-600 mt-2">
                        Please address the issue and re-submit your documents.
                      </p>
                    </div>
                  )}
                  
                  {/* Verification Requirements */}
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3">Verification Requirements</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        {profile?.profileImage ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <Clock className="h-4 w-4 text-yellow-500" />
                        )}
                        Profile photo uploaded
                      </li>
                      <li className="flex items-center gap-2">
                        {profile?.certificateUrl ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <Clock className="h-4 w-4 text-yellow-500" />
                        )}
                        Professional certificate or qualification
                      </li>
                      <li className="flex items-center gap-2">
                        {profile?.idDocumentUrl ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <Clock className="h-4 w-4 text-yellow-500" />
                        )}
                        Valid government-issued ID
                      </li>
                    </ul>
                    <p className="text-xs text-muted-foreground mt-3">
                      Verification is reviewed by our team within 2-3 business days.
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Certificate Upload Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Professional Certificate
              </CardTitle>
              <CardDescription>
                Upload your professional certificate, diploma, or qualification document
              </CardDescription>
            </CardHeader>
            <CardContent>
              {profileLoading ? (
                <Skeleton className="h-48 w-full rounded-lg" />
              ) : (
                <div className="space-y-4">
                  <FileUpload
                    folder="certificates"
                    value={certificateUrl}
                    onChange={handleCertificateUpload}
                    label=""
                    description="Accepted formats: JPEG, PNG, PDF. Max 5MB."
                  />
                  
                  {profile?.certificateUrl && profile.certificateUploadedAt && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 text-green-800 text-sm">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Uploaded on {new Date(profile.certificateUploadedAt).toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* ID Document Upload Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Government-Issued ID
              </CardTitle>
              <CardDescription>
                Upload a clear photo or scan of your government-issued identification document
              </CardDescription>
            </CardHeader>
            <CardContent>
              {profileLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-48 w-full rounded-lg" />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* ID Type Selector */}
                  <div className="space-y-2">
                    <Label htmlFor="idDocumentType">Document Type *</Label>
                    <Select
                      value={idDocumentType}
                      onValueChange={(value) => setIdDocumentType(value)}
                    >
                      <SelectTrigger id="idDocumentType">
                        <SelectValue placeholder="Select ID type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NATIONAL_ID">National ID (Kenyan)</SelectItem>
                        <SelectItem value="PASSPORT">Passport</SelectItem>
                        <SelectItem value="DRIVING_LICENSE">Driving License</SelectItem>
                        <SelectItem value="ALIEN_ID">Alien ID</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* ID Document Upload */}
                  <FileUpload
                    folder="id-documents"
                    value={idDocumentUrl}
                    onChange={handleIdDocumentUpload}
                    label="ID Document"
                    description="Accepted formats: JPEG, PNG, PDF. Max 5MB. Ensure all details are clearly visible."
                  />
                  
                  {/* Save Button */}
                  <Button 
                    onClick={handleSaveIdDocument} 
                    disabled={updateProfile.isPending || !idDocumentUrl || !idDocumentType}
                    className="w-full"
                  >
                    {updateProfile.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save ID Document
                      </>
                    )}
                  </Button>
                  
                  {/* Form Error */}
                  {formError && (
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <span>{formError}</span>
                    </div>
                  )}
                  
                  {/* Current ID Document Status */}
                  {profile?.idDocumentUrl && profile.idDocumentUploadedAt && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 text-green-800 text-sm">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>
                          {profile.idDocumentType?.replace('_', ' ')} uploaded on {new Date(profile.idDocumentUploadedAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {/* Privacy Notice */}
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">
                      <strong>Privacy Notice:</strong> Your ID document is securely stored and only used for verification purposes. 
                      It will not be shared with clients or any third parties.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <NotificationPreferencesCard />
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Specialization</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this specialization? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteSpecialization.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={deleteSpecialization.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteSpecialization.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
