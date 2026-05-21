'use client';

import { useRef, useEffect, useState, ReactNode } from 'react';

interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
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

  useEffect(() => {
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
  }, [value, options]);

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex items-center bg-muted rounded-xl p-1 gap-0.5 ${className}`}
    >
      {/* Sliding indicator */}
      <div
        className="absolute top-1 bottom-1 rounded-lg bg-card shadow-sm border border-border/50 pointer-events-none"
        style={{
          width: indicator.width,
          transform: `translateX(${indicator.left}px)`,
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />
      {options.map((opt) => (
        <button
          key={opt.value}
          ref={(el) => {
            if (el) itemRefs.current.set(opt.value, el);
          }}
          onClick={() => onChange(opt.value)}
          className={`relative z-10 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 whitespace-nowrap flex items-center gap-1.5 ${
            value === opt.value
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {opt.icon}
          {opt.label}
        </button>
      ))}
    </div>
  );
}
