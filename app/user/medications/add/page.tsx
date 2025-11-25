'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useHealthStore } from '@/lib/stores/health-store';
import { Button, Card, CardContent, Input, Textarea } from '@/components/ui';

const TIMES_OF_DAY = ['Morning', 'Afternoon', 'Evening', 'Bedtime', 'With meals'];
const FREQUENCIES = ['Daily', 'Twice daily', 'Three times daily', 'As needed', 'Weekly'];

export default function AddMedicationPage() {
  const router = useRouter();
  const addMedication = useHealthStore((state) => state.addMedication);

  const [name, setName] = useState('');
  const [dose, setDose] = useState('');
  const [instructions, setInstructions] = useState('');
  const [frequency, setFrequency] = useState('Daily');
  const [timeOfDay, setTimeOfDay] = useState('Morning');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || !dose.trim()) return;

    setIsSaving(true);
    await addMedication({
      name: name.trim(),
      dose: dose.trim(),
      instructions: instructions.trim() || undefined,
      frequency,
      time_of_day: timeOfDay,
      start_date: new Date(),
      active: true,
      refill_reminder_days: 7,
      current_refills: 0,
    });
    setIsSaving(false);
    router.push('/user/medications');
  };

  const isValid = name.trim() && dose.trim();

  return (
    <div className="flex flex-col gap-4 pt-4">
      {/* Header */}
      <header className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 rounded-xl text-[#6b6b6b] hover:bg-white hover:text-[#1a1a1a] transition-all"
          aria-label="Go back"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold text-[#1a1a1a]">Add Medication</h1>
      </header>

      {/* Content */}
      <Card>
        <CardContent className="flex flex-col gap-4 py-4">
          {/* Name & Dose side by side */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Medication Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Aspirin"
            />
            <Input
              label="Dose"
              value={dose}
              onChange={(e) => setDose(e.target.value)}
              placeholder="e.g., 100mg"
            />
          </div>

          <Input
            label="Instructions (optional)"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="e.g., Take with food"
          />

          <div>
            <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Frequency</label>
            <div className="flex flex-wrap gap-2">
              {FREQUENCIES.map((freq) => (
                <button
                  key={freq}
                  type="button"
                  onClick={() => setFrequency(freq)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    frequency === freq
                      ? 'bg-[#4a9d94] text-white shadow-[0_2px_8px_rgba(74,157,148,0.25)]'
                      : 'bg-[#f5f0e8] text-[#6b6b6b] hover:bg-[#ebe5db]'
                  }`}
                >
                  {freq}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Time of Day</label>
            <div className="flex flex-wrap gap-2">
              {TIMES_OF_DAY.map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setTimeOfDay(time)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    timeOfDay === time
                      ? 'bg-[#4a9d94] text-white shadow-[0_2px_8px_rgba(74,157,148,0.25)]'
                      : 'bg-[#f5f0e8] text-[#6b6b6b] hover:bg-[#ebe5db]'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          <Button onClick={handleSave} disabled={!isValid || isSaving} className="w-full mt-2">
            {isSaving ? 'Saving...' : 'Add Medication'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
