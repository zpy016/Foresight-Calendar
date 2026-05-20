import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

function parseArray(s: string): string[] {
  s = s.trim();
  if (!s || s === '') return [];
  if (s.startsWith('[')) {
    const matches = s.match(/"([^"\\]+)"/g);
    return matches ? matches.map(m => m.slice(1, -1)) : [];
  }
  return [s];
}

function parseTableFile(filepath: string): Record<string, string>[] {
  const content = fs.readFileSync(filepath, 'utf-8');
  const lines = content.split('\n');
  
  let headerIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('| _record_id')) {
      headerIdx = i;
      break;
    }
  }
  if (headerIdx === -1) return [];
  
  const records: Record<string, string>[] = [];
  for (let i = headerIdx + 2; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || !line.startsWith('| recvk7')) continue;
    
    const parts: string[] = [];
    let current = '';
    let inQuotes = false;
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
        current += char;
      } else if (char === '|' && !inQuotes) {
        parts.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    if (current.trim()) parts.push(current.trim());
    
    while (parts.length > 0 && parts[0] === '') parts.shift();
    while (parts.length > 0 && parts[parts.length - 1] === '') parts.pop();
    
    if (parts.length >= 5) {
      records.push({
        recordId: parts[0] || '',
        name: parts[1] || '',
        company: parts[2] || '',
        city: parts[3] || '',
        infoLink: parts[4] || '',
        eventType: parts[5] || '',
        category: parts[6] || '',
        aiRecommend: parts[7] || '',
        summary: parts[8] || '',
        description: parts[9] || '',
        importance: parts[10] || '',
        weekday: parts[11] || '',
        link: parts[12] || '',
        date: parts[13] || '',
        location: parts[14] || '',
        country: parts[15] || '',
        time: parts[16] || '',
      });
    }
  }
  
  return records;
}

async function main() {
  const allRecords: Record<string, string>[] = [];
  
  for (const page of [1, 2, 3]) {
    const filepath = `/tmp/all_page${page}.txt`;
    if (fs.existsSync(filepath)) {
      const records = parseTableFile(filepath);
      console.log(`Parsed ${records.length} records from page ${page}`);
      allRecords.push(...records);
    }
  }
  
  console.log(`Total records to import: ${allRecords.length}`);
  
  let imported = 0;
  let skipped = 0;
  
  for (const record of allRecords) {
    try {
      const companies = parseArray(record.company);
      const categories = parseArray(record.category);
      const aiRecs = parseArray(record.aiRecommend);
      const weekdays = parseArray(record.weekday);
      const types = parseArray(record.eventType);
      
      const dateStr = record.date;
      const date = dateStr ? new Date(dateStr) : new Date();
      
      await prisma.event.upsert({
        where: { recordId: record.recordId },
        update: {
          name: record.name,
          date,
          time: record.time || null,
          weekday: weekdays[0] || null,
          eventType: types[0] || '未知',
          category: JSON.stringify(categories),
          company: JSON.stringify(companies),
          aiRecommend: aiRecs[0] || null,
          importance: parseArray(record.importance)[0] || null,
          country: record.country || null,
          city: record.city || null,
          location: record.location || null,
          link: record.link || null,
          infoLink: record.infoLink || null,
          summary: record.summary || null,
          description: record.description || null,
        },
        create: {
          recordId: record.recordId,
          name: record.name,
          date,
          time: record.time || null,
          weekday: weekdays[0] || null,
          eventType: types[0] || '未知',
          category: JSON.stringify(categories),
          company: JSON.stringify(companies),
          aiRecommend: aiRecs[0] || null,
          importance: parseArray(record.importance)[0] || null,
          country: record.country || null,
          city: record.city || null,
          location: record.location || null,
          link: record.link || null,
          infoLink: record.infoLink || null,
          summary: record.summary || null,
          description: record.description || null,
        },
      });
      imported++;
    } catch (e) {
      console.error(`Failed to import ${record.recordId}:`, (e as Error).message);
      skipped++;
    }
  }
  
  console.log(`\nImport complete: ${imported} imported, ${skipped} skipped`);
  
  const count = await prisma.event.count();
  console.log(`Total events in database: ${count}`);
  
  const events = await prisma.event.findMany();
  const categoryCounts: Record<string, number> = {};
  for (const event of events) {
    const cats = JSON.parse(event.category || '[]') as string[];
    for (const cat of cats) {
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    }
  }
  console.log('\nCategory distribution:');
  for (const [cat, count] of Object.entries(categoryCounts)) {
    console.log(`  ${cat}: ${count}`);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
