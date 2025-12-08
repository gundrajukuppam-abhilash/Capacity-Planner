
import React from 'react';
import { TrendingUp, Calendar, List } from 'lucide-react';
import { SprintMetric } from '../types';

interface AnalysisPanelProps {
  totalCapacity: number;
  hoursPerStoryPoint: number;
  sprintMetrics: SprintMetric[];
}

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({
  totalCapacity,
  hoursPerStoryPoint,
  sprintMetrics
}) => {

  const totalSP = (totalCapacity / (hoursPerStoryPoint || 8)).toFixed(1);

  const formatDateDisplay = (isoDate: string) => {
    if (!isoDate) return '-';
    const parts = isoDate.split('-');
    if (parts.length !== 3) return isoDate;
    const [year, month, day] = parts;
    return `${month}/${day}`;
  };

  return (
    <div className="space-y-6">
      {/* Prominent Total Capacity Card (Current View) */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-6 rounded-xl shadow-lg text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-2 -translate-y-2">
           <TrendingUp className="w-24 h-24" />
        </div>
        <div className="relative z-10">
          <h2 className="text-indigo-100 font-medium text-sm uppercase tracking-wider mb-1">Current View Capacity</h2>
          <div className="flex items-baseline gap-2 mb-1">
             <span className="text-5xl font-bold tracking-tight">{totalCapacity}</span>
             <span className="text-xl text-indigo-200 font-medium">hours</span>
          </div>
          <div className="flex items-center gap-2 text-indigo-100 bg-indigo-500/30 px-2 py-1 rounded inline-block">
             <span className="font-bold text-lg">≈ {totalSP}</span>
             <span className="text-xs font-medium uppercase tracking-wide opacity-90">Story Points</span>
          </div>
          <p className="text-indigo-200 text-xs mt-3 opacity-80">
            Based on current view dates & {hoursPerStoryPoint}h / SP.
          </p>
        </div>
      </div>

      {/* Sprint Breakdown Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
          <List className="w-4 h-4 text-gray-500" />
          <h3 className="font-semibold text-gray-800 text-sm">Sprint Breakdown</h3>
        </div>
        
        {sprintMetrics.length === 0 ? (
           <div className="p-6 text-center text-xs text-gray-400 italic">
             No sprints configured. Add sprints in the Configuration tab to see breakdown.
           </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase">
                  <th className="px-4 py-3 font-medium">Sprint Name</th>
                  <th className="px-4 py-3 font-medium text-right">Hours</th>
                  <th className="px-4 py-3 font-medium text-right">Story Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sprintMetrics.map((sprint) => (
                  <tr key={sprint.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{sprint.name}</div>
                      <div className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                         <Calendar className="w-2.5 h-2.5" />
                         {formatDateDisplay(sprint.startDate)} - {formatDateDisplay(sprint.endDate)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                       <span className="font-semibold text-gray-700">{sprint.totalHours}</span>
                       <span className="text-xs text-gray-400 ml-0.5">h</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                       <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                         {sprint.totalSP.toFixed(1)}
                       </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisPanel;
