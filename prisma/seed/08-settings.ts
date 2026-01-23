import { prisma, SeedResult } from './client'
import { PROFESSIONS } from './data'
import { log, logSuccess } from './utils'

// ============================================================================
// SEED SYSTEM SETTINGS
// ============================================================================

export async function seedSettings(): Promise<SeedResult> {
  log('⚙️', 'Creating system settings...')
  
  const settings = [
    {
      key: 'monthly_subscription_price',
      value: '499',
      type: 'number',
      description: 'Monthly subscription price in KES',
      isPublic: true,
    },
    {
      key: 'annual_subscription_price',
      value: '4999',
      type: 'number',
      description: 'Annual subscription price in KES (save 17%)',
      isPublic: true,
    },
    {
      key: 'max_portfolio_items',
      value: '20',
      type: 'number',
      description: 'Maximum number of portfolio items per artisan',
      isPublic: false,
    },
    {
      key: 'max_images_per_portfolio',
      value: '10',
      type: 'number',
      description: 'Maximum images per portfolio item',
      isPublic: false,
    },
    {
      key: 'platform_commission',
      value: '5',
      type: 'number',
      description: 'Platform commission percentage',
      isPublic: false,
    },
    {
      key: 'email_notifications_enabled',
      value: 'true',
      type: 'boolean',
      description: 'Enable email notifications globally',
      isPublic: false,
    },
    {
      key: 'sms_notifications_enabled',
      value: 'true',
      type: 'boolean',
      description: 'Enable SMS notifications globally',
      isPublic: false,
    },
    {
      key: 'maintenance_mode',
      value: 'false',
      type: 'boolean',
      description: 'Enable maintenance mode',
      isPublic: true,
    },
    {
      key: 'min_search_radius_km',
      value: '5',
      type: 'number',
      description: 'Minimum search radius in kilometers',
      isPublic: true,
    },
    {
      key: 'max_search_radius_km',
      value: '100',
      type: 'number',
      description: 'Maximum search radius in kilometers',
      isPublic: true,
    },
    {
      key: 'default_search_radius_km',
      value: '25',
      type: 'number',
      description: 'Default search radius in kilometers',
      isPublic: true,
    },
    {
      key: 'professions_list',
      value: JSON.stringify(PROFESSIONS.map(p => p.name)),
      type: 'json',
      description: 'List of available artisan professions',
      isPublic: true,
    },
    {
      key: 'support_email',
      value: 'support@artisanlink.co.ke',
      type: 'string',
      description: 'Support email address',
      isPublic: true,
    },
    {
      key: 'support_phone',
      value: '+254700000000',
      type: 'string',
      description: 'Support phone number',
      isPublic: true,
    },
  ]
  
  // Create settings one by one to avoid unique constraint issues
  for (const setting of settings) {
    await prisma.setting.create({ data: setting })
  }
  
  logSuccess('Created system settings', settings.length)
  
  return {
    name: 'Settings',
    count: settings.length
  }
}
