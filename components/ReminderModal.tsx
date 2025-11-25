'use client';

import { useState } from 'react';
import { Modal, Button } from '@/components/ui';
import { useHealthStore } from '@/lib/stores/health-store';
import type { Medication } from '@/types';

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  medication: Medication;
}

export function ReminderModal({ isOpen, onClose, medication }: ReminderModalProps) {
  const logMedicationTaken = useHealthStore((state) => state.logMedicationTaken);
  const logMedicationSnoozed = useHealthStore((state) => state.logMedicationSnoozed);
  const [isLogging, setIsLogging] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleTaken = async () => {
    setIsLogging(true);
    await logMedicationTaken(medication.id);
    setIsLogging(false);
    setShowConfirmation(true);
    setTimeout(() => {
      setShowConfirmation(false);
      onClose();
    }, 1500);
  };

  const handleSnooze = async () => {
    setIsLogging(true);
    await logMedicationSnoozed(medication.id);
    setIsLogging(false);
    onClose();
  };

  if (showConfirmation) {
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-green-600 dark:text-green-400">Great job!</h2>
          <p className="text-gray-500 mt-2">Medication logged</p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
          <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold mb-2">Time for your medication</h2>
        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">{medication.name}</p>
        <p className="text-gray-500 mb-6">{medication.dose}</p>

        <div className="flex flex-col gap-3">
          <Button onClick={handleTaken} disabled={isLogging} className="w-full" size="lg">
            I Took It
          </Button>
          <Button onClick={handleSnooze} disabled={isLogging} variant="secondary" className="w-full">
            Snooze 10 min
          </Button>
          <Button onClick={onClose} variant="ghost" className="w-full text-gray-500">
            Dismiss
          </Button>
        </div>
      </div>
    </Modal>
  );
}
