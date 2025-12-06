
import React from 'react';
import { User } from '../types';
import { UserCheck, Check, X } from 'lucide-react';

interface UserApprovalsProps {
  users: User[];
  onApprove: (userId: string) => void;
  onReject: (userId: string) => void;
}

const UserApprovals: React.FC<UserApprovalsProps> = ({ users, onApprove, onReject }) => {
  const pendingUsers = users.filter(u => u.status === 'pending');

  if (pendingUsers.length === 0) return null;

  return (
    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 mb-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <UserCheck className="w-5 h-5 text-indigo-600" />
        New User Requests
        <span className="bg-indigo-200 text-indigo-800 text-xs px-2 py-0.5 rounded-full">
          {pendingUsers.length}
        </span>
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pendingUsers.map(user => (
           <div key={user.id} className="bg-white p-4 rounded-lg shadow-sm border border-indigo-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full bg-gray-200" />
                 <div>
                    <p className="font-medium text-sm text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded mt-1 inline-block">
                       {user.role}
                    </span>
                 </div>
              </div>
              <div className="flex gap-1">
                 <button 
                   onClick={() => onApprove(user.id)}
                   className="p-2 bg-green-50 text-green-600 rounded-full hover:bg-green-100 transition-colors"
                   title="Approve"
                 >
                    <Check className="w-4 h-4" />
                 </button>
                 <button 
                   onClick={() => onReject(user.id)}
                   className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors"
                   title="Reject"
                 >
                    <X className="w-4 h-4" />
                 </button>
              </div>
           </div>
        ))}
      </div>
    </div>
  );
};

export default UserApprovals;
