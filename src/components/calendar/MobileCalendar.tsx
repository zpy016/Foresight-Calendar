'use client';

import { useMemo, useRef } from 'react';
import { CalendarEvent, parseCompany, getCategoryColor, getFirstCategory } from './types';

interface MobileCalendarProps {
  events: CalendarEvent[];
  year: number;
  month: number;
  onEventClick: (event: CalendarEvent) => void;
}

const WEEKDAYS_SHORT = ['日', '一', '二', '三', '四', '五', '六'];

export default function MobileCalendar({ events, year, month, onEventClick }: MobileCalendarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const { daysInMonth, firstDayOfWeek, today } = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    return {
      daysInMonth: lastDay.getDate(),
      firstDayOfWeek: firstDay.getDay(),
      today: new Date(),
    };
  }, [year, month]);

  const eventsByDay = useMemo(() => {
    const map: Record<number, CalendarEvent[]> = {};
    events.forEach((event) => {
      const date = new Date(event.date);
      if (date.getFullYear() === year && date.getMonth() + 1 === month) {
        const day = date.getDate();
        if (!map[day]) map[day] = [];
        map[day].push(event);
      }
    });
    return map;
  }, [events, year, month]);

  const isToday = (day: number) => {
    return (
      today.getFullYear() === year &&
      today.getMonth() + 1 === month &&
      today.getDate() === day
    );
  };

  const hasEvents = (day: number) => (eventsByDay[day] || []).length > 0;

  // Generate day buttons for the scrollable row
  const dayButtons = [];
  for (let day = 1; day <= daysInMonth; day++) {
    dayButtons.push(
      <button
        key={day}
        className={`flex flex-col items-center justify-center min-w-[48px] h-14 rounded-xl transition-colors ${
          isToday(day)
            ? 'bg-primary text-primary-foreground'
            : hasEvents(day)
            ? 'bg-secondary text-foreground'
            : 'text-muted-foreground'
        }`}
      >
        <span className="text-xs">{WEEKDAYS_SHORT[(firstDayOfWeek + day - 1) % 7]}</span>
        <span className="text-sm font-semibold">{day}</span>
        {hasEvents(day) && !isToday(day) && (
          <span className="w-1 h-1 rounded-full bg-primary mt-0.5" />
        )}
      </button>
    );
  }

  // Flatten all events for the timeline
  const timelineEvents = useMemo(() => {
    const result: { day: number; events: CalendarEvent[] }[] = [];
    for (let day = 1; day <= daysInMonth; day++) {
      if (eventsByDay[day]) {
        result.push({ day, events: eventsByDay[day] });
      }
    }
    return result;
  }, [eventsByDay, daysInMonth]);

  return (
    <div className="md:hidden">
      {/* Scrollable day selector */}
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-hide"
        style={{ scrollbarWidth: 'none' }}
      >
        {dayButtons}
      </div>

      {/* Timeline list */}
      <div className="px-4 pb-8 space-y-6">
        {timelineEvents.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            本月暂无事件
          </div>
        ) : (
          timelineEvents.map(({ day, events }) => (
            <div key={day}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                  {day}
                </div>
                <div className="text-xs text-muted-foreground">
                  {WEEKDAYS_SHORT[(firstDayOfWeek + day - 1) % 7]}
                </div>
                <div className="flex-1 h-px bg-border" />
              </div>
              <div className="space-y-2 pl-11">
                {events.map((event) => {
                  const companies = parseCompany(event.company);
                  return (
                    <button
                      key={event.id}
                      onClick={() => onEventClick(event)}
                      className="w-full text-left bg-card border border-border rounded-xl p-3 shadow-sm active:scale-[0.98] transition-transform"
                    >
                      <div className="flex items-start gap-2">
                        <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${getCategoryColor(event.category)}`} />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-foreground leading-snug">
                            {event.name}
                          </div>
                          <div className="flex items-center gap-2 mt-1.5">
                            {event.time && (
                              <span className="text-xs text-muted-foreground">{event.time}</span>
                            )}
                            {companies[0] && (
                              <span className="text-xs text-muted-foreground">{companies[0]}</span>
                            )}
                            <span className="text-xs px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                              {getFirstCategory(event.category)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
