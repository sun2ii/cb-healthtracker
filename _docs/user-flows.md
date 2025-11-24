# CB Health Tracker: User Flows & Business Logic

Complete interaction flows and business rules for the connected care platform.

---

## Flow 1: Elder First-Time Setup
**Goal:** Get from "What is this?" to "I'm tracking my first medication" in 3 minutes

### User Journey
```
1. Landing → Sign Up
   ├─ Enter phone number OR email
   ├─ Verify code (SMS/email)
   └─ Create profile (Name, Birthdate)

2. Role Selection
   └─ "I'm using this for myself" → Elder Mode

3. Welcome Screen
   └─ "Let's add your first medication" (skip option available)

4. Add First Medication
   ├─ Medication name (text input or common med picker)
   ├─ When do you take it? (Time picker: "8:00 AM")
   ├─ How often? (Daily/Weekly selector)
   └─ Save → Confirmation "We'll remind you at 8:00 AM daily"

5. Enable Notifications
   └─ "Allow notifications so we can remind you" → Browser permission

6. Home Screen (First View)
   ├─ Big "I'm OK Today" button (prominent)
   ├─ Today's medications list (next dose countdown)
   └─ "Invite Family" card (optional, dismissible)
```

### Business Logic
- **Empty state:** If no meds added → show empty state with "Add medication" CTA
- **Notification fallback:** If denied → show message: "Open CB Health Tracker at medication time to confirm"
- **Daily reset:** Check-in button resets at midnight (local timezone)
- **Optional family:** Can skip family invite indefinitely (elder-only mode supported)

### Edge Cases
- User closes app mid-onboarding → Resume at last completed step
- Invalid medication name → Accept any text (no validation, trust user input)
- Timezone detection → Use device timezone, allow manual override in settings

---

## Flow 2: Caregiver First-Time Setup
**Goal:** Connect to loved one and start receiving updates

### User Journey
```
1. Landing → Sign Up
   ├─ Enter phone/email
   ├─ Verify code
   └─ Create profile (Name, Relationship to elder)

2. Role Selection
   └─ "I'm caring for someone" → Caregiver Mode

3. Connection Setup
   ├─ "Who are you caring for?"
   ├─ Enter their name (creates placeholder profile)
   └─ Generate invite link/code

4. Send Invitation
   ├─ Copy link OR
   ├─ Send SMS directly (requires phone number) OR
   └─ Send email

5. Home Screen (Pending State)
   └─ "Waiting for [Name] to accept invitation"
   └─ "In the meantime, explore how CB Health Tracker works" (demo tour)

[After Elder accepts invite:]

6. Home Screen (Connected State)
   ├─ Activity feed (check-ins, medications taken)
   ├─ Today's status card ("Checked in ✓" or "Not yet today")
   └─ Medication adherence summary (weekly view)
```

### Business Logic
- **Read-only access:** Caregiver cannot add/edit elder's medications (elder controls their data)
- **Alert preferences:** Configure on first login (immediate, daily digest, weekly summary)
- **Multi-caregiver support:** Multiple caregivers can connect to one elder
- **Multi-elder support:** One caregiver can monitor multiple elders (switch between profiles)

### Edge Cases
- Elder never accepts invite → Reminder email after 48 hours, expires after 7 days
- Elder declines invite → Caregiver notified, can send new invite after 24 hours
- Caregiver without elder's phone/email → Generate shareable link, caregiver sends via their preferred method

---

## Flow 3: Daily Medication Reminder
**The core loop - happens multiple times per day**

### Elder Side: Taking Medication
```
1. Scheduled Time Arrives (e.g., 8:00 AM)
   └─ Push notification: "Time for [Medication Name]"

2. Elder Opens App (from notification or manual)
   └─ Medication card prominent: "[Med Name] - 8:00 AM"

3. Action Required
   ├─ Tap "I took it" → Confirmation animation → Logs timestamp
   ├─ Tap "Snooze 15 min" → Re-schedules reminder (up to 3 times)
   └─ Tap "Skip today" → Logs skip + optional note ("Feeling sick", "Ran out")

4. Confirmation State
   └─ Card changes to "Taken ✓" with timestamp
   └─ Next dose countdown appears ("Next dose at 2:00 PM")

[If no action taken within 30 minutes:]

5. Grace Period Expires
   └─ Missed dose logged
   └─ Trigger caregiver alert (if alerts enabled)
   └─ Reminder escalation: Second notification "Did you take [Med Name]?"
```

### Caregiver Side: Missed Dose Alert
```
6. Alert Received
   └─ Push/SMS/Email: "[Elder Name] missed [Med Name] at 8:00 AM"

7. Caregiver Opens App
   ├─ Sees missed medication highlighted in amber/red
   └─ Options:
      ├─ "Call [Elder]" (quick dial if phone number shared)
      ├─ "Send gentle reminder" (push notification to elder)
      └─ Mark as "Confirmed taken" (override - if verified via call)

8. Resolution
   └─ Elder eventually confirms OR
   └─ Caregiver marks as confirmed OR
   └─ Remains "missed" in history
```

