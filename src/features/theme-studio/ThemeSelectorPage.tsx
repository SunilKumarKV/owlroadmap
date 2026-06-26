"use client";

import Button from '@/components/Button';
import RadioGroup from '@/components/RadioGroup';
import useThemeStore from '@/stores/theme-store';

const ThemeSelectorPage = () => {
  const { theme, setTheme } = useThemeStore();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-[#1e1e1e]">
      <h1 className="text-4xl font-bold text-black dark:text-white mb-8">Select Theme</h1>
      <RadioGroup
        options={['minimal', 'dark', 'gradient', 'terminal']}
        value={theme}
        onChange={(value) => setTheme(value as 'minimal' | 'dark' | 'gradient' | 'terminal')}
        labels={{
          minimal: 'Minimal',
          dark: 'Dark',
          gradient: 'Gradient',
          terminal: 'Terminal',
        }}
        className="mb-4 text-black dark:text-white"
      />
      <div className="flex space-x-4 mt-8">
        <Button href="/readme-builder" variant="primary">Go to Builder</Button>
        <Button href="/" variant="secondary">Home</Button>
      </div>
    </div>
  );
};

export default ThemeSelectorPage;