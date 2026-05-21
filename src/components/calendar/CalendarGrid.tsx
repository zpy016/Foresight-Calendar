'use client';

import { useMemo } from 'react';
import { CalendarEvent, parseCategory, getCategoryColor, getFirstCategory } from './types';

interface CalendarGridProps {
  events: CalendarEvent[];
  year: number;
  month: number;
  onEventClick: (event: CalendarEvent) => void;
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

export default function CalendarGrid({ events, year, month, onEventClick }: CalendarGridProps) {
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const startOffset = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    const prevMonthLastDay = new Date(year, month - 1, 0).getDate();
    const days: { date: number; isCurrentMonth: boolean; events: CalendarEvent[] }[] = [];
    
    // Previous month padding
    for (let i = startOffset - 1; i >= 0; i--) {
      days.push({ date: prevMonthLastDay - i, isCurrentMonth: false, events: [] });
    }
    
    // Current month
    const eventsByDay: Record<number, CalendarEvent[]> = {};
    events.forEach((event) => {
      const eventDate = new Date(event.date);
      if (eventDate.getFullYear() === year && eventDate.getMonth() + 1 === month) {
        const day = eventDate.getDate();
        if (!eventsByDay[day]) eventsByDay[day] = [];
        eventsByDay[day].push(event);
      }
    });
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({ date: day, isCurrentMonth: true, events: eventsByDay[day] || [] });
    }
    
    // Next month padding to fill 6 rows (42 cells)
    const remaining = 42 - days.length;
    for (let day = 1; day <= remaining; day++) {
      days.push({ date: day, isCurrentMonth: false, events: [] });
    }
    
    return days;
  }, [events, year, month]);

  const isToday = (day: number) => {
    const today = new Date();
    return today.getFullYear() === year && today.getMonth() + 1 === month && today.getDate() === day;
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-border">
        {WEEKDAYS.map((day) => (
          <div key={day} className="py-3 text-center text-sm font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 grid-rows-6 flex-1">
        {calendarDays.map((day, index) => (
          <div
            key={index}
            className={`border-b border-r border-border p-2 flex flex-col min-h-0 ${
              day.isCurrentMonth ? 'bg-card' : 'bg-muted/50'
            }`}
          >
            <div className={`text-sm font-medium mb-1 ${
              day.isCurrentMonth ? 'text-foreground' : 'text-muted-foreground/50'
            } ${isToday(day.date) && day.isCurrentMonth ? 'bg-primary text-primary-foreground w-7 h-7 rounded-full flex items-center justify-center' : ''}`}>
              {day.date}
            </div>
            <div className="space-y-1 overflow-y-auto min-h-0 flex-1">
              {day.events.slice(0, 3).map((event) => {
                const companies = JSON.parse(event.company || '[]');
                const companyLabel = companies[0] || '';
                return (
                  <button
                    key={event.id}
                    onClick={() => onEventClick(event)}
                    className="w-full text-left text-xs truncate hover:bg-secondary rounded px-1 py-0.5 transition-colors flex items-center gap-1"
                    title={`${event.name}${event.time ? ` · ${event.time}` : ''}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${getCategoryColor(event.category)}`} />
                    <span className="truncate text-foreground/80">{event.name}</span>
                    {event.time && (
                      <span className="text-muted-foreground flex-shrink-0 ml-auto text-[10px]">{event.time}</span>
                    )}
                  </button>
                );
              })}
              {day.events.length > 3 && (
                <div className="text-xs text-muted-foreground px-1">
                  +{day.events.length - 3} 更多
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