### Business Logic
- **Early confirmation allowed:** Elder can mark "taken" up to 2 hours BEFORE scheduled time
- **Grace period:** 30 minutes after scheduled time before marking "missed"
- **Late confirmation window:** Can confirm up to 2 hours after scheduled time (still counts as taken with timestamp)
- **After 2 hours:** Logged as missed, cannot backdate (data integrity)
- **Snooze limit:** Max 3 snoozes per dose (prevents infinite snoozing)
- **Caregiver visibility:** Sees "Not taken yet" for both snoozed and pending states (simplified)
- **Offline handling:** Reminders fire locally via service worker, sync when online

### Alert Throttling Rules
- **One alert per missed event:** Don't spam caregiver (max 1 notification per missed dose)
- **Digest mode:** Bundle multiple missed doses into one alert (configurable)
- **Quiet hours:** No alerts between 10 PM - 7 AM local time (configurable per caregiver)
- **Escalation:** If 3+ consecutive doses missed → High-priority alert

### Edge Cases
- Elder marks "taken" twice accidentally → Ignore duplicate within 5-minute window
- Caregiver overrides "missed" to "taken" → Elder sees caregiver's note ("Called you, you confirmed")
- Medication deleted mid-day → Cancel future reminders, keep historical data
- Elder changes med time after reminder sent → Next reminder uses new time

---

## Flow 4: Daily Check-In
**Simple presence indicator for peace of mind**

### Elder Side: Checking In
```
1. Open App Any Time
   └─ Home screen shows "I'm OK Today" button (if not pressed yet)

2. Tap Button
   ├─ Haptic feedback + confetti animation
   ├─ Button changes to "Checked in ✓ [time]"
   ├─ Encouraging message: "Have a great day!" / "[Caregiver] will see you're doing well"
   └─ Background: Log timestamp, notify caregivers (if they have alerts on)

3. Next Day (Midnight)
   └─ Button resets to "I'm OK Today" (new day starts)

4. Multiple Check-Ins (Optional)
   └─ Elder can tap multiple times per day (tracks all timestamps)
   └─ Shows last check-in time
```

### Caregiver Side: Monitoring Check-Ins
```
5. Morning Dashboard View
   ├─ Status card: "Checked in ✓ at 9:23 AM" (green) OR
   └─ Status card: "No check-in yet today" (neutral, not alarming)

6. Alert Trigger (If Configured)
   [Caregiver set alert time: "Notify me if no check-in by 11:00 AM"]

   └─ 11:00 AM arrives, no check-in yet
   └─ Push/SMS/Email: "[Elder Name] hasn't checked in today"

7. Caregiver Opens App
   ├─ Status: "No check-in yet today"
   └─ Quick actions:
      ├─ "Call [Elder]"
      ├─ "Send reminder" (gentle nudge notification)
      └─ "Mark as contacted" (dismisses alert, logs note)

8. Historical View
   └─ Weekly calendar: Green dots for days checked in
   └─ Streak counter: "7 days in a row!"
```

### Business Logic
- **Alert timing:** Caregiver sets specific time ("alert me if no check-in by 11 AM")
- **Default alert time:** 11:00 AM if not configured
- **Optional feature:** Caregiver can disable check-in alerts entirely
- **Weekend variation:** Caregiver can set different times for weekends (e.g., "noon on Saturdays")
- **Multiple caregivers:** Each sets their own alert preference
- **False positive prevention:** If elder opens app but doesn't check in, send gentle in-app prompt

### Edge Cases
- Elder checks in at 11:59 PM → Counts for that day, button resets at midnight
- Elder forgets for multiple days → Caregiver sees gap in calendar, but no escalation spam
- Caregiver dismisses alert but elder checks in 10 min later → Caregiver gets confirmation notification
- Elder doesn't use feature → After 7 days of no check-ins, prompt: "Disable daily check-ins?"

---

## Flow 5: Family Connection
**Trust bridge between elder and caregiver**

### Elder Receives Invite
```
1. SMS/Email Link Arrives
   └─ "[Caregiver Name] wants to support your health with CB Health Tracker"
   └─ "Tap here to review their request"

2. Tap Link
   ├─ If not signed up: Quick signup flow (streamlined, 2 steps)
   └─ If signed up: Direct to approval screen

3. Approval Screen
   ├─ "[Caregiver Name] wants to connect as your [Relationship]"
   ├─ "They will see:"
   │   ├─ ✓ When you take medications
   │   ├─ ✓ Your daily check-ins
   │   └─ ✗ They CANNOT change your medications
   └─ "You control your privacy settings at any time"

4. Action
   ├─ Tap "Accept" → Connection established, caregiver notified
   ├─ Tap "Decline" → Caregiver notified (no access granted)
   └─ Tap "Ask me later" → Reminder in 24 hours

5. Post-Connection Confirmation
   └─ "[Caregiver Name] can now see your health updates"
   └─ "Manage privacy settings" (link to controls)
```

