'use client';

import { useState } from 'react';
import { useFilterStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
} from '@/components/ui/command';
import SegmentedControl from '@/components/ui/segmented-control';
import ThemeToggle from '@/components/theme/ThemeToggle';
import { ChevronLeft, ChevronRight, Filter, X, CalendarDays, Clock, Telescope } from 'lucide-react';
import Link from 'next/link';

const CATEGORIES = [
  { value: 'all', label: '全部', activeIndicatorClass: 'bg-slate-500', activeTextClass: 'text-white', inactiveTextClass: 'text-slate-400 hover:text-slate-500' },
  { value: '汽车', label: '汽车', activeIndicatorClass: 'bg-orange-500', activeTextClass: 'text-white', inactiveTextClass: 'text-orange-400/60 hover:text-orange-500' },
  { value: 'AI', label: 'AI', activeIndicatorClass: 'bg-cyan-500', activeTextClass: 'text-white', inactiveTextClass: 'text-cyan-400/60 hover:text-cyan-500' },
  { value: '消费电子', label: '消费电子', activeIndicatorClass: 'bg-violet-500', activeTextClass: 'text-white', inactiveTextClass: 'text-violet-400/60 hover:text-violet-500' },
];

const SCORE_OPTIONS = [
  { value: 1, label: '全部评分' },
  { value: 2, label: '2分以上' },
  { value: 3, label: '3分以上' },
  { value: 4, label: '4分以上' },
  { value: 5, label: '仅5分' },
];

const TIER_1_AUTO = new Set(['蔚来', '小鹏', '理想', '小米', '小米汽车', '极氪', '零跑', '长安', '华为', '鸿蒙智行', '赛力斯', '阿维塔']);
const TIER_2_AUTO = new Set(['比亚迪', '吉利', '吉利￼', '奇瑞']);

function normalizeCompany(c: string): string {
  return c.replace(/\ufeff/g, '').replace(/\u200b/g, '').trim();
}

function categorizeCompanies(companies: string[]) {
  const autoTier1: string[] = [];
  const autoTier2: string[] = [];
  const autoOther: string[] = [];
  const tech: string[] = [];
  const other: string[] = [];

  for (const company of companies) {
    const normalized = normalizeCompany(company);
    if (TIER_1_AUTO.has(normalized) || TIER_1_AUTO.has(company)) {
      autoTier1.push(company);
    } else if (TIER_2_AUTO.has(normalized) || TIER_2_AUTO.has(company)) {
      autoTier2.push(company);
    } else if (
      ['上汽', '广汽', '东风', '北汽', '一汽', '长城', '五菱', '领克', '大众', '宝马', '奥迪', '保时捷', '莲花', '别克', '岚图', '特斯拉', '沃尔沃', '日产', '江汽', '乐道', '智己', '凯迪拉克', '雷克萨斯', '保时捷', 'Smart', '京东汽车'].some(k => normalized.includes(k)) ||
      ['￼'].some(k => normalized.includes(k))
    ) {
      autoOther.push(company);
    } else if (
      ['英伟达', '谷歌', '百度', '字节', 'AMD', '高通', '科大讯飞', '地平线', 'Mobileye', '智元', '阿里', '腾讯'].some(k => normalized.includes(k))
    ) {
      tech.push(company);
    } else {
      other.push(company);
    }
  }

  return { autoTier1, autoTier2, autoOther, tech, other };
}

interface FilterBarProps {
  uniqueCompanies: string[];
  showYearNav?: boolean;
}

export default function FilterBar({ uniqueCompanies, showYearNav }: FilterBarProps) {
  const {
    activeCategory,
    selectedCompanies,
    minScore,
    currentYear,
    currentMonth,
    viewMode,
    setActiveCategory,
    setMinScore,
    setSelectedCompanies,
    prevMonth,
    nextMonth,
    setViewMode,
  } = useFilterStore();

  const [companyOpen, setCompanyOpen] = useState(false);
  const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  const { autoTier1, autoTier2, autoOther, tech, other } = categorizeCompanies(uniqueCompanies);

  const toggleCompany = (company: string) => {
    if (selectedCompanies.includes(company)) {
      setSelectedCompanies(selectedCompanies.filter((c) => c !== company));
    } else {
      setSelectedCompanies([...selectedCompanies, company]);
    }
  };

  return (
    <div className="flex items-center justify-between py-2.5 px-4 sm:px-5 bg-background border-b border-border">
      {/* Left: Logo + Date Navigation */}
      <div className="flex items-center gap-3 sm:gap-4">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
            <Telescope className="w-5 h-5 text-primary-foreground" strokeWidth={2} />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-base font-bold text-foreground leading-tight">Foresight 视界线</h1>
            <p className="text-[11px] text-muted-foreground leading-tight">汽车+AI 行业大事件智能日历</p>
          </div>
        </Link>

        {/* Date Navigation */}
        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center
                       hover:bg-primary hover:text-primary-foreground hover:border-primary
                       transition-all duration-200"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {showYearNav ? (
            <span className="text-lg font-semibold text-foreground min-w-[72px] text-center tabular-nums">
              {currentYear}年
            </span>
          ) : (
            <span className="text-lg font-semibold text-foreground min-w-[110px] text-center tabular-nums">
              {currentYear}年 {monthNames[currentMonth - 1]}
            </span>
          )}
          <button
            onClick={nextMonth}
            className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center
                       hover:bg-primary hover:text-primary-foreground hover:border-primary
                       transition-all duration-200"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Right: Filters + ThemeToggle */}
      <div className="flex items-center gap-2">
        {/* View Toggle (Desktop) */}
        <div className="hidden md:block">
          <SegmentedControl
            options={[
              { value: 'calendar', label: '月历', icon: <CalendarDays className="w-3.5 h-3.5" /> },
              { value: 'timeline', label: '时间线', icon: <Clock className="w-3.5 h-3.5" /> },
            ]}
            value={viewMode}
            onChange={(v) => {
              setViewMode(v as 'calendar' | 'timeline');
            }}
          />
        </div>

        {/* Category Segmented Control (Desktop) */}
        <div className="hidden lg:block">
          <SegmentedControl
            options={CATEGORIES}
            value={activeCategory}
            onChange={setActiveCategory}
          />
        </div>

        {/* Mobile Category Select */}
        <div className="lg:hidden">
          <Select value={activeCategory} onValueChange={setActiveCategory}>
            <SelectTrigger className="w-[90px] h-8 text-sm border-border bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Score Filter */}
        <Select value={String(minScore)} onValueChange={(v) => setMinScore(Number(v))}>
          <SelectTrigger className="w-[100px] h-8 text-sm border-border bg-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SCORE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={String(opt.value)}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Company Filter Popover */}
        <Popover open={companyOpen} onOpenChange={setCompanyOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={`h-8 text-sm gap-1.5 border-border ${
                selectedCompanies.length > 0 ? 'border-primary bg-primary/5 text-primary' : ''
              }`}
            >
              <Filter className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">
                {selectedCompanies.length > 0 ? `品牌 (${selectedCompanies.length})` : '品牌'}
              </span>
              {selectedCompanies.length > 0 && (
                <span className="sm:hidden">({selectedCompanies.length})</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0 bg-card border-border" align="end">
            <Command>
              <CommandInput placeholder="搜索品牌..." className="border-border" />
              <CommandList className="max-h-[400px]">
                <CommandEmpty className="text-muted-foreground">未找到品牌</CommandEmpty>

                {autoTier1.length > 0 && (
                  <CommandGroup heading="🔥 核心车企" className="text-muted-foreground">
                    <div className="flex flex-wrap gap-1.5 p-2">
                      {autoTier1.map((company) => (
                        <button
                          key={company}
                          onClick={() => toggleCompany(company)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            selectedCompanies.includes(company)
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-secondary text-muted-foreground hover:bg-accent hover:text-foreground'
                          }`}
                        >
                          {company}
                        </button>
                      ))}
                    </div>
                  </CommandGroup>
                )}

                {autoTier2.length > 0 && (
                  <CommandGroup heading="⭐ 重点车企" className="text-muted-foreground">
                    <div className="flex flex-wrap gap-1.5 p-2">
                      {autoTier2.map((company) => (
                        <button
                          key={company}
                          onClick={() => toggleCompany(company)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            selectedCompanies.includes(company)
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-secondary text-muted-foreground hover:bg-accent hover:text-foreground'
                          }`}
                        >
                          {company}
                        </button>
                      ))}
                    </div>
                  </CommandGroup>
                )}

                {autoOther.length > 0 && (
                  <CommandGroup heading="🚗 其他车企" className="text-muted-foreground">
                    <div className="flex flex-wrap gap-1.5 p-2">
                      {autoOther.map((company) => (
                        <button
                          key={company}
                          onClick={() => toggleCompany(company)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            selectedCompanies.includes(company)
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-secondary text-muted-foreground hover:bg-accent hover:text-foreground'
                          }`}
                        >
                          {company}
                        </button>
                      ))}
                    </div>
                  </CommandGroup>
                )}

                {tech.length > 0 && (
                  <CommandGroup heading="💻 科技公司" className="text-muted-foreground">
                    <div className="flex flex-wrap gap-1.5 p-2">
                      {tech.map((company) => (
                        <button
                          key={company}
                          onClick={() => toggleCompany(company)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            selectedCompanies.includes(company)
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-secondary text-muted-foreground hover:bg-accent hover:text-foreground'
                          }`}
                        >
                          {company}
                        </button>
                      ))}
                    </div>
                  </CommandGroup>
                )}

                {other.length > 0 && (
                  <CommandGroup heading="📦 其他" className="text-muted-foreground">
                    <div className="flex flex-wrap gap-1.5 p-2">
                      {other.map((company) => (
                        <button
                          key={company}
                          onClick={() => toggleCompany(company)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            selectedCompanies.includes(company)
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-secondary text-muted-foreground hover:bg-accent hover:text-foreground'
                          }`}
                        >
                          {company}
                        </button>
                      ))}
                    </div>
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
            {selectedCompanies.length > 0 && (
              <div className="border-t border-border p-2.5 flex items-center justify-between bg-secondary/50">
                <div className="flex flex-wrap gap-1 max-w-[280px]">
                  {selectedCompanies.slice(0, 5).map((c) => (
                    <span key={c} className="text-xs px-2 py-0.5 bg-card border border-border rounded-md text-foreground">
                      {c}
                    </span>
                  ))}
                  {selectedCompanies.length > 5 && (
                    <span className="text-xs text-muted-foreground py-0.5">+{selectedCompanies.length - 5}</span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => setSelectedCompanies([])}
                >
                  <X className="h-3 w-3 mr-1" />
                  清除
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>

        {/* Theme Toggle */}
        <ThemeToggle />
      </div>
    </div>
  );
}
