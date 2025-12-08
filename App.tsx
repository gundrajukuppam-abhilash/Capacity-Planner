
import React, { useState, useMemo, useEffect } from 'react';
import { TeamMember, LeaveDay, CapacityOverride, Holiday, User, Sprint, SprintMetric } from './types';
import { getDaysInRange, calculateCapacity, formatDateISO, addDays } from './utils';
import SettingsPanel from './components/SettingsPanel';
import LeaveGrid from './components/LeaveGrid';
import AnalysisPanel from './components/AnalysisPanel';
import LeaveRequestModal from './components/LeaveRequestModal';
import MemberDashboard from './components/MemberDashboard';
import AuthScreen from './components/AuthScreen';
import UserProfileMenu from './components/UserProfileMenu';
import UserApprovals from './components/UserApprovals';
import { LayoutDashboard, PlusCircle } from 'lucide-react';

const INITIAL_MEMBERS: TeamMember[] = [
  { id: '1', name: 'Alex Johnson', role: 'Developer', location: 'Bangalore', dailyCapacityHours: 6, email: 'alex@sprintsync.com' },
  { id: '2', name: 'Sam Smith', role: 'Senior Dev', location: 'Hyderabad', dailyCapacityHours: 6, email: 'sam@sprintsync.com' },
  { id: '3', name: 'Jordan Lee', role: 'Designer', location: 'Pune', dailyCapacityHours: 6, email: 'jordan@sprintsync.com' },
  { id: '4', name: 'Casey West', role: 'QA', location: 'Mumbai', dailyCapacityHours: 6, email: 'casey@sprintsync.com' },
  { id: '5', name: 'Buddy', role: 'Developer', location: 'Gurgaon', dailyCapacityHours: 6, email: 'buddy@sprintsync.com' },
];

const INITIAL_HOLIDAYS: Holiday[] = [
    { id: 'h1', startDate: '2024-12-25', endDate: '2024-12-25', name: 'Christmas Day', locations: ['All'] },
    { id: 'h2', startDate: '2024-07-04', endDate: '2024-07-04', name: 'Independence Day', locations: ['US'] },
    { id: 'h3', startDate: '2024-01-26', endDate: '2024-01-26', name: 'Republic Day', locations: ['India'] }
];

const INITIAL_USERS: User[] = [
  { id: 'u1', name: 'Abhilash', email: 'abhilash@sprintsync.com', role: 'Manager', status: 'approved', location: 'Bangalore', avatarUrl: 'https://ui-avatars.com/api/?name=Abhilash&background=random' },
  { id: 'u2', name: 'Buddy', email: 'buddy@sprintsync.com', role: 'Member', status: 'approved', location: 'Gurgaon', avatarUrl: 'https://ui-avatars.com/api/?name=Buddy&background=random' }
];

