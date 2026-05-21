'use client';

import { useMemo } from 'react';
import { CalendarEvent, parseCategory, parseCompany, getCategoryColor, getFirstCategory, getScoreFromLabel } from './types';
import { MapPin, Clock, Calendar, Star, ArrowLeft, Factory } from 'lucide-react';

interface TimelineViewProps {
  events: CalendarEvent[];
  timelineBrand: string | null;
  onBrandChange: (brand: string | null) => void;
  uniqueCompanies: string[];
  onEventClick: (event: CalendarEvent) => void;
}

const MONTH_NAMES = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

const TIER_1_AUTO = new Set(['蔚来', '小鹏', '理想', '小米', '小米汽车', '极氪', '零跑', '长安', '华为', '鸿蒙智行', '赛力斯', '阿维塔']);
const TIER_2_AUTO = new Set(['比亚迪', '吉利', '奇瑞']);

function normalizeCompany(c: string): string {
  return c.replace(/\ufeff/g, '').replace(/\u200b/g, '').trim();
}

function getScoreLabel(score: number): string {
  switch (score) {
    case 5: return '强烈推荐';
    case 4: return '推荐关注';
    case 3: return '值得知晓';
    case 2: return '了解即可';
    case 1: return '参考';
    default: return '';
  }
}

function getScoreBadgeClass(score: number, isDark: boolean): string {
  if (score >= 5) return isDark ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-amber-50 text-amber-700 border-amber-200';
  if (score >= 4) return isDark ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (score >= 3) return isDark ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'bg-blue-50 text-blue-700 border-blue-200';
  return isDark ? 'bg-slate-500/20 text-slate-400 border-slate-500/30' : 'bg-slate-50 text-slate-600 border-slate-200';
}

function categorizeCompanies(companies: string[]) {
  const autoTier1: string[] = [];
  const autoTier2: string[] = [];
  const autoOther: string[] = [];
  const tech: string[] = [];
  const other: string[] = [];

  for (const company of companies) {
    const normalized = normalizeCompany(company);
    if (TIER_1_AUTO.has(normalized) || TIER_1_AUTO.has(company)) {
      autoTier1.push(company);
    } else if (TIER_2_AUTO.has(normalized) || TIER_2_AUTO.has(company)) {
      autoTier2.push(company);
    } else if (
      ['上汽', '广汽', '东风', '北汽', '一汽', '长城', '五菱', '领克', '大众', '宝马', '奥迪', '保时捷', '莲花', '别克', '岚图', '特斯拉', '沃尔沃', '日产', '江汽', '乐道', '智己', '凯迪拉克', '雷克萨斯', 'Smart', '京东汽车'].some(k => normalized.includes(k))
    ) {
      autoOther.push(company);
    } else if (
      ['英伟达', '谷歌', '百度', '字节', 'AMD', '高通', '科大讯飞', '地平线', 'Mobileye', '智元', '阿里', '腾讯'].some(k => normalized.includes(k))
    ) {
      tech.push(company);
    } else {
      other.push(company);
    }
  }

  return { autoTier1, autoTier2, autoOther, tech, other };
}

