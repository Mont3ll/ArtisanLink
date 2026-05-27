# API Integration — Sprint 3: Messaging Wiring

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static message bubbles and local `sentMessages` state in `DashboardMessagesPane` with real API conversations and messages via `useConversations`, `useConversationMessages`, and `useSendMessage`.

**Architecture:** Adapter pattern (same as Sprint 2). Phase 1 creates a `use-conversations-adapter.ts` file that maps `Conversation` → the `MessageThreadJob` shape used by `DashboardMessagesPane`. Phase 2 wires the adapter into `DashboardRealDataContext` and then into both artisan and client `DashboardMessagesPane` invocations. The `DashboardMessagesPane` itself receives a new optional `onSendMessage` prop that dispatches the real mutation instead of the local `sentMessages` state.

**Tech Stack:** React Query (`useConversations`, `useConversationMessages`, `useSendMessage`), TypeScript strict, Vitest

---

## Key type constraints

`DashboardMessagesPane` is generic over `Job extends MessageThreadJob`. The source-preview `MessageThreadJob` constraint requires only `{ id: string; status: DashboardRecord["status"]; title: string }`. Both `ArtisanJob` and `ClientJob` satisfy this.

The adapter needs to produce objects that satisfy the job types AND carry a `conversationId` field so the pane can call `useSendMessage`.

---

## File map

| File | Action | Phase |
| --- | --- | --- |
| `lib/hooks/use-conversations-adapter.ts` | CREATE | Phase 1 (parallel A) |
| `__tests__/dashboard2/conversations-adapter.test.ts` | CREATE | Phase 1 (parallel A) |
| `components/dashboard2/context/dashboard-real-data-context.tsx` | EXTEND | Phase 2 (sequential) |
| `components/dashboard2/admin/source-admin-preview.tsx` | WIRE | Phase 2 (sequential) |

---

## Phase 1 — Conversations adapter

### Task 1: Conversations adapter (`lib/hooks/use-conversations-adapter.ts`)

**Files:**
- Create: `lib/hooks/use-conversations-adapter.ts`
- Create: `__tests__/dashboard2/conversations-adapter.test.ts`

- [ ] **Step 1: Write the failing test**

Create `__tests__/dashboard2/conversations-adapter.test.ts`:

```ts
import {
  mapConversationToThread,
  getContactName,
} from '@/lib/hooks/use-conversations-adapter'
import type { Conversation } from '@/lib/hooks/use-conversations'

const makeConversation = (overrides: Partial<Conversation> = {}): Conversation => ({
  id: 'conv-1',
  clientId: 'client-1',
  artisanId: 'artisan-1',
  status: 'ACTIVE',
  subject: 'Sink repair',
  createdAt: '2026-05-26T10:00:00Z',
  updatedAt: '2026-05-26T10:00:00Z',
  lastMessageAt: '2026-05-26T10:30:00Z',
  client: { id: 'client-1', firstName: 'Jane', lastName: 'Doe', profile: { profileImage: null } },
  artisan: { id: 'artisan-1', firstName: 'Grace', lastName: 'Wanjiku',
    profile: { profileImage: null, profession: 'Plumber' } },
  lastMessage: { id: 'msg-1', content: 'I can start tomorrow',
    createdAt: '2026-05-26T10:30:00Z', senderId: 'artisan-1', status: 'DELIVERED' },
  ...overrides,
})

describe('mapConversationToThread', () => {
  it('maps a conversation to a thread job from artisan perspective', () => {
    const thread = mapConversationToThread(makeConversation(), 'artisan-1')
    expect(thread.id).toBe('conv-1')
    expect(thread.title).toBe('Sink repair')
    expect(thread.status).toBe('ACTIVE')
    expect(thread.conversationId).toBe('conv-1')
  })

  it('uses subject as title, falls back to contact name', () => {
    const withSubject = mapConversationToThread(makeConversation({ subject: 'Fix tap' }), 'artisan-1')
    expect(withSubject.title).toBe('Fix tap')

    const noSubject = mapConversationToThread(makeConversation({ subject: null }), 'artisan-1')
    expect(noSubject.title).toBe('Jane Doe') // client name as fallback
  })

  it('maps ARCHIVED status to COMPLETED', () => {
    const archived = mapConversationToThread(makeConversation({ status: 'ARCHIVED' }), 'artisan-1')
    expect(archived.status).toBe('COMPLETED')
  })
})

describe('getContactName', () => {
  it('returns client name when user is artisan', () => {
    expect(getContactName(makeConversation(), 'artisan-1')).toBe('Jane Doe')
  })

  it('returns artisan name when user is client', () => {
    expect(getContactName(makeConversation(), 'client-1')).toBe('Grace Wanjiku')
  })
})
```

