import { readFileSync } from 'fs';
import { join } from 'path';
import TimelineClient from '@/components/calendar/TimelineClient';

interface EventData {
  id: string;
  recordId: string;
  name: string;
  date: string;
  time: string | null;
  weekday: string | null;
  eventType: string;
  category: string;
  company: string;
  aiRecommend: string | null;
  importance: string | null;
  country: string | null;
  city: string | null;
  location: string | null;
  link: string | null;
  infoLink: string | null;
  summary: string | null;
  description: string | null;
}

export default function TimelinePage() {
  const dataPath = join(process.cwd(), 'public', 'data', 'events.json');
  const raw = readFileSync(dataPath, 'utf-8');
  const data = JSON.parse(raw) as { events: EventData[]; uniqueCompanies: string[] };

  return (
    <TimelineClient
      initialEvents={data.events}
      uniqueCompanies={data.uniqueCompanies}
    />
  );
}
