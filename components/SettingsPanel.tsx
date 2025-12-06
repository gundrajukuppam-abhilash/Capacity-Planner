
import React, { useState, useRef } from 'react';
import { TeamMember, Holiday } from '../types';
import { Plus, Trash2, Users, Upload, X, FileText, Download, FileSpreadsheet, MapPin, Calendar, Globe, ArrowRight, Pencil, Check, Settings, Calculator } from 'lucide-react';

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
}

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
  onUpdateHoursPerSP
}) => {
  const [activeTab, setActiveTab] = useState<'team' | 'holidays' | 'config'>('team');

  // Member State
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('Developer');
  const [newMemberLocation, setNewMemberLocation] = useState('US');
  const [newMemberCapacity, setNewMemberCapacity] = useState(6);
  
  // Holiday State
  const [newHolidayName, setNewHolidayName] = useState('');
  const [newHolidayStartDate, setNewHolidayStartDate] = useState('');
  const [newHolidayEndDate, setNewHolidayEndDate] = useState('');
  const [newHolidayLocations, setNewHolidayLocations] = useState('All');

  // Import Modal State
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetMemberForm = () => {
    setEditingMemberId(null);
    setNewMemberName('');
    setNewMemberRole('Developer');
    setNewMemberLocation('US');
    setNewMemberCapacity(6);
  };

  const handleMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    if (editingMemberId) {
       onUpdateMember(editingMemberId, {
           name: newMemberName,
           role: newMemberRole,
           location: newMemberLocation || 'Remote',
           dailyCapacityHours: newMemberCapacity
       });
       resetMemberForm();
    } else {
       onAddMember({
          id: crypto.randomUUID(),
          name: newMemberName,
          role: newMemberRole,
          location: newMemberLocation || 'Remote',
          dailyCapacityHours: newMemberCapacity
       });
       resetMemberForm();
    }
  };

  const startEditingMember = (member: TeamMember) => {
    setEditingMemberId(member.id);
    setNewMemberName(member.name);
    setNewMemberRole(member.role);
    setNewMemberLocation(member.location);
    setNewMemberCapacity(member.dailyCapacityHours);
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

  const handleImport = async () => {
    if (!importFile) return;

    try {
      const text = await importFile.text();
      const lines = text.split('\n');
      const newMembers: TeamMember[] = [];

      lines.forEach(line => {
        const cleanLine = line.trim();
        if (!cleanLine) return;

        // CSV: Name, Role, Location, Capacity
        const parts = cleanLine.split(',').map(s => s.trim());
        
        // Skip header
        if (parts[0].toLowerCase() === 'name' && parts[1]?.toLowerCase() === 'role') return;

        if (parts[0]) {
          newMembers.push({
            id: crypto.randomUUID(),
            name: parts[0],
            role: parts[1] || 'Developer',
            location: parts[2] || 'Remote',
            dailyCapacityHours: parseFloat(parts[3]) || 6
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

  const downloadTemplate = () => {
    const csvContent = "Name,Role,Location,Daily Capacity\nJohn Doe,Developer,US,6\nJane Smith,QA,London,6";
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

  const formatDateDisplay = (dateStr: string) => {
      const [year, month, day] = dateStr.split('-');
      return `${month}/${day}/${year}`;
  };

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
                  />
              </div>
              <div className="sm:col-span-3">
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
                    <MapPin className="w-4 h-4 absolute left-2.5 top-2.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Loc"
                      value={newMemberLocation}
                      onChange={(e) => setNewMemberLocation(e.target.value)}
                      className="w-full rounded-md border-gray-300 border p-2 pl-8 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                 </div>
              </div>
               <div className="sm:col-span-2">
                 <div className="relative">
                    <input
                      type="number"
                      placeholder="Cap"
                      value={newMemberCapacity}
                      onChange={(e) => setNewMemberCapacity(parseFloat(e.target.value))}
                      className="w-full rounded-md border-gray-300 border p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <span className="absolute right-2 top-2 text-xs text-gray-400">h/day</span>
                 </div>
              </div>
              <div className="sm:col-span-2 flex gap-1">
                 <button 
                  type="submit" 
                  className={`flex-1 text-white p-2 rounded-md shadow-sm transition-colors flex items-center justify-center ${editingMemberId ? 'bg-amber-500 hover:bg-amber-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}
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

            <div className="max-h-[240px] overflow-y-auto space-y-2 pr-2 custom-scroll">
              {members.map(member => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-100 hover:border-gray-200 transition-colors">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                       <span className="font-medium text-sm text-gray-800">{member.name}</span>
                       <span className="text-[10px] px-1.5 py-0.5 bg-gray-200 text-gray-600 rounded-full flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {member.location}
                       </span>
                    </div>
                    <span className="text-xs text-gray-500">{member.role} • {member.dailyCapacityHours}h/day</span>
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
                    placeholder="Locations (e.g. US, UK)"
                    value={newHolidayLocations}
                    onChange={(e) => setNewHolidayLocations(e.target.value)}
                    className="w-full rounded-md border-gray-300 border p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    title="e.g. US, UK or All"
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

      {/* Import Modal */}
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
                Format: Name, Role, Location, Daily Capacity<br/>
                Example:<br/>
                John Doe, Developer, US, 6<br/>
                Jane Smith, QA, UK, 6
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
    </div>
  );
};

export default SettingsPanel;
