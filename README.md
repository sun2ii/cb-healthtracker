# CB Health Tracker

Medication reminders and daily check-ins for peace of mind.

## Architecture

```
cbhealthtracker-2/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth group routes
│   ├── (elder)/           # Elder-specific routes
│   ├── (caregiver)/       # Caregiver dashboard
│   └── layout.tsx
├── features/              # Feature modules (整頓)
│   ├── medications/
│   ├── checkins/
│   ├── family/
│   └── dashboard/
├── components/
│   └── ui/               # Shared UI components
├── lib/
│   ├── db/              # Database client
│   ├── notifications/   # Push notifications
│   └── utils/           # Utilities
├── types/               # TypeScript definitions
└── public/
    ├── manifest.json
    └── sw.js
```

## Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **PWA:** Custom service worker
- **Database:** TBD (Supabase/PlanetScale)
- **Auth:** TBD (Clerk/NextAuth)
- **Notifications:** Web Push API

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Features (Week 1 MVP)

- [ ] Medication reminders (push notifications)
- [ ] "I took it" confirmation button
- [ ] Daily "I'm OK Today" check-in
- [ ] Family connection (elder ↔ caregiver)
- [ ] Caregiver dashboard (real-time activity feed)
- [ ] Missed dose alerts
- [ ] Works offline
- [ ] PWA (no app store)

## Wuju Coding Principles

- **Form before strength** - Master patterns before adding complexity
- **侘寂 (Wabi-sabi)** - Minimal, functional code
- **間 (Ma)** - Strategic whitespace and clear boundaries
- **整理 (Seiri)** - Everything has its place
- **改善 (Kaizen)** - Continuous small improvements
