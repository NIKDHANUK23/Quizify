import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LoginPage } from './components/LoginPage';
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

  // Authenticated User State (persisted in localStorage)
  const [authUser, setAuthUser] = useState(() => {
    try {
      const saved = localStorage.getItem('quizmaster_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

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

  const handleLogin = async ({ email, password, role }) => {
    try {
      const res = await api.loginUser({ email, password, role });
      if (res && res.user) {
        setAuthUser(res.user);
        localStorage.setItem('quizmaster_auth_user', JSON.stringify(res.user));
        setActiveTab('overview');
        return res.user;
      }
    } catch (err) {
      console.error('Login error:', err);
      throw err;
    }
  };

  const handleRegister = async (userData) => {
    try {
      const created = await api.createUser(userData);
      await fetchData(); // refresh database user list
      return created;
    } catch (err) {
      console.error('Registration error:', err);
      throw err;
    }
  };

  const handleLogout = () => {
    setAuthUser(null);
    localStorage.removeItem('quizmaster_auth_user');
  };

  // Role-specific navigation tabs
  const getRoleTabs = (role) => {
    if (role === 'admin') {
      return [
        { id: 'overview', label: 'System Overview', icon: LayoutDashboard },
        { id: 'users', label: 'User Directory', icon: Users },
        { id: 'courses', label: 'Courses Catalog', icon: BookOpen },
        { id: 'logs', label: 'Audit Trail', icon: Shield },
      ];
    }
    if (role === 'faculty') {
      return [
        { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'quizzes', label: 'Manage Quizzes', icon: FileText },
        { id: 'ai-generator', label: 'Gemini AI Builder', icon: Sparkles },
        { id: 'submissions', label: 'Student Results', icon: Award },
      ];
    }
    // Student
    return [
      { id: 'overview', label: 'Overview', icon: LayoutDashboard },
      { id: 'tests', label: 'Available Tests', icon: FileText },
      { id: 'results', label: 'My Scores', icon: CheckCircle2 },
    ];
  };

  return (
    <div className="app-container">
      <Navbar currentUser={authUser} onLogout={handleLogout} />

      <main className="main-content">
        {!authUser ? (
          <LoginPage onLogin={handleLogin} />
        ) : (
          <>
            {/* Navigation Tabs Bar for Logged-In User's Specific Role */}
            <div className="tabs-bar">
              {getRoleTabs(authUser.role).map((tab) => {
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

            {/* STRICT ROLE-BASED DASHBOARD ACCESS */}
            {authUser.role === 'admin' && (
              <AdminDashboard
                activeTab={activeTab}
                users={users}
                courses={courses}
                stats={stats}
                logs={logs}
                onRefreshData={fetchData}
              />
            )}

            {authUser.role === 'faculty' && (
              <FacultyDashboard
                activeTab={activeTab}
                currentUser={authUser}
                courses={courses}
                quizzes={quizzes}
                submissions={submissions}
                onRefreshData={fetchData}
              />
            )}

            {authUser.role === 'student' && (
              <StudentDashboard
                activeTab={activeTab}
                currentUser={authUser}
                quizzes={quizzes}
                submissions={submissions}
                onRefreshData={fetchData}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

