"use client";

import Button from '@/components/Button';
import Input from '@/components/Input';
import Textarea from '@/components/Textarea';
import useRoadmapStore from '@/stores/roadmap-store';
import { ROADMAP_TEMPLATES } from '@/utils/roadmap-templates';

const RoadmapBuilderPage = () => {
  const { title, steps, template, setField, setTemplate } = useRoadmapStore();

  const handleAddStep = () => {
    setField('steps', [...steps, '']);
  };

  const handleStepChange = (index: number, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = value;
    setField('steps', newSteps);
  };

  const handleRemoveStep = (indexToRemove: number) => {
    const newSteps = steps.filter((_, index) => index !== indexToRemove);
    setField('steps', newSteps);
  };

  const handleTemplateChange = (templateKey: string) => {
    setTemplate(templateKey);
    if (templateKey && ROADMAP_TEMPLATES[templateKey]) {
      const selected = ROADMAP_TEMPLATES[templateKey];
      setField('title', selected.title);
      setField('steps', selected.steps);
    } else {
      setField('title', '');
      setField('steps', []);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 bg-gray-100 dark:bg-[#1e1e1e]">
      <h1 className="text-4xl font-bold text-black dark:text-white mb-8">Create Your Roadmap</h1>

      {/* Template Selector */}
      <div className="w-full max-w-lg mb-6">
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300 font-semibold">Select Roadmap Template</label>
        <select
          value={template}
          onChange={(e) => handleTemplateChange(e.target.value)}
          className="w-full px-4 py-2 rounded-md border border-gray-300 dark:bg-[#1e1e1e] dark:text-white dark:border-gray-600 focus:border-blue-500 focus:ring-2 ring-blue-500 transition duration-200"
        >
          <option value="">-- Custom (Blank) --</option>
          {Object.entries(ROADMAP_TEMPLATES).map(([key, templateObj]) => (
            <option key={key} value={key}>
              {templateObj.name}
            </option>
          ))}
        </select>
      </div>

      <form className="space-y-4 w-full max-w-lg">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Roadmap Title</label>
          <Input
            value={title}
            onChange={(e) => setField('title', e.target.value)}
            placeholder="Roadmap Title"
          />
        </div>
        
        <div className="space-y-3">
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Steps</label>
          {steps.map((step, index) => (
            <div key={index} className="flex space-x-2 items-start w-full">
              <Textarea
                value={step}
                onChange={(e) => handleStepChange(index, e.target.value)}
                placeholder={`Step ${index + 1}`}
                className="flex-grow"
                rows={2}
              />
              <button
                type="button"
                onClick={() => handleRemoveStep(index)}
                className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md font-bold transition duration-200 flex items-center justify-center cursor-pointer"
                title="Remove step"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        
        <Button onClick={handleAddStep} variant="secondary" className="w-full">Add Step</Button>
      </form>

      <div className="flex flex-wrap gap-4 mt-8 justify-center">
        <Button href="/theme" variant="secondary">Theme Studio</Button>
        <Button href="/readme-builder" variant="secondary">Create README</Button>
        <Button href="/preview" variant="primary">Preview Markdown</Button>
      </div>
    </div>
  );
};

export default RoadmapBuilderPage;