import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const company = searchParams.get('company');
  const minScore = searchParams.get('minScore');
  const year = searchParams.get('year');
  const month = searchParams.get('month');

  const where: Record<string, unknown> = {};

  if (category && category !== 'all') {
    where.category = { contains: `"${category}"` };
  }

  if (company && company !== 'all') {
    where.company = { contains: `"${company}"` };
  }

  if (minScore) {
    const score = parseInt(minScore, 10);
    if (!isNaN(score)) {
      // AI推荐字段格式: "1-很不重要", "2-不重要", "3-值得知晓", "4-推荐", "5-强烈推荐"
      const validScores = [];
      for (let i = score; i <= 5; i++) {
        const labels = ['', '1-很不重要', '2-不重要', '3-值得知晓', '4-推荐', '5-强烈推荐'];
        validScores.push(labels[i]);
      }
      where.aiRecommend = { in: validScores };
    }
  }

  if (year && month) {
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 1);
    where.date = {
      gte: startDate,
      lt: endDate,
    };
  }

  const events = await prisma.event.findMany({
    where,
    orderBy: { date: 'asc' },
  });

  return NextResponse.json(events);
}
