import React, { useState } from 'react';
import { User, Course, Quiz, Submission, Question, QuestionType } from '../../types';
import { StatCard } from '../common/StatCard';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { api } from '../../lib/api';
import {
  FileText,
  Plus,
  Sparkles,
  Award,
  Clock,
  CheckCircle2,
  Trash2,
  Edit,
  Download,
  BookOpen,
  HelpCircle,
  Loader2
} from 'lucide-react';

interface FacultyDashboardProps {
  activeTab: string;
  currentUser: User;
  courses: Course[];
  quizzes: Quiz[];
  submissions: Submission[];
  onRefreshData: () => void;
  onOpenAIGenerator?: () => void;
}

export const FacultyDashboard: React.FC<FacultyDashboardProps> = ({
  activeTab,
  currentUser,
  courses,
  quizzes,
  submissions,
  onRefreshData,
}) => {
  // Quiz Builder Modal State
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  
  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    courseId: courses[0]?.id || '',
    durationMinutes: 20,
    passPercentage: 70,
    startDate: new Date().toISOString().slice(0, 16),
    endDate: new Date(Date.now() + 86400000 * 30).toISOString().slice(0, 16),
    isPublished: true,
    questions: [] as Question[],
  });

  // Question Builder State
  const [newQuestion, setNewQuestion] = useState<Question>({
    id: '',
    text: '',
    type: 'multiple-choice',
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correctAnswer: 0,
    explanation: '',
    points: 10,
  });

  // AI Generator Modal State
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiCourseCode, setAiCourseCode] = useState('CS101');
  const [aiDifficulty, setAiDifficulty] = useState('intermediate');
  const [aiCount, setAiCount] = useState(4);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Manual Grading Modal State
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [gradingSubmission, setGradingSubmission] = useState<Submission | null>(null);
  const [gradeFeedback, setGradeFeedback] = useState<Record<string, { pointsEarned: number; feedback: string }>>({});

  const facultyCourses = courses.filter((c) => c.facultyId === currentUser.id) || courses;
  const facultyQuizzes = quizzes.filter((q) => q.facultyId === currentUser.id || true); // Allow view all for demo

  const handleAddQuestion = () => {
    if (!newQuestion.text.trim()) return;
    const qToAdd: Question = {
      ...newQuestion,
      id: `q-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    setQuizForm((prev) => ({
      ...prev,
      questions: [...prev.questions, qToAdd],
    }));
    setNewQuestion({
      id: '',
      text: '',
      type: 'multiple-choice',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 0,
      explanation: '',
      points: 10,
    });
  };

  const handleRemoveQuestion = (index: number) => {
    setQuizForm((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  };

  const handleSaveQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedCourse = courses.find((c) => c.id === quizForm.courseId) || courses[0];

    const payload = {
      title: quizForm.title,
      description: quizForm.description,
      courseId: selectedCourse?.id || 'c-101',
      courseCode: selectedCourse?.code || 'CS101',
      courseName: selectedCourse?.title || 'General Course',
      facultyId: currentUser.id,
      facultyName: currentUser.name,
      durationMinutes: Number(quizForm.durationMinutes),
      passPercentage: Number(quizForm.passPercentage),
      startDate: new Date(quizForm.startDate).toISOString(),
      endDate: new Date(quizForm.endDate).toISOString(),
      isPublished: quizForm.isPublished,
      questions: quizForm.questions,
    };

    if (editingQuiz) {
      await api.updateQuiz(editingQuiz.id, payload);
    } else {
      await api.createQuiz(payload);
    }

    setIsQuizModalOpen(false);
    setEditingQuiz(null);
    onRefreshData();
  };

  const handleDeleteQuiz = async (id: string) => {
    if (confirm('Delete this quiz? Student history will be archived.')) {
      await api.deleteQuiz(id);
      onRefreshData();
    }
  };

  const handleGenerateAIQuiz = async () => {
    if (!aiTopic.trim()) return;
    setIsAiGenerating(true);
    setAiError(null);

    try {
      const generated = await api.generateAIQuiz({
        topic: aiTopic,
        courseCode: aiCourseCode,
        difficulty: aiDifficulty,
        numberOfQuestions: aiCount,
      });

      setQuizForm({
        title: generated.title || `Quiz on ${aiTopic}`,
        description: generated.description || `AI-generated assessment for ${aiTopic}`,
        courseId: courses.find((c) => c.code === aiCourseCode)?.id || courses[0]?.id || '',
        durationMinutes: generated.durationMinutes || 15,
        passPercentage: generated.passPercentage || 70,
        startDate: new Date().toISOString().slice(0, 16),
        endDate: new Date(Date.now() + 86400000 * 30).toISOString().slice(0, 16),
        isPublished: true,
        questions: (generated.questions as Question[]) || [],
      });

      setIsAIModalOpen(false);
      setIsQuizModalOpen(true);
    } catch (err: any) {
      setAiError(err.message || 'Failed to generate quiz');
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleOpenGrading = (sub: Submission) => {
    setGradingSubmission(sub);
    const initialFeedback: Record<string, { pointsEarned: number; feedback: string }> = {};
    Object.keys(sub.answers).forEach((qId) => {
      initialFeedback[qId] = {
        pointsEarned: sub.answers[qId].pointsEarned || 0,
        feedback: sub.answers[qId].feedback || '',
      };
    });
    setGradeFeedback(initialFeedback);
    setIsGradeModalOpen(true);
  };

  const handleSaveGrading = async () => {
    if (!gradingSubmission) return;
    const answerUpdates: Record<string, any> = {};
    Object.keys(gradeFeedback).forEach((qId) => {
      answerUpdates[qId] = {
        pointsEarned: Number(gradeFeedback[qId].pointsEarned),
        isCorrect: Number(gradeFeedback[qId].pointsEarned) > 0,
        feedback: gradeFeedback[qId].feedback,
      };
    });

    await api.gradeSubmission(gradingSubmission.id, answerUpdates);
    setIsGradeModalOpen(false);
    setGradingSubmission(null);
    onRefreshData();
  };

  const handleExportCSV = () => {
    const headers = ['Submission ID', 'Quiz Title', 'Course', 'Student Name', 'Student Email', 'Score', 'Total', 'Percentage', 'Status', 'Date'];
    const rows = submissions.map((s) => [
      s.id,
      `"${s.quizTitle}"`,
      s.courseCode,
      `"${s.studentName}"`,
      s.studentEmail,
      s.score,
      s.totalPossible,
      `${s.percentage}%`,
      s.passed ? 'PASSED' : 'FAILED',
      new Date(s.submittedAt).toLocaleDateString(),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `quiz_submissions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-6 bg-[#141416] rounded-xl border border-white/10 text-[#F4F4F5] shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#D4AF37] text-xs font-bold uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4 text-[#D4AF37]" /> Faculty Academic Hub
          </div>
          <h2 className="text-2xl font-serif-title font-semibold tracking-tight text-[#F4F4F5]">Welcome, {currentUser.name}</h2>
          <p className="text-[#A1A1AA] text-xs mt-1">Design assessments, leverage Gemini AI auto-question generation, and grade submissions.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAIModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] hover:bg-[#c5a028] text-black font-bold rounded-lg text-xs shadow-md transition-all"
          >
            <Sparkles className="w-4 h-4" /> AI Quiz Creator
          </button>

          <button
            onClick={() => {
              setEditingQuiz(null);
              setQuizForm({
                title: '',
                description: '',
                courseId: courses[0]?.id || '',
                durationMinutes: 20,
                passPercentage: 70,
                startDate: new Date().toISOString().slice(0, 16),
                endDate: new Date(Date.now() + 86400000 * 30).toISOString().slice(0, 16),
                isPublished: true,
                questions: [],
              });
              setIsQuizModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#1C1C1E] text-[#F4F4F5] hover:bg-white/10 border border-white/10 rounded-lg text-xs font-semibold transition-all"
          >
            <Plus className="w-4 h-4 text-[#D4AF37]" /> Build Manual Quiz
          </button>
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {(activeTab === 'overview' || !activeTab) && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Quizzes Created" value={facultyQuizzes.length} icon={FileText} colorScheme="amber" subtitle="In catalog" />
            <StatCard title="Student Submissions" value={submissions.length} icon={Award} colorScheme="emerald" subtitle="Completed tests" />
            <StatCard
              title="Class Pass Rate"
              value={`${submissions.length ? Math.round((submissions.filter((s) => s.passed).length / submissions.length) * 100) : 0}%`}
              icon={CheckCircle2}
              colorScheme="purple"
              subtitle="Overall accuracy"
            />
            <StatCard title="Assigned Courses" value={facultyCourses.length} icon={BookOpen} colorScheme="amber" subtitle="Active terms" />
          </div>

          {/* Active Quizzes */}
          <div className="bg-[#1C1C1E] p-6 rounded-xl border border-white/10 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-serif-title font-semibold text-[#F4F4F5]">Your Active Quizzes</h3>
              <span className="text-xs text-[#A1A1AA]">{facultyQuizzes.length} total</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {facultyQuizzes.map((quiz) => (
                <div key={quiz.id} className="p-4 bg-[#141416] rounded-xl border border-white/5 hover:border-[#D4AF37]/30 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded bg-[#D4AF37]/15 text-[#D4AF37] text-xs font-bold">{quiz.courseCode}</span>
                    <Badge variant={quiz.isPublished ? 'success' : 'warning'}>
                      {quiz.isPublished ? 'Published' : 'Draft'}
                    </Badge>
                  </div>

                  <h4 className="text-base font-semibold text-[#F4F4F5] line-clamp-1">{quiz.title}</h4>
                  <p className="text-xs text-[#A1A1AA] line-clamp-2 mt-1">{quiz.description}</p>

                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-[#A1A1AA]">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 font-medium"><Clock className="w-3.5 h-3.5 text-[#D4AF37]" /> {quiz.durationMinutes}m</span>
                      <span className="flex items-center gap-1 font-medium"><HelpCircle className="w-3.5 h-3.5 text-[#D4AF37]" /> {quiz.questions.length} questions</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingQuiz(quiz);
                          setQuizForm({
                            title: quiz.title,
                            description: quiz.description,
                            courseId: quiz.courseId,
                            durationMinutes: quiz.durationMinutes,
                            passPercentage: quiz.passPercentage,
                            startDate: quiz.startDate.slice(0, 16),
                            endDate: quiz.endDate.slice(0, 16),
                            isPublished: quiz.isPublished,
                            questions: quiz.questions,
                          });
                          setIsQuizModalOpen(true);
                        }}
                        className="p-1.5 text-[#A1A1AA] hover:text-[#D4AF37] hover:bg-white/5 rounded-lg"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteQuiz(quiz.id)} className="p-1.5 text-[#A1A1AA] hover:text-rose-400 hover:bg-rose-500/10 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* QUIZZES TAB */}
      {activeTab === 'quizzes' && (
        <div className="bg-[#1C1C1E] p-6 rounded-xl border border-white/10 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-serif-title font-semibold text-[#F4F4F5]">Quiz Directory</h3>
              <p className="text-xs text-[#A1A1AA]">Manage questions, passing criteria, and publication status.</p>
            </div>
            <button
              onClick={() => {
                setEditingQuiz(null);
                setQuizForm({
                  title: '',
                  description: '',
                  courseId: courses[0]?.id || '',
                  durationMinutes: 20,
                  passPercentage: 70,
                  startDate: new Date().toISOString().slice(0, 16),
                  endDate: new Date(Date.now() + 86400000 * 30).toISOString().slice(0, 16),
                  isPublished: true,
                  questions: [],
                });
                setIsQuizModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] text-black text-xs font-semibold rounded-lg hover:bg-[#c5a028]"
            >
              <Plus className="w-4 h-4" /> Create New Quiz
            </button>
          </div>

          <div className="space-y-3">
            {facultyQuizzes.map((quiz) => (
              <div key={quiz.id} className="p-4 bg-[#141416] rounded-xl border border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded bg-[#D4AF37]/15 text-[#D4AF37] text-xs font-bold">{quiz.courseCode}</span>
                    <Badge variant={quiz.isPublished ? 'success' : 'warning'}>{quiz.isPublished ? 'Published' : 'Draft'}</Badge>
                    <span className="text-xs text-[#A1A1AA]">Total Points: {quiz.totalPoints}</span>
                  </div>
                  <h4 className="text-base font-semibold text-[#F4F4F5]">{quiz.title}</h4>
                  <p className="text-xs text-[#A1A1AA] mt-1">{quiz.description}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right text-xs">
                    <div className="font-semibold text-[#F4F4F5]">{quiz.questions.length} Questions</div>
                    <div className="text-[#A1A1AA]">{quiz.durationMinutes} mins • {quiz.passPercentage}% Pass</div>
                  </div>

                  <button
                    onClick={() => {
                      setEditingQuiz(quiz);
                      setQuizForm({
                        title: quiz.title,
                        description: quiz.description,
                        courseId: quiz.courseId,
                        durationMinutes: quiz.durationMinutes,
                        passPercentage: quiz.passPercentage,
                        startDate: quiz.startDate.slice(0, 16),
                        endDate: quiz.endDate.slice(0, 16),
                        isPublished: quiz.isPublished,
                        questions: quiz.questions,
                      });
                      setIsQuizModalOpen(true);
                    }}
                    className="p-2 text-[#A1A1AA] hover:text-[#D4AF37] hover:bg-white/5 rounded-lg border border-white/10 bg-[#1C1C1E]"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteQuiz(quiz.id)}
                    className="p-2 text-[#A1A1AA] hover:text-rose-400 hover:bg-rose-500/10 rounded-lg border border-white/10 bg-[#1C1C1E]"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI GENERATOR TAB */}
      {activeTab === 'ai-generator' && (
        <div className="p-8 bg-[#141416] rounded-xl border border-white/10 text-[#F4F4F5] shadow-2xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#D4AF37]/15 text-[#D4AF37] rounded-xl border border-[#D4AF37]/30">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-serif-title font-semibold">Gemini AI Academic Quiz Creator</h3>
              <p className="text-[#A1A1AA] text-xs">Enter any syllabus subject or topic to instantly auto-generate questions with detailed explanations.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#F4F4F5] mb-1">Topic / Syllabus Module</label>
              <input
                type="text"
                placeholder="e.g. Binary Search Trees & Recursion or Calculus Differentiation"
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                className="w-full p-3 bg-[#1C1C1E] border border-white/10 rounded-lg text-xs text-[#F4F4F5] placeholder-[#A1A1AA] focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#F4F4F5] mb-1">Course Code</label>
              <select
                value={aiCourseCode}
                onChange={(e) => setAiCourseCode(e.target.value)}
                className="w-full p-3 bg-[#1C1C1E] border border-white/10 rounded-lg text-xs text-[#F4F4F5]"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.code}>
                    {c.code} - {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#F4F4F5] mb-1">Difficulty Level</label>
              <select
                value={aiDifficulty}
                onChange={(e) => setAiDifficulty(e.target.value)}
                className="w-full p-3 bg-[#1C1C1E] border border-white/10 rounded-lg text-xs text-[#F4F4F5]"
              >
                <option value="beginner">Beginner / Fundamentals</option>
                <option value="intermediate">Intermediate / Standard</option>
                <option value="advanced">Advanced / Rigorous</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#F4F4F5] mb-1">Number of Questions</label>
              <input
                type="number"
                min={2}
                max={10}
                value={aiCount}
                onChange={(e) => setAiCount(Number(e.target.value))}
                className="w-full p-3 bg-[#1C1C1E] border border-white/10 rounded-lg text-xs text-[#F4F4F5]"
              />
            </div>
          </div>

          {aiError && (
            <div className="p-3 bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs rounded-lg">
              {aiError}
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleGenerateAIQuiz}
              disabled={isAiGenerating || !aiTopic.trim()}
              className="flex items-center gap-2 px-6 py-3 bg-[#D4AF37] text-black font-bold rounded-lg text-xs shadow-xl disabled:opacity-50 hover:bg-[#c5a028] transition-all"
            >
              {isAiGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Questions with Gemini...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Quiz Questions
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* SUBMISSIONS TAB */}
      {activeTab === 'submissions' && (
        <div className="bg-[#1C1C1E] p-6 rounded-xl border border-white/10 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-serif-title font-semibold text-[#F4F4F5]">Student Submissions & Evaluation</h3>
              <p className="text-xs text-[#A1A1AA]">Review score results, export reports, and provide teacher feedback.</p>
            </div>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-[#141416] hover:bg-white/5 text-[#F4F4F5] text-xs font-semibold rounded-lg border border-white/10 transition-colors"
            >
              <Download className="w-4 h-4 text-[#D4AF37]" /> Export CSV Report
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#141416] border-b border-white/10 text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider">
                  <th className="p-4">Student</th>
                  <th className="p-4">Quiz Title</th>
                  <th className="p-4">Course</th>
                  <th className="p-4">Score</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-white/[0.02]">
                    <td className="p-4">
                      <div className="font-semibold text-[#F4F4F5]">{sub.studentName}</div>
                      <div className="text-[11px] text-[#A1A1AA]">{sub.studentEmail}</div>
                    </td>
                    <td className="p-4 font-semibold text-[#F4F4F5]">{sub.quizTitle}</td>
                    <td className="p-4 font-mono font-bold text-[#D4AF37]">{sub.courseCode}</td>
                    <td className="p-4">
                      <span className="font-semibold text-[#F4F4F5]">{sub.score}</span> / {sub.totalPossible} ({sub.percentage}%)
                    </td>
                    <td className="p-4">
                      <Badge variant={sub.passed ? 'success' : 'danger'}>
                        {sub.passed ? 'PASSED' : 'FAILED'}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleOpenGrading(sub)}
                        className="px-3 py-1.5 bg-[#D4AF37]/15 text-[#D4AF37] hover:bg-[#D4AF37]/25 text-xs font-semibold rounded-lg transition-colors border border-[#D4AF37]/30"
                      >
                        Review / Grade
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MANUAL / EDIT QUIZ MODAL */}
      <Modal
        isOpen={isQuizModalOpen}
        onClose={() => setIsQuizModalOpen(false)}
        title={editingQuiz ? 'Edit Quiz Details & Questions' : 'Create New Assessment'}
        subtitle="Build questions, options, correct answer keys, and explanations"
        maxWidth="4xl"
      >
        <form onSubmit={handleSaveQuiz} className="space-y-6 text-xs text-[#F4F4F5]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[#F4F4F5] mb-1">Quiz Title</label>
              <input
                type="text"
                required
                value={quizForm.title}
                onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                className="w-full p-2.5 bg-[#141416] border border-white/10 rounded-lg text-xs font-medium text-[#F4F4F5]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#F4F4F5] mb-1">Course</label>
              <select
                value={quizForm.courseId}
                onChange={(e) => setQuizForm({ ...quizForm, courseId: e.target.value })}
                className="w-full p-2.5 bg-[#141416] border border-white/10 rounded-lg text-xs font-medium text-[#F4F4F5]"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} - {c.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#F4F4F5] mb-1">Description / Instructions</label>
            <textarea
              rows={2}
              value={quizForm.description}
              onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
              className="w-full p-2.5 bg-[#141416] border border-white/10 rounded-lg text-xs font-medium text-[#F4F4F5]"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-[#F4F4F5] mb-1">Duration (Minutes)</label>
              <input
                type="number"
                required
                value={quizForm.durationMinutes}
                onChange={(e) => setQuizForm({ ...quizForm, durationMinutes: Number(e.target.value) })}
                className="w-full p-2.5 bg-[#141416] border border-white/10 rounded-lg text-xs font-medium text-[#F4F4F5]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#F4F4F5] mb-1">Passing Mark (%)</label>
              <input
                type="number"
                required
                value={quizForm.passPercentage}
                onChange={(e) => setQuizForm({ ...quizForm, passPercentage: Number(e.target.value) })}
                className="w-full p-2.5 bg-[#141416] border border-white/10 rounded-lg text-xs font-medium text-[#F4F4F5]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#F4F4F5] mb-1">Publish Status</label>
              <select
                value={quizForm.isPublished ? 'published' : 'draft'}
                onChange={(e) => setQuizForm({ ...quizForm, isPublished: e.target.value === 'published' })}
                className="w-full p-2.5 bg-[#141416] border border-white/10 rounded-lg text-xs font-medium text-[#F4F4F5]"
              >
                <option value="published">Published (Active)</option>
                <option value="draft">Draft (Hidden)</option>
              </select>
            </div>
          </div>

          {/* Question List Section */}
          <div className="border-t border-white/10 pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-[#F4F4F5]">Quiz Question Bank ({quizForm.questions.length})</h4>
            </div>

            <div className="space-y-3">
              {quizForm.questions.map((q, idx) => (
                <div key={q.id || idx} className="p-3 bg-[#141416] rounded-lg border border-white/10 flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#D4AF37]">Q{idx + 1}.</span>
                      <span className="font-semibold text-[#F4F4F5]">{q.text}</span>
                      <Badge variant="neutral">{q.type}</Badge>
                      <span className="text-[11px] font-semibold text-[#A1A1AA]">({q.points} pts)</span>
                    </div>

                    {q.options && q.options.length > 0 && (
                      <div className="grid grid-cols-2 gap-1 text-[11px] text-[#A1A1AA] pl-4 mt-1">
                        {q.options.map((opt, oIdx) => (
                          <div
                            key={oIdx}
                            className={`p-1 rounded ${
                              Number(q.correctAnswer) === oIdx ? 'bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/30' : ''
                            }`}
                          >
                            {String.fromCharCode(65 + oIdx)}. {opt}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(idx)}
                    className="p-1 text-[#A1A1AA] hover:text-rose-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Question Section */}
            <div className="p-4 bg-[#141416] rounded-xl border border-white/10 space-y-3">
              <h5 className="font-semibold text-[#D4AF37]">Add Single Question</h5>
              <div>
                <input
                  type="text"
                  placeholder="Question text..."
                  value={newQuestion.text}
                  onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
                  className="w-full p-2.5 bg-[#1C1C1E] border border-white/10 rounded-lg text-xs text-[#F4F4F5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#A1A1AA] mb-1">Question Type</label>
                  <select
                    value={newQuestion.type}
                    onChange={(e) => setNewQuestion({ ...newQuestion, type: e.target.value as QuestionType })}
                    className="w-full p-2.5 bg-[#1C1C1E] border border-white/10 rounded-lg text-xs text-[#F4F4F5]"
                  >
                    <option value="multiple-choice">Multiple Choice</option>
                    <option value="true-false">True / False</option>
                    <option value="fill-blank">Fill in the Blank</option>
                    <option value="short-answer">Short Answer</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#A1A1AA] mb-1">Points</label>
                  <input
                    type="number"
                    value={newQuestion.points}
                    onChange={(e) => setNewQuestion({ ...newQuestion, points: Number(e.target.value) })}
                    className="w-full p-2.5 bg-[#1C1C1E] border border-white/10 rounded-lg text-xs text-[#F4F4F5]"
                  />
                </div>
              </div>

              {/* Options for MC */}
              {newQuestion.type === 'multiple-choice' && (
                <div className="space-y-2">
                  <label className="block font-semibold text-[#A1A1AA]">Answer Options (Select correct radio)</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(newQuestion.options || []).map((opt, oIdx) => (
                      <div key={oIdx} className="flex items-center gap-2 bg-[#1C1C1E] p-2 rounded-lg border border-white/10">
                        <input
                          type="radio"
                          name="correctOption"
                          checked={Number(newQuestion.correctAnswer) === oIdx}
                          onChange={() => setNewQuestion({ ...newQuestion, correctAnswer: oIdx })}
                        />
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const newOpts = [...(newQuestion.options || [])];
                            newOpts[oIdx] = e.target.value;
                            setNewQuestion({ ...newQuestion, options: newOpts });
                          }}
                          className="w-full border-none focus:outline-none text-xs bg-transparent text-[#F4F4F5]"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleAddQuestion}
                className="w-full py-2 bg-[#D4AF37] text-black font-bold rounded-lg hover:bg-[#c5a028]"
              >
                + Append Question
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsQuizModalOpen(false)}
              className="px-4 py-2 bg-[#141416] text-[#A1A1AA] rounded-lg font-semibold hover:text-[#F4F4F5]"
            >
              Cancel
            </button>
            <button type="submit" className="px-6 py-2 bg-[#D4AF37] text-black rounded-lg font-bold hover:bg-[#c5a028] shadow-md">
              Save Assessment
            </button>
          </div>
        </form>
      </Modal>

      {/* AI GENERATOR MODAL */}
      <Modal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        title="Gemini AI Question Generator"
        subtitle="Specify subject details to auto-create quiz questions with full answer keys"
      >
        <div className="space-y-4 text-xs text-[#F4F4F5]">
          <div>
            <label className="block font-semibold text-[#F4F4F5] mb-1">Topic / Subject</label>
            <input
              type="text"
              placeholder="e.g. Machine Learning Overfitting, SQL Joins, Linear Algebra"
              value={aiTopic}
              onChange={(e) => setAiTopic(e.target.value)}
              className="w-full p-2.5 bg-[#141416] border border-white/10 rounded-lg text-xs text-[#F4F4F5]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#F4F4F5] mb-1">Course Code</label>
              <select
                value={aiCourseCode}
                onChange={(e) => setAiCourseCode(e.target.value)}
                className="w-full p-2.5 bg-[#141416] border border-white/10 rounded-lg text-xs text-[#F4F4F5]"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.code}>
                    {c.code}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#F4F4F5] mb-1">Question Count</label>
              <input
                type="number"
                min={2}
                max={8}
                value={aiCount}
                onChange={(e) => setAiCount(Number(e.target.value))}
                className="w-full p-2.5 bg-[#141416] border border-white/10 rounded-lg text-xs text-[#F4F4F5]"
              />
            </div>
          </div>

          {aiError && <div className="p-2 bg-rose-500/20 text-rose-300 text-xs rounded-lg">{aiError}</div>}

          <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
            <button onClick={() => setIsAIModalOpen(false)} className="px-4 py-2 bg-[#141416] font-semibold text-[#A1A1AA] rounded-lg">
              Cancel
            </button>
            <button
              onClick={handleGenerateAIQuiz}
              disabled={isAiGenerating || !aiTopic.trim()}
              className="flex items-center gap-2 px-5 py-2 bg-[#D4AF37] text-black font-bold rounded-lg hover:bg-[#c5a028]"
            >
              {isAiGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Generate Quiz
            </button>
          </div>
        </div>
      </Modal>

      {/* MANUAL GRADING MODAL */}
      <Modal
        isOpen={isGradeModalOpen}
        onClose={() => setIsGradeModalOpen(false)}
        title="Review & Manual Submission Grading"
        subtitle={`Student: ${gradingSubmission?.studentName} • Score: ${gradingSubmission?.score}/${gradingSubmission?.totalPossible}`}
        maxWidth="2xl"
      >
        <div className="space-y-4 text-xs text-[#F4F4F5]">
          {gradingSubmission && (
            <div className="space-y-4">
              {Object.keys(gradingSubmission.answers).map((qId, idx) => {
                const ans = gradingSubmission.answers[qId];
                return (
                  <div key={qId} className="p-3 bg-[#141416] rounded-lg border border-white/10 space-y-2">
                    <div className="font-bold text-[#D4AF37]">Question #{idx + 1}</div>
                    <div className="text-[#F4F4F5] bg-[#1C1C1E] p-2 rounded-lg border border-white/5">
                      <strong>Student Answer:</strong> {String(ans.answer)}
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <label className="block font-semibold text-[#A1A1AA] mb-1">Points Earned</label>
                        <input
                          type="number"
                          value={gradeFeedback[qId]?.pointsEarned ?? ans.pointsEarned}
                          onChange={(e) =>
                            setGradeFeedback({
                              ...gradeFeedback,
                              [qId]: {
                                ...gradeFeedback[qId],
                                pointsEarned: Number(e.target.value),
                              },
                            })
                          }
                          className="w-full p-2 bg-[#1C1C1E] border border-white/10 rounded-lg text-xs text-[#F4F4F5]"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-[#A1A1AA] mb-1">Teacher Remark / Feedback</label>
                        <input
                          type="text"
                          placeholder="Optional feedback..."
                          value={gradeFeedback[qId]?.feedback ?? ans.feedback ?? ''}
                          onChange={(e) =>
                            setGradeFeedback({
                              ...gradeFeedback,
                              [qId]: {
                                ...gradeFeedback[qId],
                                feedback: e.target.value,
                              },
                            })
                          }
                          className="w-full p-2 bg-[#1C1C1E] border border-white/10 rounded-lg text-xs text-[#F4F4F5]"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
            <button onClick={() => setIsGradeModalOpen(false)} className="px-4 py-2 bg-[#141416] text-[#A1A1AA] font-semibold rounded-lg">
              Cancel
            </button>
            <button onClick={handleSaveGrading} className="px-5 py-2 bg-[#D4AF37] text-black font-bold rounded-lg shadow-md hover:bg-[#c5a028]">
              Update Marks
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
