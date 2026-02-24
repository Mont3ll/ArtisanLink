# ArtisanLink - System Flowcharts

This document contains detailed flowcharts for key processes in the ArtisanLink platform.

## Table of Contents

1. [User Registration & Onboarding](#user-registration--onboarding)
2. [Artisan Verification](#artisan-verification)
3. [Job Request Lifecycle](#job-request-lifecycle)
4. [Quote Workflow](#quote-workflow)
5. [Payment Flow (M-Pesa C2B)](#payment-flow-m-pesa-c2b)
6. [Artisan Payout Flow (M-Pesa B2C)](#artisan-payout-flow-m-pesa-b2c)
7. [Review Workflow](#review-workflow)
8. [Search & Discovery](#search--discovery)
9. [Messaging Flow](#messaging-flow)
10. [Subscription Management](#subscription-management)

---

## User Registration & Onboarding

### Registration Flow

```mermaid
flowchart TD
    Start([User visits site]) --> SignUp{Click Sign Up?}
    SignUp -->|Yes| ClerkAuth[Clerk Authentication]
    SignUp -->|No| Browse[Browse as Guest]
    
    ClerkAuth --> AuthMethod{Auth Method}
    AuthMethod -->|Email| EmailVerify[Email Verification]
    AuthMethod -->|Google| GoogleOAuth[Google OAuth]
    AuthMethod -->|Phone| PhoneOTP[Phone OTP]
    
    EmailVerify --> Verified{Verified?}
    GoogleOAuth --> Verified
    PhoneOTP --> Verified
    
    Verified -->|No| Retry[Retry Verification]
    Retry --> AuthMethod
    
    Verified -->|Yes| SyncUser[Sync User to DB]
    SyncUser --> CreateUser["Create User record<br/>Role: CLIENT<br/>Status: ACTIVE"]
    CreateUser --> CreateProfile[Create empty Profile]
    CreateProfile --> Dashboard[Redirect to Dashboard]
    
    Dashboard --> CompleteProfile{Complete Profile?}
    CompleteProfile -->|Yes| UpdateProfile[Update Profile Info]
    CompleteProfile -->|Later| UseDashboard[Use Dashboard]
    UpdateProfile --> UseDashboard
```

### Role Selection Flow

```mermaid
flowchart TD
    Start([Client User]) --> Decide{Want to become Artisan?}
    Decide -->|No| StayClient[Continue as Client]
    Decide -->|Yes| ApplyArtisan[Apply to Become Artisan]
    
    ApplyArtisan --> FillForm["Fill Application:<br/>- Profession<br/>- Experience<br/>- Hourly Rate<br/>- Location<br/>- Bio"]
    FillForm --> UploadDocs["Upload Documents:<br/>- Profile Photo<br/>- Certificate<br/>- ID Document"]
    UploadDocs --> Submit[Submit Application]
    
    Submit --> Pending["Status: PENDING<br/>Role: CLIENT (unchanged)"]
    Pending --> AdminReview[[Admin Reviews Application]]
    
    AdminReview --> Decision{Decision}
    Decision -->|Approve| Verified["Status: VERIFIED<br/>Role: ARTISAN"]
    Decision -->|Reject| Rejected["Status: REJECTED<br/>Role: CLIENT"]
    
    Rejected --> Resubmit{Resubmit?}
    Resubmit -->|Yes| ApplyArtisan
    Resubmit -->|No| StayClient
    
    Verified --> ArtisanDashboard[Access Artisan Dashboard]
```

---

## Artisan Verification

```mermaid
flowchart TD
    Start([Artisan Submits Application]) --> Queue[Added to Verification Queue]
    Queue --> AdminNotify[Admin Notified]
    
    AdminNotify --> AdminView[Admin Views Application]
    AdminView --> Review["Review:<br/>- Profile Info<br/>- Certificate<br/>- ID Document"]
    
    Review --> Valid{Valid Documents?}
    Valid -->|Yes| CheckInfo{Info Accurate?}
    Valid -->|No| RejectReason[Add Rejection Reason]
    
    CheckInfo -->|Yes| Approve[Approve Application]
    CheckInfo -->|No| RejectReason
    
    RejectReason --> Reject[Reject Application]
    
    Approve --> UpdateStatus["Update Profile:<br/>artisanStatus: VERIFIED<br/>verifiedAt: now()<br/>verifiedBy: adminId"]
    Reject --> UpdateReject["Update Profile:<br/>artisanStatus: REJECTED<br/>rejectionReason: text"]
    
    UpdateStatus --> UpdateRole["Update User:<br/>role: ARTISAN"]
    UpdateRole --> NotifyArtisan[Notify Artisan: Approved]
    
    UpdateReject --> NotifyReject[Notify Artisan: Rejected]
    NotifyReject --> CanResubmit{Can Resubmit?}
    CanResubmit -->|Yes| Resubmit[Artisan Resubmits]
    Resubmit --> Queue
    
    NotifyArtisan --> LogActivity[Log Admin Activity]
    NotifyReject --> LogActivity
    LogActivity --> End([End])
```

---

## Job Request Lifecycle

```mermaid
flowchart TD
    Start([Client Finds Artisan]) --> RequestJob[Request Job]
    RequestJob --> CreateJob["Create Job:<br/>status: REQUESTED"]
    CreateJob --> NotifyArtisan[Notify Artisan]
    
    NotifyArtisan --> ArtisanView[Artisan Views Request]
    ArtisanView --> ArtisanDecision{Decision}
    
    ArtisanDecision -->|Decline| Decline["status: DECLINED<br/>Add decline reason"]
    ArtisanDecision -->|Accept| CreateQuote[Create Quote]
    
    CreateQuote --> DraftQuote["Quote Draft:<br/>- Line items<br/>- Total amount<br/>- Timeline<br/>- Deposit %"]
    DraftQuote --> SendQuote["Send Quote<br/>status: QUOTED"]
    
    SendQuote --> ClientView[Client Views Quote]
    ClientView --> ClientDecision{Decision}
    
    ClientDecision -->|Decline| DeclineQuote["status: DECLINED"]
    ClientDecision -->|Request Revision| Revision{First Quote?}
    ClientDecision -->|Accept| AcceptQuote["status: ACCEPTED"]
    
    Revision -->|Yes| ReviseQuote[Artisan Revises Quote]
    Revision -->|No| MustDecline[Must Accept or Decline]
    ReviseQuote --> SendQuote
    
    AcceptQuote --> PayDeposit[Client Pays Deposit]
    PayDeposit --> DepositPaid["status: DEPOSIT_PAID"]
    
    DepositPaid --> ArtisanPayout["Payout 80% to Artisan<br/>(Platform holds 20%)"]
    ArtisanPayout --> StartWork["status: IN_PROGRESS"]
    
    StartWork --> WorkComplete[Artisan Completes Work]
    WorkComplete --> MarkComplete["status: COMPLETED"]
    
    MarkComplete --> PayFinal[Client Pays Balance]
    PayFinal --> FinalPaid["status: PAID"]
    
    FinalPaid --> ReleaseHeld[Release Held 20%]
    ReleaseHeld --> FinalPayout["Final Payout to Artisan<br/>(minus commission)"]
    FinalPayout --> End([Job Complete])
    
    Decline --> NotifyClient[Notify Client]
    DeclineQuote --> NotifyArtisan2[Notify Artisan]
```

### Job Status State Machine

```mermaid
stateDiagram-v2
    [*] --> REQUESTED: Client creates job
    REQUESTED --> DECLINED: Artisan declines
    REQUESTED --> QUOTED: Artisan sends quote
    QUOTED --> ACCEPTED: Client accepts quote
    QUOTED --> DECLINED: Client declines
    QUOTED --> QUOTED: Revision requested (round 1 only)
    ACCEPTED --> DEPOSIT_PAID: Client pays deposit
    DEPOSIT_PAID --> IN_PROGRESS: Work starts
    IN_PROGRESS --> COMPLETED: Artisan completes work
    COMPLETED --> PAID: Client pays final
    
    REQUESTED --> CANCELLED: Either party cancels
    QUOTED --> CANCELLED: Either party cancels
    ACCEPTED --> CANCELLED: Either party cancels
    IN_PROGRESS --> DISPUTED: Dispute raised
    COMPLETED --> DISPUTED: Payment dispute
    
    PAID --> [*]
    DECLINED --> [*]
    CANCELLED --> [*]
    DISPUTED --> PAID: Dispute resolved
    DISPUTED --> CANCELLED: Dispute cancelled
```

---

## Quote Workflow

```mermaid
flowchart TD
    Start([Artisan Creates Quote]) --> Draft["Create Quote Draft<br/>isDraft: true<br/>round: 1"]
    
    Draft --> AddItems[Add Line Items]
    AddItems --> Categories{"Item Categories:<br/>LABOR<br/>MATERIALS<br/>EQUIPMENT<br/>TRANSPORT<br/>OTHER"}
    Categories --> Calculate["Calculate Total<br/>Set Deposit %"]
    
    Calculate --> Preview[Preview Quote]
    Preview --> Ready{Ready to Send?}
    Ready -->|No| EditDraft[Edit Draft]
    EditDraft --> AddItems
    
    Ready -->|Yes| SendQuote["Send Quote<br/>isDraft: false<br/>status: SENT"]
    SendQuote --> NotifyClient[Notify Client]
    
    NotifyClient --> ClientReview[Client Reviews Quote]
    ClientReview --> ClientAction{Client Action}
    
    ClientAction -->|Accept| Accept["status: ACCEPTED<br/>Lock in price"]
    ClientAction -->|Decline| ClientDecline["status: DECLINED"]
    ClientAction -->|Request Revision| CheckRound{Round 1?}
    
    CheckRound -->|Yes| RequestRevision["status: REVISION_REQUESTED"]
    CheckRound -->|No| MustDecide[Must Accept or Decline]
    MustDecide --> ClientReview
    
    RequestRevision --> ReviseQuote["Create New Quote<br/>round: 2"]
    ReviseQuote --> AddItems
    
    Accept --> CalculateDeposit["Calculate Deposit:<br/>agreedPrice × depositPercent"]
    CalculateDeposit --> EnablePayment[Enable Deposit Payment]
    
    ClientDecline --> NotifyArtisan[Notify Artisan]
    NotifyArtisan --> End([Quote Declined])
    
    EnablePayment --> PaymentFlow[[Payment Flow]]
```

---

## Payment Flow (M-Pesa C2B)

### Deposit Payment

```mermaid
sequenceDiagram
    participant C as Client
    participant UI as Frontend
    participant API as API Server
    participant MP as M-Pesa API
    participant DB as Database

    C->>UI: Click "Pay Deposit"
    UI->>UI: Show payment dialog
    C->>UI: Enter phone number
    UI->>API: POST /api/payments/job/initiate
    
    API->>API: Validate request
    API->>API: Calculate deposit amount
    API->>DB: Create JobPayment (PENDING)
    
    API->>MP: STK Push Request
    MP->>MP: Send push to phone
    MP->>API: Request accepted
    API->>UI: Return checkoutId
    
    UI->>UI: Show "Check your phone"
    
    Note over C,MP: User receives STK push on phone
    
    C->>MP: Enter M-Pesa PIN
    MP->>MP: Process payment
    
    alt Payment Successful
        MP->>API: POST /api/payments/job/callback
        API->>DB: Update JobPayment (COMPLETED)
        API->>DB: Update Job (DEPOSIT_PAID)
        API->>DB: Create ArtisanPayout (80%)
        API->>DB: Create PlatformEarning (20%)
        API->>API: Send notifications
        API->>MP: Acknowledge
    else Payment Failed
        MP->>API: POST /api/payments/job/callback
        API->>DB: Update JobPayment (FAILED)
        API->>MP: Acknowledge
    end
    
    UI->>API: Poll payment status
    API->>UI: Return status
    UI->>C: Show result
```

### Final Payment

```mermaid
sequenceDiagram
    participant C as Client
    participant API as API Server
    participant MP as M-Pesa API
    participant DB as Database

    C->>API: POST /api/payments/job/initiate (FINAL)
    
    API->>API: Calculate final amount
    Note over API: Final = AgreedPrice - DepositPaid
    
    API->>DB: Create JobPayment (PENDING, FINAL)
    API->>MP: STK Push Request
    MP->>C: Send push to phone
    
    C->>MP: Enter PIN
    MP->>API: Callback (success)
    
    API->>DB: Update JobPayment (COMPLETED)
    API->>DB: Update Job (status: PAID)
    API->>DB: Release held amount (20% from deposit)
    API->>DB: Create ArtisanPayout (final - commission)
    API->>DB: Create PlatformEarning (commission)
    
    Note over API: Commission = 5% (promo) or 10% (standard)
    
    API->>API: Trigger payout processing
```

---

## Artisan Payout Flow (M-Pesa B2C)

```mermaid
flowchart TD
    Start([Payment Completed]) --> CreatePayout["Create ArtisanPayout<br/>status: PENDING"]
    
    CreatePayout --> Queue[Add to Payout Queue]
    Queue --> CronJob["Cron Job Runs<br/>(Hourly)"]
    
    CronJob --> FetchPending[Fetch PENDING Payouts]
    FetchPending --> HasPayouts{Any Pending?}
    
    HasPayouts -->|No| Wait[Wait for next run]
    HasPayouts -->|Yes| ProcessBatch[Process Batch]
    
    ProcessBatch --> ForEach[For Each Payout]
    ForEach --> InitB2C["Initiate B2C<br/>status: PROCESSING"]
    
    InitB2C --> B2CRequest[M-Pesa B2C Request]
    B2CRequest --> B2CResponse{Response}
    
    B2CResponse -->|Accepted| WaitCallback[Wait for Callback]
    B2CResponse -->|Error| RetryCheck{Retry Count < 3?}
    
    RetryCheck -->|Yes| ScheduleRetry["Schedule Retry<br/>Exponential backoff"]
    RetryCheck -->|No| MarkFailed["status: FAILED<br/>requiresManualReview: true"]
    
    ScheduleRetry --> Queue
    
    WaitCallback --> Callback{B2C Callback}
    
    Callback -->|Success| Complete["status: COMPLETED<br/>Record receipt number"]
    Callback -->|Timeout| TimeoutHandler[Timeout Handler]
    Callback -->|Failed| RetryCheck
    
    TimeoutHandler --> QueryStatus[Query Transaction Status]
    QueryStatus --> StatusResult{Result}
    StatusResult -->|Success| Complete
    StatusResult -->|Failed| RetryCheck
    StatusResult -->|Unknown| MarkFailed
    
    Complete --> NotifyArtisan[Notify Artisan]
    NotifyArtisan --> End([Payout Complete])
    
    MarkFailed --> AlertAdmin[Alert Admin]
    AlertAdmin --> ManualReview[[Manual Review Required]]
```

### B2C Sequence Diagram

```mermaid
sequenceDiagram
    participant Cron as Cron Job
    participant API as API Server
    participant MP as M-Pesa B2C
    participant DB as Database
    participant Artisan as Artisan Phone

    Cron->>API: Trigger payout processing
    API->>DB: Fetch PENDING payouts
    DB->>API: Return payouts list
    
    loop For each payout
        API->>API: Encrypt phone number
        API->>MP: B2C Payment Request
        MP->>API: Request accepted (ConversationID)
        API->>DB: Update status: PROCESSING
    end
    
    Note over MP,Artisan: M-Pesa processes payment
    
    alt B2C Successful
        MP->>Artisan: Money sent to phone
        MP->>API: POST /api/payments/b2c/result
        API->>DB: Update status: COMPLETED
        API->>DB: Record transaction details
        API->>API: Send notification
    else B2C Failed
        MP->>API: POST /api/payments/b2c/result (failed)
        API->>DB: Increment retryCount
        API->>DB: Schedule next retry
    else B2C Timeout
        MP->>API: POST /api/payments/b2c/timeout
        API->>API: Query transaction status
        API->>DB: Update based on status
    end
```

---

## Review Workflow

```mermaid
flowchart TD
    Start([Job Completed & Paid]) --> CanReview{Has Completed Job?}
    
    CanReview -->|No| NoReview[Cannot Review]
    CanReview -->|Yes| CheckExisting{Already Reviewed?}
    
    CheckExisting -->|Yes| EditReview[Edit Existing Review]
    CheckExisting -->|No| WriteReview[Write New Review]
    
    WriteReview --> FillForm["Fill Review:<br/>- Rating (1-5)<br/>- Comment<br/>- Project Title<br/>- Project Cost"]
    EditReview --> FillForm
    
    FillForm --> Submit[Submit Review]
    Submit --> CreateReview["Create/Update Review<br/>isApproved: false"]
    
    CreateReview --> ModerationQueue[Add to Moderation Queue]
    ModerationQueue --> AdminReview[[Admin Reviews]]
    
    AdminReview --> Decision{Decision}
    Decision -->|Approve| Approve["isApproved: true"]
    Decision -->|Hide| Hide["isHidden: true"]
    Decision -->|Delete| Delete[Delete Review]
    
    Approve --> UpdateRating[Update Artisan Rating]
    UpdateRating --> CalculateAvg["Calculate New Average:<br/>averageRating<br/>totalReviews"]
    
    CalculateAvg --> NotifyArtisan[Notify Artisan]
    NotifyArtisan --> End([Review Published])
    
    Hide --> NotifyClient[Notify Client]
    Delete --> NotifyClient
    NotifyClient --> End
```

---

## Search & Discovery

```mermaid
flowchart TD
    Start([Client Opens Search]) --> LoadFilters[Load Filter Options]
    LoadFilters --> ShowUI[Show Search UI]
    
    ShowUI --> UserAction{User Action}
    
    UserAction -->|Enter Query| TextSearch[Text Search]
    UserAction -->|Apply Filter| FilterSearch[Filter Search]
    UserAction -->|Use Location| GeoSearch[Geolocation Search]
    UserAction -->|View Map| MapView[Map View]
    
    TextSearch --> BuildQuery["Search:<br/>- Name<br/>- Profession<br/>- Bio"]
    FilterSearch --> BuildQuery
    GeoSearch --> BuildQuery
    
    BuildQuery --> APICall["GET /api/search/artisans"]
    APICall --> ProcessResults[Process Results]
    
    ProcessResults --> CalculateDistance{Has Location?}
    CalculateDistance -->|Yes| AddDistance[Calculate Distances]
    CalculateDistance -->|No| SkipDistance[Skip Distance]
    
    AddDistance --> SortResults[Sort Results]
    SkipDistance --> SortResults
    
    SortResults --> ReturnResults[Return Artisans + Facets]
    ReturnResults --> DisplayResults[Display Results]
    
    DisplayResults --> UserSelect{User Selects Artisan?}
    UserSelect -->|Yes| ViewProfile[View Artisan Profile]
    UserSelect -->|Save| SaveArtisan[Save to Favorites]
    UserSelect -->|Message| StartConversation[Start Conversation]
    UserSelect -->|Request Job| RequestJob[[Job Request Flow]]
    
    ViewProfile --> ProfileActions{Profile Actions}
    ProfileActions -->|Save| SaveArtisan
    ProfileActions -->|Message| StartConversation
    ProfileActions -->|Request Job| RequestJob
    ProfileActions -->|Review| CheckCanReview{Has Completed Job?}
    
    CheckCanReview -->|Yes| WriteReview[[Review Flow]]
    CheckCanReview -->|No| NoReview[Show Message: Complete a job first]
    
    MapView --> ShowPins[Show Artisan Pins]
    ShowPins --> ClickPin{Click Pin?}
    ClickPin -->|Yes| ShowPopup[Show Artisan Popup]
    ShowPopup --> ProfileActions
```

---

## Messaging Flow

```mermaid
flowchart TD
    Start([User Initiates Message]) --> CheckConversation{Conversation Exists?}
    
    CheckConversation -->|No| CreateConversation["Create Conversation<br/>status: ACTIVE"]
    CheckConversation -->|Yes| OpenConversation[Open Existing Conversation]
    
    CreateConversation --> OpenConversation
    
    OpenConversation --> LoadMessages[Load Previous Messages]
    LoadMessages --> ShowChat[Display Chat UI]
    
    ShowChat --> UserAction{User Action}
    
    UserAction -->|Type Message| ComposeMessage[Compose Message]
    UserAction -->|Attach File| UploadFile[Upload to Cloudinary]
    UserAction -->|Read Messages| MarkRead[Mark Messages as Read]
    
    ComposeMessage --> SendMessage["POST /api/conversations/[id]/messages"]
    UploadFile --> AttachURL[Get File URL]
    AttachURL --> SendMessage
    
    SendMessage --> CreateMessage["Create Message<br/>status: SENT"]
    CreateMessage --> NotifyRecipient[Send Notification]
    NotifyRecipient --> UpdateLastMessage[Update Conversation.lastMessageAt]
    
    MarkRead --> UpdateStatus["Update Messages:<br/>status: READ<br/>readAt: now()"]
    UpdateStatus --> ClearUnread[Clear Unread Badge]
    
    NotifyRecipient --> RecipientView{Recipient Online?}
    RecipientView -->|Yes| ShowNotification[Show In-App Notification]
    RecipientView -->|No| QueueEmail[Queue Email Notification]
```

---

## Subscription Management

```mermaid
flowchart TD
    Start([Artisan Views Subscription]) --> CheckStatus{Current Status?}
    
    CheckStatus -->|INACTIVE| ShowPlans[Show Available Plans]
    CheckStatus -->|ACTIVE| ShowActive[Show Active Subscription]
    CheckStatus -->|EXPIRED| ShowRenew[Show Renewal Options]
    
    ShowPlans --> SelectPlan{Select Plan}
    SelectPlan -->|Monthly| MonthlyPlan["Monthly: KES X"]
    SelectPlan -->|Annual| AnnualPlan["Annual: KES Y"]
    
    MonthlyPlan --> InitPayment[Initiate M-Pesa Payment]
    AnnualPlan --> InitPayment
    
    InitPayment --> MPesaFlow[[M-Pesa STK Push Flow]]
    MPesaFlow --> PaymentResult{Payment Result}
    
    PaymentResult -->|Success| ActivateSubscription["Create Subscription:<br/>status: ACTIVE<br/>startDate: now<br/>endDate: +1 month/year"]
    PaymentResult -->|Failed| ShowError[Show Error Message]
    
    ActivateSubscription --> NotifyArtisan[Send Confirmation]
    NotifyArtisan --> End([Subscription Active])
    
    ShowActive --> ManageOptions{Options}
    ManageOptions -->|View Details| ShowDetails[Show Plan Details]
    ManageOptions -->|Cancel| CancelSubscription[Cancel Subscription]
    
    ShowRenew --> SelectPlan
    
    subgraph CronJob["Daily Cron Job"]
        CheckExpiry[Check Expiring Subscriptions]
        CheckExpiry --> ExpiryAction{Within 7 Days?}
        ExpiryAction -->|Yes| SendReminder[Send Renewal Reminder]
        ExpiryAction -->|Expired| MarkExpired["status: EXPIRED"]
        MarkExpired --> DisableFeatures[Disable Premium Features]
    end
```

---

## Error Handling Flows

### Payment Error Recovery

```mermaid
flowchart TD
    Start([Payment Error]) --> ErrorType{Error Type}
    
    ErrorType -->|Network Timeout| Retry[Auto Retry with Backoff]
    ErrorType -->|Invalid Phone| ShowError[Show Validation Error]
    ErrorType -->|Insufficient Funds| NotifyUser[Notify User]
    ErrorType -->|M-Pesa Down| QueueRetry[Queue for Later]
    
    Retry --> MaxRetries{Max Retries?}
    MaxRetries -->|No| WaitAndRetry[Wait and Retry]
    MaxRetries -->|Yes| ManualAction[Require Manual Action]
    
    WaitAndRetry --> Start
    
    ShowError --> UserFixes[User Corrects Input]
    UserFixes --> RetryPayment[Retry Payment]
    
    NotifyUser --> UserAddsKKES[User Adds Funds]
    UserAddsKKES --> RetryPayment
    
    QueueRetry --> CronCheck[Cron Checks Queue]
    CronCheck --> ServiceUp{Service Available?}
    ServiceUp -->|Yes| ProcessQueued[Process Queued Payments]
    ServiceUp -->|No| WaitMore[Wait Longer]
    WaitMore --> CronCheck
    
    ManualAction --> AdminReview[[Admin Reviews]]
    AdminReview --> Resolution{Resolution}
    Resolution -->|Retry| RetryPayment
    Resolution -->|Refund| ProcessRefund[Process Refund]
    Resolution -->|Cancel| CancelPayment[Cancel Payment]
```
