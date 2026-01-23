/**
 * Custom React Query Hooks
 * 
 * This module exports all data-fetching hooks used throughout the application.
 * Each hook encapsulates the query logic for a specific domain/feature.
 */

// Admin hooks
export { useUsers, useUserStats, userKeys, type User, type UserStats } from './use-users'
export {
  useAdminStats,
  useSystemTasks,
  useRecentUsers,
  adminDashboardKeys,
  type AdminStats,
  type SystemTasks,
  type PendingVerification,
  type RecentActivity,
  type SystemAlert,
  type RecentUser,
} from './use-admin-dashboard'

// Artisan hooks
export { 
  useArtisanProfile, 
  useArtisanReviews, 
  artisanReviewKeys,
  type Review,
  type ArtisanInfo,
  type ReviewsResponse,
} from './use-artisan-reviews'
export {
  useArtisanDashboard,
  artisanStatsKeys,
  type ArtisanStats,
  type ArtisanRecentActivity,
  type ArtisanProfile,
  type ArtisanUser,
  type ArtisanDashboardData,
} from './use-artisan-stats'

// Client hooks
export {
  useClientStats,
  useRecentSearches,
  useActiveProjects,
  useSavedArtisans,
  clientDashboardKeys,
  type ClientStats,
  type RecentSearch,
  type ActiveProject,
  type SavedArtisan,
} from './use-client-dashboard'

// Artisan search hooks
export {
  useArtisanSearch,
  useSearchHistory,
  useSavedArtisanIds,
  useToggleSaveArtisan,
  useRecordSearch,
  useClearSearchHistory,
  useDeleteSearchHistoryItem,
  artisanSearchKeys,
  type Artisan,
  type SearchFacets,
  type SearchPagination,
  type ArtisanSearchResponse,
  type SearchFilters,
  type SearchHistoryItem,
} from './use-artisan-search'

// Conversation hooks
export {
  useConversations,
  useArchiveConversation,
  useCreateConversation,
  conversationKeys,
  type Conversation,
  type ConversationsResponse,
  type ConversationFilters,
} from './use-conversations'

// Portfolio hooks
export {
  usePortfolio,
  usePortfolioItem,
  useDeletePortfolioItem,
  useCreatePortfolioItem,
  useUpdatePortfolioItem,
  portfolioKeys,
  type PortfolioItem,
  type PortfolioResponse,
  type PortfolioFilters,
} from './use-portfolio'

// Saved artisans hooks (client)
export {
  useSavedArtisansPage,
  useRemoveSavedArtisan,
  savedArtisansKeys,
  type SavedArtisan as SavedArtisanFull,
  type SavedArtisansResponse,
  type SavedArtisansFilters,
} from './use-saved-artisans'

// Admin analytics hooks
export {
  useAdminAnalytics,
  adminAnalyticsKeys,
  type UserGrowth,
  type ProjectStats,
  type RevenueData,
  type AnalyticsMetrics,
  type AdminAnalyticsData,
} from './use-admin-analytics'

// Client reviews hooks
export {
  useClientReviews,
  useCreateReview,
  useUpdateReview,
  useDeleteReview,
  clientReviewsKeys,
  type ClientReview,
  type ClientReviewProfile,
  type ClientReviewsResponse,
  type ClientReviewsFilters,
  type CreateReviewData,
  type UpdateReviewData,
} from './use-client-reviews'

// Admin artisans hooks
export {
  useAdminArtisans,
  adminArtisansKeys,
  type AdminArtisan,
  type AdminArtisansStats,
  type AdminArtisansResponse,
  type AdminArtisansFilters,
} from './use-admin-artisans'

// Conversation messages hooks (chat view)
export {
  useConversation,
  useConversationMessages,
  useSendMessage,
  useArchiveConversationDetail,
  conversationMessagesKeys,
  type Message,
  type MessageSender,
  type ConversationDetail,
  type ConversationParticipant,
  type MessagesResponse,
  type SendMessageData,
} from './use-conversation-messages'

// Admin subscriptions hooks
export {
  useAdminSubscriptions,
  adminSubscriptionsKeys,
  formatCurrency,
  getStatusBadgeVariant,
  getPlanBadgeVariant,
  type SubscriptionStat,
  type Subscription,
  type SubscriptionUser,
  type SubscriptionProfile,
  type SubscriptionMetrics,
  type AdminSubscriptionsData,
} from './use-admin-subscriptions'

// Admin verification hooks
export {
  usePendingVerifications,
  useVerificationStats,
  useAdminVerification,
  useProcessVerification,
  adminVerificationKeys,
  getInitials,
  formatDate,
  type PendingArtisan,
  type PendingArtisanProfile,
  type VerificationStats,
  type VerificationData,
  type ProcessVerificationData,
  type ProcessVerificationResponse,
} from './use-admin-verification'

// Artisan analytics hooks
export {
  useArtisanAnalytics,
  getRatingDistribution,
  formatAnalyticsDate,
  artisanAnalyticsKeys,
  type ArtisanAnalyticsStats,
  type ArtisanAnalyticsReview,
  type ArtisanAnalyticsProfile,
  type ArtisanAnalyticsData,
} from './use-artisan-analytics'

// Artisan payments hooks
export {
  useArtisanPayments,
  usePaymentReceipt,
  useExportPayments,
  PAYMENT_STATUS_CONFIG,
  formatPaymentDate,
  formatPaymentDateShort,
  generateReceiptContent,
  downloadReceipt,
  artisanPaymentsKeys,
  type Payment,
  type PaymentSummary,
  type PaymentsResponse,
  type PaymentFilters,
  type ReceiptData,
} from './use-artisan-payments'

