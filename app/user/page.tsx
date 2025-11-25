'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useHealthStore } from '@/lib/stores/health-store';
import { Avatar, Button } from '@/components/ui';
import { ReminderModal } from '@/components/ReminderModal';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function ElderHomePage() {
  const profile = useHealthStore((state) => state.profile);
  const medications = useHealthStore((state) => state.medications);
  const getStreak = useHealthStore((state) => state.getStreak);
  const getTodayCheckIn = useHealthStore((state) => state.getTodayCheckIn);

  const [showReminder, setShowReminder] = useState(false);
  const [selectedMedIndex, setSelectedMedIndex] = useState(0);

  const streak = getStreak();
  const todayCheckIn = getTodayCheckIn();
  const activeMeds = medications.filter((m) => m.active);

  return (
    <div className="flex flex-col gap-4 pt-4">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar src={profile?.avatar} name={profile?.name} size="md" />
          <div>
            <p className="text-gray-500 text-xs">{getGreeting()}</p>
            <h1 className="text-lg font-semibold text-gray-900">{profile?.name || 'Friend'}</h1>
          </div>
        </div>
        {!profile && (
          <Link href="/user/profile">
            <Button size="sm">Setup Profile</Button>
          </Link>
        )}
      </header>

      {/* Main Content */}
      <div className="flex flex-col gap-3">
        {/* Check-in Card - Primary CTA */}
        <div className={`rounded-xl p-4 flex items-center ${!todayCheckIn ? 'bg-gradient-to-br from-[#4a9d94] to-[#3d8a82]' : 'bg-white border border-gray-100 shadow-sm'}`}>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${todayCheckIn ? 'bg-[#4a9d94]/10' : 'bg-white/20'}`}>
                {todayCheckIn ? (
                  <span className="text-xl">{todayCheckIn.status === 'ok' ? '😊' : '😔'}</span>
                ) : (
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <div>
                <h2 className={`font-semibold ${todayCheckIn ? 'text-gray-900' : 'text-white'}`}>
                  {todayCheckIn ? 'Daily Check-in' : 'Check-in'}
                </h2>
                <p className={`text-sm ${todayCheckIn ? 'text-[#4a9d94]' : 'text-white/80'}`}>
                  {todayCheckIn
                    ? `${todayCheckIn.status === 'ok' ? 'Feeling good' : 'Not great'} • ${new Date(todayCheckIn.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
                    : 'How are you today?'}
                </p>
              </div>
            </div>
            {!todayCheckIn && (
              <Link href="/user/checkin">
                <Button variant="secondary" size="sm">Go</Button>
              </Link>
            )}
          </div>
        </div>

        {/* Streak + Meds Count - Side by side */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm flex flex-col items-center justify-center">
            <p className="text-2xl font-bold text-[#4a9d94]">{streak || 0}</p>
            <p className="text-xs text-gray-500 text-center">day streak</p>
          </div>
          <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm flex flex-col items-center justify-center">
            <p className="text-2xl font-bold text-gray-900">{activeMeds.length}</p>
            <p className="text-xs text-gray-500 text-center">total meds</p>
          </div>
        </div>

        {/* Medications + Activity - Side by side on desktop, stacked on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Medications */}
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 text-sm">Medications</h3>
              <Link href="/user/medications" className="text-[#4a9d94] text-xs font-medium">
                {activeMeds.length > 0 ? 'View' : 'Add'}
              </Link>
            </div>
            {activeMeds.length === 0 ? (
              <p className="text-gray-400 text-sm">No medications</p>
            ) : (
              <div className="flex flex-col gap-2">
                {activeMeds.slice(0, 2).map((med) => (
                  <div key={med.id} className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 text-sm truncate">{med.name}</p>
                      <p className="text-xs text-gray-400">{med.dose}</p>
                    </div>
                    <span className="text-xs text-[#4a9d94] bg-[#4a9d94]/10 px-2 py-0.5 rounded-full ml-2">
                      {med.time_of_day}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Activity */}
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 text-sm">Activity</h3>
              <Link href="/user/activity" className="text-[#4a9d94] text-xs font-medium">View</Link>
            </div>
            {todayCheckIn ? (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#4a9d94]/10 flex items-center justify-center">
                  <span>{todayCheckIn.status === 'ok' ? '😊' : '😔'}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Today</p>
                  <p className="text-xs text-[#4a9d94]">
                    {activeMeds.length}/{activeMeds.length} meds • {todayCheckIn.status === 'ok' ? 'Feeling good' : 'Not feeling well'}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No activity yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Appointments - Coming Soon */}
      <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 text-sm">Appointments</h3>
            <span className="text-[10px] text-[#4a9d94] bg-[#4a9d94]/10 px-1.5 py-0.5 rounded-full font-medium">Coming Soon</span>
          </div>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="flex flex-col gap-2 opacity-60">
          <div className="flex items-center justify-between py-2 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">Dr. Smith - Checkup</p>
                <p className="text-xs text-gray-400">Dec 5, 2024 at 10:00 AM</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">Lab Work - Blood Test</p>
                <p className="text-xs text-gray-400">Dec 12, 2024 at 8:30 AM</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions - Hidden on mobile (bottom nav has same links) */}
      <div className="hidden md:flex gap-2">
        <Link href="/user/medications/add" className="flex-1">
          <button aria-label="Add new medication" className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50">
            <svg className="w-4 h-4 text-[#4a9d94]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Med
          </button>
        </Link>
        <Link href="/user/activity" className="flex-1">
          <button aria-label="View activity history" className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50">
            <svg className="w-4 h-4 text-[#4a9d94]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            History
          </button>
        </Link>
        <Link href="/user/profile" className="flex-1">
          <button aria-label="View profile" className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50">
            <svg className="w-4 h-4 text-[#4a9d94]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Profile
          </button>
        </Link>
      </div>

      {/* Reminder Modal */}
      {activeMeds.length > 0 && (
        <ReminderModal
          isOpen={showReminder}
          onClose={() => setShowReminder(false)}
          medication={activeMeds[selectedMedIndex]}
        />
      )}
    </div>
  );
}
