
import React from 'react';
import { TrendingUp } from 'lucide-react';

interface AnalysisPanelProps {
  totalCapacity: number;
  hoursPerStoryPoint: number;
}

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({
  totalCapacity,
  hoursPerStoryPoint
}) => {

  const totalSP = (totalCapacity / (hoursPerStoryPoint || 8)).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Prominent Total Capacity Card */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-6 rounded-xl shadow-lg text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-2 -translate-y-2">
           <TrendingUp className="w-24 h-24" />
        </div>
        <div className="relative z-10">
          <h2 className="text-indigo-100 font-medium text-sm uppercase tracking-wider mb-1">Total Team Capacity</h2>
          <div className="flex items-baseline gap-2 mb-1">
             <span className="text-5xl font-bold tracking-tight">{totalCapacity}</span>
             <span className="text-xl text-indigo-200 font-medium">hours</span>
          </div>
          <div className="flex items-center gap-2 text-indigo-100 bg-indigo-500/30 px-2 py-1 rounded inline-block">
             <span className="font-bold text-lg">≈ {totalSP}</span>
             <span className="text-xs font-medium uppercase tracking-wide opacity-90">Story Points</span>
          </div>
          <p className="text-indigo-200 text-xs mt-3 opacity-80">
            Available for this sprint based on {hoursPerStoryPoint}h / SP.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnalysisPanel;
