"use client";

import { useState } from 'react';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Textarea from '@/components/Textarea';

const RoadmapBuilderPage = () => {
  const [title, setTitle] = useState('');
  const [steps, setSteps] = useState<string[]>([]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-[#1e1e1e]">
      <h1 className="text-4xl font-bold text-black dark:text-white mb-8">Create Your Roadmap</h1>
      <form className="space-y-4">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Roadmap Title"
        />
        {steps.map((step, index) => (
          <div key={index} className="flex space-x-2 items-center">
            <Textarea
              value={step}
              onChange={(e) => {
                const newSteps = [...steps];
                newSteps[index] = e.target.value;
                setSteps(newSteps);
              }}
              placeholder={`Step ${index + 1}`}
            />
          </div>
        ))}
        <Button onClick={() => setSteps([...steps, ''])} variant="secondary">Add Step</Button>
      </form>
      <div className="flex space-x-4 mt-8">
        <Button href="/readme-builder" variant="secondary">Create README</Button>
        <Button onClick={() => alert('Preview Roadmap.md')} variant="primary">Preview Markdown</Button>
      </div>
    </div>
  );
};

export default RoadmapBuilderPage;