
import React from 'react';

interface ProgressBarProps {
  value: number;
  max: number;
  label: string;
  colorClass: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value, max, label, colorClass }) => {
  const percentage = (value / max) * 100;

  return (
    <div className="w-full">
      <div className="text-sm font-bold text-gray-700 text-center mb-1">{label}</div>
      <div className="h-6 w-full bg-gray-300 rounded-full overflow-hidden border-2 border-gray-400">
        <div
          className={`${colorClass} h-full rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
