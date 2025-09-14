import React from 'react';

export const SuspenseLoader: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[100]">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-400"></div>
    </div>
  );
};