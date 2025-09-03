export type UserRole = 'admin' | 'artisan' | 'client'

export function isAdminRole(role: UserRole | string | undefined): boolean {
  return role === 'admin'
}

export function isArtisanRole(role: UserRole | string | undefined): boolean {
  return role === 'artisan'
}

export function isClientRole(role: UserRole | string | undefined): boolean {
  return role === 'client'
}

export function getUserRoleDisplayName(role: UserRole | string | undefined): string {
  switch (role) {
    case 'admin':
      return 'Administrator'
    case 'artisan':
      return 'Artisan'
    case 'client':
      return 'Client'
    default:
      return 'Unknown'
  }
}

export function getDefaultDashboardRoute(role: UserRole | string | undefined): string {
  switch (role) {
    case 'admin':
      return '/admin-dashboard'
    case 'artisan':
      return '/artisan-dashboard'
    case 'client':
      return '/client-dashboard'
    default:
      return '/sign-in'
  }
}
