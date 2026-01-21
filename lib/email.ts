/**
 * Email Service Utilities
 *
 * Provides email sending capabilities using Nodemailer.
 * Supports transactional emails for verification, job notifications, etc.
 */

import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'
import { createLogger } from './logger'

const logger = createLogger('email')

// ============================================================================
// Types
// ============================================================================

export interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  replyTo?: string
  attachments?: Array<{
    filename: string
    content: string | Buffer
    contentType?: string
  }>
}

export interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
}

export type EmailTemplate =
  | 'verification-approved'
  | 'verification-rejected'
  | 'verification-reminder'
  | 'job-request'
  | 'job-quote'
  | 'job-accepted'
  | 'job-completed'
  | 'payment-received'
  | 'payment-reminder'

// ============================================================================
// Configuration
// ============================================================================

const EMAIL_CONFIG = {
  host: process.env.EMAIL_SERVER_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_SERVER_PORT || '587', 10),
  secure: process.env.EMAIL_SERVER_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
}

const FROM_ADDRESS = process.env.EMAIL_FROM || 'ArtisanLink <noreply@artisanlink.co.ke>'
const APP_NAME = 'ArtisanLink'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// ============================================================================
// Transporter
// ============================================================================

let transporter: Transporter | null = null

/**
 * Get or create email transporter
 */
function getTransporter(): Transporter | null {
  if (transporter) return transporter

  if (!EMAIL_CONFIG.auth.user || !EMAIL_CONFIG.auth.pass) {
    logger.warn('Email credentials not configured')
    return null
  }

  try {
    transporter = nodemailer.createTransport(EMAIL_CONFIG)
    return transporter
  } catch (error) {
    logger.error('Failed to create email transporter:', error)
    return null
  }
}

/**
 * Check if email service is configured
 */
export function isEmailConfigured(): boolean {
  return !!(EMAIL_CONFIG.auth.user && EMAIL_CONFIG.auth.pass)
}

// ============================================================================
// Send Functions
// ============================================================================

/**
 * Send an email
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  // Check if email notifications are enabled
  if (process.env.ENABLE_EMAIL_NOTIFICATIONS !== 'true') {
    logger.info('Email notifications are disabled, skipping email')
    return { success: true, messageId: 'disabled' }
  }

  const transport = getTransporter()
  if (!transport) {
    logger.error('Email transporter not available')
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const mailOptions = {
      from: FROM_ADDRESS,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || stripHtml(options.html),
      replyTo: options.replyTo,
      attachments: options.attachments,
    }

    logger.info(`Sending email to: ${mailOptions.to}`, { subject: options.subject })

    const result = await transport.sendMail(mailOptions)

    logger.info(`Email sent successfully: ${result.messageId}`)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    logger.error('Failed to send email:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    }
  }
}

// ============================================================================
// Email Templates
// ============================================================================

/**
 * Base email template wrapper
 */
function wrapEmailTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${APP_NAME}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f5f5f5;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .email-card {
      background: white;
      border-radius: 8px;
      padding: 32px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 24px;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #16a34a;
    }
    .content {
      margin-bottom: 24px;
    }
    .button {
      display: inline-block;
      background-color: #16a34a;
      color: white !important;
      padding: 12px 24px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 500;
    }
    .button:hover {
      background-color: #15803d;
    }
    .footer {
      text-align: center;
      color: #666;
      font-size: 14px;
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #eee;
    }
    .highlight {
      background-color: #f0fdf4;
      border-left: 4px solid #16a34a;
      padding: 12px 16px;
      margin: 16px 0;
    }
    .warning {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 12px 16px;
      margin: 16px 0;
    }
    .info-box {
      background-color: #f8fafc;
      border-radius: 6px;
      padding: 16px;
      margin: 16px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="email-card">
      <div class="header">
        <div class="logo">${APP_NAME}</div>
      </div>
      <div class="content">
        ${content}
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
        <p>Connecting skilled artisans with clients across Kenya.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim()
}

/**
 * Verification Approved Email
 */
