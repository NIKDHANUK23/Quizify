import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { FacultyDashboard } from './components/faculty/FacultyDashboard';
import { StudentDashboard } from './components/student/StudentDashboard';
import { api } from './api';
import { LayoutDashboard, Users, BookOpen, FileText, Sparkles, Award, Shield, CheckCircle2 } from 'lucide-react';

export function App() {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // User Role & Tab State
  const [currentRole, setCurrentRole] = useState('faculty'); // default role
  const [activeTab, setActiveTab] = useState('overview');

  const fetchData = async () => {
    try {
      const [u, c, q, s, st, l] = await Promise.all([
        api.getUsers(),
        api.getCourses(),
        api.getQuizzes(),
        api.getSubmissions(),
        api.getStats(),
        api.getLogs(),
      ]);

      setUsers(u || []);
      setCourses(c || []);
      setQuizzes(q || []);
      setSubmissions(s || []);
      setStats(st || null);
      setLogs(l || []);
    } catch (err) {
      console.error('Error fetching MERN backend data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const currentUser =
    users.find((u) => u.role === currentRole) ||
    ({
      admin: { name: 'Elena Rostova', email: 'elena.admin@university.edu', role: 'admin', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150' },
      faculty: { name: 'Dr. Sarah Jenkins', email: 'sarah.jenkins@university.edu', role: 'faculty', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
      student: { name: 'Alex Rivera', email: 'alex.rivera@student.edu', role: 'student', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150' },
    }[currentRole]);

  const handleRoleSelect = (role) => {
    setCurrentRole(role);
    setActiveTab('overview');
  };

  const roleTabs = {
    admin: [
      { id: 'overview', label: 'System Overview', icon: LayoutDashboard },
      { id: 'users', label: 'User Directory', icon: Users },
      { id: 'courses', label: 'Courses Catalog', icon: BookOpen },
      { id: 'logs', label: 'Audit Trail', icon: Shield },
    ],
    faculty: [
      { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'quizzes', label: 'Manage Quizzes', icon: FileText },
      { id: 'ai-generator', label: 'Gemini AI Builder', icon: Sparkles },
      { id: 'submissions', label: 'Student Results', icon: Award },
    ],
    student: [
      { id: 'overview', label: 'Overview', icon: LayoutDashboard },
      { id: 'tests', label: 'Available Tests', icon: FileText },
      { id: 'results', label: 'My Scores', icon: CheckCircle2 },
    ],
  }[currentRole];

  return (
    <div className="app-container">
      <Navbar currentUser={currentUser} onRoleSelect={handleRoleSelect} />

      <main className="main-content">
        {/* Role Tab Navigation Bar */}
        <div className="tabs-bar">
          {roleTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Dynamic Dashboard View */}
        {currentRole === 'admin' && (
          <AdminDashboard
            activeTab={activeTab}
            users={users}
            courses={courses}
            stats={stats}
            logs={logs}
            onRefreshData={fetchData}
          />
        )}

        {currentRole === 'faculty' && (
          <FacultyDashboard
            activeTab={activeTab}
            currentUser={currentUser}
            courses={courses}
            quizzes={quizzes}
            submissions={submissions}
            onRefreshData={fetchData}
          />
        )}

        {currentRole === 'student' && (
          <StudentDashboard
            activeTab={activeTab}
            currentUser={currentUser}
            quizzes={quizzes}
            submissions={submissions}
            onRefreshData={fetchData}
          />
        )}
      </main>
    </div>
  );
}