### Privacy Controls (Post-Connection)
```
6. Elder Privacy Settings
   └─ Settings → Connected Family → [Caregiver Name]

   Granular Toggles:
   ├─ Share medication reminders [ON/OFF]
   ├─ Share daily check-ins [ON/OFF]
   ├─ Share appointment reminders [ON/OFF] (future)
   └─ Share phone number [ON/OFF]

   Advanced:
   ├─ View audit log ("Last viewed your data: Today at 2:30 PM")
   └─ Disconnect caregiver (requires confirmation)
```

### Business Logic
- **Elder has final say:** Can disconnect caregiver anytime without explanation
- **Default permissions:** All sharing ON by default (opt-out model for simplicity)
- **Permission changes:** Take effect immediately, caregiver sees reduced data
- **Audit trail:** Elder can see when caregiver views their dashboard (timestamp only)
- **Re-connection:** If disconnected, caregiver must send new invite (elder must re-approve)

### Multiple Connections
- **One elder → Multiple caregivers:** Elder can have unlimited caregivers (daughter, son, neighbor)
- **One caregiver → Multiple elders:** Caregiver can monitor multiple elders (switch profiles in app)
- **Individual permissions:** Elder sets different permissions per caregiver (daughter sees everything, neighbor only sees check-ins)

### Edge Cases
- Elder accepts then immediately disconnects → Caregiver notified, connection history logged
- Caregiver deleted account → Elder notified, connection auto-removed
- Elder changes phone number → Existing connections persist (tied to account, not phone)
- Invite link shared publicly by mistake → Require elder approval anyway (no auto-connect)

---

## Flow 6: Offline Mode
**Differentiating feature - works when internet doesn't**

### Scenario: Elder Loses Internet

```
1. Detection
   └─ App detects offline state (service worker monitors network)
   └─ Subtle indicator: "Offline - changes will sync when connected"
   └─ UI remains fully functional (no blocking errors)

2. Medication Reminder Still Works
   └─ Scheduled time arrives (8:00 AM)
   └─ Service worker fires local notification (no server needed)
   └─ Elder taps "I took it"
   └─ Action saved to local queue (IndexedDB)
   └─ UI updates immediately (optimistic update)

3. Adding New Medication Offline
   └─ Elder adds new med
   └─ Saved locally, synced later
   └─ Subtle indicator: "Will sync when online"

4. Caregiver View (During Elder's Offline Period)
   └─ Dashboard shows last known state
   └─ Status card: "[Elder Name] - Last updated 2 hours ago"
   └─ No false alarms (system knows elder is offline, suppresses missed dose alerts)
   └─ Indicator: "Data will update when [Elder] is back online"

5. Elder Back Online
   └─ Background sync triggers automatically (no user action needed)
   └─ Queued actions upload: "Took Metformin at 8:05 AM (offline)"
   └─ Caregiver dashboard updates in real-time
   └─ Success notification: "✓ Synced 3 updates"

6. Conflict Resolution (Rare Case)
   Scenario: Elder offline marks "Taken", caregiver online marks "Missed" via override

   └─ Sync detects conflict
   └─ Resolution UI (Elder sees on next open):
      "You marked [Med] as taken at 8:05 AM"
      "[Caregiver] marked it as missed"
      "Which is correct?"
      ├─ "I took it" (Elder's record wins)
      └─ "I didn't take it" (Caregiver's record wins)

   └─ Elder's choice is final (their data, their truth)
```

### Technical Implementation
- **Service worker:** Caches app shell, static assets, and medication schedule
- **IndexedDB:** Stores medication data, check-in history, sync queue
- **Background Sync API:** Automatic retry when connection restored
- **Optimistic UI:** Updates happen instantly, sync in background
- **Conflict strategy:** Last-write-wins with elder override option

### Offline Capabilities
**What works offline:**
- ✓ View medication list
- ✓ Receive scheduled reminders (local notifications)
- ✓ Mark medications as taken/skipped
- ✓ Daily check-in button
- ✓ Add new medications
- ✓ Edit medication schedules
- ✓ View historical data

**What requires online:**
- ✗ Real-time caregiver notifications (queued until online)
- ✗ Family connection invites
- ✗ Caregiver dashboard updates
- ✗ SMS/email alerts