export function getVerificationApprovedEmail(data: {
  artisanName: string
  dashboardUrl?: string
}): { subject: string; html: string } {
  const dashboardUrl = data.dashboardUrl || `${APP_URL}/artisan-dashboard`

  const content = `
    <h2>Congratulations, ${data.artisanName}! 🎉</h2>
    <p>Great news! Your profile has been verified on ${APP_NAME}.</p>
    
    <div class="highlight">
      <strong>What this means:</strong>
      <ul style="margin: 8px 0; padding-left: 20px;">
        <li>Your profile now displays a verified badge</li>
        <li>Clients can find you in search results</li>
        <li>You can receive job requests and messages</li>
      </ul>
    </div>
    
    <p>Start attracting clients by completing your profile and adding portfolio items showcasing your best work.</p>
    
    <p style="text-align: center; margin: 24px 0;">
      <a href="${dashboardUrl}" class="button">Go to Dashboard</a>
    </p>
    
    <p>Thank you for joining ${APP_NAME}. We're excited to help you grow your business!</p>
  `

  return {
    subject: `✅ Your ${APP_NAME} profile has been verified!`,
    html: wrapEmailTemplate(content),
  }
}

/**
 * Verification Rejected Email
 */
export function getVerificationRejectedEmail(data: {
  artisanName: string
  reason: string
  resubmitUrl?: string
}): { subject: string; html: string } {
  const resubmitUrl = data.resubmitUrl || `${APP_URL}/artisan-dashboard/settings`

  const content = `
    <h2>Verification Update</h2>
    <p>Hi ${data.artisanName},</p>
    
    <p>We've reviewed your verification application, but unfortunately we couldn't verify your profile at this time.</p>
    
    <div class="warning">
      <strong>Reason:</strong><br>
      ${data.reason}
    </div>
    
    <p><strong>What you can do:</strong></p>
    <ul style="padding-left: 20px;">
      <li>Review the feedback above</li>
      <li>Ensure your documents are clear and valid</li>
      <li>Resubmit your verification application</li>
    </ul>
    
    <p style="text-align: center; margin: 24px 0;">
      <a href="${resubmitUrl}" class="button">Resubmit Verification</a>
    </p>
    
    <p>If you have questions, please contact our support team.</p>
  `

  return {
    subject: `Action Required: ${APP_NAME} Verification`,
    html: wrapEmailTemplate(content),
  }
}

/**
 * New Job Request Email (to Artisan)
 */
export function getJobRequestEmail(data: {
  artisanName: string
  clientName: string
  jobTitle: string
  description: string
  budget?: number
  jobUrl: string
}): { subject: string; html: string } {
  const content = `
    <h2>New Job Request!</h2>
    <p>Hi ${data.artisanName},</p>
    
    <p>You've received a new job request from <strong>${data.clientName}</strong>.</p>
    
    <div class="info-box">
      <strong>${data.jobTitle}</strong>
      <p style="margin: 8px 0 0; color: #666;">${data.description}</p>
      ${data.budget ? `<p style="margin: 8px 0 0;"><strong>Budget:</strong> KES ${data.budget.toLocaleString()}</p>` : ''}
    </div>
    
    <p>Review the request and send a quote to the client.</p>
    
    <p style="text-align: center; margin: 24px 0;">
      <a href="${data.jobUrl}" class="button">View Job Request</a>
    </p>
    
    <p><em>Tip: Respond quickly to job requests to increase your chances of being hired!</em></p>
  `

  return {
    subject: `📋 New Job Request: ${data.jobTitle}`,
    html: wrapEmailTemplate(content),
  }
}

/**
 * Quote Received Email (to Client)
 */
export function getQuoteReceivedEmail(data: {
  clientName: string
  artisanName: string
  jobTitle: string
  quoteAmount: number
  jobUrl: string
}): { subject: string; html: string } {
  const content = `
    <h2>You've Received a Quote!</h2>
    <p>Hi ${data.clientName},</p>
    
    <p><strong>${data.artisanName}</strong> has sent you a quote for your job request.</p>
    
    <div class="info-box">
      <strong>${data.jobTitle}</strong>
      <p style="margin: 8px 0 0; font-size: 20px; color: #16a34a;">
        <strong>Quote: KES ${data.quoteAmount.toLocaleString()}</strong>
      </p>
    </div>
    
    <p>Review the quote details and accept it to proceed with the job.</p>
    
    <p style="text-align: center; margin: 24px 0;">
      <a href="${data.jobUrl}" class="button">View Quote</a>
    </p>
  `

  return {
    subject: `💰 Quote Received for: ${data.jobTitle}`,
    html: wrapEmailTemplate(content),
  }
}

