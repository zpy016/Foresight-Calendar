'use client';

import { useRef, useLayoutEffect, useState, ReactNode, useCallback } from 'react';

interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
  /** Background color class for the active indicator pill, e.g. 'bg-orange-500' */
  activeIndicatorClass?: string;
  /** Text color class when active, e.g. 'text-white' */
  activeTextClass?: string;
  /** Text color class when inactive, e.g. 'text-orange-400/60 hover:text-orange-500' */
  inactiveTextClass?: string;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export default function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className = '',
}: SegmentedControlProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState({ width: 0, left: 0 });
  const itemRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const activeOption = options.find((o) => o.value === value);

  const updateIndicator = useCallback(() => {
    const activeBtn = itemRefs.current.get(value);
    const container = containerRef.current;
    if (activeBtn && container) {
      const cRect = container.getBoundingClientRect();
      const bRect = activeBtn.getBoundingClientRect();
      setIndicator({
        width: bRect.width,
        left: bRect.left - cRect.left,
      });
    }
  }, [value]);

  // Use useLayoutEffect to measure before paint
  useLayoutEffect(() => {
    updateIndicator();
  }, [updateIndicator]);

  // Re-measure on window resize
  useLayoutEffect(() => {
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [updateIndicator]);

  const indicatorBg = activeOption?.activeIndicatorClass || 'bg-card';

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex items-center bg-muted rounded-xl p-1 gap-0.5 ${className}`}
    >
      {/* Sliding indicator */}
      <div
        className={`absolute top-1 bottom-1 rounded-lg shadow-sm pointer-events-none ${indicatorBg}`}
        style={{
          width: indicator.width,
          transform: `translateX(${indicator.left}px)`,
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s ease',
        }}
      />
      {options.map((opt) => {
        const isActive = value === opt.value;
        const textClass = isActive
          ? (opt.activeTextClass || 'text-primary')
          : (opt.inactiveTextClass || 'text-muted-foreground hover:text-foreground');

        return (
          <button
            key={opt.value}
            ref={(el) => {
              if (el) itemRefs.current.set(opt.value, el);
            }}
            onClick={() => onChange(opt.value)}
            className={`relative z-10 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 whitespace-nowrap flex items-center justify-center gap-1.5 text-center min-w-[3rem] ${textClass}`}
          >
            {opt.icon}
            <span className="text-center">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
