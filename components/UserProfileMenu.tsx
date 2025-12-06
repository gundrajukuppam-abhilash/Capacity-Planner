
import React, { useState } from 'react';
import { User } from '../types';
import { LogOut, User as UserIcon, X, Check, Camera } from 'lucide-react';

interface UserProfileMenuProps {
  user: User;
  onLogout: () => void;
  onUpdateProfile: (updates: Partial<User>) => void;
}

const UserProfileMenu: React.FC<UserProfileMenuProps> = ({ user, onLogout, onUpdateProfile }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Edit State
  const [editName, setEditName] = useState(user.name);
  const [editAvatar, setEditAvatar] = useState(user.avatarUrl || '');

  const handleSaveProfile = () => {
    onUpdateProfile({ name: editName, avatarUrl: editAvatar });
    setIsEditModalOpen(false);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Avatar Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 hover:bg-gray-50 p-1.5 rounded-lg transition-colors border border-transparent hover:border-gray-200 outline-none"
      >
        <img 
          src={user.avatarUrl} 
          alt={user.name} 
          className="w-8 h-8 rounded-full bg-indigo-100 object-cover border border-gray-200"
        />
        <div className="text-left hidden md:block">
           <p className="text-xs font-semibold text-gray-800 leading-none">{user.name}</p>
           <p className="text-[10px] text-gray-500 leading-none mt-1">{user.role}</p>
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-50 py-1 animate-fadeIn">
            <div className="px-4 py-2 border-b border-gray-100 md:hidden">
              <p className="text-sm font-semibold text-gray-800">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
            
            <button 
              onClick={() => { setIsEditModalOpen(true); setIsOpen(false); }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600 flex items-center gap-2"
            >
              <UserIcon className="w-4 h-4" /> Edit Profile
            </button>
            <button 
              onClick={onLogout}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Log Out
            </button>
          </div>
        </>
      )}

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-fadeIn">
             <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-semibold text-gray-800">Edit Profile</h3>
                <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
             </div>
             
             <div className="p-6 space-y-4">
                <div className="flex justify-center mb-4">
                   <div className="relative group cursor-pointer">
                      <img 
                        src={editAvatar} 
                        alt="Avatar" 
                        className="w-20 h-20 rounded-full object-cover border-2 border-indigo-100"
                      />
                      <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <Camera className="w-6 h-6 text-white" />
                      </div>
                   </div>
                </div>

                <div>
                   <label className="block text-xs font-medium text-gray-500 mb-1">Full Name</label>
                   <input 
                      type="text" 
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full rounded-md border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                   />
                </div>
                <div>
                   <label className="block text-xs font-medium text-gray-500 mb-1">Avatar URL</label>
                   <input 
                      type="text" 
                      value={editAvatar}
                      onChange={(e) => setEditAvatar(e.target.value)}
                      className="w-full rounded-md border border-gray-300 p-2 text-xs focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-gray-600"
                   />
                </div>
                
                <div className="pt-2 flex gap-2">
                   <button 
                     onClick={() => setIsEditModalOpen(false)}
                     className="flex-1 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                   >
                     Cancel
                   </button>
                   <button 
                     onClick={handleSaveProfile}
                     className="flex-1 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-1"
                   >
                     <Check className="w-4 h-4" /> Save
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileMenu;
