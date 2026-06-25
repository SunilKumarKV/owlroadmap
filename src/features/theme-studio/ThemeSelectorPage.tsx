"use client";

import { useState } from 'react';
import Button from '@/components/Button';
import RadioGroup from '@/components/RadioGroup';

const ThemeSelectorPage = () => {
  const [theme, setTheme] = useState('minimal');

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-[#1e1e1e]">
      <h1 className="text-4xl font-bold text-black dark:text-white mb-8">Select Theme</h1>
      <RadioGroup
        options={['minimal', 'dark', 'gradient', 'terminal']}
        value={theme}
        onChange={(value) => setTheme(value)}
        labels={{
          minimal: 'Minimal',
          dark: 'Dark',
          gradient: 'Gradient',
          terminal: 'Terminal',
        }}
        className="mb-4"
      />
      <Button onClick={() => alert('Apply Theme')} variant="primary">Apply Theme</Button>
    </div>
  );
};

export default ThemeSelectorPage;