"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import Input from '@/components/Input';

const GitHubUsernameInput: React.FC = () => {
  const [username, setUsername] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      router.push(`/readme-builder?username=${encodeURIComponent(username.trim())}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-[#1e1e1e]">
      <h1 className="text-4xl font-bold text-black dark:text-white mb-8 text-center px-4">Enter your GitHub username</h1>
      <form onSubmit={handleSubmit} className="flex flex-col items-center w-full max-w-sm px-4">
        <Input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Your GitHub Username"
          className="mb-4 text-center"
          autoFocus
        />
        <Button type="submit" disabled={!username.trim()} variant="primary" className="w-full">
          Start Building README
        </Button>
      </form>
    </div>
  );
};

export default GitHubUsernameInput;