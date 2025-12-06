
import React from 'react';
import { TeamMember } from '../types';
import { Plus, Trash2, Users } from 'lucide-react';

interface SettingsPanelProps {
  members: TeamMember[];
  onAddMember: (member: TeamMember) => void;
  onRemoveMember: (id: string) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  members,
  onAddMember,
  onRemoveMember
}) => {
  const [newMemberName, setNewMemberName] = React.useState('');
  const [newMemberRole, setNewMemberRole] = React.useState('Developer');

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    onAddMember({
      id: crypto.randomUUID(),
      name: newMemberName,
      role: newMemberRole,
      dailyCapacityHours: 6 // Default
    });
    setNewMemberName('');
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Users className="w-5 h-5 text-gray-500" />
        Team Members
      </h3>
      
      <form onSubmit={handleAddMember} className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Name"
          value={newMemberName}
          onChange={(e) => setNewMemberName(e.target.value)}
          className="flex-1 rounded-md border-gray-300 border p-2 text-sm"
        />
        <select
          value={newMemberRole}
          onChange={(e) => setNewMemberRole(e.target.value)}
          className="rounded-md border-gray-300 border p-2 text-sm"
        >
          <option>Developer</option>
          <option>QA</option>
          <option>Designer</option>
          <option>Product Owner</option>
          <option>Scrum Master</option>
        </select>
        <button type="submit" className="bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-700">
          <Plus className="w-5 h-5" />
        </button>
      </form>

      <div className="max-h-[240px] overflow-y-auto space-y-2 pr-2 custom-scroll">
        {members.map(member => (
          <div key={member.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md border border-gray-100">
            <div className="flex flex-col">
              <span className="font-medium text-sm text-gray-800">{member.name}</span>
              <span className="text-xs text-gray-500">{member.role} • {member.dailyCapacityHours}h/day</span>
            </div>
            <button 
              onClick={() => onRemoveMember(member.id)}
              className="text-gray-400 hover:text-red-500"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {members.length === 0 && (
            <p className="text-sm text-gray-400 italic text-center py-2">No team members added yet.</p>
        )}
      </div>
    </div>
  );
};

export default SettingsPanel;
