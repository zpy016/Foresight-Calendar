import { PrismaClient } from '@prisma/client';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

/** Remove invisible garbage characters from text */
function sanitize(str: string | null): string | null {
  if (!str) return str;
  return str
    .replace(/\ufeff/g, '')   // zero-width no-break space
    .replace(/\u200b/g, '')   // zero-width space
    .replace(/\ufffc/g, '')   // object replacement character (box with OBJ)
    .trim();
}

async function main() {
  const events = await prisma.event.findMany({
    orderBy: { date: 'asc' },
  });

  const companySet = new Set<string>();
  events.forEach((event) => {
    try {
      const raw = event.company || '[]';
      const cleaned = raw.replace(/\ufffc/g, '');
      const companies = JSON.parse(cleaned) as string[];
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
      name: sanitize(event.name) || event.name,
      date: event.date.toISOString(),
      time: sanitize(event.time),
      weekday: sanitize(event.weekday),
      eventType: sanitize(event.eventType),
      category: sanitize(event.category) || event.category,
      company: sanitize(event.company) || event.company,
      aiRecommend: sanitize(event.aiRecommend),
      importance: sanitize(event.importance),
      country: sanitize(event.country),
      city: sanitize(event.city),
      location: sanitize(event.location),
      link: sanitize(event.link),
      infoLink: sanitize(event.infoLink),
      summary: sanitize(event.summary),
      description: sanitize(event.description),
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
