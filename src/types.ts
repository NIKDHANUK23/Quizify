export type UserRole = 'admin' | 'faculty' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  status: 'active' | 'inactive';
  avatar?: string;
  createdAt: string;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  department: string;
  facultyId: string;
  facultyName: string;
}

export type QuestionType = 'multiple-choice' | 'true-false' | 'fill-blank' | 'short-answer';

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[]; // For multiple choice
  correctAnswer: string | number; // Index or string
  explanation?: string;
  points: number;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  facultyId: string;
  facultyName: string;
  durationMinutes: number;
  passPercentage: number;
  startDate: string;
  endDate: string;
  isPublished: boolean;
  shuffleQuestions: boolean;
  showAnswersPostSubmission: boolean;
  maxAttempts: number;
  questions: Question[];
  totalPoints: number;
  createdAt: string;
}

export interface AnswerRecord {
  answer: string | number;
  pointsEarned?: number;
  isCorrect?: boolean;
  feedback?: string;
}

export interface Submission {
  id: string;
  quizId: string;
  quizTitle: string;
  courseCode: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  answers: Record<string, AnswerRecord>;
  score: number;
  totalPossible: number;
  percentage: number;
  passed: boolean;
  startedAt: string;
  submittedAt: string;
  timeSpentSeconds: number;
  attemptNumber: number;
  status: 'completed' | 'in-progress' | 'manually-graded';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
}

export interface SystemStats {
  totalUsers: number;
  totalFaculty: number;
  totalStudents: number;
  totalCourses: number;
  totalQuizzes: number;
  totalSubmissions: number;
  averagePassRate: number;
}
