# Gap Fix Plan — Bring Site to Testing Phase

**Goal:** Fix C1 (messages API), C2 (admin users real data), C3 (admin moderation real data), H4 (portfolio image upload), and wire DashboardMessagesPane.sendMessage to real API.

## Success criteria per task

| Task | Done when |
| --- | --- |
| C1 — sendMessage | Sending a message in dashboard persists to DB; reload shows message |
| C2 — Admin users | Admin users view shows real DB users with live stats |
| C3 — Admin moderation | Admin moderation view shows real pending reviews/flags |
| H4 — Portfolio upload | Artisan can pick an image file; it uploads to Cloudinary and appears in portfolio |
| All | 0 TypeScript errors, all tests passing |

## File map

| File | Task |
| --- | --- |
| `components/dashboard2/admin/source-admin-preview.tsx` | C1, C2, C3, H4 |
| `components/dashboard2/context/dashboard-real-data-context.tsx` | C2 (add users + moderation to context), C3 |
| `lib/hooks/use-admin-data-adapter.ts` | C2 (extend with users/moderation adapters) |

## Implementation notes

### C1 — sendMessage
The `DashboardMessagesPane.sendMessage` does local state update only. The `_verifCtx.conversations` array has real `conversationId` on each thread. When sending, get the `conversationId` from `selectedJob` (which is typed as a SourceConversationThread with `conversationId: string`) and call `POST /api/conversations/{id}/messages`.

### C2 — Admin users real data
`useUsers()` returns `User[]` from `/api/admin/users/all`.
`useUserStats()` returns `UserStats` with `totalUsers, totalClients, totalArtisans, activeUsers`.

Map `User` → source `userRow` shape:
```ts
interface SourceUserRow {
  id: string; name: string; role: string; status: string; meta: string; email: string; risk: string;
}
mapUser(user: User) = {
  id: user.id, name: `${user.firstName} ${user.lastName}`,
  role: user.role === 'ARTISAN' ? 'Artisan' : 'Client',
  status: user.status,  // ACTIVE | PENDING | SUSPENDED | BANNED
  meta: user.profile?.profession ? `${user.profile.profession} · ${user.profile.city || 'Kenya'}` : user.profile?.city || 'Kenya',
  email: user.email,
  risk: user.status === 'SUSPENDED' || user.status === 'BANNED' ? 'High' : 'Low',
}
```

### C3 — Admin moderation real data
`useAdminModeration()` returns `{ items: ModerationItem[], stats: ModerationStats }`.

Map `ModerationItem` → source `moderationRow` shape:
```ts
interface SourceModerationRow {
  id: string; title: string; body: string; status: string; severity: string; target: string; source: string; owner: string;
}
mapModeration(item: ModerationItem) = {
  id: item.id,
  title: item.type === 'review' ? 'Review flag' : 'User report',
  body: item.content.comment || item.content.description || 'Reported item',
  status: item.status.toUpperCase() === 'PENDING' ? 'PENDING' : 'REVIEW',
  severity: 'Medium',
  target: item.type === 'review' ? 'Review' : 'User account',
  source: 'Admin report',
  owner: 'Trust queue',
}
```

### H4 — Portfolio image upload
Add `<input type="file">` to the "Media update" placeholder in `PortfolioProjectModal` edit mode. On file select: read as DataURL → POST to `/api/upload/image` with `folder: 'portfolio'` → get `url` → update the draft project's `imageUrl` field → show preview in modal.

Need to add `imageUrl` field to `ArtisanPortfolioProject` type and thread it through `handleSave`.
