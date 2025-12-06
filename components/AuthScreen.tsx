
import React, { useState } from 'react';
import { User } from '../types';
import { LayoutDashboard, UserPlus, LogIn, AlertCircle, MapPin, ChevronDown } from 'lucide-react';

interface AuthScreenProps {
  users: User[];
  onLogin: (email: string) => void;
  onRegister: (user: Omit<User, 'id' | 'status'>) => void;
}

const LOCATIONS = ['Bangalore', 'Hyderabad', 'Pune', 'Mumbai', 'Gurgaon', 'Kolkata'];

const AuthScreen: React.FC<AuthScreenProps> = ({ users, onLogin, onRegister }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'Manager' | 'Member'>('Member');
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        setError('User not found. Please register.');
        return;
      }
      if (user.status === 'pending') {
        setError('Account is pending approval by a manager.');
        return;
      }
      if (user.status === 'rejected') {
        setError('Account registration was rejected.');
        return;
      }
      onLogin(email);
    } else {
      // Registration
      if (!email || !name) {
        setError('Please fill in all fields.');
        return;
      }
      if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        setError('Email already exists. Please login.');
        return;
      }
      
      onRegister({
        name,
        email,
        role,
        location,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
      });
      alert('Registration successful! Please wait for manager approval.');
      setIsLogin(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <div className="bg-indigo-600 p-3 rounded-xl inline-flex mb-4 shadow-lg">
          <LayoutDashboard className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">SprintSync AI</h1>
        <p className="text-gray-500 mt-2">Intelligent Capacity Planning for Modern Teams</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => { setIsLogin(true); setError(''); }}
            className={`flex-1 py-4 text-sm font-medium transition-colors ${isLogin ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Login
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(''); }}
            className={`flex-1 py-4 text-sm font-medium transition-colors ${!isLogin ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Register
          </button>
        </div>

        <div className="p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  placeholder="John Doe"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="you@company.com"
              />
            </div>

            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
                    <select
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all appearance-none bg-white text-gray-900 cursor-pointer"
                    >
                      {LOCATIONS.map(loc => (
                        <option key={loc} value={loc} className="text-gray-900 bg-white">{loc}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">I am a...</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setRole('Member')}
                      className={`p-3 rounded-lg border text-sm font-medium transition-all ${role === 'Member' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}
                    >
                      Team Member
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('Manager')}
                      className={`p-3 rounded-lg border text-sm font-medium transition-all ${role === 'Manager' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}
                    >
                      Manager
                    </button>
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 mt-6 flex items-center justify-center gap-2"
            >
              {isLogin ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {isLogin && (
            <div className="mt-6 text-center text-xs text-gray-400">
               <p>Test Accounts:</p>
               <p className="mt-1">Manager: <span className="font-mono text-gray-600">abhilash@sprintsync.com</span></p>
               <p>Member: <span className="font-mono text-gray-600">buddy@sprintsync.com</span></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
