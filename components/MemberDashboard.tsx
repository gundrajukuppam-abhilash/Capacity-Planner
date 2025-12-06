
import React, { useState } from 'react';
import { LeaveDay, TeamMember } from '../types';
import { PlusCircle, Calendar, Clock, CheckCircle, Trash2, XCircle, AlertTriangle, History, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';

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

  const [sortConfig, setSortConfig] = useState<{ key: 'date' | 'status' | 'type'; direction: 'asc' | 'desc' }>({
    key: 'date',
    direction: 'desc'
  });

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

  // Sorting Logic
  const handleSort = (key: 'date' | 'status' | 'type') => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortData = (data: LeaveDay[]) => {
    return [...data].sort((a, b) => {
      let res = 0;
      if (sortConfig.key === 'date') {
        res = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortConfig.key === 'status') {
        res = a.status.localeCompare(b.status);
      } else if (sortConfig.key === 'type') {
        res = a.type.localeCompare(b.type);
      }
      return sortConfig.direction === 'asc' ? res : -res;
    });
  };

  const getSortIcon = (key: 'date' | 'status' | 'type') => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-50 transition-opacity" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="w-3 h-3 text-indigo-600" />
      : <ArrowDown className="w-3 h-3 text-indigo-600" />;
  };

  // Date Logic for splitting Active vs History
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;

  // Filter first
  const upcomingLeavesRaw = leaves.filter(l => l.date >= todayStr || l.status === 'pending');
  const historyLeavesRaw = leaves.filter(l => l.date < todayStr && l.status !== 'pending');

  // Then Sort
  const upcomingLeaves = sortData(upcomingLeavesRaw);
  const historyLeaves = sortData(historyLeavesRaw);

  const renderTable = (data: LeaveDay[], emptyMessage: string) => (
    <>
      {data.length === 0 ? (
        <div className="p-12 text-center text-gray-500 bg-gray-50/30 text-sm">
          {emptyMessage}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase font-medium text-xs border-b border-gray-200">
              <tr>
                <th 
                  className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors group select-none"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center gap-1.5">
                    Date {getSortIcon('date')}
                  </div>
                </th>
                <th className="px-6 py-4">Team Member</th>
                <th 
                  className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors group select-none"
                  onClick={() => handleSort('type')}
                >
                  <div className="flex items-center gap-1.5">
                    Type {getSortIcon('type')}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors group select-none"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-1.5">
                    Status {getSortIcon('status')}
                  </div>
                </th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((leave) => (
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
    </>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
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

      {/* Section 2: Active Requests */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gray-50/50">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            Current & Upcoming Requests
          </h3>
        </div>
        {renderTable(upcomingLeaves, "No pending or upcoming leave requests.")}
      </section>

      {/* Section 3: History */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gray-50/50">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <History className="w-5 h-5 text-gray-500" />
            Request History
          </h3>
        </div>
        {renderTable(historyLeaves, "No past leave history.")}
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
