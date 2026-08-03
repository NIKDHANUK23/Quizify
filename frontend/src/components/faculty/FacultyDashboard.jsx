import React, { useState } from 'react';
import { StatCard } from '../StatCard';
import { Badge } from '../Badge';
import { Modal } from '../Modal';
import { api } from '../../api';
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

export function FacultyDashboard({ activeTab, currentUser, courses = [], quizzes = [], submissions = [], onRefreshData }) {
  // Quiz Builder Modal State
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);

  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    courseId: courses[0]?.id || courses[0]?._id || '',
    durationMinutes: 20,
    passPercentage: 70,
    isPublished: true,
    questions: [],
  });

  // Question Builder State
  const [newQuestion, setNewQuestion] = useState({
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
  const [aiError, setAiError] = useState(null);

  // Manual Grading Modal State
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [gradingSubmission, setGradingSubmission] = useState(null);
  const [gradeFeedback, setGradeFeedback] = useState({});

  const facultyCourses = courses.filter((c) => c.facultyId === currentUser.id || c.facultyId === currentUser._id) || courses;
  const facultyQuizzes = quizzes;

  const handleAddQuestion = () => {
    if (!newQuestion.text.trim()) return;
    const qToAdd = {
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

  const handleRemoveQuestion = (index) => {
    setQuizForm((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  };

  const handleSaveQuiz = async (e) => {
    e.preventDefault();
    const selectedCourse = courses.find((c) => c.id === quizForm.courseId || c._id === quizForm.courseId) || courses[0];

    const payload = {
      title: quizForm.title,
      description: quizForm.description,
      courseId: selectedCourse?.id || selectedCourse?._id || 'c-101',
      courseCode: selectedCourse?.code || 'CS101',
      courseName: selectedCourse?.title || 'General Course',
      facultyId: currentUser.id || currentUser._id,
      facultyName: currentUser.name,
      durationMinutes: Number(quizForm.durationMinutes),
      passPercentage: Number(quizForm.passPercentage),
      isPublished: quizForm.isPublished,
      questions: quizForm.questions,
    };

    if (editingQuiz) {
      await api.updateQuiz(editingQuiz.id || editingQuiz._id, payload);
    } else {
      await api.createQuiz(payload);
    }

    setIsQuizModalOpen(false);
    setEditingQuiz(null);
    onRefreshData();
  };

  const handleDeleteQuiz = async (id) => {
    if (confirm('Delete this quiz? Student results will be archived.')) {
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
        isPublished: true,
        questions: generated.questions || [],
      });

      setIsAIModalOpen(false);
      setIsQuizModalOpen(true);
    } catch (err) {
      setAiError(err.message || 'Failed to generate quiz with AI');
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleOpenGrading = (sub) => {
    setGradingSubmission(sub);
    const initialFeedback = {};
    if (sub.answers) {
      Object.keys(sub.answers).forEach((qId) => {
        initialFeedback[qId] = {
          pointsEarned: sub.answers[qId].pointsEarned || 0,
          feedback: sub.answers[qId].feedback || '',
        };
      });
    }
    setGradeFeedback(initialFeedback);
    setIsGradeModalOpen(true);
  };

  const handleSaveGrading = async () => {
    if (!gradingSubmission) return;
    const answerUpdates = {};
    Object.keys(gradeFeedback).forEach((qId) => {
      answerUpdates[qId] = {
        pointsEarned: Number(gradeFeedback[qId].pointsEarned),
        isCorrect: Number(gradeFeedback[qId].pointsEarned) > 0,
        feedback: gradeFeedback[qId].feedback,
      };
    });

    await api.gradeSubmission(gradingSubmission.id || gradingSubmission._id, answerUpdates);
    setIsGradeModalOpen(false);
    setGradingSubmission(null);
    onRefreshData();
  };

  const handleExportCSV = () => {
    const headers = ['Submission ID', 'Quiz Title', 'Course', 'Student Name', 'Student Email', 'Score', 'Total', 'Percentage', 'Status', 'Date'];
    const rows = submissions.map((s) => [
      s.id || s._id,
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Banner */}
      <div className="card" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyBetween: 'space-between', gap: '1rem', background: '#141416' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--gold-primary)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
            <BookOpen className="w-4 h-4" /> Faculty Portal
          </div>
          <h2 className="font-title" style={{ fontSize: '1.5rem', fontWeight: 600, marginTop: '4px' }}>Welcome, {currentUser.name}</h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>MERN Express Backend • Gemini AI Auto Question Generator</p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setIsAIModalOpen(true)} className="btn btn-primary">
            <Sparkles className="w-4 h-4" /> AI Quiz Creator
          </button>
          <button
            onClick={() => {
              setEditingQuiz(null);
              setQuizForm({
                title: '',
                description: '',
                courseId: courses[0]?.id || courses[0]?._id || '',
                durationMinutes: 20,
                passPercentage: 70,
                isPublished: true,
                questions: [],
              });
              setIsQuizModalOpen(true);
            }}
            className="btn btn-secondary"
          >
            <Plus className="w-4 h-4" style={{ color: 'var(--gold-primary)' }} /> Manual Quiz
          </button>
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {(activeTab === 'overview' || !activeTab) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="grid-cols-4">
            <StatCard title="Quizzes Created" value={facultyQuizzes.length} icon={FileText} subtitle="Catalog size" />
            <StatCard title="Student Submissions" value={submissions.length} icon={Award} subtitle="Completed tests" />
            <StatCard
              title="Class Pass Rate"
              value={`${submissions.length ? Math.round((submissions.filter((s) => s.passed).length / submissions.length) * 100) : 0}%`}
              icon={CheckCircle2}
              subtitle="Overall accuracy"
            />
            <StatCard title="Assigned Courses" value={facultyCourses.length} icon={BookOpen} subtitle="Active terms" />
          </div>

          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 className="font-title" style={{ fontSize: '1rem', fontWeight: 600 }}>Active Quizzes</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{facultyQuizzes.length} total</span>
            </div>

            <div className="grid-cols-2">
              {facultyQuizzes.map((quiz) => (
                <div key={quiz.id || quiz._id} style={{ padding: '1rem', background: 'var(--bg-input)', borderRadius: '12px', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', marginBottom: '6px' }}>
                      <Badge variant="gold">{quiz.courseCode}</Badge>
                      <Badge variant={quiz.isPublished ? 'success' : 'neutral'}>{quiz.isPublished ? 'Published' : 'Draft'}</Badge>
                    </div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>{quiz.title}</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>{quiz.description}</p>
                  </div>

                  <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '12px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock className="w-3.5 h-3.5" /> {quiz.durationMinutes}m</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><HelpCircle className="w-3.5 h-3.5" /> {quiz.questions?.length || 0} questions</span>
                    </div>

                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        onClick={() => {
                          setEditingQuiz(quiz);
                          setQuizForm({
                            title: quiz.title,
                            description: quiz.description,
                            courseId: quiz.courseId,
                            durationMinutes: quiz.durationMinutes,
                            passPercentage: quiz.passPercentage,
                            isPublished: quiz.isPublished,
                            questions: quiz.questions || [],
                          });
                          setIsQuizModalOpen(true);
                        }}
                        className="btn btn-secondary"
                        style={{ padding: '4px 8px' }}
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDeleteQuiz(quiz.id || quiz._id)} className="btn btn-danger" style={{ padding: '4px 8px' }}>
                        <Trash2 className="w-3.5 h-3.5" />
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
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 className="font-title" style={{ fontSize: '1.1rem', fontWeight: 600 }}>Quizzes Catalog</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Configure questions, passing scores, and release status.</p>
            </div>
            <button
              onClick={() => {
                setEditingQuiz(null);
                setQuizForm({
                  title: '',
                  description: '',
                  courseId: courses[0]?.id || courses[0]?._id || '',
                  durationMinutes: 20,
                  passPercentage: 70,
                  isPublished: true,
                  questions: [],
                });
                setIsQuizModalOpen(true);
              }}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4" /> Build New Quiz
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {facultyQuizzes.map((quiz) => (
              <div key={quiz.id || quiz._id} style={{ padding: '1rem', background: 'var(--bg-input)', borderRadius: '10px', border: '1px solid var(--border-light)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <Badge variant="gold">{quiz.courseCode}</Badge>
                    <Badge variant={quiz.isPublished ? 'success' : 'neutral'}>{quiz.isPublished ? 'Published' : 'Draft'}</Badge>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Points: {quiz.totalPoints || 0}</span>
                  </div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{quiz.title}</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{quiz.description}</p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ textAlign: 'right', fontSize: '0.75rem' }}>
                    <div style={{ fontWeight: 600 }}>{quiz.questions?.length || 0} Questions</div>
                    <div style={{ color: 'var(--text-muted)' }}>{quiz.durationMinutes}m • Pass {quiz.passPercentage}%</div>
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
                        isPublished: quiz.isPublished,
                        questions: quiz.questions || [],
                      });
                      setIsQuizModalOpen(true);
                    }}
                    className="btn btn-secondary"
                    style={{ padding: '6px 10px' }}
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDeleteQuiz(quiz.id || quiz._id)} className="btn btn-danger" style={{ padding: '6px 10px' }}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI GENERATOR TAB */}
      {activeTab === 'ai-generator' && (
        <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: '#141416' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="stat-icon">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-title" style={{ fontSize: '1.35rem', fontWeight: 600 }}>Gemini AI Question Generator</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Auto-generate academic questions with full answer keys using server-side Gemini 2.5 Flash API.</p>
            </div>
          </div>

          <div className="grid-cols-2">
            <div>
              <label className="label">Topic / Subject Module</label>
              <input
                type="text"
                placeholder="e.g. Binary Search Trees or Calculus Integration"
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                className="input"
              />
            </div>

            <div>
              <label className="label">Course Code</label>
              <select value={aiCourseCode} onChange={(e) => setAiCourseCode(e.target.value)} className="select">
                {courses.map((c) => (
                  <option key={c.id || c._id} value={c.code}>
                    {c.code} - {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Difficulty</label>
              <select value={aiDifficulty} onChange={(e) => setAiDifficulty(e.target.value)} className="select">
                <option value="beginner">Beginner / Fundamentals</option>
                <option value="intermediate">Intermediate / Standard</option>
                <option value="advanced">Advanced / Rigorous</option>
              </select>
            </div>

            <div>
              <label className="label">Question Count</label>
              <input
                type="number"
                min={2}
                max={10}
                value={aiCount}
                onChange={(e) => setAiCount(Number(e.target.value))}
                className="input"
              />
            </div>
          </div>

          {aiError && <div style={{ color: 'var(--accent-rose)', fontSize: '0.75rem', padding: '8px', background: 'rgba(244,63,94,0.1)', borderRadius: '6px' }}>{aiError}</div>}

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={handleGenerateAIQuiz} disabled={isAiGenerating || !aiTopic.trim()} className="btn btn-primary" style={{ padding: '10px 20px' }}>
              {isAiGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {isAiGenerating ? 'Generating...' : 'Generate AI Quiz Questions'}
            </button>
          </div>
        </div>
      )}

      {/* SUBMISSIONS TAB */}
      {activeTab === 'submissions' && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 className="font-title" style={{ fontSize: '1.1rem', fontWeight: 600 }}>Student Submissions</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Review results, grade short answers, and export reports.</p>
            </div>
            <button onClick={handleExportCSV} className="btn btn-secondary">
              <Download className="w-4 h-4" style={{ color: 'var(--gold-primary)' }} /> Export CSV
            </button>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Quiz</th>
                  <th>Course</th>
                  <th>Score</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub) => (
                  <tr key={sub.id || sub._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{sub.studentName}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{sub.studentEmail}</div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{sub.quizTitle}</td>
                    <td style={{ color: 'var(--gold-primary)', fontWeight: 700 }}>{sub.courseCode}</td>
                    <td>
                      <strong>{sub.score}</strong> / {sub.totalPossible} ({sub.percentage}%)
                    </td>
                    <td>
                      <Badge variant={sub.passed ? 'success' : 'danger'}>
                        {sub.passed ? 'PASSED' : 'FAILED'}
                      </Badge>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button onClick={() => handleOpenGrading(sub)} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                        Grade / Review
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
      <Modal isOpen={isQuizModalOpen} onClose={() => setIsQuizModalOpen(false)} title={editingQuiz ? 'Edit Quiz' : 'Create New Quiz'}>
        <form onSubmit={handleSaveQuiz} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="label">Quiz Title</label>
              <input
                type="text"
                required
                value={quizForm.title}
                onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                className="input"
              />
            </div>

            <div>
              <label className="label">Course</label>
              <select
                value={quizForm.courseId}
                onChange={(e) => setQuizForm({ ...quizForm, courseId: e.target.value })}
                className="select"
              >
                {courses.map((c) => (
                  <option key={c.id || c._id} value={c.id || c._id}>
                    {c.code} - {c.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              rows={2}
              value={quizForm.description}
              onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
              className="textarea"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="label">Duration (Minutes)</label>
              <input
                type="number"
                required
                value={quizForm.durationMinutes}
                onChange={(e) => setQuizForm({ ...quizForm, durationMinutes: Number(e.target.value) })}
                className="input"
              />
            </div>

            <div>
              <label className="label">Passing Mark (%)</label>
              <input
                type="number"
                required
                value={quizForm.passPercentage}
                onChange={(e) => setQuizForm({ ...quizForm, passPercentage: Number(e.target.value) })}
                className="input"
              />
            </div>

            <div>
              <label className="label">Status</label>
              <select
                value={quizForm.isPublished ? 'published' : 'draft'}
                onChange={(e) => setQuizForm({ ...quizForm, isPublished: e.target.value === 'published' })}
                className="select"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600 }}>Questions ({quizForm.questions.length})</h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {quizForm.questions.map((q, idx) => (
                <div key={q.id || idx} style={{ padding: '8px 12px', background: 'var(--bg-input)', borderRadius: '8px', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontWeight: 700, color: 'var(--gold-primary)' }}>Q{idx + 1}. </span>
                    <span style={{ fontWeight: 600, fontSize: '0.825rem' }}>{q.text}</span>
                  </div>
                  <button type="button" onClick={() => handleRemoveQuestion(idx)} className="btn btn-danger" style={{ padding: '2px 6px' }}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div style={{ padding: '12px', background: 'var(--bg-input)', borderRadius: '8px', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h5 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gold-primary)' }}>Add Question</h5>
              <input
                type="text"
                placeholder="Question statement..."
                value={newQuestion.text}
                onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
                className="input"
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <select
                  value={newQuestion.type}
                  onChange={(e) => setNewQuestion({ ...newQuestion, type: e.target.value })}
                  className="select"
                >
                  <option value="multiple-choice">Multiple Choice</option>
                  <option value="true-false">True / False</option>
                  <option value="fill-blank">Fill in the Blank</option>
                  <option value="short-answer">Short Answer</option>
                </select>

                <input
                  type="number"
                  placeholder="Points"
                  value={newQuestion.points}
                  onChange={(e) => setNewQuestion({ ...newQuestion, points: Number(e.target.value) })}
                  className="input"
                />
              </div>

              {newQuestion.type === 'multiple-choice' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  {(newQuestion.options || []).map((opt, oIdx) => (
                    <div key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <input
                        type="radio"
                        name="correct"
                        checked={Number(newQuestion.correctAnswer) === oIdx}
                        onChange={() => setNewQuestion({ ...newQuestion, correctAnswer: oIdx })}
                      />
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...newQuestion.options];
                          newOpts[oIdx] = e.target.value;
                          setNewQuestion({ ...newQuestion, options: newOpts });
                        }}
                        className="input"
                      />
                    </div>
                  ))}
                </div>
              )}

              <button type="button" onClick={handleAddQuestion} className="btn btn-secondary" style={{ width: '100%' }}>
                + Append Question
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '1rem' }}>
            <button type="button" onClick={() => setIsQuizModalOpen(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">Save Assessment</button>
          </div>
        </form>
      </Modal>

      {/* AI GENERATOR MODAL */}
      <Modal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} title="Gemini AI Generator">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="label">Topic / Subject</label>
            <input
              type="text"
              placeholder="e.g. Data Structures, Machine Learning"
              value={aiTopic}
              onChange={(e) => setAiTopic(e.target.value)}
              className="input"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '1rem' }}>
            <button onClick={() => setIsAIModalOpen(false)} className="btn btn-secondary">Cancel</button>
            <button onClick={handleGenerateAIQuiz} disabled={isAiGenerating || !aiTopic.trim()} className="btn btn-primary">
              {isAiGenerating ? 'Generating...' : 'Generate Quiz'}
            </button>
          </div>
        </div>
      </Modal>

      {/* GRADING MODAL */}
      <Modal isOpen={isGradeModalOpen} onClose={() => setIsGradeModalOpen(false)} title="Grade Submission">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {gradingSubmission?.answers &&
            Object.keys(gradingSubmission.answers).map((qId, idx) => {
              const ans = gradingSubmission.answers[qId];
              return (
                <div key={qId} style={{ padding: '10px', background: 'var(--bg-input)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontWeight: 700, color: 'var(--gold-primary)', fontSize: '0.75rem' }}>Question #{idx + 1}</div>
                  <div style={{ fontSize: '0.8rem', marginTop: '4px' }}><strong>Answer:</strong> {String(ans.answer)}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
                    <input
                      type="number"
                      placeholder="Points"
                      value={gradeFeedback[qId]?.pointsEarned ?? ans.pointsEarned}
                      onChange={(e) =>
                        setGradeFeedback({
                          ...gradeFeedback,
                          [qId]: { ...gradeFeedback[qId], pointsEarned: Number(e.target.value) },
                        })
                      }
                      className="input"
                    />
                    <input
                      type="text"
                      placeholder="Feedback"
                      value={gradeFeedback[qId]?.feedback ?? ans.feedback ?? ''}
                      onChange={(e) =>
                        setGradeFeedback({
                          ...gradeFeedback,
                          [qId]: { ...gradeFeedback[qId], feedback: e.target.value },
                        })
                      }
                      className="input"
                    />
                  </div>
                </div>
              );
            })}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '1rem' }}>
            <button onClick={() => setIsGradeModalOpen(false)} className="btn btn-secondary">Cancel</button>
            <button onClick={handleSaveGrading} className="btn btn-primary">Update Grade</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
