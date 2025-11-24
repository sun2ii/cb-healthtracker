# CB Health Tracker: Product Requirements Document

**Version:** 1.0
**Owner:** Product & Engineering
**Last Updated:** 2025-11-24

---

## Overview

**What:** Medication reminder + daily check-in PWA connecting elders and caregivers
**Why:** 50M caregivers worry daily about medication adherence
**Success:** >60% 30-day retention, NPS >40 in beta

---

## User Stories & Acceptance Criteria

### Epic 1: Elder Medication Management

**US1.1: Add Medication**
- As an elder, I can add a medication with name, time, and frequency
- **AC:** Form with 3 fields, saves to local + cloud, shows in list

**US1.2: Receive Reminder**
- As an elder, I get notified when it's time to take medication
- **AC:** Push notification at scheduled time, works offline, includes med name

**US1.3: Confirm Taken**
- As an elder, I can tap "I took it" to confirm
- **AC:** One-tap confirmation, logs timestamp, updates caregiver dashboard

**US1.4: Snooze/Skip**
- As an elder, I can snooze (15 min) or skip a dose
- **AC:** Snooze button (max 3x), skip with optional note

---

### Epic 2: Daily Check-In

**US2.1: Check In**
- As an elder, I can tap "I'm OK Today" once per day
- **AC:** Big button on home, haptic feedback, resets at midnight

**US2.2: View Check-In Status**
- As a caregiver, I see if elder checked in today
- **AC:** Status card (green ✓ or neutral "not yet"), shows timestamp

---

### Epic 3: Family Connection

**US3.1: Send Invite**
- As a caregiver, I can invite an elder via link/SMS/email
- **AC:** Generate unique code, expires in 7 days, send via multiple channels

**US3.2: Accept Connection**
- As an elder, I can review and accept/decline a caregiver invite
- **AC:** Show caregiver name, permissions list, accept/decline buttons

**US3.3: Privacy Controls**
- As an elder, I can control what caregivers see
- **AC:** Toggle per data type (meds, check-ins), takes effect immediately

---

### Epic 4: Caregiver Dashboard

**US4.1: View Activity Feed**
- As a caregiver, I see real-time updates (meds taken, check-ins)
- **AC:** Reverse chronological feed, auto-updates via realtime subscription

**US4.2: Missed Dose Alert**
- As a caregiver, I get notified if elder misses medication
- **AC:** Alert after grace period (30 min), includes med name and time

**US4.3: Configure Alerts**
- As a caregiver, I can set alert preferences
- **AC:** Toggle per alert type, set check-in time, quiet hours

---

### Epic 5: Offline-First

**US5.1: Work Offline**
- As an elder, the app works without internet
- **AC:** Reminders fire offline, actions queue, sync when online

**US5.2: Sync Status**
- As a user, I know when data is syncing
- **AC:** Indicator shows online/offline, "syncing..." state, last sync time

---

## Feature Priorities

### MVP (Phase 1) - Core Features
**Target:** First user testing with 5 families

| Feature | Priority | Status |
|---------|----------|--------|
| Elder onboarding | P0 | Not started |
| Add/edit medications | P0 | Not started |
| Medication reminders | P0 | Not started |
| Confirm/snooze/skip | P0 | Not started |
| Daily check-in button | P0 | Not started |
| Family connection (basic) | P1 | Not started |
| Caregiver dashboard | P1 | Not started |
| Offline architecture | P0 | Not started |

---

### Beta (Phase 2) - Polish & Alerts
**Target:** 50 beta families

| Feature | Priority | Status |
|---------|----------|--------|
| Missed dose alerts | P0 | Not started |
| Check-in alerts | P1 | Not started |
| Alert configuration | P1 | Not started |
| Privacy controls | P1 | Not started |
| Multi-caregiver support | P2 | Not started |
| Multi-elder support | P2 | Not started |
| Elder UX polish | P0 | Not started |

---

### Launch (Phase 3) - Production Ready
**Target:** Public availability

| Feature | Priority | Status |
|---------|----------|--------|
| Error monitoring (Sentry) | P0 | Not started |
| Analytics (PostHog) | P1 | Not started |
| Help documentation | P1 | Not started |
| Beta feedback system | P1 | Not started |
| Performance optimization | P0 | Not started |
| Cross-browser testing | P0 | Not started |

---

## Success Metrics

### Onboarding (First 5 Minutes)
- **Signup completion:** >80%
- **First medication added:** >70%
- **Notification permission granted:** >60%

### Engagement (Daily/Weekly)
- **Elder DAU:** >50% (driven by reminders)
- **Caregiver WAU:** >70% (check dashboard 3x/week)
- **Check-in consistency:** >70% check in 5+ days/week

### Retention
- **7-day retention:** >75%
- **30-day retention:** >60%
- **90-day retention:** >50%

### Value Delivery
- **Medication adherence:** >85% doses confirmed on time
- **Alert response time:** <30 min average (caregiver sees alert → takes action)
- **NPS score:** >40 (beta), >50 (post-launch)

