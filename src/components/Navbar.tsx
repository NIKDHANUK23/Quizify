import React from 'react';
import { User } from '../types';
import { Shield, GraduationCap, UserCheck, Sparkles, Check } from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  allUsers: User[];
  onSwitchUser: (user: User) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentUser, allUsers, onSwitchUser }) => {
  const [showRoleMenu, setShowRoleMenu] = React.useState(false);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-4 h-4 text-rose-400" />;
      case 'faculty':
        return <GraduationCap className="w-4 h-4 text-[#D4AF37]" />;
      default:
        return <UserCheck className="w-4 h-4 text-emerald-400" />;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      case 'faculty':
        return 'bg-[#D4AF37]/15 text-[#D4AF37] border-[#D4AF37]/30';
      default:
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#141416]/95 backdrop-blur-md border-b border-white/10 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#D4AF37] flex items-center justify-center text-black font-bold shadow-lg shadow-[#D4AF37]/20">
            <Sparkles className="w-5 h-5 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-serif-title font-semibold text-[#F4F4F5] tracking-tight">
                Examen<span className="text-[#D4AF37]">.AI</span>
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-white/5 text-[#D4AF37] border border-[#D4AF37]/30">
                Enterprise
              </span>
            </div>
            <p className="text-xs text-[#A1A1AA] hidden sm:block">Full-Stack Assessment & Analytics Platform</p>
          </div>
        </div>

        {/* Quick Role Switcher Pill */}
        <div className="relative">
          <div className="flex items-center gap-1.5 bg-[#0A0A0B] p-1.5 rounded-xl border border-white/10">
            <span className="text-xs font-semibold text-[#A1A1AA] px-2 hidden md:inline">Quick Switch Persona:</span>
            
            {['admin', 'faculty', 'student'].map((role) => {
              const targetUser = allUsers.find((u) => u.role === role);
              const isActive = currentUser.role === role;

              return (
                <button
                  key={role}
                  onClick={() => targetUser && onSwitchUser(targetUser)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-[#1C1C1E] text-[#D4AF37] border border-[#D4AF37]/30 shadow-xs'
                      : 'text-[#A1A1AA] hover:text-[#F4F4F5] hover:bg-white/5'
                  }`}
                >
                  {getRoleIcon(role)}
                  <span className="capitalize">{role}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-3 p-1.5 pr-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
          >
            <img
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={currentUser.name}
              className="w-9 h-9 rounded-lg object-cover ring-2 ring-[#D4AF37]/30"
            />
            <div className="text-left hidden sm:block">
              <div className="text-xs font-semibold text-[#F4F4F5] leading-tight">{currentUser.name}</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border uppercase ${getRoleBadge(currentUser.role)}`}>
                  {currentUser.role}
                </span>
                <span className="text-[11px] text-[#A1A1AA] truncate max-w-[100px]">{currentUser.department}</span>
              </div>
            </div>
          </button>

          {/* User Select Modal / Dropdown */}
          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-[#1C1C1E] rounded-xl shadow-2xl border border-white/10 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-2 border-b border-white/10">
                <p className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">Switch Account Demo</p>
              </div>
              <div className="max-h-64 overflow-y-auto p-1">
                {allUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => {
                      onSwitchUser(user);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left text-xs transition-all ${
                      currentUser.id === user.id ? 'bg-[#D4AF37]/15 text-[#D4AF37] font-bold' : 'hover:bg-white/5 text-[#F4F4F5]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-md object-cover" />
                      <div>
                        <div className="font-semibold text-[#F4F4F5]">{user.name}</div>
                        <div className="text-[10px] text-[#A1A1AA] capitalize">{user.role} • {user.department}</div>
                      </div>
                    </div>
                    {currentUser.id === user.id && <Check className="w-4 h-4 text-[#D4AF37]" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