// Artisan subscription hooks
export {
  useArtisanSubscription,
  useInitiatePayment,
  usePaymentStatusPolling,
  SUBSCRIPTION_PLANS,
  formatSubscriptionDate,
  getDaysRemaining,
  isSubscriptionActive,
  isSubscriptionExpired,
  artisanSubscriptionKeys,
  type SubscriptionData,
  type PaymentStatus,
  type InitiatePaymentData,
  type InitiatePaymentResponse,
  type PlanType,
} from './use-artisan-subscription'

// Admin locations hooks
export {
  useAdminLocations,
  mapCountiesForMap,
  adminLocationsKeys,
  type County,
  type Region,
  type City,
  type TopCounty,
  type LocationStats,
  type LocationMetadata,
  type LocationData,
  type LocationFilters,
  type MapCounty,
} from './use-admin-locations'

// Admin search hooks
export {
  useAdminSearch,
  useAdminSearchMutation,
  getStatusBadgeClass,
  formatKESCurrency,
  QUICK_SEARCHES,
  adminSearchKeys,
  type UserSearchResult,
  type ArtisanSearchResult,
  type ActivitySearchResult,
  type SearchResults,
  type SearchCounts,
  type AdminSearchData,
  type AdminSearchFilters,
} from './use-admin-search'

// Admin settings hooks
export {
  useAdminSettings,
  useSaveAdminSettings,
  DEFAULT_SETTINGS,
  adminSettingsKeys,
  type GeneralSettings,
  type NotificationSettings,
  type SecuritySettings,
  type FeatureSettings,
  type AdminSettings,
  type SaveSettingsData,
} from './use-admin-settings'

// Admin database hooks
export {
  useAdminDatabase,
  getDatabaseStatusBadgeClass,
  adminDatabaseKeys,
  type TableInfo,
  type DatabaseStats,
  type HealthStats,
  type PerformanceStats,
  type DatabaseMetadata,
  type DatabaseData,
} from './use-admin-database'

// Admin reports hooks
export {
  useGenerateReport,
  REPORT_TYPES,
  formatReportCurrency,
  downloadReportCSV,
  adminReportsKeys,
  type ReportType,
  type ReportSummary,
  type GeneratedReport,
  type ReportMeta,
  type ReportResponse,
  type GenerateReportParams,
} from './use-admin-reports'

// Admin moderation hooks
export {
  useAdminModeration,
  useActivityLogs,
  useModerationAction,
  getModerationStatusBadgeClass,
  getActionLabel,
  adminModerationKeys,
  type ModerationItem,
  type ModerationItemContent,
  type ModerationTargetUser,
  type ModerationStats,
  type ActivityLogItem,
  type ModerationData,
  type ModerationActionParams,
} from './use-admin-moderation'

// Admin monitoring hooks
export {
  useAdminMonitoring,
  getHealthStatusIcon,
  getHealthStatusBadgeClass,
  getLogLevelBadgeClass,
  adminMonitoringKeys,
  type DatabaseHealth,
  type ApiHealth,
  type ServerHealth,
  type SystemHealth,
  type SystemLog,
  type PerformanceMetric,
  type MonitoringData,
} from './use-admin-monitoring'

// Artisan settings hooks
export {
  useArtisanProfile as useArtisanSettingsProfile,
  useArtisanSpecializations,
  useUpdateArtisanProfile,
  useToggleAvailability,
  useUpdateLocation,
  useUpdateCertificate,
  useAddSpecialization,
  useDeleteSpecialization,
  SKILL_LEVELS,
  KENYAN_COUNTIES,
  getSkillLevel,
  getVerificationStatusClass,
  artisanSettingsKeys,
  type Specialization,
  type ArtisanProfile as ArtisanSettingsProfile,
  type SpecializationsData,
  type NewSpecialization,
  type LocationUpdate,
  type CertificateUpdate,
} from './use-artisan-settings'

// Unread messages hooks
export {
  useUnreadMessages,
  useUnreadCount,
  unreadMessagesKeys,
} from './use-unread-messages'

// Client jobs hooks
export {
  useClientJobs,
  useClientJobDetails,
  useAcceptQuote,
  useDeclineQuote,
  useCancelJob,
  useCreateJobRequest,
  clientJobsKeys,
  type ClientJob,
  type ClientJobDetails,
  type ClientJobsResponse,
} from './use-client-jobs'

// Artisan jobs hooks
export {
  useArtisanJobs,
  useArtisanJobDetails,
  useCreateQuote,
  useDeclineJob,
  useStartJob,
  useCompleteJob,
  artisanJobsKeys,
  type ArtisanJob,
  type ArtisanJobDetails,
  type ArtisanJobsResponse,
  type QuoteLineItem,
  type QuoteLineItemInput,
} from './use-artisan-jobs'

// Current user hooks
export {
  useCurrentUser,
  currentUserKeys,
  type CurrentUser,
  type CurrentUserProfile,
  type CurrentUserResponse,
} from './use-current-user'

// Job payments hooks
export {
  useInitiateJobPayment,
  useJobPaymentStatus,
  useJobPaymentFlow,
  jobPaymentKeys,
  type InitiateJobPaymentData,
  type InitiateJobPaymentResponse,
  type JobPaymentStatus,
} from './use-job-payments'

