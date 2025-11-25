'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useHealthStore } from '@/lib/stores/health-store';
import { Button, Card, CardContent } from '@/components/ui';

const ITEMS_PER_PAGE = 3;

export default function MedicationsPage() {
  const medications = useHealthStore((state) => state.medications);
  const deleteMedication = useHealthStore((state) => state.deleteMedication);
  const [page, setPage] = useState(0);

  const activeMeds = medications.filter((m) => m.active);
  const inactiveMeds = medications.filter((m) => !m.active);
  const allMeds = [...activeMeds, ...inactiveMeds];

  const totalPages = Math.max(1, Math.ceil(allMeds.length / ITEMS_PER_PAGE));

  // Reset page if current page is out of bounds (e.g., after deleting items)
  useEffect(() => {
    if (page >= totalPages) {
      setPage(Math.max(0, totalPages - 1));
    }
  }, [page, totalPages]);
  const paginatedMeds = allMeds.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  return (
    <div className="h-full flex flex-col gap-4 pt-4">
      {/* Header */}
      <header className="flex items-center justify-between flex-shrink-0">
        <h1 className="text-2xl font-bold text-[#1a1a1a]">Medications</h1>
        <Link href="/user/medications/add">
          <Button size="sm">Add New</Button>
        </Link>
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col gap-3">
        {medications.length === 0 ? (
          <Card>
            <CardContent className="text-center py-10">
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-[#4a9d94]/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-[#4a9d94]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <p className="text-[#6b6b6b] text-lg mb-5">No medications added yet</p>
              <Link href="/user/medications/add">
                <Button>Add Your First Medication</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            {paginatedMeds.map((med) => (
              <Card key={med.id} className={!med.active ? 'opacity-60' : ''}>
                <CardContent className="py-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-[#1a1a1a]">{med.name}</h3>
                      <p className="text-[#6b6b6b] text-sm">{med.dose}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-[#9a9a9a] bg-[#f5f0e8] px-2 py-0.5 rounded-full">
                          {med.frequency}
                        </span>
                        <span className="text-xs text-[#4a9d94] bg-[#4a9d94]/10 px-2 py-0.5 rounded-full">
                          {med.time_of_day}
                        </span>
                        {!med.active && (
                          <span className="text-xs text-[#9a9a9a] bg-gray-100 px-2 py-0.5 rounded-full">
                            Inactive
                          </span>
                        )}
                      </div>
                      {med.instructions && (
                        <p className="text-xs text-[#9a9a9a] mt-2">{med.instructions}</p>
                      )}
                    </div>
                    <button
                      onClick={() => deleteMedication(med.id)}
                      className="p-2 text-[#9a9a9a] hover:text-[#d94f4f] transition-colors rounded-xl hover:bg-[#d94f4f]/10"
                      aria-label="Delete medication"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 flex-shrink-0">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="p-2 rounded-lg text-[#6b6b6b] hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-sm text-[#6b6b6b]">
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="p-2 rounded-lg text-[#6b6b6b] hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
