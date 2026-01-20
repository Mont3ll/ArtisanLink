import { NotificationType } from '../../app/generated/prisma'
import { prisma, SeedResult, BATCH_SIZE } from './client'
import { 
  randomElement, 
  randomInt,
  randomDate,
  processBatch,
  log,
  logSuccess
} from './utils'

type User = {
  id: string
  email: string
}

// ============================================================================
// SEED NOTIFICATIONS
// ============================================================================

export async function seedNotifications(
  artisans: User[],
  clients: User[]
): Promise<SeedResult> {
  log('🔔', 'Creating notifications...')
  
  const notificationTypes = [
    { type: NotificationType.MESSAGE, title: 'New Message', message: 'You have received a new message.' },
    { type: NotificationType.REVIEW, title: 'New Review', message: 'Someone left you a review.' },
    { type: NotificationType.VERIFICATION, title: 'Verification Update', message: 'Your profile verification status has been updated.' },
    { type: NotificationType.SYSTEM, title: 'System Update', message: 'We have made improvements to the platform.' },
    { type: NotificationType.BOOKING, title: 'New Inquiry', message: 'You have received a new service inquiry.' },
  ]
  
  const notifData: Array<{ userId: string }> = []
  
  for (const user of [...clients.slice(0, 20), ...artisans.slice(0, 50)]) {
    const numNotifications = randomInt(0, 10)
    
    for (let i = 0; i < numNotifications; i++) {
      notifData.push({ userId: user.id })
    }
  }
  
  const notifications = await processBatch(
    notifData,
    BATCH_SIZE * 2,
    async (data) => {
      const notif = randomElement(notificationTypes)
      
      return prisma.notification.create({
        data: {
          userId: data.userId,
          type: notif.type,
          title: notif.title,
          message: notif.message,
          isRead: Math.random() > 0.3,
          linkUrl: Math.random() > 0.5 ? '/dashboard' : null,
          createdAt: randomDate(30),
          readAt: Math.random() > 0.3 ? randomDate(30) : null,
        }
      })
    }
  )
  
  logSuccess('Created notifications', notifications.length)
  
  return {
    name: 'Notifications',
    count: notifications.length
  }
}

// ============================================================================
// SEED ACTIVITY LOGS
// ============================================================================

export async function seedActivityLogs(
  admins: User[],
  artisans: User[],
  count = 100
): Promise<SeedResult> {
  log('📝', 'Creating activity logs...')
  
  const actions = [
    { action: 'USER_VERIFIED', targetType: 'ARTISAN', description: 'Verified artisan certificate and approved profile' },
    { action: 'USER_REJECTED', targetType: 'ARTISAN', description: 'Rejected artisan application' },
    { action: 'SUBSCRIPTION_ACTIVATED', targetType: 'SUBSCRIPTION', description: 'Activated subscription' },
    { action: 'REVIEW_APPROVED', targetType: 'REVIEW', description: 'Approved review' },
    { action: 'USER_SUSPENDED', targetType: 'USER', description: 'Suspended user account' },
    { action: 'SETTING_UPDATED', targetType: 'SETTING', description: 'Updated system setting' },
  ]
  
  const logData = Array.from({ length: count }, () => ({
    admin: randomElement(admins),
    action: randomElement(actions),
    target: randomElement(artisans)
  }))
  
  const activityLogs = await processBatch(
    logData,
    BATCH_SIZE,
    async (data) => {
      return prisma.activityLog.create({
        data: {
          adminId: data.admin.id,
          adminEmail: data.admin.email,
          action: data.action.action,
          targetType: data.action.targetType,
          targetId: data.target.id,
          description: data.action.description,
          ipAddress: `192.168.${randomInt(0, 255)}.${randomInt(0, 255)}`,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          createdAt: randomDate(90),
        }
      })
    }
  )
  
  logSuccess('Created activity logs', activityLogs.length)
  
  return {
    name: 'Activity Logs',
    count: activityLogs.length
  }
}
