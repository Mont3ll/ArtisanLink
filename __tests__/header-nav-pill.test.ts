import { describe, expect, it } from 'vitest'

import { buildNavPillHref } from '@/components/layout/header-new'

describe('buildNavPillHref', () => {
  it('builds artisan search URLs from nav pill popover selections', () => {
    expect(buildNavPillHref('service', 'Plumbing')).toBe('/artisans?profession=Plumbing')
    expect(buildNavPillHref('location', 'Nairobi')).toBe('/artisans?county=Nairobi')
    expect(buildNavPillHref('when', 'Today')).toBe('/artisans?available=true')
    expect(buildNavPillHref('budget', 'Under KES 2,000')).toBe('/artisans?maxRate=2000')
  })
})
