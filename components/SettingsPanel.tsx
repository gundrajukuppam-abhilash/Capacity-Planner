
import React, { useState, useRef } from 'react';
import { TeamMember, Holiday, LeaveDay } from '../types';
import { Plus, Trash2, Users, Upload, X, FileText, Download, FileSpreadsheet, MapPin, Calendar, Globe, Pencil, Check, Settings, Calculator, ChevronDown, Mail, Clock, CheckCircle, XCircle } from 'lucide-react';

interface SettingsPanelProps {
  members: TeamMember[];
  holidays: Holiday[];
  onAddMember: (member: TeamMember) => void;
  onUpdateMember: (id: string, updates: Partial<TeamMember>) => void;
  onImportMembers: (members: TeamMember[]) => void;
  onRemoveMember: (id: string) => void;
  onAddHoliday: (holiday: Holiday) => void;
  onRemoveHoliday: (id: string) => void;
  hoursPerStoryPoint: number;
  onUpdateHoursPerSP: (value: number) => void;
  pendingLeaves: LeaveDay[];
  onApproveLeave: (leaveId: string) => void;
  onRejectLeave: (leaveId: string) => void;
  onImportLeaves: (leaves: LeaveDay[]) => void;
}

const LOCATIONS = ['Bangalore', 'Hyderabad', 'Pune', 'Mumbai', 'Gurgaon', 'Kolkata'];

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  members,
  holidays,
  onAddMember,
  onUpdateMember,
  onImportMembers,
  onRemoveMember,
  onAddHoliday,
  onRemoveHoliday,
  hoursPerStoryPoint,
  onUpdateHoursPerSP,
  pendingLeaves,
  onApproveLeave,
  onRejectLeave,
  onImportLeaves
}) => {
  const [activeTab, setActiveTab] = useState<'team' | 'requests' | 'holidays' | 'config'>('team');

  // Member State
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('Developer');
  const [newMemberLocation, setNewMemberLocation] = useState(LOCATIONS[0]);
  const [newMemberCapacity, setNewMemberCapacity] = useState(6);
  const [newMemberStartDate, setNewMemberStartDate] = useState('');
  
  // Holiday State
  const [newHolidayName, setNewHolidayName] = useState('');
  const [newHolidayStartDate, setNewHolidayStartDate] = useState('');
  const [newHolidayEndDate, setNewHolidayEndDate] = useState('');
  const [newHolidayLocations, setNewHolidayLocations] = useState('All');

  // Import Member Modal State
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Import Leave Modal State
  const [isLeaveImportOpen, setIsLeaveImportOpen] = useState(false);
  const [leaveImportFile, setLeaveImportFile] = useState<File | null>(null);
  const leaveFileInputRef = useRef<HTMLInputElement>(null);

  const resetMemberForm = () => {
    setEditingMemberId(null);
    setNewMemberName('');
    setNewMemberEmail('');
    setNewMemberRole('Developer');
    setNewMemberLocation(LOCATIONS[0]);
    setNewMemberCapacity(6);
    setNewMemberStartDate('');
  };

  const handleMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    if (editingMemberId) {
       onUpdateMember(editingMemberId, {
           name: newMemberName,
           email: newMemberEmail,
           role: newMemberRole,
           location: newMemberLocation,
           dailyCapacityHours: newMemberCapacity,
           startDate: newMemberStartDate || undefined
       });
       resetMemberForm();
    } else {
       onAddMember({
          id: crypto.randomUUID(),
          name: newMemberName,
          email: newMemberEmail,
          role: newMemberRole,
          location: newMemberLocation,
          dailyCapacityHours: newMemberCapacity,
          startDate: newMemberStartDate || undefined
       });
       resetMemberForm();
    }
  };

  const startEditingMember = (member: TeamMember) => {
    setEditingMemberId(member.id);
    setNewMemberName(member.name);
    setNewMemberEmail(member.email || '');
    setNewMemberRole(member.role);
    setNewMemberLocation(member.location);
    setNewMemberCapacity(member.dailyCapacityHours);
    setNewMemberStartDate(member.startDate || '');
  };

  const handleAddHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHolidayName.trim() || !newHolidayStartDate || !newHolidayEndDate) return;

    if (newHolidayEndDate < newHolidayStartDate) {
        alert("End date cannot be before start date.");
        return;
    }

    const locs = newHolidayLocations.split(',').map(s => s.trim()).filter(Boolean);

    onAddHoliday({
        id: crypto.randomUUID(),
        name: newHolidayName,
        startDate: newHolidayStartDate,
        endDate: newHolidayEndDate,
        locations: locs.length > 0 ? locs : ['All']
    });
    setNewHolidayName('');
    setNewHolidayStartDate('');
    setNewHolidayEndDate('');
    setNewHolidayLocations('All');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImportFile(e.target.files[0]);
    }
  };

  const handleLeaveFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLeaveImportFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!importFile) return;

    try {
      const text = await importFile.text();
      const lines = text.split('\n');
      const newMembers: TeamMember[] = [];

      lines.forEach(line => {
        const cleanLine = line.trim();
        if (!cleanLine) return;

        // CSV: Name, Role, Location, Capacity, Email, Start Date
        const parts = cleanLine.split(',').map(s => s.trim());
        
        // Skip header
        if (parts[0].toLowerCase() === 'name' && parts[1]?.toLowerCase() === 'role') return;

        if (parts[0]) {
          newMembers.push({
            id: crypto.randomUUID(),
            name: parts[0],
            role: parts[1] || 'Developer',
            location: parts[2] || 'Bangalore', // Default to first location
            dailyCapacityHours: parseFloat(parts[3]) || 6,
            email: parts[4] || undefined,
            startDate: parts[5] || undefined
          });
        }
      });

      if (newMembers.length > 0) {
        onImportMembers(newMembers);
        setImportFile(null);
        setIsImportOpen(false);
      } else {
        alert("No valid members found in the file.");
      }
    } catch (error) {
      console.error("Error reading file:", error);
      alert("Failed to read the file.");
    }
  };

  const handleLeaveImport = async () => {
    if (!leaveImportFile) return;

    try {
      const text = await leaveImportFile.text();
      const lines = text.split('\n');
      const newLeaves: LeaveDay[] = [];

      lines.forEach(line => {
        const cleanLine = line.trim();
        if (!cleanLine) return;

        // CSV: Email, Date, Type, Status, Reason
        const parts = cleanLine.split(',').map(s => s.trim());

        // Skip header
        if (parts[0].toLowerCase() === 'email' && parts[1]?.toLowerCase() === 'date') return;

        if (parts[0] && parts[1]) {
            const email = parts[0];
            const date = parts[1]; // Expects YYYY-MM-DD
            const typeRaw = parts[2] || 'Full';
            const statusRaw = parts[3] || 'Approved';
            const reason = parts[4] || 'Imported via CSV';

            // Find member
            const member = members.find(m => m.email?.toLowerCase() === email.toLowerCase());

            let status: 'pending' | 'approved' | 'rejected' = 'approved';
            const sLower = statusRaw.toLowerCase();
            if (sLower === 'pending') status = 'pending';
            else if (sLower === 'rejected') status = 'rejected';

            if (member) {
                newLeaves.push({
                    id: crypto.randomUUID(),
                    memberId: member.id,
                    date: date,
                    type: typeRaw.toLowerCase() === 'half' ? 'Half' : 'Full',
                    status: status,
                    reason: reason
                });
            }
        }
      });

      if (newLeaves.length > 0) {
        onImportLeaves(newLeaves);
        setLeaveImportFile(null);
        setIsLeaveImportOpen(false);
      } else {
        alert("No valid leaves found or email addresses do not match existing team members.");
      }

    } catch (error) {
        console.error("Error reading leave file", error);
        alert("Failed to read the file.");
    }
  };

  const downloadTemplate = () => {
    const csvContent = "Name,Role,Location,Daily Capacity,Email,Start Date\nJohn Doe,Developer,Bangalore,6,john@example.com,2024-01-01\nJane Smith,QA,Mumbai,6,jane@example.com,2024-02-15";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'team_import_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const downloadLeaveTemplate = () => {
    const csvContent = "Email,Date,Type,Status,Reason\njohn@example.com,2024-12-25,Full,Approved,Vacation\njane@example.com,2024-12-26,Half,Pending,Doctor Appointment";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'leave_import_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const formatDateDisplay = (dateStr: string) => {
      if (!dateStr) return '';
      const [year, month, day] = dateStr.split('-');
      return `${month}/${day}/${year}`;
  };

  const getMemberName = (id: string) => members.find(m => m.id === id)?.name || 'Unknown';
  const getMemberDetails = (id: string) => members.find(m => m.id === id);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('team')}
          className={`px-6 py-3 text-sm font-medium flex items-center gap-2 transition-colors whitespace-nowrap ${activeTab === 'team' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
        >
          <Users className="w-4 h-4" /> Team Management
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-6 py-3 text-sm font-medium flex items-center gap-2 transition-colors whitespace-nowrap ${activeTab === 'requests' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
        >
          <Clock className="w-4 h-4" /> 
          Leave Requests
          {pendingLeaves.length > 0 && (
             <span className="ml-1 px-1.5 py-0.5 bg-orange-100 text-orange-600 rounded-full text-[10px] font-bold">
               {pendingLeaves.length}
             </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('holidays')}
          className={`px-6 py-3 text-sm font-medium flex items-center gap-2 transition-colors whitespace-nowrap ${activeTab === 'holidays' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
        >
          <Globe className="w-4 h-4" /> Holiday Calendar
        </button>
        <button
          onClick={() => setActiveTab('config')}
          className={`px-6 py-3 text-sm font-medium flex items-center gap-2 transition-colors whitespace-nowrap ${activeTab === 'config' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
        >
          <Settings className="w-4 h-4" /> Configuration
        </button>
      </div>

      <div className="p-6">
        {activeTab === 'team' && (
          <div className="animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Team Roster</h3>
              <button 
                onClick={() => setIsImportOpen(true)}
                className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors font-medium"
              >
                <Upload className="w-4 h-4" />
                Import CSV
              </button>
            </div>
            
            <form onSubmit={handleMemberSubmit} className={`grid grid-cols-1 sm:grid-cols-12 gap-2 mb-4 transition-colors p-3 rounded-lg border ${editingMemberId ? 'bg-amber-50 border-amber-200' : 'bg-transparent border-transparent'}`}>
              <div className="sm:col-span-3">
                 <input
                    type="text"
                    placeholder="Name"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    className="w-full rounded-md border-gray-300 border p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
              </div>
              <div className="sm:col-span-2">
                 <input
                    type="email"
                    placeholder="Email (Optional)"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    className="w-full rounded-md border-gray-300 border p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
              </div>
              <div className="sm:col-span-2">
                 <select
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value)}
                    className="w-full rounded-md border-gray-300 border p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option>Developer</option>
                    <option>QA</option>
                    <option>Designer</option>
                    <option>Product Owner</option>
                    <option>Scrum Master</option>
                  </select>
              </div>
              <div className="sm:col-span-2">
                 <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-2.5 top-2.5 text-gray-400 pointer-events-none" />
                    <select
                      value={newMemberLocation}
                      onChange={(e) => setNewMemberLocation(e.target.value)}
                      className="w-full rounded-md border-gray-300 border p-2 pl-8 pr-8 text-sm focus:ring-2 focus:ring-indigo-500 outline-none appearance-none bg-white text-gray-900 cursor-pointer"
                    >
                      {LOCATIONS.map(loc => (
                         <option key={loc} value={loc} className="text-gray-900 bg-white">{loc}</option>
                      ))}
                      {!LOCATIONS.includes(newMemberLocation) && <option value={newMemberLocation}>{newMemberLocation}</option>}
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-2.5 top-2.5 text-gray-400 pointer-events-none" />
                 </div>
              </div>
               <div className="sm:col-span-1">
                 <div className="relative">
                    <input
                      type="number"
                      placeholder="Cap"
                      value={newMemberCapacity}
                      onChange={(e) => setNewMemberCapacity(parseFloat(e.target.value))}
                      className="w-full rounded-md border-gray-300 border p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                 </div>
              </div>
              <div className="sm:col-span-1">
                 <div className="relative">
                    <span className="absolute -top-1.5 left-2 bg-white px-1 text-[9px] text-gray-400">Start Date</span>
                    <input
                      type="date"
                      value={newMemberStartDate}
                      onChange={(e) => setNewMemberStartDate(e.target.value)}
                      className="w-full rounded-md border-gray-300 border p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                 </div>
              </div>
              <div className="sm:col-span-1 flex gap-1">
                 <button 
                  type="submit" 
                  className={`w-full text-white p-2 rounded-md shadow-sm transition-colors flex items-center justify-center ${editingMemberId ? 'bg-amber-500 hover:bg-amber-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                  title={editingMemberId ? "Update Member" : "Add Member"}
                 >
                    {editingMemberId ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                 </button>
                 {editingMemberId && (
                   <button 
                    type="button" 
                    onClick={resetMemberForm}
                    className="flex-1 bg-gray-200 text-gray-600 p-2 rounded-md hover:bg-gray-300 shadow-sm transition-colors flex items-center justify-center"
                    title="Cancel Edit"
                   >
                      <X className="w-5 h-5" />
                   </button>
                 )}
              </div>
            </form>

            <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 custom-scroll">
              {members.map(member => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-100 hover:border-gray-200 transition-colors">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                       <span className="font-medium text-sm text-gray-800">{member.name}</span>
                       <span className="text-[10px] px-1.5 py-0.5 bg-gray-200 text-gray-600 rounded-full flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {member.location}
                       </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-1">
                      <span>{member.role} • {member.dailyCapacityHours}h/day</span>
                      {member.email && (
                        <span className="flex items-center gap-1 text-gray-400">
                           <Mail className="w-3 h-3" /> {member.email}
                        </span>
                      )}
                      {member.startDate && (
                         <span className="flex items-center gap-1 text-gray-400" title="Start Date">
                           <Calendar className="w-3 h-3" /> {formatDateDisplay(member.startDate)}
                         </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                     <button 
                        onClick={() => startEditingMember(member)}
                        className="text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded p-1 transition-colors"
                        title="Edit Member"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onRemoveMember(member.id)}
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded p-1 transition-colors"
                        title="Remove Member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                  </div>
                </div>
              ))}
              {members.length === 0 && (
                  <p className="text-sm text-gray-400 italic text-center py-2">No team members added yet.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'requests' && (
           <div className="animate-fadeIn">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                   Pending Leave Requests
                   <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full">{pendingLeaves.length}</span>
                </h3>
                <button 
                  onClick={() => setIsLeaveImportOpen(true)}
                  className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors font-medium"
                >
                  <Upload className="w-4 h-4" />
                  Import Requests
                </button>
              </div>

              {pendingLeaves.length === 0 ? (
                 <p className="text-sm text-gray-400 italic text-center py-8">No pending leave requests.</p>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scroll">
                   {pendingLeaves.map(leave => {
                      const member = getMemberDetails(leave.memberId);
                      if (!member) return null;

                      return (
                         <div key={leave.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white rounded-lg border border-orange-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-3 mb-3 sm:mb-0">
                               <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0">
                                  {member.name.charAt(0)}
                               </div>
                               <div>
                                  <div className="flex items-center gap-2">
                                     <span className="font-medium text-gray-900">{member.name}</span>
                                     <span className={`text-[10px] px-2 py-0.5 rounded-full border ${leave.type === 'Full' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                                        {leave.type} Day
                                     </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-0.5">
                                     <Calendar className="w-3.5 h-3.5" />
                                     <span>{formatDateDisplay(leave.date)}</span>
                                  </div>
                                  {leave.reason && (
                                     <p className="text-xs text-gray-500 mt-1 italic line-clamp-1">"{leave.reason}"</p>
                                  )}
                               </div>
                            </div>
                            <div className="flex gap-2 justify-end">
                               <button 
                                  onClick={() => onApproveLeave(leave.id)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-xs font-medium transition-colors border border-green-200"
                               >
                                  <CheckCircle className="w-3.5 h-3.5" /> Approve
                               </button>
                               <button 
                                  onClick={() => onRejectLeave(leave.id)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-xs font-medium transition-colors border border-red-200"
                               >
                                  <XCircle className="w-3.5 h-3.5" /> Reject
                               </button>
                            </div>
                         </div>
                      );
                   })}
                </div>
              )}
           </div>
        )}

        {activeTab === 'holidays' && (
           <div className="animate-fadeIn">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Holiday Calendar</h3>
              
              <form onSubmit={handleAddHoliday} className="grid grid-cols-1 sm:grid-cols-12 gap-2 mb-4 bg-indigo-50/50 p-3 rounded-lg border border-indigo-100">
                <div className="sm:col-span-3">
                  <input
                    type="text"
                    placeholder="Holiday Name"
                    value={newHolidayName}
                    onChange={(e) => setNewHolidayName(e.target.value)}
                    className="w-full rounded-md border-gray-300 border p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                   <div className="relative">
                     <span className="absolute -top-1.5 left-2 bg-white px-1 text-[10px] text-gray-500">Start</span>
                     <input
                        type="date"
                        value={newHolidayStartDate}
                        onChange={(e) => {
                            setNewHolidayStartDate(e.target.value);
                            // Auto-set end date if not set
                            if (!newHolidayEndDate) setNewHolidayEndDate(e.target.value);
                        }}
                        className="w-full rounded-md border-gray-300 border p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                     />
                   </div>
                </div>
                <div className="sm:col-span-2">
                   <div className="relative">
                     <span className="absolute -top-1.5 left-2 bg-white px-1 text-[10px] text-gray-500">End</span>
                     <input
                        type="date"
                        value={newHolidayEndDate}
                        onChange={(e) => setNewHolidayEndDate(e.target.value)}
                        min={newHolidayStartDate}
                        className="w-full rounded-md border-gray-300 border p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                     />
                   </div>
                </div>
                <div className="sm:col-span-3">
                  <input
                    type="text"
                    placeholder="Locations (e.g. Bangalore, Mumbai)"
                    value={newHolidayLocations}
                    onChange={(e) => setNewHolidayLocations(e.target.value)}
                    className="w-full rounded-md border-gray-300 border p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    title="e.g. Bangalore, Mumbai or All"
                  />
                </div>
                <div className="sm:col-span-2">
                   <button type="submit" className="w-full bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-700 shadow-sm transition-colors flex items-center justify-center gap-1 h-full">
                      <Plus className="w-4 h-4" /> Add
                   </button>
                </div>
              </form>

              <div className="max-h-[240px] overflow-y-auto space-y-2 pr-2 custom-scroll">
                 {[...holidays].sort((a,b) => a.startDate.localeCompare(b.startDate)).map(holiday => (
                    <div key={holiday.id} className="flex items-center justify-between p-3 bg-white rounded-md border border-gray-200 hover:border-indigo-200 transition-colors shadow-sm">
                       <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                             <Calendar className="w-4 h-4 text-purple-500" />
                             <span className="font-medium text-sm text-gray-800">{holiday.name}</span>
                             <span className="text-xs text-gray-400">
                                ({formatDateDisplay(holiday.startDate)}
                                {holiday.startDate !== holiday.endDate && ` - ${formatDateDisplay(holiday.endDate)}`})
                             </span>
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                             <Globe className="w-3 h-3 text-gray-400" />
                             <span className="text-xs text-gray-500">
                                {holiday.locations.join(', ')}
                             </span>
                          </div>
                       </div>
                       <button 
                        onClick={() => onRemoveHoliday(holiday.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                 ))}
                 {holidays.length === 0 && (
                  <p className="text-sm text-gray-400 italic text-center py-2">No holidays configured.</p>
                 )}
              </div>
           </div>
        )}

        {activeTab === 'config' && (
          <div className="animate-fadeIn">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Metric Configuration</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-indigo-50/50 p-6 rounded-lg border border-indigo-100">
                  <div className="flex items-center gap-2 mb-4 text-indigo-700">
                     <Calculator className="w-5 h-5" />
                     <h4 className="font-medium">Capacity Metrics</h4>
                  </div>
                  
                  <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hours per Story Point (SP)</label>
                        <div className="flex items-center gap-2">
                           <input 
                             type="number" 
                             min="1"
                             step="0.5"
                             value={hoursPerStoryPoint}
                             onChange={(e) => onUpdateHoursPerSP(Math.max(1, parseFloat(e.target.value) || 0))}
                             className="w-24 rounded-md border-gray-300 border p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                           />
                           <span className="text-sm text-gray-500">hours = 1 SP</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                           This value is used to calculate the estimated Story Point capacity for the team based on available hours.
                           Default is 8 hours/SP.
                        </p>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        )}
      </div>

      {/* Member Import Modal */}
      {isImportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                Import Team Members
              </h3>
              <button onClick={() => { setIsImportOpen(false); setImportFile(null); }} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex justify-between items-end mb-2">
                 <p className="text-sm text-gray-600">
                   Upload a CSV file with your team list.
                 </p>
                 <button 
                   onClick={downloadTemplate}
                   className="text-indigo-600 hover:text-indigo-800 text-xs font-medium flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded border border-indigo-100 transition-colors"
                 >
                   <Download className="w-3 h-3" /> Download Template
                 </button>
              </div>
              <div className="bg-gray-50 p-3 rounded-md border border-gray-200 text-xs text-gray-500 mb-4 font-mono">
                Format: Name, Role, Location, Daily Capacity, Email, Start Date<br/>
                Example:<br/>
                John Doe, Developer, Bangalore, 6, john@example.com, 2024-01-01
              </div>
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center cursor-pointer transition-colors
                  ${importFile ? 'border-indigo-300 bg-indigo-50' : 'border-gray-300 hover:bg-gray-50'}`}
              >
                <input 
                   type="file" 
                   ref={fileInputRef}
                   onChange={handleFileChange}
                   accept=".csv"
                   className="hidden" 
                />
                
                {importFile ? (
                   <div className="text-center">
                      <FileSpreadsheet className="w-10 h-10 text-indigo-600 mb-2 mx-auto" />
                      <p className="text-sm font-medium text-gray-900">{importFile.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{(importFile.size / 1024).toFixed(1)} KB</p>
                      <p className="text-xs text-indigo-600 mt-2 font-medium">Click to replace</p>
                   </div>
                ) : (
                   <div className="text-center">
                      <Upload className="w-10 h-10 text-gray-400 mb-3 mx-auto" />
                      <p className="text-sm font-medium text-gray-700">Click to upload CSV</p>
                      <p className="text-xs text-gray-500 mt-1">Supports .csv files</p>
                   </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <button
                onClick={() => { setIsImportOpen(false); setImportFile(null); }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={!importFile}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg shadow-sm
                  ${!importFile ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
              >
                Import Members
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leave Import Modal */}
      {isLeaveImportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                Import Leave Requests
              </h3>
              <button onClick={() => { setIsLeaveImportOpen(false); setLeaveImportFile(null); }} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex justify-between items-end mb-2">
                 <p className="text-sm text-gray-600">
                   Upload a CSV file with leave requests.
                 </p>
                 <button 
                   onClick={downloadLeaveTemplate}
                   className="text-indigo-600 hover:text-indigo-800 text-xs font-medium flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded border border-indigo-100 transition-colors"
                 >
                   <Download className="w-3 h-3" /> Download Template
                 </button>
              </div>
              <div className="bg-gray-50 p-3 rounded-md border border-gray-200 text-xs text-gray-500 mb-4 font-mono">
                Format: Email, Date, Type, Status, Reason<br/>
                Example:<br/>
                john@example.com, 2024-12-25, Full, Approved, Vacation
              </div>
              
              <div 
                onClick={() => leaveFileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center cursor-pointer transition-colors
                  ${leaveImportFile ? 'border-indigo-300 bg-indigo-50' : 'border-gray-300 hover:bg-gray-50'}`}
              >
                <input 
                   type="file" 
                   ref={leaveFileInputRef}
                   onChange={handleLeaveFileChange}
                   accept=".csv"
                   className="hidden" 
                />
                
                {leaveImportFile ? (
                   <div className="text-center">
                      <FileSpreadsheet className="w-10 h-10 text-indigo-600 mb-2 mx-auto" />
                      <p className="text-sm font-medium text-gray-900">{leaveImportFile.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{(leaveImportFile.size / 1024).toFixed(1)} KB</p>
                      <p className="text-xs text-indigo-600 mt-2 font-medium">Click to replace</p>
                   </div>
                ) : (
                   <div className="text-center">
                      <Upload className="w-10 h-10 text-gray-400 mb-3 mx-auto" />
                      <p className="text-sm font-medium text-gray-700">Click to upload CSV</p>
                      <p className="text-xs text-gray-500 mt-1">Supports .csv files</p>
                   </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <button
                onClick={() => { setIsLeaveImportOpen(false); setLeaveImportFile(null); }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleLeaveImport}
                disabled={!leaveImportFile}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg shadow-sm
                  ${!leaveImportFile ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
              >
                Import Requests
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPanel;
