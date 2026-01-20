/**
 * Type definitions for environment variables
 * 
 * This file provides type safety for accessing environment variables.
 * It also validates that required variables are present at build time.
 */

/**
 * Server-side environment variables (not exposed to browser)
 */
interface ServerEnv {
  // Database
  DATABASE_URL: string

  // Clerk Authentication
  CLERK_SECRET_KEY: string

  // M-Pesa Daraja API
  MPESA_CONSUMER_KEY?: string
  MPESA_CONSUMER_SECRET?: string
  MPESA_PASSKEY?: string
  MPESA_SHORT_CODE?: string
  MPESA_CALLBACK_URL?: string
  MPESA_ENVIRONMENT?: 'sandbox' | 'production'

  // Application
  NEXTAUTH_SECRET: string
  LOG_LEVEL?: 'debug' | 'info' | 'warn' | 'error'

  // Cloudinary
  CLOUDINARY_CLOUD_NAME?: string
  CLOUDINARY_API_KEY?: string
  CLOUDINARY_API_SECRET?: string
  MAX_UPLOAD_SIZE?: string

  // Email
  EMAIL_SERVER_HOST?: string
  EMAIL_SERVER_PORT?: string
  EMAIL_SERVER_USER?: string
  EMAIL_SERVER_PASSWORD?: string
  EMAIL_FROM?: string

  // Feature Flags
  ENABLE_EMAIL_NOTIFICATIONS?: string
  ENABLE_SMS_NOTIFICATIONS?: string
  ENABLE_MPESA_PAYMENTS?: string

  // Africa's Talking
  AFRICASTALKING_USERNAME?: string
  AFRICASTALKING_API_KEY?: string
  AFRICASTALKING_SENDER_ID?: string

  // Monitoring
  SENTRY_DSN?: string

  // Rate Limiting
  RATE_LIMIT_AUTHENTICATED?: string
  RATE_LIMIT_ANONYMOUS?: string
}

/**
 * Client-side environment variables (exposed to browser)
 * Must be prefixed with NEXT_PUBLIC_
 */
interface ClientEnv {
  // Clerk
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: string
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: string
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: string
  NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: string
  NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: string

  // Application
  NEXT_PUBLIC_APP_URL: string

  // Analytics
  NEXT_PUBLIC_GA_MEASUREMENT_ID?: string
}

/**
 * Combined environment variables
 */
type Env = ServerEnv & ClientEnv

/**
 * Extend NodeJS ProcessEnv with our typed variables
 */
declare global {
  namespace NodeJS {
    interface ProcessEnv extends Env {}
  }
}

/**
 * Get a required environment variable (throws if missing)
 */
export function getRequiredEnv(key: keyof Env): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

/**
 * Get an optional environment variable with a default value
 */
export function getOptionalEnv<T extends string>(
  key: keyof Env,
  defaultValue: T
): string {
  return process.env[key] ?? defaultValue
}

/**
 * Get a boolean environment variable
 */
export function getBooleanEnv(key: keyof Env, defaultValue = false): boolean {
  const value = process.env[key]
  if (!value) return defaultValue
  return value.toLowerCase() === 'true' || value === '1'
}

/**
 * Get a numeric environment variable
 */
export function getNumericEnv(key: keyof Env, defaultValue: number): number {
  const value = process.env[key]
  if (!value) return defaultValue
  const parsed = parseInt(value, 10)
  return isNaN(parsed) ? defaultValue : parsed
}

/**
 * Typed environment configuration object
 * Use this for accessing environment variables with type safety
 */
export const env = {
  // Database
  get databaseUrl() {
    return getRequiredEnv('DATABASE_URL')
  },

  // Clerk
  get clerkSecretKey() {
    return getRequiredEnv('CLERK_SECRET_KEY')
  },
  get clerkPublishableKey() {
    return getRequiredEnv('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY')
  },

  // M-Pesa
  mpesa: {
    get consumerKey() {
      return process.env.MPESA_CONSUMER_KEY
    },
    get consumerSecret() {
      return process.env.MPESA_CONSUMER_SECRET
    },
    get passkey() {
      return process.env.MPESA_PASSKEY
    },
    get shortCode() {
      return process.env.MPESA_SHORT_CODE
    },
    get callbackUrl() {
      return process.env.MPESA_CALLBACK_URL
    },
    get environment() {
      return (process.env.MPESA_ENVIRONMENT || 'sandbox') as 'sandbox' | 'production'
    },
    get isConfigured() {
      return !!(
        process.env.MPESA_CONSUMER_KEY &&
        process.env.MPESA_CONSUMER_SECRET &&
        process.env.MPESA_PASSKEY &&
        process.env.MPESA_SHORT_CODE
      )
    },
  },

  // Application
  get appUrl() {
    return getOptionalEnv('NEXT_PUBLIC_APP_URL', 'http://localhost:3000')
  },
  get logLevel() {
    return getOptionalEnv('LOG_LEVEL', 'info') as 'debug' | 'info' | 'warn' | 'error'
  },

  // Cloudinary
  cloudinary: {
    get cloudName() {
      return process.env.CLOUDINARY_CLOUD_NAME
    },
    get apiKey() {
      return process.env.CLOUDINARY_API_KEY
    },
    get apiSecret() {
      return process.env.CLOUDINARY_API_SECRET
    },
    get isConfigured() {
      return !!(
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
      )
    },
  },

  // Email
  email: {
    get host() {
      return process.env.EMAIL_SERVER_HOST
    },
    get port() {
      return getNumericEnv('EMAIL_SERVER_PORT' as keyof Env, 587)
    },
    get user() {
      return process.env.EMAIL_SERVER_USER
    },
    get password() {
      return process.env.EMAIL_SERVER_PASSWORD
    },
    get from() {
      return getOptionalEnv('EMAIL_FROM' as keyof Env, 'noreply@artisanlink.co.ke')
    },
    get isConfigured() {
      return !!(
        process.env.EMAIL_SERVER_HOST &&
        process.env.EMAIL_SERVER_USER &&
        process.env.EMAIL_SERVER_PASSWORD
      )
    },
  },

  // Feature Flags
  features: {
    get emailNotifications() {
      return getBooleanEnv('ENABLE_EMAIL_NOTIFICATIONS' as keyof Env, false)
    },
    get smsNotifications() {
      return getBooleanEnv('ENABLE_SMS_NOTIFICATIONS' as keyof Env, false)
    },
    get mpesaPayments() {
      return getBooleanEnv('ENABLE_MPESA_PAYMENTS' as keyof Env, false)
    },
  },

  // Rate Limiting
  rateLimit: {
    get authenticated() {
      return getNumericEnv('RATE_LIMIT_AUTHENTICATED' as keyof Env, 100)
    },
    get anonymous() {
      return getNumericEnv('RATE_LIMIT_ANONYMOUS' as keyof Env, 20)
    },
  },

  // Upload
  get maxUploadSize() {
    return getNumericEnv('MAX_UPLOAD_SIZE' as keyof Env, 5242880) // 5MB
  },

  // Monitoring
  get sentryDsn() {
    return process.env.SENTRY_DSN
  },
  get gaId() {
    return process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
  },

  // Environment checks
  get isDevelopment() {
    return process.env.NODE_ENV === 'development'
  },
  get isProduction() {
    return process.env.NODE_ENV === 'production'
  },
  get isTest() {
    return process.env.NODE_ENV === 'test'
  },
} as const

export default env