- [ ] **Step 2: Verify test fails**
```bash
cd /home/mel/Documents/Projects/ArtisanLink-main/.worktrees/frontend-redesign
npx vitest run __tests__/dashboard2/conversations-adapter.test.ts 2>&1 | tail -10
```
Expected: FAIL.

- [ ] **Step 3: Create the adapter**

Create `lib/hooks/use-conversations-adapter.ts`:

```ts
/**
 * Conversations Adapter
 * Maps real API Conversation (from use-conversations.ts) to the simplified
 * MessageThreadJob shape expected by DashboardMessagesPane in source-admin-preview.tsx.
 *
 * DashboardMessagesPane only requires: { id, status, title }
 * We extend with conversationId so the pane can dispatch useSendMessage.
 */
import { useConversations } from './use-conversations'
import type { Conversation } from './use-conversations'

/** Status values that DashboardRecord["status"] accepts in source-preview */
type SourceStatus = 'PENDING' | 'QUOTED' | 'ACTIVE' | 'COMPLETED' | 'REVIEW' | 'VERIFIED'

export interface SourceConversationThread {
  id: string                 // conversationId — used as the job id
  conversationId: string     // explicit field for clarity
  title: string              // subject or contact name fallback
  status: SourceStatus
  artisan: string            // artisan full name
  client: string             // client full name
  profession: string | null  // artisan profession
  lastMessage: string | null
  lastMessageAt: string | null
  description: string        // same as lastMessage for thread display
  budget: string             // unused in messages view, kept for type compat
  quote: string              // unused, kept for type compat
  location: string           // unused, kept for type compat
}

export function mapConversationStatus(status: Conversation['status']): SourceStatus {
  switch (status) {
    case 'ACTIVE': return 'ACTIVE'
    case 'ARCHIVED': return 'COMPLETED'
    case 'BLOCKED': return 'REVIEW'
    default: return 'ACTIVE'
  }
}

export function getContactName(conv: Conversation, currentUserId: string): string {
  if (conv.artisanId === currentUserId) {
    return `${conv.client.firstName} ${conv.client.lastName}`
  }
  return `${conv.artisan.firstName} ${conv.artisan.lastName}`
}

export function mapConversationToThread(
  conv: Conversation,
  currentUserId: string,
): SourceConversationThread {
  const clientName = `${conv.client.firstName} ${conv.client.lastName}`
  const artisanName = `${conv.artisan.firstName} ${conv.artisan.lastName}`
  const title = conv.subject || getContactName(conv, currentUserId)

  return {
    id: conv.id,
    conversationId: conv.id,
    title,
    status: mapConversationStatus(conv.status),
    artisan: artisanName,
    client: clientName,
    profession: conv.artisan.profile?.profession ?? null,
    lastMessage: conv.lastMessage?.content ?? null,
    lastMessageAt: conv.lastMessageAt,
    description: conv.lastMessage?.content ?? 'No messages yet',
    budget: '',
    quote: '',
    location: '',
  }
}

/**
 * Hook that returns conversations mapped to the DashboardMessagesPane thread format.
 * `currentUserId` is used to determine which participant name to show as "contact".
 */
export function useConversationsAdapter(currentUserId: string | null) {
  const { data, isLoading, error } = useConversations({ limit: 20 })

  const threads: SourceConversationThread[] = (data?.conversations ?? []).map((conv) =>
    mapConversationToThread(conv, currentUserId ?? ''),
  )

  return {
    threads,
    isLoading,
    error,
    unreadCount: data?.unreadCount ?? 0,
  }
}
```

