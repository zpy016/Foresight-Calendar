'use client';

import { useState, useMemo } from 'react';
import { useFilterStore } from '@/lib/store';
import { CalendarEvent, parseCategory, parseCompany, getScoreFromLabel } from './types';
import FilterBar from './FilterBar';
import TimelineView from './TimelineView';
import EventDetailSheet from './EventDetailSheet';

interface TimelineClientProps {
  initialEvents: CalendarEvent[];
  uniqueCompanies: string[];
}

export default function TimelineClient({ initialEvents, uniqueCompanies }: TimelineClientProps) {
  const {
    activeCategory,
    selectedCompanies,
    minScore,
  } = useFilterStore();

  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [timelineBrand, setTimelineBrand] = useState<string | null>(null);

  // Events filtered for timeline view
  const filteredEvents = useMemo(() => {
    let result = initialEvents;

    // If a brand is selected for timeline view, filter by that brand first
    if (timelineBrand) {
      result = result.filter((event) => {
        const companies = parseCompany(event.company);
        return companies.includes(timelineBrand);
      });
    }

    // Apply additional filters
    result = result.filter((event) => {
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

    // Sort by date (ascending)
    return result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [initialEvents, timelineBrand, activeCategory, selectedCompanies, minScore]);

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setDetailOpen(true);
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header with all filters */}
      <header className="flex-shrink-0 border-b border-border bg-background">
        <FilterBar uniqueCompanies={uniqueCompanies} showYearNav />
      </header>

      {/* Timeline - takes remaining space */}
      <main className="flex-1 min-h-0 overflow-hidden">
        <TimelineView
          events={filteredEvents}
          timelineBrand={timelineBrand}
          onBrandChange={setTimelineBrand}
          uniqueCompanies={uniqueCompanies}
          onEventClick={handleEventClick}
        />
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
