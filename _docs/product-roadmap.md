# CB Health Tracker: 0-to-1 Product Roadmap

Quest-based implementation checklist from ground zero to first user testing.

**Tech Stack:** Next.js 14 + Supabase + TypeScript + Tailwind CSS
**Target:** MVP with medication tracking, daily check-in, offline-first functionality
**Philosophy:** Form before strength. Build foundation, then features.

---

## Quest 1: Foundation Architecture
*Everything builds on this. Cannot skip.*

### 1.1 Project Scaffold & Environment
- [ ] Initialize Next.js 14 App Router with TypeScript
  - `npx create-next-app@latest cbhealthtracker --typescript --tailwind --app`
  - Configure absolute imports (`@/` prefix)
- [ ] Set up Supabase project
  - Create project at supabase.com
  - Copy project URL and anon key to `.env.local`
  - Install `@supabase/supabase-js` and `@supabase/ssr`
- [ ] Configure environment variables
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (server-side only)
- [ ] Install core dependencies
  ```bash
  npm install @supabase/supabase-js @supabase/ssr
  npm install dexie dexie-react-hooks  # IndexedDB wrapper
  npm install date-fns  # Date utilities
  npm install next-pwa  # PWA support
  ```
- [ ] Set up Git repository
  - Initialize repo: `git init`
  - Create `.gitignore` (exclude `.env.local`, `node_modules`, `.next`)
  - First commit: "Initial project scaffold"

### 1.2 Database Schema Design
Create Supabase tables via SQL Editor:

**Users Table (extends Supabase auth.users):**
```sql
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  birth_date date,
  phone_number text,
  role text not null check (role in ('elder', 'caregiver')),
  timezone text default 'America/New_York',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policy: Users can read/update their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);
```

**Medications Table:**
```sql
create table public.medications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  dosage text,
  schedule_times time[], -- Array of times: ['08:00', '14:00', '20:00']
  schedule_days int[], -- Days of week: [0,1,2,3,4,5,6] (Sunday=0)
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.medications enable row level security;

-- Elder can CRUD their own medications
create policy "Elders manage own medications"
  on public.medications for all
  using (auth.uid() = user_id);

-- Caregivers can view connected elder's medications (handled via function)
```

**Medication Logs Table:**
```sql
create table public.medication_logs (
  id uuid default gen_random_uuid() primary key,
  medication_id uuid references public.medications(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  scheduled_time timestamp with time zone not null,
  taken_at timestamp with time zone,
  status text not null check (status in ('taken', 'missed', 'skipped')),
  note text,
  logged_offline boolean default false,
  synced_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

alter table public.medication_logs enable row level security;

create policy "Users view own medication logs"
  on public.medication_logs for select
  using (auth.uid() = user_id);

create policy "Users create own medication logs"
  on public.medication_logs for insert
  with check (auth.uid() = user_id);
```

**Check-Ins Table:**
```sql
create table public.check_ins (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  checked_in_at timestamp with time zone not null,
  logged_offline boolean default false,
  synced_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

alter table public.check_ins enable row level security;

create policy "Users manage own check-ins"
  on public.check_ins for all
  using (auth.uid() = user_id);
```

**Family Connections Table:**
```sql
create table public.family_connections (
  id uuid default gen_random_uuid() primary key,
  elder_id uuid references public.profiles(id) on delete cascade not null,
  caregiver_id uuid references public.profiles(id) on delete cascade not null,
  relationship text, -- 'daughter', 'son', 'friend', etc.
  status text not null check (status in ('pending', 'accepted', 'declined')) default 'pending',
  permissions jsonb default '{"medications": true, "check_ins": true}',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(elder_id, caregiver_id)
);

alter table public.family_connections enable row level security;

-- Elder can manage connections where they are the elder
create policy "Elders manage their connections"
  on public.family_connections for all
  using (auth.uid() = elder_id);

-- Caregivers can view connections where they are the caregiver
create policy "Caregivers view their connections"
  on public.family_connections for select
  using (auth.uid() = caregiver_id);
```