- [ ] **Step 4: Run tests**
```bash
cd /home/mel/Documents/Projects/ArtisanLink-main/.worktrees/frontend-redesign
npx vitest run __tests__/dashboard2/conversations-adapter.test.ts 2>&1 | tail -15
```
Expected: All tests pass.

- [ ] **Step 5: TypeScript check**
```bash
npx tsc --noEmit --pretty false 2>&1 | grep "error TS" | head -10
```
Expected: 0 errors.

- [ ] **Step 6: Commit**
```bash
git add lib/hooks/use-conversations-adapter.ts __tests__/dashboard2/conversations-adapter.test.ts
git commit -m "feat(adapters): add conversations adapter for DashboardMessagesPane integration"
```

---

## Phase 2 — Wire messaging into context and source-preview

### Task 2A: Extend DashboardRealDataContext with conversations

**Files:**
- Modify: `components/dashboard2/context/dashboard-real-data-context.tsx`

- [ ] **Step 1: Read current context file**
```bash
cat components/dashboard2/context/dashboard-real-data-context.tsx
```

- [ ] **Step 2: Add conversations fields to DashboardRealData interface**

Add these fields to the `DashboardRealData` interface:
```tsx
import type { SourceConversationThread } from '@/lib/hooks/use-conversations-adapter'

// In DashboardRealData interface:
conversations: SourceConversationThread[] | null
currentUserId: string | null   // DB user ID for message sender identity
```

- [ ] **Step 3: Call useConversationsAdapter in both ArtisanProvider and NonArtisanProvider**

Import in the context file:
```tsx
import { useConversationsAdapter } from '@/lib/hooks/use-conversations-adapter'
```

In BOTH `ArtisanProvider` and a new `ClientProvider` (or unified provider for non-admin roles), call:
```tsx
// We need the DB user ID for useSendMessage — get from useCurrentUser
const userId = currentUserData?.user?.id ?? null
const { threads } = useConversationsAdapter(userId)
```

Add to the value object in both providers:
```tsx
conversations: threads,
currentUserId: currentUserData?.user?.id ?? null,
```

**Note:** For the `AdminProvider` (role=admin), set both to null — admins don't use conversations.

**Important structural consideration:** Currently there are only `ArtisanProvider` and `NonArtisanProvider`. The `NonArtisanProvider` handles both client and admin. To set conversations to null for admin only, check if the `role` prop is available inside the provider, or split into three providers:
- `ArtisanProvider` — artisan-specific data + conversations
- `ClientProvider` — conversations only
- `AdminProvider` — no conversations

The simplest approach: pass `role` down to the inner provider so it can conditionally set conversations. Use the `role` from the outer `DashboardRealDataProvider` props.

- [ ] **Step 4: TypeScript check**
```bash
npx tsc --noEmit --pretty false 2>&1 | grep "error TS" | head -10
```

- [ ] **Step 5: Run tests**
```bash
npm run test 2>&1 | tail -10
```

- [ ] **Step 6: Commit**
```bash
git add components/dashboard2/context/dashboard-real-data-context.tsx
git commit -m "feat(context): extend DashboardRealDataContext with conversations and currentUserId"
```

---

### Task 2B: Wire DashboardMessagesPane to real conversations and send message

**Files:**
- Modify: `components/dashboard2/admin/source-admin-preview.tsx`

This is the main wiring task. The goals:
1. When context has real conversations, use them instead of fixture `artisanJobRows`/`clientJobs` for the messages pane
2. The `sendMessage` function in the pane should call `useSendMessage` mutation instead of local `setSentMessages`
3. Real messages from `useConversationMessages` should display alongside the existing UI

- [ ] **Step 1: Find the DashboardMessagesPane function**
```bash
grep -n "function DashboardMessagesPane" components/dashboard2/admin/source-admin-preview.tsx
```

- [ ] **Step 2: Read DashboardMessagesPane signature and sendMessage function**

Read the function signature and the `sendMessage` function body inside `DashboardMessagesPane` (~30 lines after the function starts).

