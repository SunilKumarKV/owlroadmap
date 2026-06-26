"use client";

import React from 'react';
import Button from '@/components/Button';
import { GitHubIcon, RoadmapIcon } from '@/components/Icons';

const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-[#1e1e1e]">
      <h1 className="text-4xl font-bold text-black dark:text-white mb-8">Build your GitHub README, roadmap, and portfolio in minutes.</h1>
      <div className="flex space-x-4">
        <Button href="/readme-builder" icon={<GitHubIcon />} variant="primary">Start with README</Button>
        <Button href="/roadmap-builder" icon={<RoadmapIcon />} variant="secondary">Create Roadmap</Button>
      </div>
    </div>
  );
};

export default HomePage;