export default function TimelineView({
  events,
  timelineBrand,
  onBrandChange,
  uniqueCompanies,
  onEventClick,
}: TimelineViewProps) {
  // Count events per company
  const companyEventCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    // We need to count from all initial events, not filtered ones
    // But we don't have access to initial events here.
    // For now, count from the passed events (which may be filtered)
    for (const event of events) {
      const companies = parseCompany(event.company);
      for (const c of companies) {
        counts[c] = (counts[c] || 0) + 1;
      }
    }
    return counts;
  }, [events]);

  // Group events by month for display
  const groupedEvents = useMemo(() => {
    if (!timelineBrand) return [];
    const months: { month: number; year: number; events: CalendarEvent[] }[] = [];
    for (const event of events) {
      const date = new Date(event.date);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const existing = months.find((m) => m.month === month && m.year === year);
      if (existing) {
        existing.events.push(event);
      } else {
        months.push({ month, year, events: [event] });
      }
    }
    return months.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });
  }, [events, timelineBrand]);

  // Brand selector view
  if (!timelineBrand) {
    const { autoTier1, autoTier2, autoOther, tech, other } = categorizeCompanies(uniqueCompanies);

    const renderGroup = (title: string, icon: string, companies: string[]) => {
      if (companies.length === 0) return null;
      return (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <span>{icon}</span>
            {title}
          </h3>
          <div className="flex flex-wrap gap-2">
            {companies.map((company) => {
              const count = companyEventCounts[company] || 0;
              return (
                <button
                  key={company}
                  onClick={() => onBrandChange(company)}
                  className="px-4 py-2.5 rounded-xl bg-card border border-border text-sm font-medium
                             hover:border-primary hover:bg-primary/5 hover:text-primary
                             transition-all duration-200 text-foreground flex items-center gap-2"
                >
                  <Factory className="w-3.5 h-3.5 text-muted-foreground" />
                  {company}
                  {count > 0 && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      );
    };

    return (
      <div className="h-full overflow-y-auto px-4 sm:px-6 py-8 bg-background">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">品牌时间线</h2>
            <p className="text-muted-foreground">选择一个品牌，查看其今年以来的所有大事件</p>
          </div>

          {renderGroup('核心车企', '🔥', autoTier1)}
          {renderGroup('重点车企', '⭐', autoTier2)}
          {renderGroup('其他车企', '🚗', autoOther)}
          {renderGroup('科技公司', '💻', tech)}
          {renderGroup('其他', '📦', other)}
        </div>
      </div>
    );
  }

  // Timeline view for selected brand
  const totalEvents = events.length;
  const dateRange = useMemo(() => {
    if (events.length === 0) return null;
    const dates = events.map((e) => new Date(e.date));
    const min = new Date(Math.min(...dates.map((d) => d.getTime())));
    const max = new Date(Math.max(...dates.map((d) => d.getTime())));
    return {
      start: `${min.getFullYear()}年${min.getMonth() + 1}月`,
      end: `${max.getFullYear()}年${max.getMonth() + 1}月`,
    };
  }, [events]);

  return (
    <div className="h-full overflow-y-auto px-4 sm:px-6 py-6 bg-background">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onBrandChange(null)}
              className="w-9 h-9 rounded-xl bg-secondary border border-border flex items-center justify-center
                         hover:bg-primary hover:text-primary-foreground hover:border-primary
                         transition-all duration-200 shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-xl font-bold text-foreground">{timelineBrand}</h2>
              <p className="text-sm text-muted-foreground">
                共 <span className="font-medium text-foreground">{totalEvents}</span> 个事件
                {dateRange && (
                  <span> · {dateRange.start} - {dateRange.end}</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {events.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center">
              <Calendar className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-sm">该品牌暂无事件</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {groupedEvents.map(({ month, year, events: monthEvents }) => (
              <div key={`${year}-${month}`}>
                {/* Month header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                    {month}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">
                      {year}年 {MONTH_NAMES[month - 1]}
                    </h3>
                    <span className="text-xs text-muted-foreground">{monthEvents.length} 个事件</span>
                  </div>
                  <div className="flex-1 h-px bg-border ml-2" />
                </div>

                {/* Events grid - dual column on wide screens */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {monthEvents.map((event) => {
                    const categories = parseCategory(event.category);
                    const score = getScoreFromLabel(event.aiRecommend);
                    const date = new Date(event.date);
                    const day = date.getDate();
                    const weekday = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()];

                    return (
                      <button
                        key={event.id}
                        onClick={() => onEventClick(event)}
                        className="text-left bg-card rounded-xl border border-border p-4 shadow-sm
                                   hover:shadow-md hover:border-primary/30 transition-all duration-200 active:scale-[0.99]"
                      >
                        <div className="flex items-start gap-3">
                          {/* Date block */}
                          <div className="flex-shrink-0 text-center min-w-[48px]">
                            <div className="text-xl font-bold text-foreground leading-none">{day}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{weekday}</div>
                            {event.time && (
                              <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center justify-center gap-0.5">
                                <Clock className="w-2.5 h-2.5" />
                                {event.time}
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="text-sm font-medium text-foreground leading-snug">
                                {event.name}
                              </h4>
                            </div>

                            {/* Meta info */}
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              {/* Category */}
                              <span className={`w-1.5 h-1.5 rounded-full ${getCategoryColor(event.category)}`} />
                              <span className="text-xs text-muted-foreground">{getFirstCategory(event.category)}</span>

                              {/* Score */}
                              {score > 0 && (
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${getScoreBadgeClass(score, false)}`}>
                                  <Star className="w-2.5 h-2.5 inline mr-0.5" />
                                  {score}分 · {getScoreLabel(score)}
                                </span>
                              )}

                              {/* Event type */}
                              {event.eventType && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                                  {event.eventType}
                                </span>
                              )}
                            </div>

                            {/* Location */}
                            {(event.city || event.country) && (
                              <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
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
    </div>
  );
}