### Edge Cases
- Offline for multiple days → Syncs all queued actions chronologically when online
- Battery dies during offline period → Missed local reminders, no false "missed dose" alerts sent to caregiver
- Elder and caregiver both offline → Each works independently, sync when any device online
- Sync failure (server error) → Retry with exponential backoff, show persistent retry button

---

## Key Business Rules Summary

### 1. Medication Timing Logic
| Event | Rule |
|-------|------|
| Early confirmation | Allowed up to 2 hours before scheduled time |
| Grace period | 30 minutes after scheduled time before marking "missed" |
| Late confirmation | Allowed up to 2 hours after scheduled time |
| Missed cutoff | After 2 hours, permanently logged as missed (no backdating) |
| Snooze limit | Maximum 3 snoozes per dose (15 min each) |

### 2. Alert Throttling
- **Max 1 alert per missed event** (no spam)
- **Quiet hours:** 10 PM - 7 AM (no alerts, configurable)
- **Digest mode:** Bundle multiple events into daily summary email
- **Escalation:** 3+ consecutive missed doses → High-priority alert

### 3. Privacy Hierarchy
- **Elder > Caregiver** (elder's privacy choices always override)
- **Default:** All data shared (opt-out model)
- **Granular controls:** Per-caregiver, per-data-type toggles
- **Audit transparency:** Elder can see when caregiver views data

### 4. Data Sync Priority
| Priority | Data Type | Sync Target |
|----------|-----------|-------------|
| High | Medication confirmations, check-ins | Immediate (real-time) |
| Medium | New medications, profile updates | Within 5 minutes |
| Low | Historical data, analytics | When idle |

### 5. Notification Permissions
**Fallback cascade:**
1. **Push notifications** (preferred) → Instant, works offline
2. **SMS reminders** (if push denied) → Requires phone number, carrier charges apply
3. **Email reminders** (last resort) → Least timely, better than nothing

### 6. Multi-Tenancy Rules
- **One elder → Unlimited caregivers** (family, friends, professionals)
- **One caregiver → Unlimited elders** (profile switcher in nav)
- **Permissions are independent** (Elder A shares everything with Daughter, Elder B shares only check-ins)

### 7. Data Retention
- **Active data:** Indefinite retention (medication history, check-ins)
- **Deleted medications:** Soft delete (archived), historical records preserved
- **Disconnected caregivers:** Connection history kept, access immediately revoked
- **Account deletion:** 30-day grace period, then permanent deletion (GDPR compliant)

---

## UI/UX Principles

### Elder Interface
- **Touch targets:** Minimum 60px × 60px (generous tap zones)
- **Font size:** Base 18px, scalable (respects system text size)
- **Color contrast:** WCAG AAA compliant (high contrast mode available)
- **Navigation depth:** Max 2 levels (Home → Detail, no deeper)
- **Language:** Plain English, zero jargon ("Take medication" not "Administer dosage")
- **Error states:** Never blame user ("Let's try that again" not "Invalid input")

### Caregiver Interface
- **Information density:** Higher density allowed (assume tech-savvy)
- **Dashboard priority:** Most recent activity at top (time-sorted feed)
- **Color coding:**
  - Green: Completed actions (taken medication, checked in)
  - Amber: Pending/waiting (no check-in yet, reminder sent)
  - Red: Missed/alerts (missed medication, overdue check-in)
- **Empty states:** Show example data with "Preview mode" label
- **Onboarding:** Interactive demo before elder connects

### Shared Principles
- **Offline-first:** Never show blocking "No internet" errors
- **Optimistic UI:** Actions appear instant, sync in background
- **Progressive disclosure:** Advanced features hidden until needed
- **Undo/redo:** All destructive actions have 5-second undo window
- **Haptic feedback:** Physical confirmation for important taps (medication taken, check-in)

---

## Success Metrics

### Elder Engagement
- **Onboarding completion:** >80% complete first medication setup
- **Notification acceptance:** >60% enable push notifications
- **Daily active usage:** >50% open app daily (driven by reminders)
- **Check-in consistency:** >70% check in at least 5 days/week

### Caregiver Value
- **Time to first alert:** <24 hours from signup
- **Alert response time:** <30 minutes average
- **Dashboard views:** 3+ times per week
- **Multi-elder adoption:** >30% monitor 2+ elders

### Technical Performance
- **Offline functionality:** 100% of reminders fire offline
- **Sync success rate:** >99% of queued actions sync
- **Push notification delivery:** >95% within 10 seconds
- **App load time:** <2 seconds on 3G connection

### Business Health
- **Family connections:** >70% of elders invite at least 1 caregiver
- **Retention (30-day):** >60% still active after 1 month
- **NPS score:** >50 (from beta families)
- **Support ticket rate:** <5% of users per month

---

This document is the blueprint. Every interaction, every click, every business rule. Now we build.