// Helper for LocalStorage
const useStickyState = <T,>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [value, setValue] = useState<T>(() => {
    const stickyValue = window.localStorage.getItem(key);
    return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
};

const App: React.FC = () => {
  // Auth State
  const [currentUser, setCurrentUser] = useStickyState<User | null>('sprintsync_currentUser', null);
  const [allUsers, setAllUsers] = useStickyState<User[]>('sprintsync_users', INITIAL_USERS);

  // App Data State (Persistent)
  const [members, setMembers] = useStickyState<TeamMember[]>('sprintsync_members', INITIAL_MEMBERS);
  const [leaves, setLeaves] = useStickyState<LeaveDay[]>('sprintsync_leaves', []);
  const [holidays, setHolidays] = useStickyState<Holiday[]>('sprintsync_holidays', INITIAL_HOLIDAYS);
  const [capacityOverrides, setCapacityOverrides] = useStickyState<CapacityOverride[]>('sprintsync_overrides', []);
  const [hoursPerStoryPoint, setHoursPerStoryPoint] = useStickyState<number>('sprintsync_hsp', 8);
  const [sprints, setSprints] = useStickyState<Sprint[]>('sprintsync_sprints', []);
  
  // View State for Grid (Session only)
  const [viewStartDate, setViewStartDate] = useState(formatDateISO(new Date()));
  const [viewEndDate, setViewEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 13); // Default 14 days inclusive (0 to 13)
    return formatDateISO(d);
  });

  // Modal State
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestModalInitialData, setRequestModalInitialData] = useState<{ memberId?: string, date?: string } | undefined>(undefined);

  // Computed Values
  const userRole = currentUser?.role || 'Member';

  // Identify the TeamMember record for the logged-in user (if applicable)
  const currentTeamMember = useMemo(() => {
    if (!currentUser) return null;
    return members.find(m => m.email?.toLowerCase() === currentUser.email.toLowerCase());
  }, [currentUser, members]);

  // View Days based on Start and End date
  const viewDays = useMemo(() => {
    if (!viewEndDate || viewEndDate < viewStartDate) {
       return getDaysInRange(viewStartDate, viewStartDate);
    }
    return getDaysInRange(viewStartDate, viewEndDate);
  }, [viewStartDate, viewEndDate]);

  const { memberCaps, totalTeamCapacity } = useMemo(() => {
    return calculateCapacity(members, leaves, capacityOverrides, holidays, viewDays, false);
  }, [members, leaves, capacityOverrides, holidays, viewDays]);

  // Calculate Metrics for EACH defined sprint (for AnalysisPanel)
  const sprintMetrics = useMemo((): SprintMetric[] => {
    return sprints.map(sprint => {
       const sprintDays = getDaysInRange(sprint.startDate, sprint.endDate);
       const cap = calculateCapacity(members, leaves, capacityOverrides, holidays, sprintDays, false);
       return {
          ...sprint,
          totalHours: cap.totalTeamCapacity,
          totalSP: cap.totalTeamCapacity / (hoursPerStoryPoint || 8)
       };
    }).sort((a,b) => a.startDate.localeCompare(b.startDate));
  }, [sprints, members, leaves, capacityOverrides, holidays, hoursPerStoryPoint]);

  const pendingLeaves = useMemo(() => leaves.filter(l => l.status === 'pending'), [leaves]);

  // Auth Handlers
  const handleLogin = (email: string) => {
    const user = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user && user.status === 'approved') {
      setCurrentUser(user);
    }
  };

  const handleRegister = (newUser: Omit<User, 'id' | 'status'>) => {
    const user: User = {
      ...newUser,
      id: crypto.randomUUID(),
      status: 'pending'
    };
    setAllUsers(prev => [...prev, user]);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleUpdateProfile = (updates: Partial<User>) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...updates };
    setCurrentUser(updatedUser);
    setAllUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
    
    // Also update TeamMember record if name changes
    if (updates.name && currentTeamMember) {
        setMembers(prev => prev.map(m => m.id === currentTeamMember.id ? { ...m, name: updates.name! } : m));
    }
  };

  const handleUserApproval = (userId: string, isApproved: boolean) => {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;

    if (isApproved) {
      // 1. Approve User
      setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'approved' } : u));
      
      // 2. Automatically add to Team Members if they are a 'Member' role and not already there
      if (user.role === 'Member' && !members.some(m => m.email === user.email)) {
         setMembers(prev => [...prev, {
            id: crypto.randomUUID(),
            name: user.name,
            role: 'Developer', // Default
            location: user.location || 'Bangalore', // Use user location or default
            dailyCapacityHours: 6,
            email: user.email,
            avatarUrl: user.avatarUrl
         }]);
      }
    } else {
      setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'rejected' } : u));
    }
  };

  // Logic Handlers
  const handleViewNavigate = (direction: 'prev' | 'next') => {
    const start = new Date(viewStartDate);
    const end = new Date(viewEndDate);
    const durationMs = end.getTime() - start.getTime();
    const shiftMs = durationMs + (24 * 60 * 60 * 1000);
    const offsetDays = Math.round(shiftMs / (24 * 60 * 60 * 1000));
    const offset = direction === 'next' ? offsetDays : -offsetDays;
    
    setViewStartDate(formatDateISO(addDays(start, offset)));
    setViewEndDate(formatDateISO(addDays(end, offset)));
  };

  const handleGridClick = (memberId: string, date: string) => {
    if (userRole === 'Manager') {
      setLeaves(prev => {
        const existingLeave = prev.find(l => l.memberId === memberId && l.date === date);
        if (!existingLeave) {
          return [...prev, { id: crypto.randomUUID(), memberId, date, type: 'Full', status: 'approved' }];
        } else if (existingLeave.type === 'Full') {
          return prev.map(l => (l.memberId === memberId && l.date === date) ? { ...l, type: 'Half', status: 'approved' } : l);
        } else {
          return prev.filter(l => !(l.memberId === memberId && l.date === date));
        }
      });
    } else {
      // Member Mode check
      if (currentTeamMember && memberId !== currentTeamMember.id) {
         return; // Cannot click others
      }

      const existingLeave = leaves.find(l => l.memberId === memberId && l.date === date);
      if (existingLeave) {
        if (existingLeave.status === 'pending') alert("Pending request exists.");
        else if (existingLeave.status === 'approved') alert("Already approved.");
        else if (existingLeave.status === 'rejected') alert("Request rejected. Delete to retry.");
        return;
      }
      
      setRequestModalInitialData({ memberId, date });
      setIsRequestModalOpen(true);
    }
  };

  const handleCapacityUpdate = (memberId: string, date: string, hours: number) => {
    setCapacityOverrides(prev => {
      const existing = prev.find(o => o.memberId === memberId && o.date === date);
      return existing 
        ? prev.map(o => o.memberId === memberId && o.date === date ? { ...o, hours } : o)
        : [...prev, { memberId, date, hours }];
    });
  };

  const handleRequestLeave = (data: { memberId: string; date: string; type: 'Full' | 'Half'; reason: string }) => {
    if (leaves.some(l => l.memberId === data.memberId && l.date === data.date)) {
      alert("Leave entry already exists.");
      return;
    }
    setLeaves(prev => [...prev, { id: crypto.randomUUID(), memberId: data.memberId, date: data.date, type: data.type, status: 'pending', reason: data.reason }]);
  };

  const handleDeleteLeave = (leaveId: string) => {
    setLeaves(prev => prev.filter(l => l.id !== leaveId));
  };

  const handleApproveRequest = (leaveId: string) => {
    setLeaves(prev => prev.map(l => l.id === leaveId ? { ...l, status: 'approved' } : l));
  };

  const handleRejectRequest = (leaveId: string) => {
    setLeaves(prev => prev.map(l => l.id === leaveId ? { ...l, status: 'rejected' } : l));
  };

  const syncUserFromMember = (member: TeamMember) => {
      if (!member.email) return;

      setAllUsers(prev => {
         const existingUserIndex = prev.findIndex(u => u.email.toLowerCase() === member.email!.toLowerCase());
         if (existingUserIndex >= 0) {
            const updated = [...prev];
            // Auto approve if manager adds them
            updated[existingUserIndex] = { ...updated[existingUserIndex], status: 'approved' };
            return updated;
         } else {
            const newUser: User = {
               id: crypto.randomUUID(),
               name: member.name,
               email: member.email!,
               role: 'Member',
               status: 'approved',
               location: member.location,
               avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random`
            };
            return [...prev, newUser];
         }
      });
  };

  const handleAddMember = (member: TeamMember) => {
    setMembers(prev => [...prev, member]);
    syncUserFromMember(member);
  };

  const handleImportMembers = (newMembers: TeamMember[]) => {
    setMembers(prev => [...prev, ...newMembers]);
    newMembers.forEach(syncUserFromMember);
  };

  const handleUpdateMember = (id: string, updates: Partial<TeamMember>) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const handleRemoveMember = (id: string) => {
    setMembers(members.filter(m => m.id !== id));
    setLeaves(leaves.filter(l => l.memberId !== id)); 
  };

  const handleAddHoliday = (holiday: Holiday) => {
      setHolidays([...holidays, holiday]);
  };

  const handleRemoveHoliday = (id: string) => {
      setHolidays(holidays.filter(h => h.id !== id));
  };
  
  const handleImportLeaves = (newLeaves: LeaveDay[]) => {
    setLeaves(prev => {
       const existing = [...prev];
       const leavesToAdd: LeaveDay[] = [];
       
       newLeaves.forEach(newLeave => {
          // Check if leave already exists for this member on this date
          const exists = existing.some(l => l.memberId === newLeave.memberId && l.date === newLeave.date);
          if (!exists) {
              leavesToAdd.push(newLeave);
          }
       });
       
       return [...existing, ...leavesToAdd];
    });
  };

  const handleAddSprint = (sprint: Sprint) => {
      setSprints(prev => [...prev, sprint]);
      // Optional: Auto switch view to new sprint?
      // setViewStartDate(sprint.startDate);
      // setViewEndDate(sprint.endDate);
  };

  const handleRemoveSprint = (id: string) => {
      setSprints(prev => prev.filter(s => s.id !== id));
  };

  // Workspace Management
  const handleExportWorkspace = () => {
     const data = {
         members,
         leaves,
         holidays,
         capacityOverrides,
         hoursPerStoryPoint,
         sprints,
         users: allUsers // Backup users too? Might be sensitive if sharing file.
     };
     const jsonString = JSON.stringify(data, null, 2);
     const blob = new Blob([jsonString], { type: 'application/json' });
     const url = URL.createObjectURL(blob);
     const link = document.createElement('a');
     link.href = url;
     link.download = `sprintsync_workspace_${new Date().toISOString().split('T')[0]}.json`;
     document.body.appendChild(link);
     link.click();
     document.body.removeChild(link);
  };

  const handleImportWorkspace = async (file: File) => {
     try {
         const text = await file.text();
         const data = JSON.parse(text);
         
         if (confirm("This will overwrite your current workspace. Continue?")) {
             if(data.members) setMembers(data.members);
             if(data.leaves) setLeaves(data.leaves);
             if(data.holidays) setHolidays(data.holidays);
             if(data.capacityOverrides) setCapacityOverrides(data.capacityOverrides);
             if(data.hoursPerStoryPoint) setHoursPerStoryPoint(data.hoursPerStoryPoint);
             if(data.sprints) setSprints(data.sprints);
             // if(data.users) setAllUsers(data.users); // Decide if we want to restore users
         }
     } catch (e) {
         alert("Failed to import workspace. Invalid JSON file.");
         console.error(e);
     }
  };

  const handleResetWorkspace = () => {
      if (confirm("Are you sure you want to reset everything? This cannot be undone.")) {
          setMembers(INITIAL_MEMBERS);
          setLeaves([]);
          setHolidays(INITIAL_HOLIDAYS);
          setCapacityOverrides([]);
          setHoursPerStoryPoint(8);
          setSprints([]);
          // Keep users/auth intact usually
      }
  };

  // ---- RENDER ----

  if (!currentUser) {
    return <AuthScreen users={allUsers} onLogin={handleLogin} onRegister={handleRegister} />;
  }

  return (
    <div className="min-h-screen pb-20 bg-slate-50">
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
             
             {/* Profile Menu */}
             <UserProfileMenu 
               user={currentUser} 
               onLogout={handleLogout} 
               onUpdateProfile={handleUpdateProfile}
             />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {userRole === 'Manager' ? (
          <>
            <UserApprovals 
               users={allUsers} 
               onApprove={(id) => handleUserApproval(id, true)}
               onReject={(id) => handleUserApproval(id, false)}
            />

            <SettingsPanel 
              members={members}
              holidays={holidays}
              sprints={sprints}
              onAddMember={handleAddMember}
              onUpdateMember={handleUpdateMember}
              onImportMembers={handleImportMembers}
              onRemoveMember={handleRemoveMember}
              onAddHoliday={handleAddHoliday}
              onRemoveHoliday={handleRemoveHoliday}
              onAddSprint={handleAddSprint}
              onRemoveSprint={handleRemoveSprint}
              hoursPerStoryPoint={hoursPerStoryPoint}
              onUpdateHoursPerSP={setHoursPerStoryPoint}
              pendingLeaves={pendingLeaves}
              onApproveLeave={handleApproveRequest}
              onRejectLeave={handleRejectRequest}
              onImportLeaves={handleImportLeaves}
              onExportWorkspace={handleExportWorkspace}
              onImportWorkspace={handleImportWorkspace}
              onResetWorkspace={handleResetWorkspace}
            />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2 space-y-8">
                <LeaveGrid 
                  members={members} 
                  days={viewDays} 
                  leaves={leaves} 
                  overrides={capacityOverrides}
                  holidays={holidays}
                  sprints={sprints}
                  onToggleLeave={handleGridClick}
                  onUpdateMember={handleUpdateMember}
                  onCapacityUpdate={handleCapacityUpdate}
                  capacityData={memberCaps}
                  isManager={true}
                  viewStartDate={viewStartDate}
                  viewEndDate={viewEndDate}
                  onNavigate={handleViewNavigate}
                  onDateSelect={setViewStartDate}
                  onEndDateSelect={setViewEndDate}
                />
              </div>
              
              <div className="xl:col-span-1">
                 <AnalysisPanel 
                    totalCapacity={totalTeamCapacity}
                    hoursPerStoryPoint={hoursPerStoryPoint}
                    sprintMetrics={sprintMetrics}
                 />
              </div>
            </div>
          </>
        ) : (
          <MemberDashboard 
            leaves={currentTeamMember ? leaves.filter(l => l.memberId === currentTeamMember.id) : []}
            members={members}
            onOpenRequestModal={() => {
              if (!currentTeamMember) {
                alert("Your account is not linked to a team member profile.");
                return;
              }
              setRequestModalInitialData({ memberId: currentTeamMember.id });
              setIsRequestModalOpen(true);
            }}
            onDeleteRequest={handleDeleteLeave}
          />
        )}
      </main>

      <LeaveRequestModal 
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        members={userRole === 'Manager' ? members : (currentTeamMember ? [currentTeamMember] : [])}
        onSubmit={handleRequestLeave}
        initialValues={requestModalInitialData}
      />
    </div>
  );
};

export default App;
