import React, { Suspense } from 'react';
import READMEBuilderPage from '@/features/readme-builder/READMEBuilderPage';

const READMEBuilder: React.FC = () => {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-[#1e1e1e] text-black dark:text-white font-semibold">Loading builder...</div>}>
      <READMEBuilderPage />
    </Suspense>
  );
};

export default READMEBuilder;