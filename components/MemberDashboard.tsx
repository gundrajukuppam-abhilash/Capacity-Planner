

import React, { useState } from 'react';
import { LeaveDay, TeamMember } from '../types';
import { PlusCircle, Calendar, Clock, CheckCircle, Trash2, XCircle, AlertTriangle } from 'lucide-react';

interface MemberDashboardProps {
  leaves: LeaveDay[];
  members: TeamMember[];
  onOpenRequestModal: () => void;
  onDeleteRequest: (leaveId: string) => void;
}

const MemberDashboard: React.FC<MemberDashboardProps> = ({
  leaves,
  members,
  onOpenRequestModal,
  onDeleteRequest
}) => {
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; leaveId: string | null }>({
    isOpen: false,
    leaveId: null,
  });

  // Sort leaves by date descending (newest first)
  const sortedLeaves = [...leaves].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getMemberName = (id: string) => members.find(m => m.id === id)?.name || 'Unknown';

  const handleDeleteClick = (leaveId: string) => {
    setDeleteConfirmation({ isOpen: true, leaveId });
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmation.leaveId) {
      onDeleteRequest(deleteConfirmation.leaveId);
    }
    setDeleteConfirmation({ isOpen: false, leaveId: null });
  };

  const handleCancelDelete = () => {
    setDeleteConfirmation({ isOpen: false, leaveId: null });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Section 1: Request Leave Action */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Need time off?</h2>
          <p className="text-gray-500 mb-6">Submit your leave request for the current sprint. Your manager will review it shortly.</p>
          <button
            onClick={onOpenRequestModal}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-md"
          >
            <PlusCircle className="w-5 h-5" />
            Submit Leave Request
          </button>
        </div>
      </section>

      {/* Section 2: List of Requests */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gray-50/50">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-500" />
            Leave Requests & Status
          </h3>
        </div>
        
        {sortedLeaves.length === 0 ? (
          <div className="p-12 text-center text-gray-500 bg-gray-50/30">
            No leave requests found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 uppercase font-medium text-xs border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Team Member</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Reason</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedLeaves.map((leave) => (
                  <tr key={leave.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {new Date(leave.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-bold text-[10px]">
                           {getMemberName(leave.memberId).charAt(0)}
                        </div>
                        {getMemberName(leave.memberId)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${leave.type === 'Full' ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'}`}>
                        {leave.type} Day
                      </span>
                    </td>
                    <td className="px-6 py-4">
                       {leave.status === 'pending' && (
                         <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                           <Clock className="w-3 h-3" /> Pending
                         </span>
                       )}
                       {leave.status === 'approved' && (
                         <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                           <CheckCircle className="w-3 h-3" /> Approved
                         </span>
                       )}
                       {leave.status === 'rejected' && (
                         <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                           <XCircle className="w-3 h-3" /> Rejected
                         </span>
                       )}
                    </td>
                    <td className="px-6 py-4 text-gray-500 italic max-w-xs truncate">
                      {leave.reason || '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button 
                         onClick={() => handleDeleteClick(leave.id)}
                         className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors"
                         title="Delete Request"
                       >
                         <Trash2 className="w-4 h-4" />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Confirmation Modal */}
      {deleteConfirmation.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
               <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Leave Request?</h3>
            <p className="text-gray-500 mb-6 text-sm">
              Are you sure you want to delete this leave request? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm transition-colors"
              >
                No, Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm transition-colors"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberDashboard;