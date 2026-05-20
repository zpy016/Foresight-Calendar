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
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { ChevronLeft, ChevronRight, Filter, X, Check, Car, Cpu, Smartphone, CalendarDays, Clock } from 'lucide-react';
import Link from 'next/link';

const CATEGORIES = [
  { key: 'all', label: '全部', icon: null as null, activeClass: 'bg-gray-900 text-white shadow-sm', inactiveClass: 'bg-gray-50 text-gray-500 hover:bg-gray-100' },
  { key: '汽车', label: '汽车', icon: Car, activeClass: 'bg-emerald-600 text-white shadow-sm', inactiveClass: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' },
  { key: 'AI', label: 'AI', icon: Cpu, activeClass: 'bg-amber-500 text-white shadow-sm', inactiveClass: 'bg-amber-50 text-amber-600 hover:bg-amber-100' },
  { key: '消费电子', label: '消费电子', icon: Smartphone, activeClass: 'bg-blue-500 text-white shadow-sm', inactiveClass: 'bg-blue-50 text-blue-600 hover:bg-blue-100' },
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
    setCurrentYear,
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
    <div className="flex items-center justify-between py-2.5 px-5">
      {/* Left: Logo + Date Navigation */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white text-base font-bold">F</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-base font-bold text-gray-900 leading-tight">Foresight 视界线</h1>
            <p className="text-[11px] text-gray-400 leading-tight">汽车+AI 行业大事件智能日历</p>
          </div>
        </div>

        {/* Month/Year Navigation */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={prevMonth} className="h-7 w-7 hover:bg-gray-100">
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          </Button>
          {showYearNav ? (
            <span className="text-lg font-semibold text-gray-900 min-w-[80px] text-center tabular-nums">
              {currentYear}年
            </span>
          ) : (
            <span className="text-lg font-semibold text-gray-900 min-w-[120px] text-center tabular-nums">
              {currentYear}年 {monthNames[currentMonth - 1]}
            </span>
          )}
          <Button variant="ghost" size="icon" onClick={nextMonth} className="h-7 w-7 hover:bg-gray-100">
            <ChevronRight className="h-4 w-4 text-gray-600" />
          </Button>
        </div>
      </div>

      {/* Right: Filters + View Toggle */}
      <div className="flex items-center gap-2">
        {/* View Toggle */}
        <div className="hidden sm:flex items-center bg-gray-50 rounded-lg p-0.5 mr-1">
          <Link href="/">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${
                viewMode === 'calendar'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <CalendarDays className="h-3.5 w-3.5" />
              月历
            </button>
          </Link>
          <Link href="/timeline">
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${
                viewMode === 'timeline'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              时间线
            </button>
          </Link>
        </div>

        {/* Category Pills */}
        <div className="hidden lg:flex items-center gap-1.5">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                  isActive ? cat.activeClass : cat.inactiveClass
                }`}
              >
                {Icon && <Icon className="h-3.5 w-3.5" />}
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Mobile Category Dropdown */}
        <div className="lg:hidden">
          <Select value={activeCategory} onValueChange={setActiveCategory}>
            <SelectTrigger className="w-[90px] h-8 text-sm border-gray-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.key} value={cat.key}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Score Filter */}
        <Select value={String(minScore)} onValueChange={(v) => setMinScore(Number(v))}>
          <SelectTrigger className="w-[100px] h-8 text-sm border-gray-200">
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
              className={`h-8 text-sm gap-1.5 ${
                selectedCompanies.length > 0 ? 'border-gray-900 bg-gray-50' : 'border-gray-200'
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
          <PopoverContent className="w-[400px] p-0" align="end">
            <Command>
              <CommandInput placeholder="搜索品牌..." />
              <CommandList className="max-h-[400px]">
                <CommandEmpty>未找到品牌</CommandEmpty>

                {/* Tier 1 Auto */}
                {autoTier1.length > 0 && (
                  <CommandGroup heading="🔥 核心车企">
                    <div className="flex flex-wrap gap-1.5 p-2">
                      {autoTier1.map((company) => (
                        <button
                          key={company}
                          onClick={() => toggleCompany(company)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            selectedCompanies.includes(company)
                              ? 'bg-gray-900 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {company}
                        </button>
                      ))}
                    </div>
                  </CommandGroup>
                )}

                {/* Tier 2 Auto */}
                {autoTier2.length > 0 && (
                  <CommandGroup heading="⭐ 重点车企">
                    <div className="flex flex-wrap gap-1.5 p-2">
                      {autoTier2.map((company) => (
                        <button
                          key={company}
                          onClick={() => toggleCompany(company)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            selectedCompanies.includes(company)
                              ? 'bg-gray-900 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {company}
                        </button>
                      ))}
                    </div>
                  </CommandGroup>
                )}

                {/* Other Auto */}
                {autoOther.length > 0 && (
                  <CommandGroup heading="🚗 其他车企">
                    <div className="flex flex-wrap gap-1.5 p-2">
                      {autoOther.map((company) => (
                        <button
                          key={company}
                          onClick={() => toggleCompany(company)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            selectedCompanies.includes(company)
                              ? 'bg-gray-900 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {company}
                        </button>
                      ))}
                    </div>
                  </CommandGroup>
                )}

                {/* Tech */}
                {tech.length > 0 && (
                  <CommandGroup heading="💻 科技公司">
                    <div className="flex flex-wrap gap-1.5 p-2">
                      {tech.map((company) => (
                        <button
                          key={company}
                          onClick={() => toggleCompany(company)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            selectedCompanies.includes(company)
                              ? 'bg-gray-900 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {company}
                        </button>
                      ))}
                    </div>
                  </CommandGroup>
                )}

                {/* Other */}
                {other.length > 0 && (
                  <CommandGroup heading="📦 其他">
                    <div className="flex flex-wrap gap-1.5 p-2">
                      {other.map((company) => (
                        <button
                          key={company}
                          onClick={() => toggleCompany(company)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            selectedCompanies.includes(company)
                              ? 'bg-gray-900 text-white'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
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
              <div className="border-t p-2.5 flex items-center justify-between bg-gray-50">
                <div className="flex flex-wrap gap-1 max-w-[280px]">
                  {selectedCompanies.slice(0, 5).map((c) => (
                    <span key={c} className="text-xs px-2 py-0.5 bg-white border border-gray-200 rounded-md text-gray-700">
                      {c}
                    </span>
                  ))}
                  {selectedCompanies.length > 5 && (
                    <span className="text-xs text-gray-400 py-0.5">+{selectedCompanies.length - 5}</span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-gray-500 hover:text-gray-900"
                  onClick={() => setSelectedCompanies([])}
                >
                  <X className="h-3 w-3 mr-1" />
                  清除
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
