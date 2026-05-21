'use client';

import { useTheme } from './ThemeProvider';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? '切换到日间模式' : '切换到夜间模式'}
      className="relative w-10 h-10 rounded-full bg-secondary border border-border 
                 flex items-center justify-center cursor-pointer
                 hover:scale-110 active:scale-95
                 transition-transform duration-200 ease-out
                 shadow-sm hover:shadow-md"
    >
      {theme === 'dark' ? (
        <Sun className="w-[18px] h-[18px] text-primary" />
      ) : (
        <Moon className="w-[18px] h-[18px] text-primary" />
      )}
    </button>
  );
}
