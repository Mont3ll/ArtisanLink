/**
 * Tests for lib/roles.ts
 */
import { describe, it, expect } from 'vitest'
import {
  isAdminRole,
  isArtisanRole,
  isClientRole,
  getUserRoleDisplayName,
  getDefaultDashboardRoute,
  type UserRole,
} from '../lib/roles'

describe('isAdminRole', () => {
  it('should return true for admin role', () => {
    expect(isAdminRole('admin')).toBe(true)
  })

  it('should return false for artisan role', () => {
    expect(isAdminRole('artisan')).toBe(false)
  })

  it('should return false for client role', () => {
    expect(isAdminRole('client')).toBe(false)
  })

  it('should return false for undefined', () => {
    expect(isAdminRole(undefined)).toBe(false)
  })

  it('should return false for empty string', () => {
    expect(isAdminRole('')).toBe(false)
  })

  it('should return false for invalid role string', () => {
    expect(isAdminRole('superadmin')).toBe(false)
    expect(isAdminRole('ADMIN')).toBe(false) // case sensitive
  })
})

describe('isArtisanRole', () => {
  it('should return true for artisan role', () => {
    expect(isArtisanRole('artisan')).toBe(true)
  })

  it('should return false for admin role', () => {
    expect(isArtisanRole('admin')).toBe(false)
  })

  it('should return false for client role', () => {
    expect(isArtisanRole('client')).toBe(false)
  })

  it('should return false for undefined', () => {
    expect(isArtisanRole(undefined)).toBe(false)
  })

  it('should return false for empty string', () => {
    expect(isArtisanRole('')).toBe(false)
  })

  it('should return false for invalid role string', () => {
    expect(isArtisanRole('craftsman')).toBe(false)
    expect(isArtisanRole('ARTISAN')).toBe(false) // case sensitive
  })
})

describe('isClientRole', () => {
  it('should return true for client role', () => {
    expect(isClientRole('client')).toBe(true)
  })

  it('should return false for admin role', () => {
    expect(isClientRole('admin')).toBe(false)
  })

  it('should return false for artisan role', () => {
    expect(isClientRole('artisan')).toBe(false)
  })

  it('should return false for undefined', () => {
    expect(isClientRole(undefined)).toBe(false)
  })

  it('should return false for empty string', () => {
    expect(isClientRole('')).toBe(false)
  })

  it('should return false for invalid role string', () => {
    expect(isClientRole('customer')).toBe(false)
    expect(isClientRole('CLIENT')).toBe(false) // case sensitive
  })
})

describe('getUserRoleDisplayName', () => {
  it('should return "Administrator" for admin role', () => {
    expect(getUserRoleDisplayName('admin')).toBe('Administrator')
  })

  it('should return "Artisan" for artisan role', () => {
    expect(getUserRoleDisplayName('artisan')).toBe('Artisan')
  })

  it('should return "Client" for client role', () => {
    expect(getUserRoleDisplayName('client')).toBe('Client')
  })

  it('should return "Unknown" for undefined', () => {
    expect(getUserRoleDisplayName(undefined)).toBe('Unknown')
  })

  it('should return "Unknown" for empty string', () => {
    expect(getUserRoleDisplayName('')).toBe('Unknown')
  })

  it('should return "Unknown" for invalid role', () => {
    expect(getUserRoleDisplayName('superuser')).toBe('Unknown')
    expect(getUserRoleDisplayName('ADMIN')).toBe('Unknown')
  })
})

describe('getDefaultDashboardRoute', () => {
  it('should return admin dashboard route for admin role', () => {
    expect(getDefaultDashboardRoute('admin')).toBe('/admin-dashboard')
  })

  it('should return artisan dashboard route for artisan role', () => {
    expect(getDefaultDashboardRoute('artisan')).toBe('/artisan-dashboard')
  })

  it('should return client dashboard route for client role', () => {
    expect(getDefaultDashboardRoute('client')).toBe('/client-dashboard')
  })

  it('should return sign-in route for undefined', () => {
    expect(getDefaultDashboardRoute(undefined)).toBe('/sign-in')
  })

  it('should return sign-in route for empty string', () => {
    expect(getDefaultDashboardRoute('')).toBe('/sign-in')
  })

  it('should return sign-in route for invalid role', () => {
    expect(getDefaultDashboardRoute('superuser')).toBe('/sign-in')
    expect(getDefaultDashboardRoute('ADMIN')).toBe('/sign-in')
  })
})

describe('UserRole type', () => {
  it('should accept valid role values', () => {
    const roles: UserRole[] = ['admin', 'artisan', 'client']
    expect(roles).toHaveLength(3)
    expect(roles).toContain('admin')
    expect(roles).toContain('artisan')
    expect(roles).toContain('client')
  })
})
