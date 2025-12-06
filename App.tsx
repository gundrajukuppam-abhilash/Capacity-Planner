

import React, { useState, useMemo, useEffect } from 'react';
import { TeamMember, LeaveDay, CapacityAnalysis, CapacityOverride } from './types';
import { getSprintDays, calculateCapacity, formatDateISO } from './utils';
import { analyzeCapacity } from './services/geminiService';
import SettingsPanel from './components/SettingsPanel';
import LeaveGrid from './components/LeaveGrid';
import AnalysisPanel from './components/AnalysisPanel';
import ApprovalQueue from './components/ApprovalQueue';
import LeaveRequestModal from './components/LeaveRequestModal';
import MemberDashboard from './components/MemberDashboard';
import { LayoutDashboard, PlusCircle, UserCog, Users } from 'lucide-react';

const INITIAL_MEMBERS: TeamMember[] = [
  { id: '1', name: 'Alex Johnson', role: 'Developer', dailyCapacityHours: 6 },
  { id: '2', name: 'Sam Smith', role: 'Senior Dev', dailyCapacityHours: 6 },
  { id: '3', name: 'Jordan Lee', role: 'Designer', dailyCapacityHours: 6 },
  { id: '4', name: 'Casey West', role: 'QA', dailyCapacityHours: 6 },
];

