"use client";

import Button from '@/components/Button';
import Input from '@/components/Input';
import Textarea from '@/components/Textarea';
import useRoadmapStore from '@/stores/roadmap-store';

const RoadmapBuilderPage = () => {
  const { title, steps, setField } = useRoadmapStore();

  const handleAddStep = () => {
    setField('steps', [...steps, '']);
  };

  const handleStepChange = (index: number, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = value;
    setField('steps', newSteps);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-[#1e1e1e]">
      <h1 className="text-4xl font-bold text-black dark:text-white mb-8">Create Your Roadmap</h1>
      <form className="space-y-4">
        <Input
          value={title}
          onChange={(e) => setField('title', e.target.value)}
          placeholder="Roadmap Title"
        />
        {steps.map((step, index) => (
          <div key={index} className="flex space-x-2 items-center">
            <Textarea
              value={step}
              onChange={(e) => handleStepChange(index, e.target.value)}
              placeholder={`Step ${index + 1}`}
            />
          </div>
        ))}
        <Button onClick={handleAddStep} variant="secondary">Add Step</Button>
      </form>
      <div className="flex space-x-4 mt-8">
        <Button href="/readme-builder" variant="secondary">Create README</Button>
        <Button href="/preview" variant="primary">Preview Markdown</Button>
      </div>
    </div>
  );
};

export default RoadmapBuilderPage;