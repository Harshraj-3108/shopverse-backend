// src/components/navigation/ThemeToggle.tsx

import { useTheme } from '../../hooks/useTheme';
import { Button } from '../ui/button';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggle = () => {
    if (theme === 'dark') setTheme('light');
    else setTheme('dark');
  };

  return (
    <Button variant="ghost" size="icon" onClick={toggle} title="Toggle Theme" aria-label="Toggle Theme">
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-slate-300" />
    </Button>
  );
}