**Connection Invites Table:**
```sql
create table public.connection_invites (
  id uuid default gen_random_uuid() primary key,
  caregiver_id uuid references public.profiles(id) on delete cascade not null,
  elder_email text,
  elder_phone text,
  elder_name text not null,
  relationship text,
  invite_code text unique not null,
  expires_at timestamp with time zone not null,
  created_at timestamp with time zone default now()
);

alter table public.connection_invites enable row level security;

create policy "Caregivers manage own invites"
  on public.connection_invites for all
  using (auth.uid() = caregiver_id);
```

- [ ] Run database migrations in Supabase SQL Editor
- [ ] Verify tables created via Supabase Dashboard → Table Editor
- [ ] Test RLS policies (attempt to read other user's data, should fail)

### 1.3 Offline-First Architecture Setup
- [ ] Configure PWA with next-pwa
  ```javascript
  // next.config.js
  const withPWA = require('next-pwa')({
    dest: 'public',
    disable: process.env.NODE_ENV === 'development',
    register: true,
    skipWaiting: true,
  });
  module.exports = withPWA({...});
  ```
- [ ] Create PWA manifest (`public/manifest.json`)
  ```json
  {
    "name": "CB Health Tracker - Connected Care",
    "short_name": "CB Health",
    "description": "Medication reminders and daily check-ins",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#ffffff",
    "theme_color": "#4F46E5",
    "icons": [...]
  }
  ```
- [ ] Set up IndexedDB with Dexie.js
  - Create `lib/db.ts` with Dexie schema
  - Tables: `medications`, `medication_logs`, `check_ins`, `sync_queue`
- [ ] Build sync queue system
  - `lib/sync-engine.ts` with functions:
    - `queueAction(action, data)` - Add to sync queue
    - `processSyncQueue()` - Upload queued actions to Supabase
    - `syncDownstream()` - Fetch server updates to local DB
- [ ] Create network status hook
  - `hooks/useNetworkStatus.ts` - Detects online/offline state
  - Returns `isOnline`, `wasOffline` (to trigger sync on reconnect)

### 1.4 Authentication Foundation
- [ ] Create Supabase auth utilities (`lib/supabase/client.ts`, `lib/supabase/server.ts`)
- [ ] Build auth flow pages:
  - `/login` - Email/phone login with OTP
  - `/signup` - New user registration
  - `/auth/callback` - Handle OAuth redirects
- [ ] Implement auth context (`contexts/AuthContext.tsx`)
  - Provides `user`, `profile`, `signIn()`, `signOut()`, `updateProfile()`
- [ ] Create protected route wrapper (`components/ProtectedRoute.tsx`)
- [ ] Build role selection screen (`/onboarding/role`)
  - "I'm using this for myself" → Elder
  - "I'm caring for someone" → Caregiver

---

## Quest 2: Elder Onboarding Flow
*First user experience. Must be flawless.*

### 2.1 Onboarding Screens
- [ ] Welcome screen (`/onboarding/welcome`)
  - "Welcome to CB Health Tracker, [Name]!"
  - "Let's add your first medication" CTA
  - "Skip for now" option (goes to home)
- [ ] Add medication form (`/onboarding/add-medication`)
  - Medication name (text input, autocomplete with common meds)
  - Time picker (default: 8:00 AM)
  - Frequency selector (Daily, Specific days)
  - Save → Success message
- [ ] Notification permission request (`/onboarding/notifications`)
  - Explain why: "We'll remind you when it's time"
  - Request browser notification permission
  - Fallback message if denied: "No problem, just open CB Health Tracker when it's time"
- [ ] Home screen first view (`/dashboard`)
  - Prominent "I'm OK Today" button
  - Medication list card (shows added med)
  - "Invite family" card (dismissible)

### 2.2 Onboarding State Management
- [ ] Create onboarding progress tracker
  - Store in localStorage: `onboarding_step`, `completed_at`
  - Resume at last step if user closes app
- [ ] Build onboarding completion logic
  - Mark complete when: Role selected + First med added OR Skipped
  - Redirect from `/onboarding/*` if already complete

---

## Quest 3: Medication Management Core
*Highest value feature. Perfect this first.*

### 3.1 Medication CRUD Interface
- [ ] Medication list view (`/medications`)
  - Large card design (elder-optimized spacing)
  - Show: Med name, next dose time, "Edit" button
  - Sort by: Next scheduled time
- [ ] Add medication page (`/medications/new`)
  - Form fields: Name, dosage (optional), time(s), days
  - Support multiple times per day (breakfast, lunch, dinner)
  - Save → Sync to Supabase + IndexedDB
- [ ] Edit medication page (`/medications/[id]/edit`)
  - Pre-fill form with existing data
  - "Delete medication" button (confirmation modal)
- [ ] Delete medication flow
  - Confirmation modal: "Are you sure? Past logs will be kept."
  - Soft delete (mark `is_active = false`)
  - Cancel future reminders

### 3.2 Medication Scheduler
- [ ] Build scheduling logic (`lib/medication-scheduler.ts`)
  - Function: `getNextDose(medication)` → Returns next scheduled time
  - Function: `getTodaysDoses(medications)` → Returns all doses for today
  - Handle recurring patterns (daily, specific days)
- [ ] Create medication reminder service
  - Use service worker + Notification API
  - Schedule local notifications for each dose
  - Fire notification at scheduled time (even offline)
- [ ] Notification content
  - Title: "Time for [Med Name]"
  - Body: "[Dosage] at [Time]"
  - Actions: "I took it", "Snooze 15 min"

### 3.3 Medication Confirmation Flow
- [ ] Home screen medication cards
  - Show upcoming doses (next 4 hours)
  - Status indicators: Pending, Taken ✓, Missed ⚠
  - Large "I took it" button per card
- [ ] Confirmation interaction
  - Tap "I took it" → Haptic feedback + animation
  - Log to `medication_logs` (timestamp, status: 'taken')
  - Update card UI to "Taken ✓ at [time]"
  - Sync to Supabase (or queue if offline)
- [ ] Snooze functionality
  - Tap "Snooze 15 min" → Reschedule notification
  - Max 3 snoozes per dose (prevent infinite loop)
  - Track snooze count in local state
- [ ] Skip functionality
  - Tap "Skip today" → Show optional note field
  - Log as 'skipped' with reason
  - Don't send missed alert to caregiver

### 3.4 Missed Medication Detection
- [ ] Grace period timer (30 minutes after scheduled time)
  - Check every 5 minutes if dose confirmed
  - If not confirmed after grace period → Mark as 'missed'
- [ ] Missed dose logging
  - Create `medication_logs` entry with status: 'missed'
  - Trigger caregiver alert (if family connected)
  - Show escalation notification to elder: "Did you take [Med]?"
- [ ] Late confirmation window (2 hours)
  - Elder can still mark "I took it" up to 2 hours late
  - Log with actual timestamp (not scheduled time)
  - After 2 hours: Cannot backdate (data integrity)

---

## Quest 4: Daily Check-In System
*Simple feature, high emotional value.*

### 4.1 Check-In Button (Elder Side)
- [ ] Home screen prominent button
  - Design: Large, friendly, inviting
  - Text: "I'm OK Today" (if not checked in)
  - Text: "Checked in ✓ [time]" (if already done)
- [ ] Check-in interaction
  - Tap button → Confetti animation + haptic feedback
  - Encouraging message: "Have a great day!"
  - Log to `check_ins` table (timestamp)
  - Notify connected caregivers (real-time if online)
- [ ] Check-in state logic
  - Resets at midnight (local timezone)
  - Allow multiple check-ins per day (track all timestamps)
  - Show most recent check-in time
- [ ] Historical view
  - Weekly calendar grid (green dots for checked-in days)
  - Streak counter: "7 days in a row!"

### 4.2 Check-In Dashboard (Caregiver Side)
- [ ] Caregiver home screen status card
  - Elder profile card with check-in status
  - Green: "Checked in ✓ at 9:23 AM"
  - Neutral: "No check-in yet today" (not alarming)
- [ ] Check-in alert system
  - Caregiver sets alert time in settings: "Notify me if no check-in by 11:00 AM"
  - Cron job or edge function checks at alert time
  - Send push/SMS/email if elder hasn't checked in
- [ ] Alert notification content
  - Title: "[Elder Name] hasn't checked in today"
  - Actions: "Call", "Send reminder", "Mark as contacted"
- [ ] Quick actions from alert
  - "Call" → Opens dialer with elder's phone (if shared)
  - "Send reminder" → Push notification to elder app
  - "Mark as contacted" → Dismisses alert, logs note

---

## Quest 5: Family Connection System
*Bridges elder and caregiver experiences.*

### 5.1 Caregiver: Send Invitation
- [ ] Caregiver onboarding flow (`/onboarding/connect`)
  - "Who are you caring for?"
  - Form: Name, relationship (daughter, son, friend)
  - Generate invite link
- [ ] Invite generation logic
  - Create record in `connection_invites` table
  - Generate unique `invite_code` (8-char alphanumeric)
  - Set expiration: 7 days from creation
  - Build invite URL: `https://cbhealthtracker.app/invite/[code]`
- [ ] Send invite options
  - Copy link → Clipboard
  - Send SMS → Twilio integration (if phone provided)
  - Send email → Resend/SendGrid integration (if email provided)
- [ ] Pending state UI
  - Show "Waiting for [Elder Name] to accept"
  - Display invite link + resend button
  - Show demo tour while waiting

### 5.2 Elder: Accept Invitation
- [ ] Invite landing page (`/invite/[code]`)
  - Look up invite by code
  - If expired: Show error, prompt caregiver to resend
  - If valid: Show approval screen
- [ ] Approval screen
  - "[Caregiver Name] wants to connect as your [relationship]"
  - List permissions: "They will see:"
    - Medication reminders
    - Daily check-ins
  - "You control privacy settings anytime"
- [ ] Accept flow
  - Tap "Accept" → Create `family_connections` record (status: 'accepted')
  - Notify caregiver (push + email)
  - Redirect elder to dashboard
- [ ] Decline flow
  - Tap "Decline" → Update invite status
  - Notify caregiver (gentle message)
  - Don't create connection record

### 5.3 Privacy Controls
- [ ] Elder settings page (`/settings/privacy`)
  - List connected caregivers
  - Tap caregiver → Granular permission toggles
    - Share medication reminders [ON/OFF]
    - Share daily check-ins [ON/OFF]
    - Share phone number [ON/OFF]
- [ ] Permission changes
  - Update `family_connections.permissions` (JSONB)
  - Take effect immediately
  - Caregiver dashboard respects permissions (filter hidden data)
- [ ] Disconnect caregiver
  - "Disconnect [Caregiver]" button (bottom of privacy page)
  - Confirmation modal: "They will no longer see your updates"
  - Delete `family_connections` record
  - Notify caregiver

### 5.4 Multi-Elder Support (Caregiver)
- [ ] Elder profile switcher
  - Header dropdown: List of connected elders
  - Tap to switch context
  - Dashboard updates to show selected elder's data
- [ ] Add another elder
  - "Connect another loved one" button in settings
  - Repeat invite flow

---

## Quest 6: Caregiver Dashboard
*Central command for peace of mind.*

### 6.1 Activity Feed
- [ ] Real-time activity stream (`/dashboard`)
  - Reverse chronological feed (most recent first)
  - Event types:
    - Medication taken ✓
    - Medication missed ⚠
    - Daily check-in ✓
    - Missed check-in ⚠
  - Show timestamp + elder name (if monitoring multiple)
- [ ] Real-time updates with Supabase Realtime
  - Subscribe to `medication_logs` and `check_ins` tables
  - Filter by connected elder IDs
  - Auto-update feed when new events arrive
- [ ] Empty state
  - "Waiting for [Elder Name]'s first update"
  - Show example data with "Preview mode" label

### 6.2 Medication Adherence View
- [ ] Weekly adherence summary
  - Calendar grid (last 7 days)
  - Color coding per day:
    - Green: All meds taken
    - Yellow: Some missed
    - Red: Multiple missed
- [ ] Medication-specific adherence
  - List view: Each medication with % adherence (last 30 days)
  - Tap medication → Detailed history (every dose, taken/missed)
- [ ] Export adherence report
  - "Download report" button
  - Generate PDF: Weekly summary for doctor visits
  - Include: Med list, adherence %, notes

### 6.3 Alert Configuration
- [ ] Settings page (`/settings/alerts`)
  - Toggle per alert type:
    - Missed medications [ON/OFF]
    - Missed check-ins [ON/OFF]
    - Late medications (snoozed 3+ times) [ON/OFF]
  - Check-in alert time picker: "Notify me if no check-in by [11:00 AM]"
  - Delivery method: Push, SMS, Email (checkboxes, allow multiple)
- [ ] Quiet hours
  - "Don't send alerts between [10:00 PM] and [7:00 AM]"
  - Queues alerts, sends when quiet hours end
- [ ] Digest mode
  - Toggle: "Send daily digest instead of immediate alerts"
  - Email sent at 6:00 PM with day's summary

---

## Quest 7: Offline-First Implementation
*Differentiator. Must work flawlessly.*

### 7.1 Service Worker Setup
- [ ] Configure next-pwa service worker strategies
  - **App shell:** Cache-first (HTML, JS, CSS)
  - **API calls:** Network-first with cache fallback
  - **Images/assets:** Cache-first with stale-while-revalidate
- [ ] Cache medication schedules locally
  - On login: Download user's medications to IndexedDB
  - Update cache when medications added/edited
  - Service worker reads from cache for reminders
- [ ] Local notification scheduling
  - Service worker alarm API (if supported) OR
  - Fallback: Check every minute if any dose is due
  - Fire notification from service worker (works offline)

### 7.2 Sync Queue System
- [ ] Queue all write operations when offline
  - Wrap Supabase calls in sync queue helper
  - `syncQueue.add('medication_log', {action: 'insert', data: {...}})`
  - Store queue in IndexedDB `sync_queue` table
- [ ] Background Sync API integration
  - Register sync event when action queued: `registration.sync.register('sync-data')`
  - Service worker listens for 'sync-data' event
  - On event: Process sync queue
- [ ] Sync queue processor
  - Iterate queue in chronological order
  - For each action:
    - Attempt API call (POST/PUT/DELETE to Supabase)
    - If success: Remove from queue, mark `synced_at`
    - If fail: Retry with exponential backoff (1s, 2s, 4s, 8s)
  - Show sync progress indicator in UI

### 7.3 Conflict Resolution
- [ ] Detect conflicts during sync
  - Server record modified since local cache timestamp
  - Example: Caregiver marked "missed" while elder offline marked "taken"
- [ ] Conflict resolution UI
  - Modal: "We found a conflict"
  - Show both versions side-by-side
  - "Which is correct?" → User chooses
  - Winning record synced to server
- [ ] Auto-resolution rules
  - Elder's actions override caregiver's manual entries
  - Most recent timestamp wins for profile updates

### 7.4 Offline UX Indicators
- [ ] Network status banner
  - Top banner (dismissible): "Offline - changes will sync when connected"
  - Subtle (not alarming)
  - Icon: Cloud with slash
- [ ] Per-action sync status
  - Small indicator on cards: "Syncing..." or "Synced ✓"
  - Show last sync time: "Last updated 5 min ago"
- [ ] Manual sync button
  - Settings → "Sync now"
  - Force trigger sync queue processing
  - Show progress: "Syncing 3 updates..."

---

## Quest 8: Elder-Optimized UX Polish
*Adoption depends on this. Test with real seniors.*

### 8.1 Accessibility Compliance
- [ ] Touch target sizing
  - Minimum 60px × 60px for all tappable elements
  - 16px spacing between touch targets
  - Audit with Chrome DevTools Accessibility panel
- [ ] Color contrast audit
  - Use WCAG AAA checker (7:1 ratio)
  - Test with high contrast mode enabled
  - Avoid red/green only (colorblind-friendly)
- [ ] Font sizing
  - Base: 18px (larger than typical 16px)
  - Support dynamic type (respects system text size settings)
  - Test with iOS Accessibility → Larger Text (max size)
- [ ] Screen reader support
  - Semantic HTML (use `<button>`, `<nav>`, `<main>`)
  - ARIA labels for icon-only buttons
  - Test with VoiceOver (iOS) and TalkBack (Android)

### 8.2 Simplified Navigation
- [ ] Bottom navigation (mobile)
  - Max 4 tabs: Home, Medications, Check-In, Settings
  - Large icons + labels
  - Active state clearly visible
- [ ] Page hierarchy limit
  - Max 2 levels: Home → Detail (no deeper nesting)
  - Prominent back button (top-left, large)
- [ ] Onboarding navigation
  - Linear flow (no branching)
  - Progress indicator: "Step 2 of 4"
  - Can't skip forward, can go back

### 8.3 Error Handling & Messaging
- [ ] Plain language errors
  - ❌ "Invalid input"
  - ✅ "Please enter your medication name"
- [ ] Never blame user
  - ❌ "You entered the wrong password"
  - ✅ "Let's try that again"
- [ ] Positive reinforcement
  - Success messages: "Great job!", "You're all set!"
  - Celebrate streaks: "7 days in a row! 🎉"
- [ ] Undo for destructive actions
  - Delete medication → 5-second undo toast
  - Skip medication → "Undo" button (before grace period)

### 8.4 User Testing with Seniors
- [ ] Recruit 3-5 seniors (65+ years old)
- [ ] Usability test tasks:
  1. Sign up and add first medication
  2. Mark medication as taken
  3. Use daily check-in button
  4. Find medication history
- [ ] Observe without helping (note struggles)
- [ ] Post-test survey:
  - "Was anything confusing?" (open-ended)
  - "Would you use this daily?" (yes/no + why)
- [ ] Iterate based on feedback (repeat testing)

---

## Quest 9: Testing & Quality Assurance
*Ship with confidence. No blockers on launch day.*

### 9.1 Unit Tests (Critical Paths Only)
- [ ] Sync engine tests (`lib/sync-engine.test.ts`)
  - Queue actions when offline
  - Process queue in order when online
  - Handle API failures (retry logic)
- [ ] Medication scheduler tests (`lib/medication-scheduler.test.ts`)
  - Calculate next dose correctly
  - Handle multiple times per day
  - Respect timezone changes
- [ ] Date utilities tests
  - Midnight reset logic (check-in)
  - Grace period calculations
  - Timezone conversions

### 9.2 Integration Tests (Key Flows)
- [ ] Authentication flow test
  - Sign up → Verify OTP → Create profile
  - Login → Verify OTP → Redirect to dashboard
- [ ] Medication flow test
  - Add medication → Schedule notification → Confirm taken → Verify log
- [ ] Family connection test
  - Caregiver sends invite → Elder accepts → Verify connection record
- [ ] Offline sync test
  - Go offline → Confirm medication → Go online → Verify synced to server

### 9.3 E2E Tests (Playwright)
- [ ] Elder onboarding flow (end-to-end)
  - Start at `/signup` → Complete onboarding → Arrive at dashboard
- [ ] Medication reminder flow
  - Add med → Wait for scheduled time → Notification appears → Confirm → Check database
- [ ] Caregiver dashboard flow
  - Login as caregiver → View elder's activity feed → Verify real-time update

### 9.4 Cross-Browser & Device Testing
- [ ] Desktop browsers
  - Chrome (latest)
  - Safari (latest)
  - Firefox (latest)
  - Edge (latest)
- [ ] Mobile browsers
  - iOS Safari (iPhone 12+, iOS 15+)
  - Android Chrome (Samsung, Pixel)
- [ ] PWA install testing
  - iOS: Add to Home Screen → Verify standalone mode
  - Android: Install prompt → Verify app drawer icon
- [ ] Offline scenario testing
  - Enable airplane mode → Use app → Verify functionality → Re-enable → Verify sync

### 9.5 Performance Testing
- [ ] Lighthouse audit (target score >90)
  - Performance: >90
  - Accessibility: 100
  - Best Practices: >90
  - SEO: >90
- [ ] Core Web Vitals
  - LCP (Largest Contentful Paint): <2.5s
  - FID (First Input Delay): <100ms
  - CLS (Cumulative Layout Shift): <0.1
- [ ] Load testing (simulate 1000 concurrent users)
  - Use artillery.io or k6
  - Test: Login, view dashboard, confirm medication
  - Monitor: Supabase connection pool, API latency, error rate

---

## Quest 10: Pre-Launch Infrastructure
*Prepare for users. Monitoring and support.*

### 10.1 Error Monitoring
- [ ] Set up Sentry (or LogRocket)
  - `npm install @sentry/nextjs`
  - Configure DSN in `.env.local`
  - Add to `next.config.js` and `app/layout.tsx`
- [ ] Error tracking
  - Capture unhandled errors (global error boundary)
  - Track user context (ID, role, browser)
  - Source maps for stack traces
- [ ] Performance monitoring
  - Track page load times
  - Monitor API call latency
  - Alert on >5% error rate spike

### 10.2 Analytics
- [ ] Privacy-respecting analytics (PostHog or Plausible)
  - No cookies, GDPR compliant
  - Track page views, button clicks
- [ ] Key events to track
  - Onboarding completion rate
  - Medication added
  - Medication confirmed
  - Check-in button tapped
  - Family connection established
- [ ] Funnels to monitor
  - Signup → Onboarding → First med added
  - Caregiver invite sent → Elder accepted
  - Medication reminder → Confirmed taken

### 10.3 Feature Flags
- [ ] Set up feature flag system (LaunchDarkly or custom)
  - Simple boolean flags in Supabase `feature_flags` table
- [ ] Flags to create
  - `enable_check_ins` - Disable if buggy on launch
  - `enable_family_connections` - Gradual rollout
  - `enable_sms_notifications` - If Twilio not ready
- [ ] Admin UI to toggle flags (build simple settings page)

### 10.4 Support Documentation
- [ ] Help center pages
  - `/help/getting-started` - Onboarding guide
  - `/help/medications` - How to add/edit meds
  - `/help/family-connections` - Invite and privacy guide
  - `/help/troubleshooting` - Common issues (notifications not working, offline sync)
- [ ] FAQ page
  - "Is my data secure?" (Yes, HIPAA-aware, encrypted)
  - "Does it work without internet?" (Yes, offline-first)
  - "How much does it cost?" (Free beta, pricing TBD)
- [ ] In-app help tooltips
  - Question mark icon next to complex features
  - Short explanations (1-2 sentences)

### 10.5 Backup & Disaster Recovery
- [ ] Supabase automated backups (verify enabled)
  - Daily backups retained for 7 days (Pro plan)
- [ ] Database export script
  - Create manual backup script: `npm run backup:db`
  - Exports to JSON, stores in secure location
- [ ] Disaster recovery plan document
  - Steps to restore from backup
  - Estimated recovery time (RTO: <4 hours)
  - Contact list (Supabase support, Vercel support)

---

## Quest 11: Beta Launch Preparation
*Final checks before first users.*

### 11.1 Beta Landing Page
- [ ] Create public landing page (`/beta`)
  - Headline: "Your loved one's health, always in reach"
  - Subhead: Problem + solution (1 sentence each)
  - "Join beta waitlist" form (email + name)
- [ ] Waitlist system
  - Store in Supabase `waitlist` table
  - Send confirmation email (Resend/SendGrid)
  - Admin dashboard to review signups
- [ ] Invite flow
  - Manual: Send invite emails to beta families
  - Include: Unique signup link with beta code
  - Track: Who signed up from which invite

### 11.2 Onboarding Email Sequence
- [ ] Welcome email (send immediately after signup)
  - "Welcome to CB Health Tracker!"
  - Quick start guide (3 steps: Add med, Enable notifications, Invite family)
  - Link to help center
- [ ] Day 2 email (if no medication added)
  - "Need help getting started?"
  - Video walkthrough (Loom recording)
- [ ] Day 7 email (if active)
  - "You've been using CB Health Tracker for a week!"
  - Request feedback: "How's it going?"
  - Link to survey (Typeform)

### 11.3 Feedback Collection System
- [ ] In-app feedback widget
  - Floating button (bottom-right): "Send feedback"
  - Form: Rating (1-5 stars) + Text area
  - Store in Supabase `feedback` table
- [ ] NPS survey (Net Promoter Score)
  - After 2 weeks of use: "How likely are you to recommend CB Health Tracker?"
  - 0-10 scale + "Why?" text field
  - Calculate NPS score weekly
- [ ] User interview scheduling
  - Email beta users: "Can we chat for 15 min?"
  - Use Calendly for scheduling
  - Goal: 5 interviews per week

### 11.4 Go-Live Checklist
- [ ] Security review
  - Verify RLS policies (run test queries)
  - Check API keys not exposed in client code
  - Enable HTTPS only (Vercel does this by default)
  - Review CORS settings
- [ ] Performance final check
  - Run Lighthouse audit (all pages >90 score)
  - Test on slow 3G network (Chrome DevTools)
  - Verify PWA installs correctly (iOS + Android)
- [ ] Content review
  - Proofread all copy (typos, grammar)
  - Verify links work (help center, legal pages)
  - Test all email templates (send to yourself)
- [ ] Legal compliance
  - Terms of Service page (lawyer review recommended)
  - Privacy Policy page (HIPAA-aware, data retention)
  - Cookie consent (if using analytics cookies)
- [ ] Monitoring dashboards
  - Sentry: Verify errors captured
  - Analytics: Verify events tracked
  - Supabase: Check dashboard for query performance
- [ ] Launch announcement
  - Email beta waitlist: "We're live!"
  - Post on social media (if applicable)
  - Send direct invites to first 10 families

---

## Critical Path Dependencies

**Sequential (must complete in order):**
1. Quest 1 (Foundation) → Everything else depends on this
2. Quest 2 (Elder Onboarding) → Required before Quest 3
3. Quest 3 (Medication) → Core feature, blocks Quest 6
4. Quest 4 (Check-In) → Can start after Quest 2 complete
5. Quest 5 (Family Connections) → Required before Quest 6
6. Quest 6 (Caregiver Dashboard) → Needs 3, 4, 5 complete

**Parallel (can work simultaneously):**
- Quest 7 (Offline) runs parallel to Quests 3-6 (integrate as you build)
- Quest 8 (UX Polish) ongoing throughout (refine as you go)
- Quest 9 (Testing) starts after Quest 3, continues through launch
- Quest 10-11 (Launch Prep) start during Quest 6-7

---

## Milestone Markers

**Milestone 1: Foundation Complete** (Quest 1 done)
- ✓ Database schema deployed
- ✓ Authentication working
- ✓ Offline architecture scaffolded
- **Demo:** Can sign up, login, see empty dashboard

**Milestone 2: Elder MVP** (Quests 2-3 done)
- ✓ Onboarding flow complete
- ✓ Can add medications
- ✓ Reminders fire and can confirm
- **Demo:** Elder can complete full flow solo (no family)

**Milestone 3: Full Feature Set** (Quests 4-6 done)
- ✓ Check-in button works
- ✓ Family connections functional
- ✓ Caregiver dashboard shows real-time data
- **Demo:** Elder + Caregiver connected, see each other's updates

**Milestone 4: Production Ready** (Quests 7-9 done)
- ✓ Offline mode works flawlessly
- ✓ UX tested with 3+ seniors
- ✓ Tests passing (unit + E2E)
- **Demo:** Works offline, syncs on reconnect

**Milestone 5: Beta Launch** (Quests 10-11 done)
- ✓ Monitoring live
- ✓ Help docs published
- ✓ First 10 families invited
- **Demo:** Real users using in production

---

## Tech Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 14 (App Router) | React framework, SSR, routing |
| Language | TypeScript | Type safety, better DX |
| UI Framework | Tailwind CSS + shadcn/ui | Fast styling, accessible components |
| Database | Supabase (PostgreSQL) | Hosted DB, auth, realtime |
| Offline Storage | IndexedDB (Dexie.js) | Local database for offline |
| PWA | next-pwa | Service worker, manifest |
| Notifications | Web Push API + Supabase Edge Functions | Browser notifications, SMS fallback |
| Authentication | Supabase Auth | Email/phone OTP, session management |
| Monitoring | Sentry | Error tracking, performance |
| Analytics | PostHog or Plausible | Privacy-respecting analytics |
| Email | Resend or SendGrid | Transactional emails |
| SMS | Twilio (future) | SMS notifications fallback |
| Hosting | Vercel | Deployment, edge functions |

---

## Post-Launch Roadmap (Future Quests)

**Quest 12: Appointment Management**
- Calendar integration (Google Calendar, iCal)
- Doctor visit reminders
- Test/checkup tracking

**Quest 13: AI Voice Assistant**
- Voice queries: "When do I take my blood pressure medication?"
- Natural language medication input
- Voice confirmation: "Say 'I took it'"

**Quest 14: Emergency SOS**
- One-tap emergency button
- Location sharing with family
- Emergency contact auto-dial

**Quest 15: Enterprise Features**
- Home care agency dashboard (monitor multiple elders)
- Insurance provider integrations
- HIPAA compliance certification

---

This roadmap is your blade. Each quest sharpens your edge. Build with focus, test with users, ship with confidence.
