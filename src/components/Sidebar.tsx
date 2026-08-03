import React from 'react';
import { UserRole } from '../types';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileText,
  Sparkles,
  Award,
  CheckCircle2,
  BarChart2,
  History,
  HelpCircle,
  Clock
} from 'lucide-react';

interface SidebarProps {
  role: UserRole;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  pendingGradingCount?: number;
}

interface NavItem {
  id: string;
  label: string;
  icon: any;
  badge?: string;
  count?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  role,
  activeTab,
  onSelectTab,
  pendingGradingCount = 0,
}) => {
  const adminNav: NavItem[] = [
    { id: 'overview', label: 'System Overview', icon: LayoutDashboard },
    { id: 'users', label: 'User Directory', icon: Users },
    { id: 'courses', label: 'Course Catalog', icon: BookOpen },
    { id: 'logs', label: 'Audit Logs', icon: History },
  ];

  const facultyNav: NavItem[] = [
    { id: 'overview', label: 'Faculty Hub', icon: LayoutDashboard },
    { id: 'quizzes', label: 'Quiz Management', icon: FileText },
    { id: 'ai-generator', label: 'AI Quiz Creator', icon: Sparkles, badge: 'AI' },
    {
      id: 'submissions',
      label: 'Submissions & Grading',
      icon: CheckCircle2,
      count: pendingGradingCount,
    },
  ];

  const studentNav: NavItem[] = [
    { id: 'overview', label: 'Student Dashboard', icon: LayoutDashboard },
    { id: 'available-quizzes', label: 'Available Quizzes', icon: Clock },
    { id: 'my-grades', label: 'My Submissions', icon: Award },
    { id: 'analytics', label: 'Performance Trends', icon: BarChart2 },
  ];

  const navItems = role === 'admin' ? adminNav : role === 'faculty' ? facultyNav : studentNav;

  return (
    <aside className="w-full lg:w-64 bg-[#141416] border-r border-white/10 p-4 shrink-0 flex flex-col justify-between">
      <div>
        <div className="mb-4 px-3 py-2 bg-[#1C1C1E] rounded-lg border border-white/5 flex items-center justify-between">
          <span className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-widest">Management</span>
          <span className="text-xs font-semibold text-[#D4AF37] capitalize">{role} Hub</span>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30'
                    : 'text-[#A1A1AA] hover:text-[#F4F4F5] hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#D4AF37]' : 'text-[#A1A1AA]'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#D4AF37] text-black uppercase tracking-wider">
                    {item.badge}
                  </span>
                )}

                {item.count !== undefined && item.count > 0 && (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : 'bg-rose-500/20 text-rose-400'}`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-8 p-4 bg-[#1C1C1E] rounded-xl border border-white/5 text-xs text-[#A1A1AA]">
        <div className="flex items-center gap-2 font-semibold text-[#F4F4F5] mb-1">
          <HelpCircle className="w-4 h-4 text-[#D4AF37]" />
          <span>Capability Tip</span>
        </div>
        {role === 'admin' && 'You have full authority to invite users, manage department courses, and review security logs.'}
        {role === 'faculty' && 'Use AI Quiz Creator to instantly generate question banks or manually build customized assessments.'}
        {role === 'student' && 'Take timed quizzes, view real-time countdowns, and review detailed answer keys upon completion.'}
      </div>
    </aside>
  );
};
