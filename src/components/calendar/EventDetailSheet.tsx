'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { CalendarEvent, parseCategory, parseCompany, getScoreFromLabel } from './types';
import { MapPin, Clock, Calendar, Link as LinkIcon, Building2, Tag } from 'lucide-react';

interface EventDetailSheetProps {
  event: CalendarEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EventDetailSheet({ event, open, onOpenChange }: EventDetailSheetProps) {
  if (!event) return null;

  const categories = parseCategory(event.category);
  const companies = parseCompany(event.company);
  const score = getScoreFromLabel(event.aiRecommend);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto px-6">
        <SheetHeader className="space-y-4">
          <SheetTitle className="text-lg leading-relaxed pr-4">
            {event.name}
          </SheetTitle>
          <SheetDescription className="sr-only">
            事件详情
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-5">
          {/* Date & Time */}
          <div className="flex items-start gap-3">
            <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-sm font-medium text-gray-900">
                {new Date(event.date).toLocaleDateString('zh-CN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long',
                })}
              </div>
              {event.time && (
                <div className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3" />
                  {event.time}
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          {(event.country || event.city || event.location) && (
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-gray-700">
                {[event.country, event.city, event.location].filter(Boolean).join(' · ')}
                {event.eventType === '线上' && (
                  <Badge variant="secondary" className="ml-2 text-xs">线上</Badge>
                )}
                {event.eventType === '线下' && (
                  <Badge variant="secondary" className="ml-2 text-xs">线下</Badge>
                )}
              </div>
            </div>
          )}

          {/* Companies */}
          {companies.length > 0 && (
            <div className="flex items-start gap-3">
              <Building2 className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="flex flex-wrap gap-1.5">
                {companies.map((company) => (
                  <Badge key={company} variant="outline" className="text-xs">
                    {company}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Categories */}
          {categories.length > 0 && (
            <div className="flex items-start gap-3">
              <Tag className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => (
                  <Badge key={cat} variant="secondary" className="text-xs">
                    {cat}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* AI Recommend Score */}
          {event.aiRecommend && (
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-500">AI推荐:</div>
              <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                score >= 4 ? 'bg-red-50 text-red-700' :
                score >= 3 ? 'bg-amber-50 text-amber-700' :
                score >= 2 ? 'bg-blue-50 text-blue-700' :
                'bg-gray-50 text-gray-600'
              }`}>
                {event.aiRecommend}
              </div>
            </div>
          )}

          {/* Links */}
          {event.link && (
            <div className="flex items-center gap-3">
              <LinkIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <a
                href={event.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline truncate"
              >
                {event.link}
              </a>
            </div>
          )}

          {/* Summary */}
          {event.summary && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">一句话总结</div>
              <div className="text-sm text-gray-800">{event.summary}</div>
            </div>
          )}

          {/* Description */}
          {event.description && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">详细描述</div>
              <div className="text-sm text-gray-800 whitespace-pre-wrap">{event.description}</div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
