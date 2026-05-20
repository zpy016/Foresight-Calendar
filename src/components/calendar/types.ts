export interface CalendarEvent {
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

export const CATEGORY_COLORS: Record<string, string> = {
  '汽车': 'bg-emerald-500',
  'AI': 'bg-amber-500',
  '消费电子': 'bg-blue-500',
  '泛科技': 'bg-slate-500',
  '航天': 'bg-indigo-500',
  '消费电子-次要': 'bg-sky-400',
  '无匹配类别': 'bg-gray-400',
};

export const CATEGORY_LABELS: Record<string, string> = {
  'all': '全部',
  '汽车': '汽车',
  'AI': 'AI',
  '消费电子': '消费电子',
};

export function parseCategory(categoryJson: string): string[] {
  try {
    return JSON.parse(categoryJson);
  } catch {
    return [];
  }
}

export function parseCompany(companyJson: string): string[] {
  try {
    return JSON.parse(companyJson);
  } catch {
    return [];
  }
}

export function getScoreFromLabel(label: string | null): number {
  if (!label) return 0;
  const match = label.match(/^(\d)/);
  return match ? parseInt(match[1], 10) : 0;
}

export function getFirstCategory(categoryJson: string): string {
  const cats = parseCategory(categoryJson);
  return cats[0] || '无匹配类别';
}

export function getCategoryColor(categoryJson: string): string {
  const cat = getFirstCategory(categoryJson);
  return CATEGORY_COLORS[cat] || 'bg-gray-400';
}
