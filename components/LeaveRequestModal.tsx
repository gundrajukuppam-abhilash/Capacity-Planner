
import React, { useState, useEffect } from 'react';
import { TeamMember } from '../types';
import { X, Calendar } from 'lucide-react';

interface LeaveRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: TeamMember[];
  onSubmit: (data: { memberId: string; date: string; type: 'Full' | 'Half'; reason: string }) => void;
  initialValues?: { memberId?: string, date?: string };
}

const LeaveRequestModal: React.FC<LeaveRequestModalProps> = ({
  isOpen,
  onClose,
  members,
  onSubmit,
  initialValues
}) => {
  const [memberId, setMemberId] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState<'Full' | 'Half'>('Full');
  const [reason, setReason] = useState('');

  // Update state when initialValues change or modal opens
  useEffect(() => {
    if (isOpen) {
        setMemberId(initialValues?.memberId || members[0]?.id || '');
        
        if (initialValues?.date) {
            setDate(initialValues.date);
        } else {
            // Default to today's date in local time YYYY-MM-DD
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            setDate(`${year}-${month}-${day}`);
        }
        
        setType('Full');
        setReason('');
    }
  }, [isOpen, initialValues, members]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId || !date) return;
    onSubmit({ memberId, date, type, reason });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-fadeIn">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            Request Leave
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Team Member</label>
            <select
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              className="w-full rounded-lg border-gray-300 border p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            >
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border-gray-300 border p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Leave Type</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={type === 'Full'}
                  onChange={() => setType('Full')}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">Full Day</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={type === 'Half'}
                  onChange={() => setType('Half')}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">Half Day</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason (Optional)</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Doctor appointment"
              className="w-full rounded-lg border-gray-300 border p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none h-20 resize-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeaveRequestModal;
