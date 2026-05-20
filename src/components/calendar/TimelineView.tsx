'use client';

import { useMemo } from 'react';
import { CalendarEvent, parseCategory, parseCompany, getCategoryColor, getFirstCategory, getScoreFromLabel } from './types';
import { MapPin, Clock, Calendar, Star } from 'lucide-react';

interface TimelineViewProps {
  events: CalendarEvent[];
  year: number;
  onEventClick: (event: CalendarEvent) => void;
}

const MONTH_NAMES = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

// Company colors for multi-company comparison
const COMPANY_COLORS = [
  'border-emerald-400 bg-emerald-50/50',
  'border-blue-400 bg-blue-50/50',
  'border-amber-400 bg-amber-50/50',
  'border-rose-400 bg-rose-50/50',
  'border-violet-400 bg-violet-50/50',
  'border-cyan-400 bg-cyan-50/50',
  'border-orange-400 bg-orange-50/50',
  'border-pink-400 bg-pink-50/50',
];

function getCompanyColor(company: string, index: number): string {
  return COMPANY_COLORS[index % COMPANY_COLORS.length];
}

export default function TimelineView({ events, year, onEventClick }: TimelineViewProps) {
  const groupedEvents = useMemo(() => {
    // Filter events for the selected year
    const yearEvents = events.filter((e) => new Date(e.date).getFullYear() === year);

    // Group by month
    const months: { month: number; events: CalendarEvent[] }[] = [];
    for (let m = 1; m <= 12; m++) {
      const monthEvents = yearEvents.filter((e) => new Date(e.date).getMonth() + 1 === m);
      if (monthEvents.length > 0) {
        months.push({ month: m, events: monthEvents });
      }
    }
    return months;
  }, [events, year]);

  // Build company color map for selected companies
  const companyColorMap = useMemo(() => {
    const allCompanies = new Set<string>();
    events.forEach((e) => {
      parseCompany(e.company).forEach((c) => allCompanies.add(c));
    });
    const map: Record<string, string> = {};
    Array.from(allCompanies).sort().forEach((c, i) => {
      map[c] = getCompanyColor(c, i);
    });
    return map;
  }, [events]);

  const totalEvents = groupedEvents.reduce((sum, m) => sum + m.events.length, 0);

  return (
    <div className="h-full overflow-y-auto px-4 py-6">
      {/* Summary header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{year}年 事件时间线</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            共 <span className="font-medium text-gray-700">{totalEvents}</span> 个事件
            {groupedEvents.length > 0 && (
              <span>，分布在 {groupedEvents.length} 个月</span>
            )}
          </p>
        </div>
      </div>

      {groupedEvents.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-gray-400">
          <div className="text-center">
            <Calendar className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">{year}年暂无事件</p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {groupedEvents.map(({ month, events }) => (
            <div key={month} className="relative">
              {/* Month header with timeline dot */}
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-bold shadow-sm">
                    {month}
                  </div>
                  {/* Timeline line */}
                  <div className="absolute top-10 left-1/2 -translate-x-1/2 w-0.5 h-[calc(100%+2rem)] bg-gray-200 -z-10" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">
                    {MONTH_NAMES[month - 1]}
                  </h3>
                  <span className="text-xs text-gray-400">{events.length} 个事件</span>
                </div>
              </div>

              {/* Events list */}
              <div className="ml-5 pl-8 space-y-3">
                {events.map((event) => {
                  const companies = parseCompany(event.company);
                  const categories = parseCategory(event.category);
                  const score = getScoreFromLabel(event.aiRecommend);
                  const date = new Date(event.date);
                  const day = date.getDate();
                  const weekday = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()];

                  // Determine card border color based on primary company
                  const primaryCompany = companies[0];
                  const companyBorderClass = primaryCompany ? companyColorMap[primaryCompany] || '' : '';

                  return (
                    <button
                      key={event.id}
                      onClick={() => onEventClick(event)}
                      className={`w-full text-left bg-white rounded-xl border p-4 shadow-sm hover:shadow-md transition-all active:scale-[0.99] ${
                        companyBorderClass || 'border-gray-100'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Date block */}
                        <div className="flex-shrink-0 text-center min-w-[48px]">
                          <div className="text-xl font-bold text-gray-900 leading-none">{day}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{weekday}</div>
                          {event.time && (
                            <div className="text-[10px] text-gray-400 mt-0.5 flex items-center justify-center gap-0.5">
                              <Clock className="w-2.5 h-2.5" />
                              {event.time}
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm font-medium text-gray-900 leading-snug">
                              {event.name}
                            </h4>
                            {score > 0 && (
                              <span className={`flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                                score >= 4 ? 'bg-red-50 text-red-600' :
                                score >= 3 ? 'bg-amber-50 text-amber-600' :
                                'bg-gray-50 text-gray-500'
                              }`}>
                                <Star className="w-2.5 h-2.5 inline mr-0.5" />
                                {score}
                              </span>
                            )}
                          </div>

                          {/* Meta info */}
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            {companies.slice(0, 3).map((company) => (
                              <span
                                key={company}
                                className="text-xs px-2 py-0.5 rounded-md bg-gray-100 text-gray-600"
                              >
                                {company}
                              </span>
                            ))}
                            {companies.length > 3 && (
                              <span className="text-xs text-gray-400">+{companies.length - 3}</span>
                            )}
                            <span className={`w-1.5 h-1.5 rounded-full ${getCategoryColor(event.category)}`} />
                            <span className="text-xs text-gray-400">{getFirstCategory(event.category)}</span>
                          </div>

                          {/* Location */}
                          {(event.city || event.country) && (
                            <div className="flex items-center gap-1 mt-1.5 text-xs text-gray-400">
                              <MapPin className="w-3 h-3" />
                              {[event.country, event.city, event.location].filter(Boolean).join(' · ')}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