const App: React.FC = () => {
  // State
  const [userRole, setUserRole] = useState<'Manager' | 'Member'>('Manager');
  
  const [members, setMembers] = useState<TeamMember[]>(INITIAL_MEMBERS);
  const [leaves, setLeaves] = useState<LeaveDay[]>([]);
  const [capacityOverrides, setCapacityOverrides] = useState<CapacityOverride[]>([]);
  const [analysis, setAnalysis] = useState<CapacityAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // View State for Grid
  const [viewStartDate, setViewStartDate] = useState(formatDateISO(new Date()));

  // Modal State
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestModalInitialData, setRequestModalInitialData] = useState<{ memberId?: string, date?: string } | undefined>(undefined);

  // Computed Values

  // View Days: 2 Weeks window based on viewStartDate
  // Note: calculateCapacity now runs on the visible days, so total capacity reflects the 2-week window.
  const viewDays = useMemo(() => {
    return getSprintDays(viewStartDate, 2);
  }, [viewStartDate]);

  const { memberCaps, totalTeamCapacity } = useMemo(() => {
    // Pass false for includeWeekends by default as settings were removed
    return calculateCapacity(members, leaves, capacityOverrides, viewDays, false);
  }, [members, leaves, capacityOverrides, viewDays]);

  const pendingLeaves = useMemo(() => leaves.filter(l => l.status === 'pending'), [leaves]);

  // Handlers
  const handleViewNavigate = (direction: 'prev' | 'next') => {
    const current = new Date(viewStartDate);
    const offset = direction === 'next' ? 14 : -14;
    current.setDate(current.getDate() + offset);
    setViewStartDate(formatDateISO(current));
  };

  const handleGridClick = (memberId: string, date: string) => {
    if (userRole === 'Manager') {
      // Manager Mode: Direct Toggle / Override
      setLeaves(prev => {
        const existingLeave = prev.find(l => l.memberId === memberId && l.date === date);
        
        if (!existingLeave) {
          // No leave -> Full (Approved)
          return [...prev, { id: crypto.randomUUID(), memberId, date, type: 'Full', status: 'approved' }];
        } else if (existingLeave.type === 'Full') {
          // Full -> Half
          return prev.map(l => 
            (l.memberId === memberId && l.date === date) 
              ? { ...l, type: 'Half', status: 'approved' } 
              : l
          );
        } else {
          // Half -> Remove
          return prev.filter(l => !(l.memberId === memberId && l.date === date));
        }
      });
      setAnalysis(null);
    } else {
      // Member Mode: Open Request Form
      const existingLeave = leaves.find(l => l.memberId === memberId && l.date === date);
      if (existingLeave) {
        if (existingLeave.status === 'pending') {
          alert("You have a pending request for this date.");
        } else if (existingLeave.status === 'approved') {
          alert("Leave already approved for this date. Contact manager to change.");
        } else if (existingLeave.status === 'rejected') {
          alert("Your request for this date was rejected. Please delete it from your dashboard to submit a new one.");
        }
        return;
      }
      
      setRequestModalInitialData({ memberId, date });
      setIsRequestModalOpen(true);
    }
  };

  const handleCapacityUpdate = (memberId: string, date: string, hours: number) => {
    setCapacityOverrides(prev => {
      const existing = prev.find(o => o.memberId === memberId && o.date === date);
      if (existing) {
        return prev.map(o => o.memberId === memberId && o.date === date ? { ...o, hours } : o);
      }
      return [...prev, { memberId, date, hours }];
    });
    setAnalysis(null);
  };

  const handleRequestLeave = (data: { memberId: string; date: string; type: 'Full' | 'Half'; reason: string }) => {
    const exists = leaves.some(l => l.memberId === data.memberId && l.date === data.date);
    if (exists) {
      alert("A leave entry already exists for this date.");
      return;
    }

    setLeaves(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        memberId: data.memberId,
        date: data.date,
        type: data.type,
        status: 'pending',
        reason: data.reason
      }
    ]);
  };

  const handleDeleteLeave = (leaveId: string) => {
    setLeaves(prev => prev.filter(l => l.id !== leaveId));
    setAnalysis(null);
  };

  const handleApproveRequest = (leaveId: string) => {
    setLeaves(prev => prev.map(l => l.id === leaveId ? { ...l, status: 'approved' } : l));
    setAnalysis(null);
  };

  const handleRejectRequest = (leaveId: string) => {
    // Instead of deleting, we mark it as rejected
    setLeaves(prev => prev.map(l => l.id === leaveId ? { ...l, status: 'rejected' } : l));
    setAnalysis(null);
  };

  const handleAddMember = (member: TeamMember) => {
    setMembers([...members, member]);
    setAnalysis(null);
  };

  const handleUpdateMember = (id: string, updates: Partial<TeamMember>) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
    setAnalysis(null);
  };

  const handleRemoveMember = (id: string) => {
    setMembers(members.filter(m => m.id !== id));
    setLeaves(leaves.filter(l => l.memberId !== id)); 
    setAnalysis(null);
  };

  const handleAnalyze = async () => {
    if (!process.env.API_KEY) {
      alert("API Key is missing from environment.");
      return;
    }
    
    setIsAnalyzing(true);
    try {
      const approvedLeaves = leaves.filter(l => l.status === 'approved');
      const result = await analyzeCapacity(
        members, 
        approvedLeaves,
        "Current Capacity View",
        "2 weeks",
        viewDays, 
        { memberCaps, totalTeamCapacity }
      );
      setAnalysis({
        totalCapacity: totalTeamCapacity,
        memberCapacities: Object.entries(memberCaps).map(([id, hours]) => ({ memberId: id, hours })),
        risks: result.risks || [],
        suggestions: result.suggestions || [],
        summary: result.summary || "Analysis complete."
      });
    } catch (error) {
      console.error(error);
      alert("Failed to analyze capacity. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">SprintSync AI</h1>
          </div>
          
          <div className="flex items-center gap-4">
             {/* Persona Switcher */}
             <div className="bg-gray-100 p-1 rounded-lg flex text-sm font-medium">
                <button
                  onClick={() => setUserRole('Manager')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all ${userRole === 'Manager' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <UserCog className="w-4 h-4" />
                  Manager
                </button>
                <button
                  onClick={() => setUserRole('Member')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all ${userRole === 'Member' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <Users className="w-4 h-4" />
                  Team
                </button>
             </div>

             <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>

             {userRole === 'Manager' && (
                <button 
                  onClick={() => {
                    setRequestModalInitialData(undefined);
                    setIsRequestModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium border border-indigo-100"
                >
                  <PlusCircle className="w-4 h-4" />
                  Request Leave
                </button>
             )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {userRole === 'Manager' ? (
          <>
            <SettingsPanel 
              members={members}
              onAddMember={handleAddMember}
              onRemoveMember={handleRemoveMember}
            />

            <ApprovalQueue 
              pendingLeaves={pendingLeaves}
              members={members}
              onApprove={handleApproveRequest}
              onReject={handleRejectRequest}
            />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2 space-y-8">
                <LeaveGrid 
                  members={members} 
                  days={viewDays} 
                  leaves={leaves} 
                  overrides={capacityOverrides}
                  onToggleLeave={handleGridClick}
                  onUpdateMember={handleUpdateMember}
                  onCapacityUpdate={handleCapacityUpdate}
                  capacityData={memberCaps}
                  isManager={true}
                  viewStartDate={viewStartDate}
                  onNavigate={handleViewNavigate}
                  onDateSelect={setViewStartDate}
                />
              </div>
              
              <div className="xl:col-span-1">
                 <AnalysisPanel 
                    totalCapacity={totalTeamCapacity}
                    analysis={analysis}
                    isLoading={isAnalyzing}
                    onAnalyze={handleAnalyze}
                 />
              </div>
            </div>
          </>
        ) : (
          <MemberDashboard 
            leaves={leaves}
            members={members}
            onOpenRequestModal={() => {
              setRequestModalInitialData(undefined);
              setIsRequestModalOpen(true);
            }}
            onDeleteRequest={handleDeleteLeave}
          />
        )}
      </main>

      <LeaveRequestModal 
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        members={members}
        onSubmit={handleRequestLeave}
        initialValues={requestModalInitialData}
      />
    </div>
  );
};

export default App;