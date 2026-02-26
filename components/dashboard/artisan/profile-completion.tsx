'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle2, 
  Circle, 
  User, 
  Briefcase, 
  Award, 
  MapPin,
  FileText,
  Image,
  ArrowRight,
  X
} from 'lucide-react'

interface Profile {
  bio: string | null
  profileImage: string | null
  profession: string | null
  experience: number | null
  hourlyRate: number | null
  latitude: number | null
  longitude: number | null
  address: string | null
  city: string | null
  county: string | null
  certificateUrl: string | null
  isAvailable: boolean
  artisanStatus: string | null
  portfolioItems: { id: string }[]
  specializations: { id: string }[]
}

interface ProfileCompletionProps {
  profile: Profile | null
}

interface CompletionItem {
  id: string
  title: string
  description: string
  completed: boolean
  icon: React.ReactNode
  href: string
  weight: number // For percentage calculation
}

const STORAGE_KEY = 'artisanlink_profile_completion_dismissed'

export function ProfileCompletion({ profile }: ProfileCompletionProps) {
  const [isDismissed, setIsDismissed] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  // Check localStorage on mount
  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY)
    if (dismissed === 'true') {
      setIsDismissed(true)
    }
    setIsHydrated(true)
  }, [])

  if (!profile) {
    return null
  }

  // Define completion items with weights
  const completionItems: CompletionItem[] = [
    {
      id: 'bio',
      title: 'Add Bio',
      description: 'Tell clients about yourself and your work',
      completed: Boolean(profile.bio && profile.bio.length >= 50),
      icon: <User className="h-4 w-4" />,
      href: '/artisan-dashboard/settings?tab=profile',
      weight: 15
    },
    {
      id: 'profileImage',
      title: 'Profile Photo',
      description: 'Add a professional profile picture',
      completed: Boolean(profile.profileImage),
      icon: <Image className="h-4 w-4" />,
      href: '/artisan-dashboard/settings?tab=profile',
      weight: 10
    },
    {
      id: 'profession',
      title: 'Set Profession',
      description: 'Specify your main profession or trade',
      completed: Boolean(profile.profession),
      icon: <Briefcase className="h-4 w-4" />,
      href: '/artisan-dashboard/settings?tab=profile',
      weight: 15
    },
    {
      id: 'specializations',
      title: 'Add Specializations',
      description: 'List your skills and expertise areas',
      completed: profile.specializations.length >= 2,
      icon: <Award className="h-4 w-4" />,
      href: '/artisan-dashboard/settings',
      weight: 15
    },
    {
      id: 'portfolio',
      title: 'Build Portfolio',
      description: 'Showcase at least 3 of your best works',
      completed: profile.portfolioItems.length >= 3,
      icon: <FileText className="h-4 w-4" />,
      href: '/artisan-dashboard/portfolio/new',
      weight: 20
    },
    {
      id: 'location',
      title: 'Set Location',
      description: 'Add your service area for local clients',
      completed: Boolean(profile.county || (profile.latitude && profile.longitude)),
      icon: <MapPin className="h-4 w-4" />,
      href: '/artisan-dashboard/settings?tab=profile',
      weight: 15
    },
    {
      id: 'certificate',
      title: 'Upload Certificate',
      description: 'Verify your credentials for trust badges',
      completed: Boolean(profile.certificateUrl),
      icon: <Award className="h-4 w-4" />,
      href: '/artisan-dashboard/settings?tab=verification',
      weight: 10
    }
  ]

  // Calculate completion percentage
  const completedWeight = completionItems
    .filter(item => item.completed)
    .reduce((sum, item) => sum + item.weight, 0)
  
  const totalWeight = completionItems.reduce((sum, item) => sum + item.weight, 0)
  const completionPercentage = Math.round((completedWeight / totalWeight) * 100)
  
  // Hide the card if profile is complete AND user dismissed it
  if (completionPercentage === 100 && isDismissed) {
    return null
  }

  // Don't render until hydrated to avoid flicker
  if (!isHydrated) {
    return null
  }
  
  // Get the next incomplete item
  const nextItem = completionItems.find(item => !item.completed)
  
  // Get completion status label
  const getStatusLabel = () => {
    if (completionPercentage === 100) return { label: 'Complete', color: 'bg-green-500' }
    if (completionPercentage >= 80) return { label: 'Almost There', color: 'bg-emerald-500' }
    if (completionPercentage >= 50) return { label: 'Good Progress', color: 'bg-yellow-500' }
    return { label: 'Getting Started', color: 'bg-orange-500' }
  }
  
  const status = getStatusLabel()

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true')
    setIsDismissed(true)
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Profile Completion</CardTitle>
            <CardDescription>Complete your profile to attract more clients</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={status.color}>{status.label}</Badge>
            {completionPercentage === 100 && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6" 
                onClick={handleDismiss}
                title="Dismiss"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{completionPercentage}%</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>

        {/* Checklist */}
        <div className="space-y-2">
          {completionItems.map(item => (
            <div 
              key={item.id} 
              className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                item.completed 
                  ? 'bg-green-50 dark:bg-green-950/20' 
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <div className={`flex-shrink-0 ${item.completed ? 'text-green-500' : 'text-muted-foreground'}`}>
                {item.completed ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <Circle className="h-5 w-5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${item.completed ? 'text-green-700 dark:text-green-400 line-through' : 'text-gray-900 dark:text-gray-100'}`}>
                  {item.title}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {item.description}
                </p>
              </div>
              {!item.completed && (
                <Link href={item.href}>
                  <Button size="sm" variant="ghost" className="flex-shrink-0">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Next Step CTA */}
        {nextItem && completionPercentage < 100 && (
          <div className="pt-2 border-t">
            <Link href={nextItem.href}>
              <Button className="w-full">
                {nextItem.icon}
                <span className="ml-2">Next: {nextItem.title}</span>
                <ArrowRight className="ml-auto h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}

        {completionPercentage === 100 && (
          <div className="pt-2 border-t text-center">
            <div className="flex items-center justify-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">Profile Complete!</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Your profile is now ready to attract clients
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-3"
              onClick={handleDismiss}
            >
              Dismiss this card
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
