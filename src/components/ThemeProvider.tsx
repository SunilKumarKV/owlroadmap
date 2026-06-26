"use client";

import { useEffect } from 'react';
import useThemeStore from '@/stores/theme-store';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    // Remove any existing theme classes
    document.body.classList.remove('theme-minimal', 'theme-dark', 'theme-gradient', 'theme-terminal');
    // Add the current theme class
    document.body.classList.add(`theme-${theme}`);
  }, [theme]);

  return <>{children}</>;
}
