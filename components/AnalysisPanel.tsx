
import React from 'react';
import { CapacityAnalysis } from '../types';
import { Sparkles, AlertTriangle, Lightbulb, TrendingUp } from 'lucide-react';

interface AnalysisPanelProps {
  totalCapacity: number;
  analysis: CapacityAnalysis | null;
  isLoading: boolean;
  onAnalyze: () => void;
  hoursPerStoryPoint: number;
}

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({
  totalCapacity,
  analysis,
  isLoading,
  onAnalyze,
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

      {/* AI Insight Section */}
      <div className="bg-indigo-900 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Sparkles className="w-32 h-32" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-300" />
              AI Insight
            </h3>
            <button
              onClick={onAnalyze}
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${isLoading 
                  ? 'bg-indigo-800 text-indigo-400 cursor-not-allowed' 
                  : 'bg-white text-indigo-900 hover:bg-indigo-50 shadow-sm'}`}
            >
              {isLoading ? 'Analyzing...' : 'Analyze Plan'}
            </button>
          </div>

          {!analysis ? (
            <p className="text-indigo-200 text-sm">
              Click "Analyze Plan" to get a risk assessment and capacity summary powered by Gemini.
            </p>
          ) : (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-indigo-800/50 rounded-lg p-3 border border-indigo-700">
                 <p className="text-sm text-indigo-100 italic">"{analysis.summary}"</p>
              </div>

              {analysis.risks.length > 0 && (
                <div>
                   <h4 className="text-xs font-bold uppercase tracking-wider text-red-300 mb-2 flex items-center gap-1">
                     <AlertTriangle className="w-3 h-3" /> Risks Identified
                   </h4>
                   <ul className="space-y-1">
                     {analysis.risks.map((risk, i) => (
                       <li key={i} className="text-xs text-indigo-100 flex gap-2 items-start">
                         <span className="text-red-400">•</span> {risk}
                       </li>
                     ))}
                   </ul>
                </div>
              )}

              {analysis.suggestions.length > 0 && (
                <div>
                   <h4 className="text-xs font-bold uppercase tracking-wider text-green-300 mb-2 flex items-center gap-1">
                     <Lightbulb className="w-3 h-3" /> Suggestions
                   </h4>
                   <ul className="space-y-1">
                     {analysis.suggestions.map((sug, i) => (
                       <li key={i} className="text-xs text-indigo-100 flex gap-2 items-start">
                         <span className="text-green-400">•</span> {sug}
                       </li>
                     ))}
                   </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalysisPanel;
