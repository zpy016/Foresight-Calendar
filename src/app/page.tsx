import { prisma } from '@/lib/db/prisma';
import CalendarClient from '@/components/calendar/CalendarClient';

export default async function HomePage() {
  // Fetch all events from the database
  const events = await prisma.event.findMany({
    orderBy: { date: 'asc' },
  });

  // Serialize events for client component
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

  // Extract unique companies for filter
  const companySet = new Set<string>();
  events.forEach((event) => {
    try {
      const companies = JSON.parse(event.company || '[]') as string[];
      companies.forEach((c) => companySet.add(c));
    } catch {
      // ignore
    }
  });
  const uniqueCompanies = Array.from(companySet).sort();

  return (
    <CalendarClient 
      initialEvents={serializedEvents} 
      uniqueCompanies={uniqueCompanies}
    />
  );
}
