import React, { useState, useEffect } from 'react';
import { User, Course, Quiz, Submission, AuditLog, SystemStats } from './types';
import { api } from './lib/api';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { FacultyDashboard } from './components/faculty/FacultyDashboard';
import { StudentDashboard } from './components/student/StudentDashboard';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadAllData = async () => {
    try {
      const [uData, cData, qData, sData, statsData, lData] = await Promise.all([
        api.getUsers(),
        api.getCourses(),
        api.getQuizzes(),
        api.getSubmissions(),
        api.getSystemStats(),
        api.getAuditLogs(),
      ]);

      setUsers(uData);
      setCourses(cData);
      setQuizzes(qData);
      setSubmissions(sData);
      setStats(statsData);
      setLogs(lData);

      // Set default user if not set
      if (!currentUser && uData.length > 0) {
        // Default to Admin or Faculty for rich demo controls
        const defaultAdmin = uData.find((u) => u.role === 'admin') || uData[0];
        setCurrentUser(defaultAdmin);
      }
    } catch (err) {
      console.error('Error fetching data from server:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleSwitchUser = (user: User) => {
    setCurrentUser(user);
    setActiveTab('overview'); // Reset to default overview for new role
  };

  if (isLoading || !currentUser) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] text-[#F4F4F5] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#D4AF37]" />
        <div className="text-center">
          <h2 className="text-xl font-serif-title font-bold tracking-tight text-[#F4F4F5]">Loading Examen.AI...</h2>
          <p className="text-xs text-[#A1A1AA] mt-1">Connecting to institutional Express REST backend</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] flex flex-col text-[#F4F4F5] font-sans selection:bg-[#D4AF37] selection:text-black">
      {/* Top Header Navbar */}
      <Navbar
        currentUser={currentUser}
        allUsers={users}
        onSwitchUser={handleSwitchUser}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col lg:flex-row">
        {/* Left Sidebar Navigation */}
        <Sidebar
          role={currentUser.role}
          activeTab={activeTab}
          onSelectTab={(tab) => setActiveTab(tab)}
          pendingGradingCount={submissions.filter((s) => s.status === 'in-progress').length}
        />

        {/* Dynamic Center Dashboard based on Active User Role */}
        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden bg-[#0A0A0B]">
          {currentUser.role === 'admin' && (
            <AdminDashboard
              activeTab={activeTab}
              users={users}
              courses={courses}
              stats={stats}
              logs={logs}
              onRefreshData={loadAllData}
            />
          )}

          {currentUser.role === 'faculty' && (
            <FacultyDashboard
              activeTab={activeTab}
              currentUser={currentUser}
              courses={courses}
              quizzes={quizzes}
              submissions={submissions}
              onRefreshData={loadAllData}
            />
          )}

          {currentUser.role === 'student' && (
            <StudentDashboard
              activeTab={activeTab}
              currentUser={currentUser}
              quizzes={quizzes}
              submissions={submissions}
              onRefreshData={loadAllData}
            />
          )}
        </main>
      </div>
    </div>
  );
}
