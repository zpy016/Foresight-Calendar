import { PrismaClient } from '@prisma/client';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

async function main() {
  const events = await prisma.event.findMany({
    orderBy: { date: 'asc' },
  });

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

  const data = {
    events: events.map((event) => ({
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
    })),
    uniqueCompanies,
  };

  const dataDir = join(process.cwd(), 'public', 'data');
  mkdirSync(dataDir, { recursive: true });

  const outputPath = join(dataDir, 'events.json');
  writeFileSync(outputPath, JSON.stringify(data, null, 2));

  console.log(`✅ Exported ${events.length} events to ${outputPath}`);
  console.log(`   Unique companies: ${uniqueCompanies.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