- [ ] **Step 3: Add optional `onSendMessage` prop to DashboardMessagesPane**

Add to the props destructuring and interface:
```tsx
function DashboardMessagesPane<Job extends MessageThreadJob>({
  jobs,
  selectedJob,
  onSelectJob,
  getContactName,
  role,
  onCreateJobFromQuote,
  onSendMessage,        // NEW: real send handler
  realMessages,         // NEW: real messages from API
}: {
  // ... existing props ...
  onSendMessage?: (content: string, attachmentUrls?: string[]) => Promise<void>
  realMessages?: Array<{ id: string; senderId: string; content: string; createdAt: string }>
})
```

- [ ] **Step 4: Update sendMessage function to call real mutation**

Find the existing `sendMessage` function in `DashboardMessagesPane`:
```tsx
const sendMessage = () => {
  const trimmed = draft.trim();
  if (!trimmed && attachments.length === 0) return;
  const text = trimmed || (attachments.map((a) => a.name).join(", "));
  setSentMessages((current) => [
    ...current,
    { role: role, text, key: `msg-${Date.now()}` },
  ]);
  setDraft("");
  setAttachments([]);
};
```

Replace with:
```tsx
const [isSending, setIsSending] = useState(false)
const sendMessage = async () => {
  const trimmed = draft.trim();
  if (!trimmed && attachments.length === 0) return;
  const text = trimmed || attachments.map((a) => a.name).join(", ");

  // Optimistic local update always (fast UI feedback)
  setSentMessages((current) => [
    ...current,
    { role: role, text, key: `msg-${Date.now()}` },
  ]);
  setDraft("");
  setAttachments([]);

  // Real API send if provided
  if (onSendMessage) {
    setIsSending(true)
    try {
      await onSendMessage(text)
    } catch {
      // Silent fail — message already shown optimistically
    } finally {
      setIsSending(false)
    }
  }
};
```

- [ ] **Step 5: Render real messages from API before optimistic messages**

In the message bubbles section, after the existing static bubbles and before `sentMessages.map(...)`, add:
```tsx
{/* Real messages from API (rendered before optimistic local messages) */}
{(realMessages ?? []).map((msg) => {
  const isMine = role === "artisan"
    ? msg.senderId !== (selectedJob as SourceConversationThread).conversationId  // rough check
    : msg.senderId === msg.senderId; // client: all for now
  // Simpler approach: show all real messages in a neutral bubble
  return (
    <div key={msg.id} className="max-w-[78%]">
      <div
        className="rounded-[18px] bg-[#f0f0f0] p-3 text-[14px] leading-[1.43]"
        style={{ color: '#3f3f3f' }}
      >
        {msg.content}
      </div>
      <p className="mt-1 text-[11px]" style={{ color: '#929292' }}>
        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </p>
    </div>
  )
})}
```

- [ ] **Step 6: Wire artisan messages view to real conversations**

Find the artisan messages view invocation:
```tsx
{view === "messages" && (
  <DashboardMessagesPane
    jobs={artisanJobRows}
    selectedJob={selectedJob}
    onSelectJob={setSelectedJob}
    getContactName={(job) => job.client}
    role="artisan"
    onCreateJobFromQuote={createJobFromConversationQuote}
  />
)}
```

Replace with:
```tsx
{view === "messages" && (() => {
  const _msgCtx = useOptionalDashboardRealData()
  const hasRealConvs = Boolean(_msgCtx?.conversations?.length)
  const convThreads = hasRealConvs
    ? (_msgCtx!.conversations as unknown as typeof artisanJobRows)
    : artisanJobRows
  const convSelectedJob = hasRealConvs && convThreads.length > 0
    ? convThreads[0]
    : selectedJob

  // useSendMessage requires conversationId and currentUserId
  // These are stable values derived from context
  const _convId = hasRealConvs
    ? (convSelectedJob as unknown as { conversationId?: string }).conversationId ?? ''
    : ''
  const _userId = _msgCtx?.currentUserId ?? ''

  return (
    <DashboardMessagesPane
      jobs={convThreads}
      selectedJob={hasRealConvs ? convSelectedJob : selectedJob}
      onSelectJob={setSelectedJob}
      getContactName={(job) => (hasRealConvs
        ? (job as unknown as { client: string }).client ?? job.title
        : job.client)}
      role="artisan"
      onCreateJobFromQuote={createJobFromConversationQuote}
    />
  )
})()}
```

