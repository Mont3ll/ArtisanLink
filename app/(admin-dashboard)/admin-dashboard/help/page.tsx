'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Book, 
  MessageCircle, 
  Video, 
  Download, 
  ExternalLink,
  Search,
  Phone,
  Mail,
  Clock
} from 'lucide-react'

export default function HelpPage() {
  return (
    <div className="px-4 lg:px-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Help & Support</h1>
          <p className="text-gray-600 mt-2">Find answers and get assistance with platform administration</p>
        </div>
        <Button className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4" />
          Contact Support
        </Button>
      </div>

      {/* Quick Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search Help Articles</CardTitle>
          <CardDescription>Find quick answers to common questions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search help articles, tutorials, and documentation..." 
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Help Categories */}
      <Tabs defaultValue="documentation" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="documentation">Documentation</TabsTrigger>
          <TabsTrigger value="tutorials">Tutorials</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>

        <TabsContent value="documentation" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Book className="h-8 w-8 text-blue-600" />
                  <div>
                    <CardTitle className="text-lg">Admin Guide</CardTitle>
                    <CardDescription>Complete administrator handbook</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Comprehensive guide covering all administrative functions and best practices.
                </p>
                <Button variant="outline" className="w-full">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Guide
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Book className="h-8 w-8 text-green-600" />
                  <div>
                    <CardTitle className="text-lg">User Management</CardTitle>
                    <CardDescription>Managing users and permissions</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Learn how to manage user accounts, roles, and platform access.
                </p>
                <Button variant="outline" className="w-full">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Read More
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Book className="h-8 w-8 text-purple-600" />
                  <div>
                    <CardTitle className="text-lg">Analytics & Reports</CardTitle>
                    <CardDescription>Understanding platform metrics</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Guide to interpreting analytics data and generating reports.
                </p>
                <Button variant="outline" className="w-full">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Learn More
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tutorials" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Video className="h-8 w-8 text-red-600" />
                  <div>
                    <CardTitle className="text-lg">Getting Started</CardTitle>
                    <CardDescription>15-minute walkthrough</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Complete overview of the admin dashboard and core features.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <Video className="h-4 w-4 mr-2" />
                    Watch Video
                  </Button>
                  <Button variant="outline" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Video className="h-8 w-8 text-blue-600" />
                  <div>
                    <CardTitle className="text-lg">User Verification</CardTitle>
                    <CardDescription>8-minute tutorial</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Step-by-step guide to verifying artisan accounts and profiles.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <Video className="h-4 w-4 mr-2" />
                    Watch Video
                  </Button>
                  <Button variant="outline" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Video className="h-8 w-8 text-green-600" />
                  <div>
                    <CardTitle className="text-lg">System Monitoring</CardTitle>
                    <CardDescription>12-minute tutorial</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Monitor platform health and performance metrics effectively.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <Video className="h-4 w-4 mr-2" />
                    Watch Video
                  </Button>
                  <Button variant="outline" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Video className="h-8 w-8 text-orange-600" />
                  <div>
                    <CardTitle className="text-lg">Platform Settings</CardTitle>
                    <CardDescription>10-minute walkthrough</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Configure platform settings and customize user experience.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <Video className="h-4 w-4 mr-2" />
                    Watch Video
                  </Button>
                  <Button variant="outline" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="support" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>Common questions and answers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-medium">How do I reset a user&apos;s password?</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Navigate to User Management, find the user, and click the reset password option.
                  </p>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-medium">How do I approve artisan verifications?</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Go to Artisan Verification, review submitted documents, and approve or reject.
                  </p>
                </div>
                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-medium">How do I generate system reports?</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Use the Reports section to create custom reports with various filters and timeframes.
                  </p>
                </div>
                <Button variant="outline" className="w-full">
                  View All FAQs
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Support Resources</CardTitle>
                <CardDescription>Additional help and resources</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Book className="h-8 w-8 text-blue-600" />
                  <div className="flex-1">
                    <h4 className="font-medium">Knowledge Base</h4>
                    <p className="text-sm text-gray-600">Searchable articles and guides</p>
                  </div>
                  <Button variant="outline" size="sm">Access</Button>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <MessageCircle className="h-8 w-8 text-green-600" />
                  <div className="flex-1">
                    <h4 className="font-medium">Community Forum</h4>
                    <p className="text-sm text-gray-600">Connect with other admins</p>
                  </div>
                  <Button variant="outline" size="sm">Visit</Button>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Download className="h-8 w-8 text-purple-600" />
                  <div className="flex-1">
                    <h4 className="font-medium">Downloads</h4>
                    <p className="text-sm text-gray-600">Documentation and templates</p>
                  </div>
                  <Button variant="outline" size="sm">Browse</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Support</CardTitle>
                <CardDescription>Get direct help from our support team</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-4 border rounded-lg">
                  <Mail className="h-6 w-6 text-blue-600" />
                  <div>
                    <h4 className="font-medium">Email Support</h4>
                    <p className="text-sm text-gray-600">admin-support@artisanlink.ke</p>
                    <p className="text-xs text-gray-500">Response within 24 hours</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 border rounded-lg">
                  <Phone className="h-6 w-6 text-green-600" />
                  <div>
                    <h4 className="font-medium">Phone Support</h4>
                    <p className="text-sm text-gray-600">+254 700 123 456</p>
                    <p className="text-xs text-gray-500">Mon-Fri, 9AM-6PM EAT</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 border rounded-lg">
                  <MessageCircle className="h-6 w-6 text-purple-600" />
                  <div>
                    <h4 className="font-medium">Live Chat</h4>
                    <p className="text-sm text-gray-600">Available during business hours</p>
                    <p className="text-xs text-gray-500">Average response: 5 minutes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Support Hours</CardTitle>
                <CardDescription>When you can reach our team</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-gray-600" />
                  <div>
                    <h4 className="font-medium">Business Hours</h4>
                    <p className="text-sm text-gray-600">Monday - Friday: 9:00 AM - 6:00 PM EAT</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-gray-600" />
                  <div>
                    <h4 className="font-medium">Emergency Support</h4>
                    <p className="text-sm text-gray-600">24/7 for critical system issues</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-gray-600" />
                  <div>
                    <h4 className="font-medium">Response Times</h4>
                    <p className="text-sm text-gray-600">Email: 24 hours | Chat: 5 minutes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
