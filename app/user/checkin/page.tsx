'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useHealthStore } from '@/lib/stores/health-store';
import { Card, CardContent, Textarea } from '@/components/ui';
import { Confetti } from '@/components/Confetti';

export default function CheckInPage() {
  const router = useRouter();
  const checkIn = useHealthStore((state) => state.checkIn);
  const getTodayCheckIn = useHealthStore((state) => state.getTodayCheckIn);
  const getStreak = useHealthStore((state) => state.getStreak);

  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const todayCheckIn = getTodayCheckIn();
  const streak = getStreak();

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleCheckIn = async (status: 'ok' | 'not-ok') => {
    setIsSubmitting(true);
    await checkIn(status, note.trim() || undefined);
    setIsSubmitting(false);
    setShowSuccess(true);
    timeoutRef.current = setTimeout(() => {
      router.push('/user');
    }, 2000);
  };

  if (showSuccess) {
    return (
      <>
        <Confetti />
        <div className="min-h-[80vh] flex items-center justify-center px-6">
          <div className="text-center animate-bounce-in">
            <div className="w-28 h-28 mx-auto mb-6 rounded-full bg-[#4a9d94]/10 flex items-center justify-center animate-pulse-scale">
              <span className="text-6xl">🎉</span>
            </div>
            <h2 className="text-3xl font-bold text-[#4a9d94] mb-2">Check-in Complete!</h2>
            <p className="text-gray-500 mb-4">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            {streak > 0 && (
              <div className="inline-flex items-center gap-2 bg-[#e5a84b]/10 px-6 py-3 rounded-full">
                <span className="text-2xl">🔥</span>
                <p className="text-xl text-[#e5a84b] font-bold">{streak + 1} day streak!</p>
              </div>
            )}
            <p className="text-gray-400 text-sm mt-6">Redirecting to home...</p>
          </div>
        </div>
        <style jsx>{`
          @keyframes bounce-in {
            0% { transform: scale(0.3); opacity: 0; }
            50% { transform: scale(1.05); }
            70% { transform: scale(0.9); }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes pulse-scale {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
          .animate-bounce-in {
            animation: bounce-in 0.6s ease-out forwards;
          }
          .animate-pulse-scale {
            animation: pulse-scale 1.5s ease-in-out infinite;
          }
        `}</style>
      </>
    );
  }

  if (todayCheckIn) {
    return (
      <div className="flex flex-col gap-4 pt-4">
        <header>
          <h1 className="text-2xl font-bold text-[#1a1a1a]">Daily Check-in</h1>
        </header>
        <div>
          <Card>
            <CardContent className="text-center py-10">
              <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-[#4a9d94]/10 flex items-center justify-center">
                <svg className="w-10 h-10 text-[#4a9d94]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-[#1a1a1a] mb-3">Already checked in today!</h2>
              <p className="text-[#6b6b6b] text-lg mb-2">
                Status: {todayCheckIn.status === 'ok' ? "Feeling good" : "Not feeling great"}
              </p>
              {todayCheckIn.note && (
                <p className="text-[#9a9a9a]">Note: {todayCheckIn.note}</p>
              )}
              {streak > 0 && (
                <div className="mt-6 inline-block bg-[#e5a84b]/10 px-5 py-2 rounded-full">
                  <p className="text-[#e5a84b] font-semibold text-lg">{streak} day streak!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pt-4">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-bold text-[#1a1a1a]">Daily Check-in</h1>
      </header>

      {/* Content */}
      <Card>
        <CardContent className="py-6 flex flex-col gap-5">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-[#1a1a1a] mb-2">How are you feeling today?</h2>
              <p className="text-[#6b6b6b]">Let your family know you&apos;re okay</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleCheckIn('ok')}
                disabled={isSubmitting}
                className="p-6 rounded-2xl bg-[#4a9d94]/10 border-2 border-[#4a9d94]/20 hover:border-[#4a9d94] transition-all duration-200 disabled:opacity-50 active:scale-[0.98]"
              >
                <div className="text-5xl mb-3">😊</div>
                <p className="font-semibold text-[#4a9d94] text-lg">I&apos;m OK</p>
              </button>

              <button
                onClick={() => handleCheckIn('not-ok')}
                disabled={isSubmitting}
                className="p-6 rounded-2xl bg-[#e5a84b]/10 border-2 border-[#e5a84b]/20 hover:border-[#e5a84b] transition-all duration-200 disabled:opacity-50 active:scale-[0.98]"
              >
                <div className="text-5xl mb-3">😔</div>
                <p className="font-semibold text-[#e5a84b] text-lg">Not Great</p>
              </button>
            </div>

            <Textarea
              label="Add a note (optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="How are you feeling? Any concerns?"
              rows={3}
            />

            {streak > 0 && (
              <div className="text-center p-3 bg-[#e5a84b]/10 rounded-xl">
                <p className="text-[#e5a84b] font-semibold">
                  Keep your {streak} day streak going!
                </p>
              </div>
            )}
          </CardContent>
      </Card>
    </div>
  );
}
