import React, { useState } from 'react';
import { StatCard } from '../StatCard';
import { Badge } from '../Badge';
import { Modal } from '../Modal';
import { api } from '../../api';
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

export function AdminDashboard({ activeTab, users = [], courses = [], stats, logs = [], onRefreshData }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // User Modal State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    role: 'student',
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

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (editingUser) {
      await api.updateUser(editingUser.id || editingUser._id, userFormData);
    } else {
      await api.createUser(userFormData);
    }
    setIsUserModalOpen(false);
    setEditingUser(null);
    setUserFormData({ name: '', email: '', role: 'student', department: 'Computer Science' });
    onRefreshData();
  };

  const handleDeleteUser = async (id) => {
    if (confirm('Are you sure you want to delete this user?')) {
      await api.deleteUser(id);
      onRefreshData();
    }
  };

  const handleToggleUserStatus = async (user) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    await api.updateUser(user.id || user._id, { status: newStatus });
    onRefreshData();
  };

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    const assignedFaculty = users.find((u) => u.id === courseFormData.facultyId || u._id === courseFormData.facultyId);
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
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Banner */}
      <div className="card" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', background: '#141416' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--gold-primary)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
            <Shield className="w-4 h-4" /> System Administrator Control Panel
          </div>
          <h2 className="font-title" style={{ fontSize: '1.5rem', fontWeight: 600, marginTop: '4px' }}>Admin Overview</h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>MERN Central Control Hub • Express MongoDB Sync</p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => {
              setEditingUser(null);
              setUserFormData({ name: '', email: '', role: 'student', department: 'Computer Science' });
              setIsUserModalOpen(true);
            }}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4" /> Add User
          </button>
          <button onClick={() => setIsCourseModalOpen(true)} className="btn btn-secondary">
            <BookOpen className="w-4 h-4" style={{ color: 'var(--gold-primary)' }} /> Add Course
          </button>
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {(activeTab === 'overview' || !activeTab) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="grid-cols-4">
            <StatCard title="Total Users" value={stats?.totalUsers || users.length} icon={Users} subtitle="Registered accounts" />
            <StatCard title="Faculty Members" value={stats?.totalFaculty || 0} icon={GraduationCap} subtitle="Quiz creators" />
            <StatCard title="Quizzes Hosted" value={stats?.totalQuizzes || 0} icon={UserCheck} subtitle="Active tests" />
            <StatCard title="Average Pass Rate" value={`${stats?.averagePassRate || 88}%`} icon={Activity} subtitle="Overall accuracy" />
          </div>

          <div className="grid-cols-2">
            {/* Quick Users Directory */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 className="font-title" style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Users className="w-4 h-4" style={{ color: 'var(--gold-primary)' }} /> User Directory
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{users.length} total</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {users.slice(0, 5).map((user) => (
                  <div key={user.id || user._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img src={user.avatar} alt={user.name} style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover' }} />
                      <div>
                        <div style={{ fontSize: '0.825rem', fontWeight: 600 }}>{user.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{user.email}</div>
                      </div>
                    </div>
                    <Badge variant={user.role === 'admin' ? 'danger' : user.role === 'faculty' ? 'gold' : 'success'}>
                      {user.role}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Courses Overview */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 className="font-title" style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BookOpen className="w-4 h-4" style={{ color: 'var(--gold-primary)' }} /> Courses Catalog
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{courses.length} courses</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {courses.map((course) => (
                  <div key={course.id || course._id} style={{ padding: '10px', background: 'var(--bg-input)', borderRadius: '8px', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gold-primary)' }}>{course.code}</span>
                      <div style={{ fontSize: '0.825rem', fontWeight: 600 }}>{course.title}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Faculty: {course.facultyName}</div>
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
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-light)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
            <div style={{ position: 'relative', width: '280px' }}>
              <Search className="w-4 h-4" style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search user or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input"
                style={{ paddingLeft: '34px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '4px' }}>
              {['all', 'admin', 'faculty', 'student'].map((role) => (
                <button
                  key={role}
                  onClick={() => setRoleFilter(role)}
                  className={`btn ${roleFilter === role ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ textTransform: 'capitalize', padding: '6px 12px', fontSize: '0.75rem' }}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id || user._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src={user.avatar} alt={user.name} style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }} />
                        <div>
                          <div style={{ fontWeight: 600 }}>{user.name}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <Badge variant={user.role === 'admin' ? 'danger' : user.role === 'faculty' ? 'gold' : 'success'}>
                        {user.role}
                      </Badge>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{user.department}</td>
                    <td>
                      <button
                        onClick={() => handleToggleUserStatus(user)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: user.status === 'active' ? 'var(--accent-emerald)' : 'var(--text-muted)',
                        }}
                      >
                        {user.status === 'active' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        <span style={{ textTransform: 'capitalize', fontSize: '0.75rem', fontWeight: 600 }}>{user.status}</span>
                      </button>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
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
                          className="btn btn-secondary"
                          style={{ padding: '4px 8px' }}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id || user._id)}
                          className="btn btn-danger"
                          style={{ padding: '4px 8px' }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 className="font-title" style={{ fontSize: '1.1rem', fontWeight: 600 }}>Courses Directory</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Manage course offerings and assign lead faculty members.</p>
            </div>
            <button onClick={() => setIsCourseModalOpen(true)} className="btn btn-primary">
              <Plus className="w-4 h-4" /> Add Course
            </button>
          </div>

          <div className="grid-cols-2">
            {courses.map((course) => (
              <div key={course.id || course._id} style={{ padding: '1rem', background: 'var(--bg-input)', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                <span className="badge badge-gold">{course.code}</span>
                <h4 style={{ fontSize: '1rem', fontWeight: 600, marginTop: '8px' }}>{course.title}</h4>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Department: {course.department}</div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <GraduationCap className="w-4 h-4" style={{ color: 'var(--gold-primary)' }} /> Lead: {course.facultyName}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AUDIT LOGS TAB */}
      {activeTab === 'logs' && (
        <div className="card">
          <h3 className="font-title" style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Audit Trail & Event Logs</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {logs.map((log) => (
              <div key={log.id || log._id} style={{ paddingBottom: '8px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.825rem' }}>{log.userName}</span>
                    <Badge variant={log.userRole === 'admin' ? 'danger' : 'gold'}>{log.userRole}</Badge>
                    <span style={{ fontSize: '0.7rem', color: 'var(--gold-primary)', background: 'var(--gold-subtle)', padding: '2px 6px', borderRadius: '4px' }}>{log.action}</span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>{log.details}</p>
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* USER MODAL */}
      <Modal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} title={editingUser ? 'Edit User Profile' : 'Add New User'}>
        <form onSubmit={handleSaveUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="label">Full Name</label>
            <input
              type="text"
              required
              value={userFormData.name}
              onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
              className="input"
            />
          </div>

          <div>
            <label className="label">Email Address</label>
            <input
              type="email"
              required
              value={userFormData.email}
              onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
              className="input"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="label">Role</label>
              <select
                value={userFormData.role}
                onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                className="select"
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="label">Department</label>
              <input
                type="text"
                value={userFormData.department}
                onChange={(e) => setUserFormData({ ...userFormData, department: e.target.value })}
                className="input"
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '1rem' }}>
            <button type="button" onClick={() => setIsUserModalOpen(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">Save User</button>
          </div>
        </form>
      </Modal>

      {/* COURSE MODAL */}
      <Modal isOpen={isCourseModalOpen} onClose={() => setIsCourseModalOpen(false)} title="Create New Academic Course">
        <form onSubmit={handleSaveCourse} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="label">Course Code</label>
              <input
                type="text"
                placeholder="e.g. CS101"
                required
                value={courseFormData.code}
                onChange={(e) => setCourseFormData({ ...courseFormData, code: e.target.value })}
                className="input"
              />
            </div>

            <div>
              <label className="label">Department</label>
              <input
                type="text"
                value={courseFormData.department}
                onChange={(e) => setCourseFormData({ ...courseFormData, department: e.target.value })}
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="label">Course Title</label>
            <input
              type="text"
              placeholder="e.g. Data Structures & Algorithms"
              required
              value={courseFormData.title}
              onChange={(e) => setCourseFormData({ ...courseFormData, title: e.target.value })}
              className="input"
            />
          </div>

          <div>
            <label className="label">Lead Faculty</label>
            <select
              value={courseFormData.facultyId}
              onChange={(e) => setCourseFormData({ ...courseFormData, facultyId: e.target.value })}
              className="select"
            >
              <option value="">Select Faculty...</option>
              {users
                .filter((u) => u.role === 'faculty')
                .map((f) => (
                  <option key={f.id || f._id} value={f.id || f._id}>
                    {f.name} ({f.department})
                  </option>
                ))}
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '1rem' }}>
            <button type="button" onClick={() => setIsCourseModalOpen(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">Create Course</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
