import { PrismaClient } from '@prisma/client';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const APP_ID = process.env.LARK_APP_ID || 'cli_aa86855115f99cd1';
const APP_SECRET = process.env.LARK_APP_SECRET;
const APP_TOKEN = 'BhQkb7DFlaiT8TsIoF0cMklcnSd';

function sanitize(str: string | null): string | null {
  if (!str) return str;
  return str.replace(/\ufeff/g, '').replace(/\u200b/g, '').replace(/\ufffc/g, '').trim();
}

/* ========== Feishu API helpers ========== */

async function feishuApi(path: string, token: string, method = 'GET', body?: object) {
  const url = `https://open.feishu.cn/open-apis${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (data.code !== 0) {
    throw new Error(`Feishu API error [${path}]: ${data.msg} (code=${data.code})`);
  }
  return data.data;
}

async function getTenantAccessToken() {
  const res = await fetch('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ app_id: APP_ID, app_secret: APP_SECRET }),
  });
  const data = await res.json();
  if (data.code !== 0) throw new Error(`Auth failed: ${data.msg}`);
  return data.tenant_access_token as string;
}

/* ========== Field auto-mapping ========== */

function mapFieldName(baseName: string): string | null {
  const lower = baseName.toLowerCase().replace(/\s+/g, '');
  const rules: [string[], string][] = [
    [['名称', 'name', '事件名', '标题', '事件名称', 'title', 'eventname', 'event'], 'name'],
    [['日期', 'date', '时间日期', '发生日期', 'datetime', 'when', 'day'], 'date'],
    [['时间', 'time', '具体时刻', '发生时间', 'hour', 'clock'], 'time'],
    [['星期', 'weekday', '周几', '星期几'], 'weekday'],
    [['类型', 'type', 'eventtype', '事件类型', '线上/线下', 'eventtype'], 'eventType'],
    [['分类', 'category', '类别', '赛道', '领域', 'tag', 'tags', 'sector', 'industry'], 'category'],
    [['公司', '企业', 'company', '品牌', '厂商', '车企', 'brand', 'manufacturer', 'maker', 'org', 'organization'], 'company'],
    [['ai推荐', 'airecommend', '推荐', '评分', 'ai评分', '推荐度', 'score', 'rating', 'rank', 'grade', 'stars'], 'aiRecommend'],
    [['重要性', 'importance', '重要程度', '优先级', 'priority'], 'importance'],
    [['国家', 'country', '地区', '国家/地区', 'nation', 'region'], 'country'],
    [['城市', 'city', '地点城市', 'town'], 'city'],
    [['地点', 'location', '位置', '地址', 'venue', '场所', 'place', 'address', 'site'], 'location'],
    [['链接', 'link', 'url', '官网', '网页链接', 'website', 'href'], 'link'],
    [['信息链接', 'infolink', '详情链接', '资讯链接', 'infolink', 'newslink'], 'infoLink'],
    [['一句话总结', 'summary', '一句话', '概述', '简介', '一句话描述', 'brief', 'abstract', 'overview'], 'summary'],
    [['详细描述', 'description', '描述', '详情', '详细介绍', '事件描述', 'detail', 'content', 'text', 'body', 'notes'], 'description'],
  ];
  for (const [keywords, field] of rules) {
    if (keywords.some((k) => lower.includes(k.toLowerCase()))) return field;
  }
  return null;
}

/* ========== Record conversion ========== */

function extractValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (Array.isArray(value)) {
    return JSON.stringify(
      value.map((v) => (typeof v === 'string' ? v : (v as any).text || (v as any).name || String(v)))
    );
  }
  return String(value);
}

function convertRecord(record: any, fieldMap: Record<string, string>) {
  const fields = record.fields || {};
  const result: Record<string, any> = { recordId: record.record_id };

  for (const [baseName, eventField] of Object.entries(fieldMap)) {
    const raw = fields[baseName];
    if (raw === undefined || raw === null) continue;

    switch (eventField) {
      case 'name':
        result.name = String(raw);
        break;
      case 'date':
        if (typeof raw === 'number') {
          result.date = new Date(raw);
        } else if (typeof raw === 'string') {
          result.date = new Date(raw);
        }
        break;
      case 'time':
        result.time = String(raw);
        break;
      case 'weekday':
        result.weekday = String(raw);
        break;
      case 'eventType':
        result.eventType = String(raw);
        break;
      case 'category':
        result.category = extractValue(raw);
        break;
      case 'company':
        result.company = extractValue(raw);
        break;
      case 'aiRecommend':
        result.aiRecommend = String(raw);
        break;
      case 'importance':
        result.importance = String(raw);
        break;
      case 'country':
        result.country = String(raw);
        break;
      case 'city':
        result.city = String(raw);
        break;
      case 'location':
        result.location = String(raw);
        break;
      case 'link':
        result.link = String(raw);
        break;
      case 'infoLink':
        result.infoLink = String(raw);
        break;
      case 'summary':
        result.summary = String(raw);
        break;
      case 'description':
        result.description = String(raw);
        break;
    }
  }

  // Defaults for required fields
  if (!result.name) result.name = '未命名事件';
  if (!result.date) result.date = new Date();
  if (!result.eventType) result.eventType = '线下';
  if (!result.category) result.category = '[]';
  if (!result.company) result.company = '[]';

  return result;
}

/* ========== Main ========== */

async function main() {
  // If no secret configured, skip sync and just export existing data
  if (!APP_SECRET) {
    console.log('⚠️  LARK_APP_SECRET not set, skipping Feishu sync');
    console.log('   To enable auto-sync, add LARK_APP_SECRET to GitHub Secrets');
    await exportOnly();
    return;
  }

  console.log('🔑 Authenticating with Feishu...');
  const token = await getTenantAccessToken();

  console.log('📋 Fetching tables...');
  const tables = await feishuApi(`/bitable/v1/apps/${APP_TOKEN}/tables`, token);
  const tableList = tables.items || [];
  if (tableList.length === 0) {
    throw new Error('No tables found in Base');
  }
  const table = tableList[0];
  console.log(`   Using table: ${table.name} (${table.table_id})`);

  console.log('🔍 Fetching fields...');
  const fieldsData = await feishuApi(`/bitable/v1/apps/${APP_TOKEN}/tables/${table.table_id}/fields`, token);
  const fieldMap: Record<string, string> = {};
  for (const f of fieldsData.items || []) {
    const mapped = mapFieldName(f.field_name);
    if (mapped) fieldMap[f.field_name] = mapped;
  }
  console.log('   Mapped fields:', Object.entries(fieldMap).map(([k, v]) => `${k}→${v}`).join(', '));

  console.log('📥 Fetching records...');
  const records: any[] = [];
  let pageToken = '';
  while (true) {
    const body: any = { page_size: 500 };
    if (pageToken) body.page_token = pageToken;
    const data = await feishuApi(`/bitable/v1/apps/${APP_TOKEN}/tables/${table.table_id}/records/search`, token, 'POST', body);
    records.push(...(data.items || []));
    if (!data.has_more) break;
    pageToken = data.page_token;
  }
  console.log(`   Fetched ${records.length} records`);

  // Write to SQLite
  const prisma = new PrismaClient();
  try {
    const existing = await prisma.event.count();
    console.log(`🗑️  Clearing ${existing} existing events...`);
    await prisma.event.deleteMany({});

    const events = records.map((r) => convertRecord(r, fieldMap));
    console.log(`💾 Inserting ${events.length} events into SQLite...`);
    for (const e of events) {
      await prisma.event.create({ data: e as any });
    }
  } finally {
    await prisma.$disconnect();
  }

  // Export to JSON
  await exportOnly();
}

async function exportOnly() {
  const prisma = new PrismaClient();
  try {
    const events = await prisma.event.findMany({ orderBy: { date: 'asc' } });
    const companySet = new Set<string>();
    events.forEach((e) => {
      try {
        const companies = JSON.parse(e.company || '[]') as string[];
        companies.forEach((c) => companySet.add(c));
      } catch {}
    });

    const data = {
      events: events.map((e) => ({
        id: e.id,
        recordId: e.recordId,
        name: sanitize(e.name),
        date: e.date.toISOString(),
        time: sanitize(e.time),
        weekday: sanitize(e.weekday),
        eventType: sanitize(e.eventType),
        category: sanitize(e.category),
        company: sanitize(e.company),
        aiRecommend: sanitize(e.aiRecommend),
        importance: sanitize(e.importance),
        country: sanitize(e.country),
        city: sanitize(e.city),
        location: sanitize(e.location),
        link: sanitize(e.link),
        infoLink: sanitize(e.infoLink),
        summary: sanitize(e.summary),
        description: sanitize(e.description),
      })),
      uniqueCompanies: Array.from(companySet).sort(),
    };

    const dataDir = join(process.cwd(), 'public', 'data');
    mkdirSync(dataDir, { recursive: true });
    writeFileSync(join(dataDir, 'events.json'), JSON.stringify(data, null, 2));
    console.log(`✅ Exported ${events.length} events to public/data/events.json (${data.uniqueCompanies.length} companies)`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error('❌ Sync failed:', e);
  process.exit(1);
});
