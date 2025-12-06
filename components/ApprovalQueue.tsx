
import React from 'react';
import { LeaveDay, TeamMember } from '../types';
import { CheckCircle, XCircle, Clock, Calendar } from 'lucide-react';

interface ApprovalQueueProps {
  pendingLeaves: LeaveDay[];
  members: TeamMember[];
  onApprove: (leaveId: string) => void;
  onReject: (leaveId: string) => void;
}

const ApprovalQueue: React.FC<ApprovalQueueProps> = ({
  pendingLeaves,
  members,
  onApprove,
  onReject
}) => {
  if (pendingLeaves.length === 0) return null;

  const getMember = (id: string) => members.find(m => m.id === id);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-200 bg-orange-50/30">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5 text-orange-500" />
        Pending Approvals
        <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full">
          {pendingLeaves.length}
        </span>
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pendingLeaves.map(leave => {
          const member = getMember(leave.memberId);
          if (!member) return null;

          return (
            <div key={leave.id} className="bg-white p-4 rounded-lg border border-orange-100 shadow-sm flex items-start justify-between group hover:shadow-md transition-shadow">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                    {member.name.charAt(0)}
                  </div>
                  <span className="font-medium text-sm text-gray-900">{member.name}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(leave.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${leave.type === 'Full' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                    {leave.type} Day
                  </span>
                </div>

                {leave.reason && (
                  <p className="text-xs text-gray-500 mt-2 italic">"{leave.reason}"</p>
                )}
              </div>

              <div className="flex flex-col gap-2 ml-4">
                <button 
                  onClick={() => onApprove(leave.id)}
                  className="p-1.5 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                  title="Approve"
                >
                  <CheckCircle className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => onReject(leave.id)}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  title="Reject"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ApprovalQueue;
