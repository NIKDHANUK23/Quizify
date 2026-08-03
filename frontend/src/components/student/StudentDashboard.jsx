import React, { useState, useEffect } from 'react';
import { StatCard } from '../StatCard';
import { Badge } from '../Badge';
import { Modal } from '../Modal';
import { api } from '../../api';
import {
  BookOpen,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Award,
  Play,
  ArrowRight,
  ArrowLeft,
  Flag,
  RotateCcw
} from 'lucide-react';

export function StudentDashboard({ activeTab, currentUser, quizzes = [], submissions = [], onRefreshData }) {
  // Active Test State
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [studentAnswers, setStudentAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState({});
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Result Review Modal State
  const [reviewSubmission, setReviewSubmission] = useState(null);

  const studentSubmissions = submissions.filter((s) => s.studentId === currentUser.id || s.studentId === currentUser._id) || submissions;
  const passedCount = studentSubmissions.filter((s) => s.passed).length;
  const avgScore = studentSubmissions.length
    ? Math.round(studentSubmissions.reduce((sum, s) => sum + s.percentage, 0) / studentSubmissions.length)
    : 0;

  // Countdown Timer
  useEffect(() => {
    if (!activeQuiz || timeLeftSeconds <= 0) return;
    const interval = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeQuiz, timeLeftSeconds]);

  const handleStartQuiz = (quiz) => {
    setActiveQuiz(quiz);
    setStudentAnswers({});
    setFlaggedQuestions({});
    setCurrentQuestionIdx(0);
    setTimeLeftSeconds((quiz.durationMinutes || 20) * 60);
  };

  const handleSelectOption = (qId, optionIdx) => {
    setStudentAnswers((prev) => ({
      ...prev,
      [qId]: optionIdx,
    }));
  };

  const handleTextAnswer = (qId, text) => {
    setStudentAnswers((prev) => ({
      ...prev,
      [qId]: text,
    }));
  };

  const toggleFlagQuestion = (qId) => {
    setFlaggedQuestions((prev) => ({
      ...prev,
      [qId]: !prev[qId],
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const timeSpent = (activeQuiz.durationMinutes || 20) * 60 - timeLeftSeconds;
      const result = await api.submitQuiz({
        quizId: activeQuiz.id || activeQuiz._id,
        studentId: currentUser.id || currentUser._id,
        studentName: currentUser.name,
        studentEmail: currentUser.email,
        answers: studentAnswers,
        timeSpentSeconds: Math.max(0, timeSpent),
      });

      setActiveQuiz(null);
      setReviewSubmission(result);
      onRefreshData();
    } catch (err) {
      alert('Error submitting test: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Banner */}
      {!activeQuiz && (
        <div className="card" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', background: '#141416' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--gold-primary)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
              <BookOpen className="w-4 h-4" /> Student Test Center
            </div>
            <h2 className="font-title" style={{ fontSize: '1.5rem', fontWeight: 600, marginTop: '4px' }}>Hello, {currentUser.name}</h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>MERN Stack Online Assessment Engine</p>
          </div>

          <Badge variant="gold">Level: Advanced Student</Badge>
        </div>
      )}

      {/* ACTIVE QUIZ PLAYER INTERFACE */}
      {activeQuiz ? (
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: '#121215', border: '1px solid var(--gold-border)' }}>
          {/* Header */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>
            <div>
              <span className="badge badge-gold">{activeQuiz.courseCode}</span>
              <h3 className="font-title" style={{ fontSize: '1.25rem', fontWeight: 600, marginTop: '4px' }}>{activeQuiz.title}</h3>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--gold-border)', color: 'var(--gold-primary)', fontWeight: 800, fontSize: '1.1rem' }}>
                <Clock className="w-5 h-5" /> {formatTime(timeLeftSeconds)}
              </div>
              <button onClick={handleSubmitQuiz} disabled={isSubmitting} className="btn btn-primary">
                Submit Test
              </button>
            </div>
          </div>

          {/* Question Navigator Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {activeQuiz.questions.map((q, idx) => {
              const isAnswered = studentAnswers[q.id] !== undefined;
              const isFlagged = flaggedQuestions[q.id];
              const isCurrent = currentQuestionIdx === idx;

              return (
                <button
                  key={q.id || idx}
                  onClick={() => setCurrentQuestionIdx(idx)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    border: isCurrent ? '2px solid var(--gold-primary)' : '1px solid var(--border-light)',
                    background: isFlagged ? 'rgba(244,63,94,0.3)' : isAnswered ? 'var(--gold-subtle)' : 'var(--bg-card)',
                    color: isAnswered ? 'var(--gold-primary)' : 'var(--text-main)',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                  }}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Current Question Block */}
          {activeQuiz.questions[currentQuestionIdx] && (() => {
            const currentQ = activeQuiz.questions[currentQuestionIdx];
            const isFlagged = flaggedQuestions[currentQ.id];

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--gold-primary)' }}>
                    Question {currentQuestionIdx + 1} of {activeQuiz.questions.length} ({currentQ.points || 10} pts)
                  </span>

                  <button
                    onClick={() => toggleFlagQuestion(currentQ.id)}
                    className={`btn ${isFlagged ? 'btn-danger' : 'btn-secondary'}`}
                    style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                  >
                    <Flag className="w-3.5 h-3.5" /> {isFlagged ? 'Flagged' : 'Flag for Review'}
                  </button>
                </div>

                <h4 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{currentQ.text}</h4>

                {/* Question Options */}
                {(currentQ.type === 'multiple-choice' || currentQ.type === 'true-false') && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {currentQ.options.map((opt, oIdx) => {
                      const isSelected = studentAnswers[currentQ.id] === oIdx;
                      return (
                        <div
                          key={oIdx}
                          onClick={() => handleSelectOption(currentQ.id, oIdx)}
                          style={{
                            padding: '12px 16px',
                            borderRadius: '10px',
                            background: isSelected ? 'var(--gold-subtle)' : 'var(--bg-card)',
                            border: isSelected ? '1px solid var(--gold-primary)' : '1px solid var(--border-light)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            fontWeight: isSelected ? 700 : 500,
                          }}
                        >
                          <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: isSelected ? '5px solid var(--gold-primary)' : '2px solid var(--text-muted)' }} />
                          <span>{opt}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {currentQ.type === 'fill-blank' && (
                  <div>
                    <label className="label">Type your answer:</label>
                    <input
                      type="text"
                      value={studentAnswers[currentQ.id] || ''}
                      onChange={(e) => handleTextAnswer(currentQ.id, e.target.value)}
                      className="input"
                    />
                  </div>
                )}

                {currentQ.type === 'short-answer' && (
                  <div>
                    <label className="label">Provide short essay response:</label>
                    <textarea
                      rows={3}
                      value={studentAnswers[currentQ.id] || ''}
                      onChange={(e) => handleTextAnswer(currentQ.id, e.target.value)}
                      className="textarea"
                    />
                  </div>
                )}

                {/* Footer Controls */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
                  <button
                    onClick={() => setCurrentQuestionIdx((p) => Math.max(0, p - 1))}
                    disabled={currentQuestionIdx === 0}
                    className="btn btn-secondary"
                  >
                    <ArrowLeft className="w-4 h-4" /> Previous
                  </button>

                  <button
                    onClick={() => setCurrentQuestionIdx((p) => Math.min(activeQuiz.questions.length - 1, p + 1))}
                    disabled={currentQuestionIdx === activeQuiz.questions.length - 1}
                    className="btn btn-secondary"
                  >
                    Next <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      ) : (
        /* DASHBOARD VIEWS */
        <>
          {/* OVERVIEW TAB */}
          {(activeTab === 'overview' || !activeTab) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="grid-cols-4">
                <StatCard title="Available Tests" value={quizzes.filter((q) => q.isPublished).length} icon={BookOpen} subtitle="Ready to attempt" />
                <StatCard title="Tests Completed" value={studentSubmissions.length} icon={CheckCircle2} subtitle="Submissions" />
                <StatCard title="Passed Tests" value={passedCount} icon={Award} subtitle="Passing mark met" />
                <StatCard title="Average Score" value={`${avgScore}%`} icon={HelpCircle} subtitle="Overall mark" />
              </div>

              <div className="card">
                <h3 className="font-title" style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Available Tests</h3>
                <div className="grid-cols-2">
                  {quizzes
                    .filter((q) => q.isPublished)
                    .map((quiz) => (
                      <div key={quiz.id || quiz._id} style={{ padding: '1rem', background: 'var(--bg-input)', borderRadius: '12px', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <Badge variant="gold">{quiz.courseCode}</Badge>
                          <h4 style={{ fontSize: '1rem', fontWeight: 600, marginTop: '6px' }}>{quiz.title}</h4>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>{quiz.description}</p>
                        </div>

                        <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{quiz.durationMinutes}m • Pass {quiz.passPercentage}%</span>
                          <button onClick={() => handleStartQuiz(quiz)} className="btn btn-primary" style={{ padding: '6px 12px' }}>
                            <Play className="w-3.5 h-3.5" /> Start Test
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* TESTS TAB */}
          {activeTab === 'tests' && (
            <div className="card">
              <h3 className="font-title" style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Test Catalog</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {quizzes
                  .filter((q) => q.isPublished)
                  .map((quiz) => (
                    <div key={quiz.id || quiz._id} style={{ padding: '1rem', background: 'var(--bg-input)', borderRadius: '10px', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Badge variant="gold">{quiz.courseCode}</Badge>
                          <span style={{ fontWeight: 600 }}>{quiz.title}</span>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>{quiz.description}</p>
                      </div>

                      <button onClick={() => handleStartQuiz(quiz)} className="btn btn-primary">
                        <Play className="w-3.5 h-3.5" /> Attempt Quiz
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* RESULTS TAB */}
          {activeTab === 'results' && (
            <div className="card">
              <h3 className="font-title" style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>My Performance Records</h3>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Quiz Title</th>
                      <th>Course</th>
                      <th>Score</th>
                      <th>Percentage</th>
                      <th>Status</th>
                      <th>Submitted</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentSubmissions.map((sub) => (
                      <tr key={sub.id || sub._id}>
                        <td style={{ fontWeight: 600 }}>{sub.quizTitle}</td>
                        <td style={{ color: 'var(--gold-primary)', fontWeight: 700 }}>{sub.courseCode}</td>
                        <td>{sub.score} / {sub.totalPossible}</td>
                        <td style={{ fontWeight: 700 }}>{sub.percentage}%</td>
                        <td>
                          <Badge variant={sub.passed ? 'success' : 'danger'}>
                            {sub.passed ? 'PASSED' : 'FAILED'}
                          </Badge>
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{new Date(sub.submittedAt).toLocaleDateString()}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button onClick={() => setReviewSubmission(sub)} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                            View Breakdown
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* RESULT REVIEW MODAL */}
      <Modal isOpen={!!reviewSubmission} onClose={() => setReviewSubmission(null)} title="Test Performance Report">
        {reviewSubmission && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: 'var(--bg-input)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span className="badge badge-gold">{reviewSubmission.courseCode}</span>
                <h4 className="font-title" style={{ fontSize: '1.1rem', fontWeight: 600, marginTop: '4px' }}>{reviewSubmission.quizTitle}</h4>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: reviewSubmission.passed ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                  {reviewSubmission.percentage}%
                </div>
                <Badge variant={reviewSubmission.passed ? 'success' : 'danger'}>
                  {reviewSubmission.passed ? 'PASSED' : 'FAILED'}
                </Badge>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h5 style={{ fontSize: '0.825rem', fontWeight: 700 }}>Question Explanations</h5>
              {reviewSubmission.answers &&
                Object.keys(reviewSubmission.answers).map((qId, idx) => {
                  const ansObj = reviewSubmission.answers[qId];
                  return (
                    <div key={qId} style={{ padding: '10px', background: 'var(--bg-input)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.75rem', color: 'var(--gold-primary)' }}>Question #{idx + 1}</span>
                        <Badge variant={ansObj.isCorrect ? 'success' : 'danger'}>
                          {ansObj.isCorrect ? 'Correct (+10)' : 'Incorrect (0)'}
                        </Badge>
                      </div>
                      <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>Answer: {String(ansObj.answer)}</div>
                      {ansObj.feedback && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Feedback: {ansObj.feedback}</div>}
                    </div>
                  );
                })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button onClick={() => setReviewSubmission(null)} className="btn btn-primary">Close Report</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
