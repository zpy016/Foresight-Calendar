import { prisma } from '@/lib/db/prisma';
import TimelineClient from '@/components/calendar/TimelineClient';

export default async function TimelinePage() {
  const events = await prisma.event.findMany({
    orderBy: { date: 'asc' },
  });

  const serializedEvents = events.map((event) => ({
    id: event.id,
    recordId: event.recordId,
    name: event.name,
    date: event.date.toISOString(),
    time: event.time,
    weekday: event.weekday,
    eventType: event.eventType,
    category: event.category,
    company: event.company,
    aiRecommend: event.aiRecommend,
    importance: event.importance,
    country: event.country,
    city: event.city,
    location: event.location,
    link: event.link,
    infoLink: event.infoLink,
    summary: event.summary,
    description: event.description,
  }));

  const companySet = new Set<string>();
  events.forEach((event) => {
    try {
      JSON.parse(event.company || '[]').forEach((c: string) => companySet.add(c));
    } catch {}
  });
  const uniqueCompanies = Array.from(companySet).sort();

  return (
    <TimelineClient
      initialEvents={serializedEvents}
      uniqueCompanies={uniqueCompanies}
    />
  );
}