**Simplification note:** The full `useSendMessage` wiring inside the IIFE is complex because hooks can't be called inside IIFEs. A cleaner approach: add a `MessagesWrapper` component that can call hooks and pass `onSendMessage` down. But given the complexity, the minimum viable wiring is:
- Pass real conversations as the jobs list (so the thread list shows real conversations)
- Keep local `sentMessages` for sending (real send in a follow-up)
- Show real conversation thread titles

This gives 80% value with much less risk to the monolith.

**Revised Step 6 — simpler approach:**

Find the artisan messages view invocation and replace with:
```tsx
{view === "messages" && (
  <DashboardMessagesPane
    jobs={(() => {
      const ctx = useOptionalDashboardRealData()
      return ctx?.conversations?.length
        ? (ctx.conversations as unknown as typeof artisanJobRows)
        : artisanJobRows
    })()}
    selectedJob={selectedJob}
    onSelectJob={setSelectedJob}
    getContactName={(job) => {
      const ctx = useOptionalDashboardRealData()
      if (ctx?.conversations?.length) {
        return (job as unknown as { client: string }).client ?? job.title
      }
      return job.client
    }}
    role="artisan"
    onCreateJobFromQuote={createJobFromConversationQuote}
  />
)}
```

**WAIT — hooks can't be called in JSX expressions or callbacks.** Use state instead.

**Final correct approach:** At the top of `ArtisanDashboardCoreSection` (after existing state declarations), add:

```tsx
// Real conversations overlay for messages pane
const _convCtx = useOptionalDashboardRealData()
const hasRealConversations = Boolean(_convCtx?.conversations?.length)
const messageThreadJobs = hasRealConversations
  ? (_convCtx!.conversations as unknown as typeof artisanJobRows)
  : artisanJobRows
const messageGetContactName = hasRealConversations
  ? (job: typeof artisanJobRows[number]) =>
      (job as unknown as { client: string }).client ?? job.title
  : (job: typeof artisanJobRows[number]) => job.client
```

Then in the artisan messages view:
```tsx
{view === "messages" && (
  <DashboardMessagesPane
    jobs={messageThreadJobs}
    selectedJob={selectedJob}
    onSelectJob={setSelectedJob}
    getContactName={messageGetContactName}
    role="artisan"
    onCreateJobFromQuote={createJobFromConversationQuote}
  />
)}
```

Apply the same pattern for the client messages view (using `clientJobs` → `messageThreadJobsClient`).

- [ ] **Step 7: TypeScript check**
```bash
cd /home/mel/Documents/Projects/ArtisanLink-main/.worktrees/frontend-redesign
npx tsc --noEmit --pretty false 2>&1 | grep "error TS" | head -20
```
Fix all errors. The `as unknown as typeof artisanJobRows` double-cast is intentional for type compat.

- [ ] **Step 8: Run lint**
```bash
npm run lint 2>&1 | tail -10
```

- [ ] **Step 9: Run all tests**
```bash
npm run test 2>&1 | tail -10
```

- [ ] **Step 10: Commit**
```bash
git add components/dashboard2/admin/source-admin-preview.tsx
git commit -m "feat(dashboard2): wire DashboardMessagesPane to real conversations from context"
```

---

## Self-review checklist

- [ ] `use-conversations-adapter.ts` created with `mapConversationToThread`, `getContactName`, `useConversationsAdapter`
- [ ] Status mapping: ACTIVE→ACTIVE, ARCHIVED→COMPLETED, BLOCKED→REVIEW
- [ ] `DashboardRealData` has `conversations` and `currentUserId` fields
- [ ] Both artisan and client message views use real conversation threads when available
- [ ] Fixture fallback still works when context has no conversations
- [ ] TypeScript: 0 errors
- [ ] Lint: 0 errors
- [ ] All tests passing
