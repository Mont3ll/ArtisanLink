'use client'

import { PortfolioForm } from '@/components/dashboard/artisan/portfolio/portfolio-form'

export default function NewPortfolioPage() {
  return (
    <div className="px-4 lg:px-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Add Portfolio Item</h1>
        <p className="text-muted-foreground">
          Showcase your work by adding a new portfolio item
        </p>
      </div>
      
      <PortfolioForm mode="create" />
    </div>
  )
}
