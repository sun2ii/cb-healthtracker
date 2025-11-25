'use client';

import { useMemo, useState } from 'react';
import { useHealthStore } from '@/lib/stores/health-store';
import { Card, CardContent } from '@/components/ui';
import { format, isToday, isYesterday } from 'date-fns';

type ActivityItem = {
  id: string;
  type: 'medication' | 'checkin';
  title: string;
  subtitle: string;
  timestamp: Date;
  status: 'positive' | 'neutral' | 'warning';
};

type DayGroup = {
  date: string;
  displayDate: string;
  items: ActivityItem[];
  medsTaken: number;
  medsTotal: number;
  checkInStatus: 'ok' | 'not-ok' | null;
};

function formatDateHeader(date: Date): string {
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'EEEE, MMMM d');
}

function formatTime(date: Date): string {
  return format(date, 'h:mm a');
}

const DAYS_PER_PAGE = 4;

export default function ActivityPage() {
  const medications = useHealthStore((state) => state.medications);
  const medicationLogs = useHealthStore((state) => state.medicationLogs);
  const checkIns = useHealthStore((state) => state.checkIns);
  const [selectedDay, setSelectedDay] = useState<DayGroup | null>(null);
  const [page, setPage] = useState(0);

  const dayGroups = useMemo(() => {
    const groups: Map<string, DayGroup> = new Map();

    // Process medication logs
    medicationLogs.forEach((log) => {
      const med = medications.find((m) => m.id === log.medication_id);
      const dateKey = format(new Date(log.taken_at), 'yyyy-MM-dd');

      if (!groups.has(dateKey)) {
        groups.set(dateKey, {
          date: dateKey,
          displayDate: formatDateHeader(new Date(log.taken_at)),
          items: [],
          medsTaken: 0,
          medsTotal: 0,
          checkInStatus: null,
        });
      }

      const group = groups.get(dateKey)!;
      group.items.push({
        id: log.id,
        type: 'medication',
        title: med?.name || 'Unknown medication',
        subtitle: log.status === 'taken' ? 'Taken' : log.status === 'snoozed' ? 'Snoozed' : log.status,
        timestamp: new Date(log.taken_at),
        status: log.status === 'taken' ? 'positive' : log.status === 'snoozed' ? 'neutral' : 'warning',
      });

      if (log.status === 'taken') {
        group.medsTaken++;
      }
      group.medsTotal++;
    });

    // Process check-ins
    checkIns.forEach((checkIn) => {
      const dateKey = format(new Date(checkIn.date), 'yyyy-MM-dd');

      if (!groups.has(dateKey)) {
        groups.set(dateKey, {
          date: dateKey,
          displayDate: formatDateHeader(new Date(checkIn.date)),
          items: [],
          medsTaken: 0,
          medsTotal: 0,
          checkInStatus: null,
        });
      }

      const group = groups.get(dateKey)!;
      group.checkInStatus = checkIn.status;
      group.items.push({
        id: checkIn.id,
        type: 'checkin',
        title: 'Daily Check-in',
        subtitle: checkIn.status === 'ok' ? 'Feeling good' : 'Not feeling great',
        timestamp: new Date(checkIn.date),
        status: checkIn.status === 'ok' ? 'positive' : 'warning',
      });
    });

    // Sort items within each group and sort groups by date descending
    return Array.from(groups.values())
      .map(group => ({
        ...group,
        items: group.items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      }))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [medications, medicationLogs, checkIns]);

  const getStatusStyles = (status: ActivityItem['status']) => {
    switch (status) {
      case 'positive':
        return 'bg-[#4a9d94]/10 text-[#4a9d94]';
      case 'warning':
        return 'bg-[#e5a84b]/10 text-[#e5a84b]';
      default:
        return 'bg-[#f5f0e8] text-[#6b6b6b]';
    }
  };

  const getIcon = (type: ActivityItem['type'], status: ActivityItem['status']) => {
    if (type === 'checkin') {
      return status === 'positive' ? '😊' : '😔';
    }
    return '💊';
  };

  const totalPages = Math.ceil(dayGroups.length / DAYS_PER_PAGE);
  const paginatedGroups = dayGroups.slice(page * DAYS_PER_PAGE, (page + 1) * DAYS_PER_PAGE);

  return (
    <div className="h-full flex flex-col gap-4 pt-4">
      {/* Header */}
      <header className="flex-shrink-0">
        <h1 className="text-2xl font-bold text-[#1a1a1a]">Activity</h1>
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col gap-3">
        {dayGroups.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-[#4a9d94]/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-[#4a9d94]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-[#6b6b6b] text-lg mb-2">No activity yet</p>
              <p className="text-[#9a9a9a]">Check in or take your medications to see activity here</p>
            </CardContent>
          </Card>
        ) : (
          paginatedGroups.map((group) => (
            <Card key={group.date}>
              <button
                onClick={() => setSelectedDay(group)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    group.checkInStatus === 'ok' ? 'bg-[#4a9d94]/10' :
                    group.checkInStatus === 'not-ok' ? 'bg-[#e5a84b]/10' : 'bg-gray-100'
                  }`}>
                    {group.checkInStatus ? (
                      <span className="text-lg">{group.checkInStatus === 'ok' ? '😊' : '😔'}</span>
                    ) : (
                      <span className="text-lg">📋</span>
                    )}
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-[#1a1a1a]">{group.displayDate}</p>
                    <p className="text-sm text-[#6b6b6b]">
                      {group.medsTotal > 0 && (
                        <span className={group.medsTaken === group.medsTotal ? 'text-[#4a9d94]' : ''}>
                          {group.medsTaken}/{group.medsTotal} meds taken
                        </span>
                      )}
                      {group.medsTotal > 0 && group.checkInStatus && ' • '}
                      {group.checkInStatus && (
                        <span className={group.checkInStatus === 'ok' ? 'text-[#4a9d94]' : 'text-[#e5a84b]'}>
                          {group.checkInStatus === 'ok' ? 'Feeling good' : 'Not great'}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-[#9a9a9a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 flex-shrink-0 pb-2">
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

      {/* Day Detail Modal */}
      {selectedDay && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  selectedDay.checkInStatus === 'ok' ? 'bg-[#4a9d94]/10' :
                  selectedDay.checkInStatus === 'not-ok' ? 'bg-[#e5a84b]/10' : 'bg-gray-100'
                }`}>
                  {selectedDay.checkInStatus ? (
                    <span className="text-lg">{selectedDay.checkInStatus === 'ok' ? '😊' : '😔'}</span>
                  ) : (
                    <span className="text-lg">📋</span>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-[#1a1a1a]">{selectedDay.displayDate}</p>
                  <p className="text-sm text-[#6b6b6b]">
                    {selectedDay.medsTotal > 0 && `${selectedDay.medsTaken}/${selectedDay.medsTotal} meds`}
                    {selectedDay.medsTotal > 0 && selectedDay.checkInStatus && ' • '}
                    {selectedDay.checkInStatus && (selectedDay.checkInStatus === 'ok' ? 'Feeling good' : 'Not great')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDay(null)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5 text-[#6b6b6b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex flex-col gap-2">
                {selectedDay.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-50"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getStatusStyles(item.status)}`}>
                      {getIcon(item.type, item.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[#1a1a1a]">{item.title}</p>
                      <p className="text-sm text-[#6b6b6b]">{item.subtitle}</p>
                    </div>
                    <p className="text-sm text-[#9a9a9a]">{formatTime(item.timestamp)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
