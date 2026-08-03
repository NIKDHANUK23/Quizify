import React, { useState, useEffect } from 'react';
import { User, Quiz, Submission } from '../../types';
import { StatCard } from '../common/StatCard';
import { Badge } from '../common/Badge';
import { api } from '../../lib/api';
import {
  Award,
  Clock,
  CheckCircle2,
  Play,
  ArrowLeft,
  ArrowRight,
  Flag,
  Check,
  BarChart2,
  BookOpen
} from 'lucide-react';

interface StudentDashboardProps {
  activeTab: string;
  currentUser: User;
  quizzes: Quiz[];
  submissions: Submission[];
  onRefreshData: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  activeTab,
  currentUser,
  quizzes,
  submissions,
  onRefreshData,
}) => {
  // Quiz Running State
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [studentAnswers, setStudentAnswers] = useState<Record<string, any>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reviewing Completed Quiz
  const [reviewSubmission, setReviewSubmission] = useState<Submission | null>(null);

  const mySubmissions = submissions.filter((s) => s.studentId === currentUser.id);
  const publishedQuizzes = quizzes.filter((q) => q.isPublished);

  // Countdown timer effect for active quiz
  useEffect(() => {
    if (!activeQuiz || secondsRemaining <= 0) return;

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeQuiz, secondsRemaining]);

  const handleStartQuiz = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setCurrentQuestionIndex(0);
    setStudentAnswers({});
    setFlaggedQuestions({});
    setSecondsRemaining(quiz.durationMinutes * 60);
    setReviewSubmission(null);
  };

  const handleAnswerSelect = (questionId: string, answer: any) => {
    setStudentAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleToggleFlag = (questionId: string) => {
    setFlaggedQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const handleAutoSubmit = async () => {
    if (!activeQuiz) return;
    setIsSubmitting(true);
    const totalSpent = activeQuiz.durationMinutes * 60 - secondsRemaining;

    const sub = await api.submitQuiz({
      quizId: activeQuiz.id,
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentEmail: currentUser.email,
      answers: studentAnswers,
      timeSpentSeconds: totalSpent > 0 ? totalSpent : activeQuiz.durationMinutes * 60,
    });

    setActiveQuiz(null);
    setReviewSubmission(sub);
    setIsSubmitting(false);
    onRefreshData();
  };

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculations
  const totalCompleted = mySubmissions.length;
  const avgScore = totalCompleted
    ? Math.round(mySubmissions.reduce((acc, s) => acc + s.percentage, 0) / totalCompleted)
    : 0;
  const passCount = mySubmissions.filter((s) => s.passed).length;

  // Render ACTIVE QUIZ TAKING INTERFACE
  if (activeQuiz) {
    const currentQuestion = activeQuiz.questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === activeQuiz.questions.length - 1;
    const answeredCount = Object.keys(studentAnswers).length;

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Quiz Top Timer Bar */}
        <div className="sticky top-16 z-30 bg-[#141416] text-[#F4F4F5] p-4 rounded-xl shadow-2xl border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold text-[#D4AF37] uppercase tracking-widest">{activeQuiz.courseCode}</span>
            <h3 className="text-lg font-serif-title font-semibold tracking-tight">{activeQuiz.title}</h3>
          </div>

          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-mono font-bold ${secondsRemaining < 180 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse' : 'bg-white/5 text-emerald-400 border border-white/10'}`}>
              <Clock className="w-4 h-4 text-[#D4AF37]" />
              <span>{formatTime(secondsRemaining)}</span>
            </div>

            <button
              onClick={handleAutoSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-lg shadow-md transition-all"
            >
              Submit Quiz Now
            </button>
          </div>
        </div>

        {/* Question Progress & Navigator */}
        <div className="bg-[#1C1C1E] p-4 rounded-xl border border-white/10 shadow-md flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#F4F4F5]">
              Question {currentQuestionIndex + 1} of {activeQuiz.questions.length}
            </span>
            <span className="text-xs text-[#A1A1AA]">({answeredCount} Answered)</span>
          </div>

          {/* Question Grid Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {activeQuiz.questions.map((q, idx) => {
              const isAnswered = studentAnswers[q.id] !== undefined;
              const isFlagged = flaggedQuestions[q.id];
              const isCurrent = currentQuestionIndex === idx;

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all relative ${
                    isCurrent
                      ? 'bg-[#D4AF37] text-black font-bold ring-2 ring-[#D4AF37]/40'
                      : isAnswered
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-[#141416] text-[#A1A1AA] border border-white/5 hover:text-[#F4F4F5]'
                  }`}
                >
                  {idx + 1}
                  {isFlagged && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Question Card */}
        {currentQuestion && (
          <div className="bg-[#1C1C1E] p-8 rounded-xl border border-white/10 shadow-lg space-y-6">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <span className="px-2.5 py-1 rounded bg-[#D4AF37]/15 text-[#D4AF37] text-xs font-bold uppercase tracking-wide">
                  {currentQuestion.type} • {currentQuestion.points} points
                </span>
                <h4 className="text-xl font-serif-title font-semibold text-[#F4F4F5] mt-3 leading-relaxed">{currentQuestion.text}</h4>
              </div>

              <button
                onClick={() => handleToggleFlag(currentQuestion.id)}
                className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 border ${
                  flaggedQuestions[currentQuestion.id]
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    : 'bg-[#141416] text-[#A1A1AA] border-white/10'
                }`}
              >
                <Flag className="w-4 h-4" />
                {flaggedQuestions[currentQuestion.id] ? 'Flagged' : 'Flag'}
              </button>
            </div>

            {/* Question Options / Inputs */}
            <div className="space-y-3">
              {(currentQuestion.type === 'multiple-choice' || currentQuestion.type === 'true-false') &&
                currentQuestion.options?.map((opt, oIdx) => {
                  const isSelected = studentAnswers[currentQuestion.id] === oIdx;

                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleAnswerSelect(currentQuestion.id, oIdx)}
                      className={`w-full p-4 rounded-xl border text-left flex items-center justify-between text-sm font-semibold transition-all ${
                        isSelected
                          ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-[#F4F4F5] shadow-sm'
                          : 'bg-[#141416] border-white/5 text-[#A1A1AA] hover:text-[#F4F4F5] hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                            isSelected ? 'bg-[#D4AF37] text-black' : 'bg-[#1C1C1E] text-[#A1A1AA] border border-white/10'
                          }`}
                        >
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        <span>{opt}</span>
                      </div>
                      {isSelected && <Check className="w-5 h-5 text-[#D4AF37]" />}
                    </button>
                  );
                })}

              {(currentQuestion.type === 'fill-blank' || currentQuestion.type === 'short-answer') && (
                <div>
                  <label className="block text-xs font-semibold text-[#A1A1AA] mb-2">Write your response answer:</label>
                  <textarea
                    rows={currentQuestion.type === 'short-answer' ? 4 : 2}
                    placeholder="Type answer here..."
                    value={studentAnswers[currentQuestion.id] || ''}
                    onChange={(e) => handleAnswerSelect(currentQuestion.id, e.target.value)}
                    className="w-full p-4 bg-[#141416] border border-white/10 rounded-xl text-sm font-medium text-[#F4F4F5] focus:border-[#D4AF37]"
                  />
                </div>
              )}
            </div>

            {/* Question Footer Nav */}
            <div className="flex items-center justify-between pt-6 border-t border-white/10">
              <button
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#141416] hover:bg-white/5 disabled:opacity-40 text-[#F4F4F5] text-xs font-semibold rounded-lg border border-white/10"
              >
                <ArrowLeft className="w-4 h-4" /> Previous
              </button>

              {isLastQuestion ? (
                <button
                  onClick={handleAutoSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-lg shadow-lg"
                >
                  Submit Final Quiz
                </button>
              ) : (
                <button
                  onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#D4AF37] hover:bg-[#c5a028] text-black font-bold text-xs rounded-lg shadow-md"
                >
                  Next Question <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render COMPLETED REVIEW MODE
  if (reviewSubmission) {
    const quiz = quizzes.find((q) => q.id === reviewSubmission.quizId);

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <button
          onClick={() => setReviewSubmission(null)}
          className="flex items-center gap-2 text-xs font-semibold text-[#A1A1AA] hover:text-[#F4F4F5] bg-[#1C1C1E] px-3 py-1.5 rounded-lg border border-white/10 shadow-xs"
        >
          <ArrowLeft className="w-4 h-4 text-[#D4AF37]" /> Back to Dashboard
        </button>

        {/* Review Result Card */}
        <div
          className={`p-8 rounded-xl text-[#F4F4F5] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 border ${
            reviewSubmission.passed
              ? 'bg-[#141416] border-emerald-500/30'
              : 'bg-[#141416] border-rose-500/30'
          }`}
        >
          <div className="space-y-2 text-center md:text-left">
            <Badge variant={reviewSubmission.passed ? 'success' : 'danger'}>
              {reviewSubmission.passed ? 'ASSESSMENT PASSED' : 'NEEDS IMPROVEMENT'}
            </Badge>
            <h2 className="text-3xl font-serif-title font-semibold">{reviewSubmission.quizTitle}</h2>
            <p className="text-xs text-[#A1A1AA]">Submitted on {new Date(reviewSubmission.submittedAt).toLocaleString()}</p>
          </div>

          <div className="bg-[#1C1C1E] p-6 rounded-xl border border-white/10 text-center min-w-[200px]">
            <div className="text-4xl font-bold text-[#F4F4F5]">{reviewSubmission.score} / {reviewSubmission.totalPossible}</div>
            <div className="text-sm font-semibold text-[#D4AF37] mt-1">{reviewSubmission.percentage}% Overall Score</div>
          </div>
        </div>

        {/* Detailed Question Review */}
        {quiz && (
          <div className="bg-[#1C1C1E] p-6 rounded-xl border border-white/10 shadow-lg space-y-6">
            <h3 className="text-lg font-serif-title font-semibold text-[#F4F4F5]">Question Answer Key & Explanations</h3>

            <div className="space-y-4">
              {quiz.questions.map((q, idx) => {
                const ansRecord = reviewSubmission.answers[q.id];
                const isCorrect = ansRecord?.isCorrect;

                return (
                  <div key={q.id} className="p-4 bg-[#141416] rounded-xl border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#F4F4F5]">Q{idx + 1}. {q.text}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${isCorrect ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'}`}>
                        {ansRecord?.pointsEarned || 0} / {q.points} pts
                      </span>
                    </div>

                    <div className="text-xs text-[#A1A1AA] mt-2">
                      <strong className="text-[#F4F4F5]">Your Answer:</strong> {String(ansRecord?.answer ?? 'No answer submitted')}
                    </div>

                    {q.options && (
                      <div className="text-xs text-emerald-400 font-medium bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                        <strong>Correct Answer:</strong> {q.options[Number(q.correctAnswer)] || String(q.correctAnswer)}
                      </div>
                    )}

                    {q.explanation && (
                      <p className="text-xs text-[#A1A1AA] italic bg-[#1C1C1E] p-2.5 rounded-lg border border-white/5">
                        <strong className="text-[#D4AF37]">Explanation:</strong> {q.explanation}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render STANDARD STUDENT DASHBOARD
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 bg-[#141416] rounded-xl border border-white/10 text-[#F4F4F5] shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#D4AF37] text-xs font-bold uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4 text-[#D4AF37]" /> Student Portal
          </div>
          <h2 className="text-2xl font-serif-title font-semibold tracking-tight text-[#F4F4F5]">Welcome, {currentUser.name}</h2>
          <p className="text-[#A1A1AA] text-xs mt-1">Access scheduled quizzes, track your performance, and review test feedback.</p>
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {(activeTab === 'overview' || !activeTab) && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Quizzes Taken" value={totalCompleted} icon={Award} colorScheme="amber" subtitle="Completed tests" />
            <StatCard title="Average Score" value={`${avgScore}%`} icon={BarChart2} colorScheme="emerald" subtitle="Overall percentage" />
            <StatCard title="Passed Quizzes" value={passCount} icon={CheckCircle2} colorScheme="purple" subtitle="Above threshold" />
            <StatCard title="Available Quizzes" value={publishedQuizzes.length} icon={Clock} colorScheme="amber" subtitle="Ready to take" />
          </div>

          {/* Available Quizzes List */}
          <div className="bg-[#1C1C1E] p-6 rounded-xl border border-white/10 shadow-lg space-y-4">
            <h3 className="text-base font-serif-title font-semibold text-[#F4F4F5]">Available Quizzes to Take</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {publishedQuizzes.map((quiz) => {
                const sub = mySubmissions.find((s) => s.quizId === quiz.id);

                return (
                  <div key={quiz.id} className="p-5 bg-[#141416] rounded-xl border border-white/5 flex flex-col justify-between hover:border-[#D4AF37]/30 transition-all">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 rounded bg-[#D4AF37]/15 text-[#D4AF37] text-xs font-bold">{quiz.courseCode}</span>
                        {sub ? (
                          <Badge variant={sub.passed ? 'success' : 'danger'}>
                            Completed ({sub.percentage}%)
                          </Badge>
                        ) : (
                          <Badge variant="primary">Available</Badge>
                        )}
                      </div>

                      <h4 className="text-base font-semibold text-[#F4F4F5]">{quiz.title}</h4>
                      <p className="text-xs text-[#A1A1AA] mt-1 line-clamp-2">{quiz.description}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                      <div className="text-xs text-[#A1A1AA] font-medium">
                        ⏱ {quiz.durationMinutes} mins • {quiz.questions.length} questions
                      </div>

                      {sub ? (
                        <button
                          onClick={() => setReviewSubmission(sub)}
                          className="px-3 py-1.5 bg-[#1C1C1E] hover:bg-white/10 text-[#F4F4F5] font-semibold text-xs rounded-lg border border-white/10"
                        >
                          Review Result
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStartQuiz(quiz)}
                          className="flex items-center gap-1.5 px-4 py-2 bg-[#D4AF37] hover:bg-[#c5a028] text-black font-bold text-xs rounded-lg shadow-md"
                        >
                          <Play className="w-3.5 h-3.5 fill-black" /> Start Quiz
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* AVAILABLE QUIZZES TAB */}
      {activeTab === 'available-quizzes' && (
        <div className="bg-[#1C1C1E] p-6 rounded-xl border border-white/10 shadow-lg space-y-4">
          <h3 className="text-lg font-serif-title font-semibold text-[#F4F4F5]">Enrolled Course Quizzes</h3>
          <div className="space-y-3">
            {publishedQuizzes.map((quiz) => {
              const sub = mySubmissions.find((s) => s.quizId === quiz.id);

              return (
                <div key={quiz.id} className="p-4 bg-[#141416] rounded-xl border border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <span className="px-2 py-0.5 rounded bg-[#D4AF37]/15 text-[#D4AF37] text-xs font-bold">{quiz.courseCode}</span>
                    <h4 className="text-base font-semibold text-[#F4F4F5] mt-1">{quiz.title}</h4>
                    <p className="text-xs text-[#A1A1AA]">{quiz.description}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right text-xs">
                      <div className="font-semibold text-[#F4F4F5]">{quiz.durationMinutes} Minutes</div>
                      <div className="text-[#A1A1AA]">Passing: {quiz.passPercentage}%</div>
                    </div>

                    {sub ? (
                      <button
                        onClick={() => setReviewSubmission(sub)}
                        className="px-4 py-2 bg-[#1C1C1E] text-[#F4F4F5] border border-white/10 font-semibold text-xs rounded-lg"
                      >
                        Review
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStartQuiz(quiz)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-[#D4AF37] text-black font-bold text-xs rounded-lg shadow-md hover:bg-[#c5a028]"
                      >
                        <Play className="w-3.5 h-3.5 fill-black" /> Take Test
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MY GRADES TAB */}
      {activeTab === 'my-grades' && (
        <div className="bg-[#1C1C1E] p-6 rounded-xl border border-white/10 shadow-lg space-y-4">
          <h3 className="text-lg font-serif-title font-semibold text-[#F4F4F5]">Submission History</h3>
          <div className="divide-y divide-white/5 text-xs">
            {mySubmissions.map((sub) => (
              <div key={sub.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-[#F4F4F5]">{sub.quizTitle}</div>
                  <div className="text-[#A1A1AA]">{sub.courseCode} • Submitted on {new Date(sub.submittedAt).toLocaleDateString()}</div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right font-semibold text-[#F4F4F5]">
                    {sub.score} / {sub.totalPossible} ({sub.percentage}%)
                  </div>
                  <Badge variant={sub.passed ? 'success' : 'danger'}>
                    {sub.passed ? 'PASSED' : 'FAILED'}
                  </Badge>
                  <button
                    onClick={() => setReviewSubmission(sub)}
                    className="px-3 py-1.5 bg-[#D4AF37]/15 text-[#D4AF37] font-semibold rounded-lg border border-[#D4AF37]/30"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PERFORMANCE ANALYTICS TAB */}
      {activeTab === 'analytics' && (
        <div className="bg-[#1C1C1E] p-6 rounded-xl border border-white/10 shadow-lg space-y-6">
          <h3 className="text-lg font-serif-title font-semibold text-[#F4F4F5]">Academic Score Trends & Mastery</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-[#141416] rounded-xl border border-white/5 space-y-3">
              <h4 className="font-semibold text-[#F4F4F5]">Overall Accuracy Rate</h4>
              <div className="w-full bg-[#1C1C1E] h-3 rounded-full overflow-hidden border border-white/5">
                <div className="bg-[#D4AF37] h-full rounded-full transition-all duration-500" style={{ width: `${avgScore}%` }} />
              </div>
              <div className="text-xs text-[#A1A1AA] flex justify-between">
                <span>0%</span>
                <span className="font-bold text-[#D4AF37]">{avgScore}% Accuracy</span>
                <span>100%</span>
              </div>
            </div>

            <div className="p-4 bg-[#141416] rounded-xl border border-white/5 space-y-3">
              <h4 className="font-semibold text-[#F4F4F5]">Test Completion Ratio</h4>
              <div className="w-full bg-[#1C1C1E] h-3 rounded-full overflow-hidden border border-white/5">
                <div
                  className="bg-[#D4AF37] h-full rounded-full transition-all duration-500"
                  style={{ width: `${publishedQuizzes.length ? Math.round((totalCompleted / publishedQuizzes.length) * 100) : 0}%` }}
                />
              </div>
              <div className="text-xs text-[#A1A1AA] flex justify-between">
                <span>0 Taken</span>
                <span className="font-bold text-[#D4AF37]">{totalCompleted} / {publishedQuizzes.length} Completed</span>
                <span>All Finished</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
