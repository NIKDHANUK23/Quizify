import React, { useState } from 'react';
import { User, Course, AuditLog, SystemStats, UserRole } from '../../types';
import { StatCard } from '../common/StatCard';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { api } from '../../lib/api';
import {
  Users,
  GraduationCap,
  BookOpen,
  Plus,
  Search,
  Shield,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  Activity,
  UserCheck
} from 'lucide-react';

interface AdminDashboardProps {
  activeTab: string;
  users: User[];
  courses: Course[];
  stats: SystemStats | null;
  logs: AuditLog[];
  onRefreshData: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  activeTab,
  users,
  courses,
  stats,
  logs,
  onRefreshData,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  
  // User Modal State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    role: 'student' as UserRole,
    department: 'Computer Science',
  });

  // Course Modal State
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [courseFormData, setCourseFormData] = useState({
    code: '',
    title: '',
    department: 'Computer Science',
    facultyId: '',
  });

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      await api.updateUser(editingUser.id, userFormData);
    } else {
      await api.createUser(userFormData);
    }
    setIsUserModalOpen(false);
    setEditingUser(null);
    setUserFormData({ name: '', email: '', role: 'student', department: 'Computer Science' });
    onRefreshData();
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      await api.deleteUser(id);
      onRefreshData();
    }
  };

  const handleToggleUserStatus = async (user: User) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    await api.updateUser(user.id, { status: newStatus });
    onRefreshData();
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    const assignedFaculty = users.find(u => u.id === courseFormData.facultyId);
    await api.createCourse({
      code: courseFormData.code,
      title: courseFormData.title,
      department: courseFormData.department,
      facultyId: courseFormData.facultyId,
      facultyName: assignedFaculty ? assignedFaculty.name : 'Unassigned',
    });
    setIsCourseModalOpen(false);
    setCourseFormData({ code: '', title: '', department: 'Computer Science', facultyId: '' });
    onRefreshData();
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 bg-[#141416] rounded-xl border border-white/10 text-[#F4F4F5] shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#D4AF37] text-xs font-bold uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4 text-[#D4AF37]" /> System Administrator Control Panel
          </div>
          <h2 className="text-2xl font-serif-title font-semibold tracking-tight text-[#F4F4F5]">Admin Overview</h2>
          <p className="text-[#A1A1AA] text-xs mt-1">Central Command & Control Center • Root Admin</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEditingUser(null);
              setUserFormData({ name: '', email: '', role: 'student', department: 'Computer Science' });
              setIsUserModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] hover:bg-[#c5a028] text-black rounded-lg text-xs font-semibold shadow-md transition-all"
          >
            <Plus className="w-4 h-4" /> Add User
          </button>
          <button
            onClick={() => setIsCourseModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#1C1C1E] hover:bg-white/10 text-[#F4F4F5] border border-white/10 rounded-lg text-xs font-semibold transition-all"
          >
            <BookOpen className="w-4 h-4 text-[#D4AF37]" /> Add Course
          </button>
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {(activeTab === 'overview' || !activeTab) && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Students" value={stats?.totalUsers || users.length} icon={Users} colorScheme="amber" subtitle="Enrolled in system" />
            <StatCard title="Active Faculty" value={stats?.totalFaculty || 0} icon={GraduationCap} colorScheme="purple" subtitle="Quiz Creators" />
            <StatCard title="Quizzes Hosted" value={stats?.totalQuizzes || 0} icon={UserCheck} colorScheme="emerald" subtitle="Active Test Takers" />
            <StatCard title="Avg. Pass Rate" value={`${stats?.averagePassRate || 88.4}%`} icon={Activity} colorScheme="amber" subtitle="Across all quizzes" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Users List */}
            <div className="bg-[#1C1C1E] p-6 rounded-xl border border-white/10 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-[#F4F4F5] flex items-center gap-2 font-serif-title">
                  <Users className="w-4 h-4 text-[#D4AF37]" /> Recent User Directory
                </h3>
                <span className="text-xs text-[#A1A1AA]">{users.length} total users</span>
              </div>
              <div className="divide-y divide-white/5">
                {users.slice(0, 5).map((user) => (
                  <div key={user.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-lg object-cover ring-1 ring-white/10" />
                      <div>
                        <div className="text-sm font-semibold text-[#F4F4F5]">{user.name}</div>
                        <div className="text-xs text-[#A1A1AA]">{user.email}</div>
                      </div>
                    </div>
                    <Badge variant={user.role === 'admin' ? 'danger' : user.role === 'faculty' ? 'primary' : 'success'}>
                      {user.role}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Courses Summary */}
            <div className="bg-[#1C1C1E] p-6 rounded-xl border border-white/10 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-[#F4F4F5] flex items-center gap-2 font-serif-title">
                  <BookOpen className="w-4 h-4 text-[#D4AF37]" /> Department Courses
                </h3>
                <span className="text-xs text-[#A1A1AA]">{courses.length} courses</span>
              </div>
              <div className="space-y-3">
                {courses.map((course) => (
                  <div key={course.id} className="p-3 bg-[#141416] rounded-lg border border-white/5 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-[#D4AF37]">{course.code}</div>
                      <div className="text-sm font-semibold text-[#F4F4F5]">{course.title}</div>
                      <div className="text-xs text-[#A1A1AA] mt-0.5">Faculty: {course.facultyName}</div>
                    </div>
                    <Badge variant="neutral">{course.department}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* USER DIRECTORY TAB */}
      {activeTab === 'users' && (
        <div className="bg-[#1C1C1E] rounded-xl border border-white/10 shadow-lg overflow-hidden">
          <div className="p-6 border-b border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-[#A1A1AA]" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#141416] border border-white/10 rounded-lg text-xs font-medium text-[#F4F4F5] placeholder-[#A1A1AA] focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              {['all', 'admin', 'faculty', 'student'].map((role) => (
                <button
                  key={role}
                  onClick={() => setRoleFilter(role)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                    roleFilter === role
                      ? 'bg-[#D4AF37] text-black font-bold'
                      : 'bg-[#141416] text-[#A1A1AA] hover:text-[#F4F4F5] border border-white/5'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#141416] border-b border-white/10 text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider">
                  <th className="p-4">User</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Department</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-lg object-cover ring-1 ring-white/10" />
                        <div>
                          <div className="font-semibold text-[#F4F4F5]">{user.name}</div>
                          <div className="text-[#A1A1AA] text-[11px]">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant={user.role === 'admin' ? 'danger' : user.role === 'faculty' ? 'primary' : 'success'}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="p-4 text-[#A1A1AA] font-medium">{user.department}</td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleUserStatus(user)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer ${
                          user.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {user.status === 'active' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        <span className="capitalize">{user.status}</span>
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingUser(user);
                            setUserFormData({
                              name: user.name,
                              email: user.email,
                              role: user.role,
                              department: user.department,
                            });
                            setIsUserModalOpen(true);
                          }}
                          className="p-1.5 text-[#A1A1AA] hover:text-[#D4AF37] hover:bg-white/5 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-1.5 text-[#A1A1AA] hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* COURSES TAB */}
      {activeTab === 'courses' && (
        <div className="bg-[#1C1C1E] p-6 rounded-xl border border-white/10 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-serif-title font-semibold text-[#F4F4F5]">Academic Courses & Departments</h3>
              <p className="text-xs text-[#A1A1AA]">Manage courses and faculty assignments.</p>
            </div>
            <button
              onClick={() => setIsCourseModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] text-black text-xs font-semibold rounded-lg hover:bg-[#c5a028] transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Course
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.map((course) => (
              <div key={course.id} className="p-4 bg-[#141416] rounded-xl border border-white/5 flex items-start justify-between">
                <div>
                  <span className="px-2 py-0.5 rounded bg-[#D4AF37]/15 text-[#D4AF37] text-xs font-bold">{course.code}</span>
                  <h4 className="text-base font-semibold text-[#F4F4F5] mt-2">{course.title}</h4>
                  <div className="text-xs text-[#A1A1AA] mt-1">Department: {course.department}</div>
                  <div className="text-xs font-semibold text-[#F4F4F5] mt-2 flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-[#D4AF37]" /> Lead Faculty: {course.facultyName}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AUDIT LOGS TAB */}
      {activeTab === 'logs' && (
        <div className="bg-[#1C1C1E] p-6 rounded-xl border border-white/10 shadow-lg space-y-4">
          <h3 className="text-lg font-serif-title font-semibold text-[#F4F4F5]">System Audit Trail & Event Logs</h3>
          <div className="divide-y divide-white/5 text-xs">
            {logs.map((log) => (
              <div key={log.id} className="py-3 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#F4F4F5]">{log.userName}</span>
                    <Badge variant={log.userRole === 'admin' ? 'danger' : log.userRole === 'faculty' ? 'primary' : 'success'}>
                      {log.userRole}
                    </Badge>
                    <span className="font-mono text-[10px] text-[#A1A1AA] bg-[#141416] px-1.5 py-0.5 rounded border border-white/5">{log.action}</span>
                  </div>
                  <p className="text-[#A1A1AA] mt-1">{log.details}</p>
                </div>
                <span className="text-[11px] text-[#A1A1AA] whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADD/EDIT USER MODAL */}
      <Modal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        title={editingUser ? 'Edit User Profile' : 'Add New User'}
        subtitle="Specify account details and role permissions"
      >
        <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#F4F4F5] mb-1">Full Name</label>
            <input
              type="text"
              required
              value={userFormData.name}
              onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
              className="w-full p-2.5 bg-[#141416] border border-white/10 rounded-lg text-xs font-medium text-[#F4F4F5] focus:border-[#D4AF37]"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#F4F4F5] mb-1">Email Address</label>
            <input
              type="email"
              required
              value={userFormData.email}
              onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
              className="w-full p-2.5 bg-[#141416] border border-white/10 rounded-lg text-xs font-medium text-[#F4F4F5] focus:border-[#D4AF37]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[#F4F4F5] mb-1">Role</label>
              <select
                value={userFormData.role}
                onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value as UserRole })}
                className="w-full p-2.5 bg-[#141416] border border-white/10 rounded-lg text-xs font-medium text-[#F4F4F5]"
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#F4F4F5] mb-1">Department</label>
              <input
                type="text"
                value={userFormData.department}
                onChange={(e) => setUserFormData({ ...userFormData, department: e.target.value })}
                className="w-full p-2.5 bg-[#141416] border border-white/10 rounded-lg text-xs font-medium text-[#F4F4F5]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsUserModalOpen(false)}
              className="px-4 py-2 bg-[#141416] text-[#A1A1AA] rounded-lg font-semibold hover:text-[#F4F4F5]"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-[#D4AF37] text-black rounded-lg font-semibold hover:bg-[#c5a028] shadow-md">
              Save User
            </button>
          </div>
        </form>
      </Modal>

      {/* ADD COURSE MODAL */}
      <Modal
        isOpen={isCourseModalOpen}
        onClose={() => setIsCourseModalOpen(false)}
        title="Create New Academic Course"
        subtitle="Add course details to catalog and assign lead faculty"
      >
        <form onSubmit={handleSaveCourse} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[#F4F4F5] mb-1">Course Code</label>
              <input
                type="text"
                placeholder="e.g. CS101"
                required
                value={courseFormData.code}
                onChange={(e) => setCourseFormData({ ...courseFormData, code: e.target.value })}
                className="w-full p-2.5 bg-[#141416] border border-white/10 rounded-lg text-xs font-medium text-[#F4F4F5]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#F4F4F5] mb-1">Department</label>
              <input
                type="text"
                value={courseFormData.department}
                onChange={(e) => setCourseFormData({ ...courseFormData, department: e.target.value })}
                className="w-full p-2.5 bg-[#141416] border border-white/10 rounded-lg text-xs font-medium text-[#F4F4F5]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#F4F4F5] mb-1">Course Title</label>
            <input
              type="text"
              placeholder="e.g. Data Structures & Algorithms"
              required
              value={courseFormData.title}
              onChange={(e) => setCourseFormData({ ...courseFormData, title: e.target.value })}
              className="w-full p-2.5 bg-[#141416] border border-white/10 rounded-lg text-xs font-medium text-[#F4F4F5]"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#F4F4F5] mb-1">Lead Faculty</label>
            <select
              value={courseFormData.facultyId}
              onChange={(e) => setCourseFormData({ ...courseFormData, facultyId: e.target.value })}
              className="w-full p-2.5 bg-[#141416] border border-white/10 rounded-lg text-xs font-medium text-[#F4F4F5]"
            >
              <option value="">Select Faculty Member...</option>
              {users
                .filter((u) => u.role === 'faculty')
                .map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.department})
                  </option>
                ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsCourseModalOpen(false)}
              className="px-4 py-2 bg-[#141416] text-[#A1A1AA] rounded-lg font-semibold hover:text-[#F4F4F5]"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-[#D4AF37] text-black rounded-lg font-semibold hover:bg-[#c5a028] shadow-md">
              Create Course
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
