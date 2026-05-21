'use client';

import { useState, useMemo } from 'react';
import { useFilterStore } from '@/lib/store';
import { CalendarEvent, parseCategory, parseCompany, getScoreFromLabel } from './types';
import FilterBar from './FilterBar';
import CalendarGrid from './CalendarGrid';
import MobileCalendar from './MobileCalendar';
import EventDetailSheet from './EventDetailSheet';

interface CalendarClientProps {
  initialEvents: CalendarEvent[];
  uniqueCompanies: string[];
}

export default function CalendarClient({ initialEvents, uniqueCompanies }: CalendarClientProps) {
  const {
    activeCategory,
    selectedCompanies,
    minScore,
    currentYear,
    currentMonth,
  } = useFilterStore();

  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const filteredEvents = useMemo(() => {
    return initialEvents.filter((event) => {
      if (activeCategory !== 'all') {
        const cats = parseCategory(event.category);
        if (!cats.includes(activeCategory)) return false;
      }
      if (selectedCompanies.length > 0) {
        const companies = parseCompany(event.company);
        if (!selectedCompanies.some((sc) => companies.includes(sc))) return false;
      }
      if (minScore > 1) {
        const score = getScoreFromLabel(event.aiRecommend);
        if (score < minScore) return false;
      }
      return true;
    });
  }, [initialEvents, activeCategory, selectedCompanies, minScore]);

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setDetailOpen(true);
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header with all filters */}
      <header className="flex-shrink-0 border-b border-border bg-background">
        <FilterBar uniqueCompanies={uniqueCompanies} />
      </header>

      {/* Calendar - takes remaining space */}
      <main className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full max-w-[1400px] mx-auto px-4 py-2">
          {/* PC Grid */}
          <div className="hidden md:block h-full">
            <CalendarGrid
              events={filteredEvents}
              year={currentYear}
              month={currentMonth}
              onEventClick={handleEventClick}
            />
          </div>
          {/* Mobile */}
          <div className="md:hidden h-full overflow-y-auto">
            <MobileCalendar
              events={filteredEvents}
              year={currentYear}
              month={currentMonth}
              onEventClick={handleEventClick}
            />
          </div>
        </div>
      </main>

      {/* Event Detail */}
      <EventDetailSheet
        event={selectedEvent}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}