### Technical Performance
- **Offline reminder success:** 100% (must fire even offline)
- **Sync success rate:** >99%
- **App load time:** <2s on 3G
- **Error rate:** <1% of sessions

---

## Technical Requirements

### Architecture
- **Frontend:** Next.js 14 (App Router), React, TypeScript
- **Backend:** Supabase (PostgreSQL, Auth, Realtime, Edge Functions)
- **Offline:** Service Worker + IndexedDB (Dexie.js) + Background Sync API
- **Hosting:** Vercel (frontend), Supabase (backend)

### Database Schema
**Tables:**
- `profiles` (user data, role, timezone)
- `medications` (name, dosage, schedule)
- `medication_logs` (taken/missed/skipped, timestamps)
- `check_ins` (daily check-in timestamps)
- `family_connections` (elder-caregiver links, permissions)
- `connection_invites` (invite codes, expiry)

**Key Indexes:**
- `medication_logs.user_id, scheduled_time` (query performance)
- `check_ins.user_id, checked_in_at` (daily status checks)

### Security & Compliance
- **Row-Level Security (RLS):** Supabase policies on all tables
- **Data encryption:** At rest (Supabase default) + in transit (HTTPS only)
- **HIPAA-aware:** No PHI in logs, audit trail for data access
- **Privacy controls:** Granular permissions (elder controls visibility)

### PWA Requirements
- **Manifest:** name, icons, theme, display: standalone
- **Service Worker:** Cache app shell, schedule local notifications
- **Installable:** iOS (Add to Home Screen), Android (install prompt)
- **Offline-first:** All reads work offline, writes queue and sync

### Notification System
- **Primary:** Web Push API (browser notifications)
- **Fallback:** SMS via Twilio (if push denied)
- **Timing:** Scheduled notifications via service worker alarms
- **Content:** Med name, dosage, time, action buttons

### Performance Targets
- **Lighthouse score:** >90 (all categories)
- **Core Web Vitals:**
  - LCP <2.5s
  - FID <100ms
  - CLS <0.1
- **Bundle size:** <200KB initial JS (code splitting)

### Browser Support
- **Desktop:** Chrome, Safari, Firefox, Edge (latest 2 versions)
- **Mobile:** iOS Safari 15+, Android Chrome 90+
- **PWA install:** iOS 16.4+, Android 5.0+

### Third-Party Services
- **Auth:** Supabase Auth (email/phone OTP)
- **Database:** Supabase PostgreSQL
- **Realtime:** Supabase Realtime (WebSocket)
- **Notifications:** Web Push API + Twilio (SMS fallback)
- **Email:** Resend or SendGrid (transactional)
- **Monitoring:** Sentry (errors), Vercel Analytics (performance)
- **Analytics:** PostHog or Plausible (privacy-respecting)

### Data Sync Strategy
**Priority Queue:**
1. **High (immediate):** Medication confirmations, check-ins
2. **Medium (5 min):** New medications, profile updates
3. **Low (idle):** Historical data, analytics events

**Conflict Resolution:**
- Elder's actions override caregiver's manual entries
- Timestamp-based merge for non-conflicting updates
- UI prompt for unresolvable conflicts

### Scalability Considerations
- **Supabase connection pooling:** Enabled (default)
- **Database queries:** <100ms p95 latency
- **Realtime connections:** 1 per active caregiver dashboard
- **Storage:** 10MB per user (medications + logs for 1 year)

---

## Out of Scope (Not in MVP)

❌ Appointment management
❌ AI voice assistant
❌ Emergency SOS
❌ Activity monitoring (passive wellness)
❌ Health data integrations (Apple Health, etc.)
❌ Video calling
❌ B2B agency dashboard
❌ Insurance provider integrations

---

## Dependencies & Risks

### Critical Path Dependencies
1. Supabase project setup → Database schema → Auth
2. Offline architecture → All features (must be foundational)
3. Notification permissions → Reminder value delivery

### Technical Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| iOS PWA install friction | High | Provide clear instructions, test on real devices |
| Service worker notification limits | High | Test on all browsers, SMS fallback ready |
| Offline sync conflicts | Medium | Simple resolution rules, elder's data wins |
| Supabase Realtime latency | Low | Acceptable <2s delay for dashboard updates |

### Go-to-Market Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| Elder tech adoption | High | UX testing with 5+ seniors, iterate aggressively |
| Caregiver engagement drop-off | Medium | Value delivery in first week (alerts must work) |
| Notification permission denial | High | Explain value clearly, SMS fallback available |

---

## Open Questions

1. **SMS pricing:** Twilio costs at scale (defer until post-MVP)
2. **Multi-language support:** Start English-only, expand in beta if needed
3. **Medication database:** Custom list vs API integration (start custom, simple)
4. **Data retention:** How long to keep historical logs (start: indefinite, user-controlled delete)

---

**Approval Required From:**
- [ ] Product/Engineering Lead (you)
- [ ] Marketing/Sales Co-founder (validate personas, metrics)

**Next Steps:**
1. Review and sign off on PRD
2. Begin Quest 1: Foundation Architecture (see `product-roadmap.md`)
3. Weekly sync to track progress vs. timeline