/**
 * Job Accepted Email (to Artisan)
 */
export function getJobAcceptedEmail(data: {
  artisanName: string
  clientName: string
  jobTitle: string
  agreedPrice: number
  depositAmount: number
  jobUrl: string
}): { subject: string; html: string } {
  const content = `
    <h2>Quote Accepted! 🎉</h2>
    <p>Hi ${data.artisanName},</p>
    
    <p>Great news! <strong>${data.clientName}</strong> has accepted your quote.</p>
    
    <div class="highlight">
      <strong>${data.jobTitle}</strong>
      <p style="margin: 8px 0 0;">
        <strong>Agreed Price:</strong> KES ${data.agreedPrice.toLocaleString()}<br>
        <strong>Deposit:</strong> KES ${data.depositAmount.toLocaleString()}
      </p>
    </div>
    
    <p>The client will pay the deposit, and then you can start the work.</p>
    
    <p style="text-align: center; margin: 24px 0;">
      <a href="${data.jobUrl}" class="button">View Job Details</a>
    </p>
  `

  return {
    subject: `✅ Quote Accepted: ${data.jobTitle}`,
    html: wrapEmailTemplate(content),
  }
}

/**
 * Payment Received Email (to Artisan)
 */
export function getPaymentReceivedEmail(data: {
  artisanName: string
  jobTitle: string
  amount: number
  paymentType: 'deposit' | 'final'
  transactionId?: string
}): { subject: string; html: string } {
  const paymentLabel = data.paymentType === 'deposit' ? 'Deposit' : 'Final Payment'

  const content = `
    <h2>Payment Received! 💰</h2>
    <p>Hi ${data.artisanName},</p>
    
    <p>You've received a ${paymentLabel.toLowerCase()} for your job.</p>
    
    <div class="highlight">
      <strong>${data.jobTitle}</strong>
      <p style="margin: 8px 0 0; font-size: 20px;">
        <strong>${paymentLabel}:</strong> KES ${data.amount.toLocaleString()}
      </p>
      ${data.transactionId ? `<p style="margin: 8px 0 0; font-size: 12px; color: #666;">Transaction ID: ${data.transactionId}</p>` : ''}
    </div>
    
    ${data.paymentType === 'deposit' 
      ? '<p>You can now start working on the job. The final payment will be released upon completion.</p>' 
      : '<p>Thank you for your excellent work! The job has been marked as complete.</p>'
    }
  `

  return {
    subject: `💰 ${paymentLabel} Received: ${data.jobTitle}`,
    html: wrapEmailTemplate(content),
  }
}

/**
 * Job Completed Email (to Client)
 */
export function getJobCompletedEmail(data: {
  clientName: string
  artisanName: string
  jobTitle: string
  completionNotes?: string
  reviewUrl: string
}): { subject: string; html: string } {
  const content = `
    <h2>Job Completed! 🎉</h2>
    <p>Hi ${data.clientName},</p>
    
    <p><strong>${data.artisanName}</strong> has marked your job as complete.</p>
    
    <div class="info-box">
      <strong>${data.jobTitle}</strong>
      ${data.completionNotes ? `<p style="margin: 8px 0 0; color: #666;"><em>"${data.completionNotes}"</em></p>` : ''}
    </div>
    
    <p>Please review the work and make the final payment to complete the transaction.</p>
    
    <p><strong>Don't forget to leave a review!</strong> Your feedback helps other clients find great artisans.</p>
    
    <p style="text-align: center; margin: 24px 0;">
      <a href="${data.reviewUrl}" class="button">Pay & Review</a>
    </p>
  `

  return {
    subject: `✅ Job Completed: ${data.jobTitle}`,
    html: wrapEmailTemplate(content),
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Strip HTML tags for plain text version
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Verify email transporter connection
 */
export async function verifyEmailConnection(): Promise<boolean> {
  const transport = getTransporter()
  if (!transport) return false

  try {
    await transport.verify()
    logger.info('Email transporter verified successfully')
    return true
  } catch (error) {
    logger.error('Email transporter verification failed:', error)
    return false
  }
}
