import { User, Course, Quiz, Submission, AuditLog, SystemStats } from '../types';

export const api = {
  // Users
  async getUsers(): Promise<User[]> {
    const res = await fetch('/api/users');
    return res.json();
  },
  async createUser(data: Partial<User>): Promise<User> {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const res = await fetch(`/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  async deleteUser(id: string): Promise<any> {
    const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Courses
  async getCourses(): Promise<Course[]> {
    const res = await fetch('/api/courses');
    return res.json();
  },
  async createCourse(data: Partial<Course>): Promise<Course> {
    const res = await fetch('/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Quizzes
  async getQuizzes(): Promise<Quiz[]> {
    const res = await fetch('/api/quizzes');
    return res.json();
  },
  async getQuiz(id: string): Promise<Quiz> {
    const res = await fetch(`/api/quizzes/${id}`);
    return res.json();
  },
  async createQuiz(data: Partial<Quiz>): Promise<Quiz> {
    const res = await fetch('/api/quizzes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  async updateQuiz(id: string, data: Partial<Quiz>): Promise<Quiz> {
    const res = await fetch(`/api/quizzes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  async deleteQuiz(id: string): Promise<any> {
    const res = await fetch(`/api/quizzes/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Submissions
  async getSubmissions(): Promise<Submission[]> {
    const res = await fetch('/api/submissions');
    return res.json();
  },
  async getStudentSubmissions(studentId: string): Promise<Submission[]> {
    const res = await fetch(`/api/submissions/student/${studentId}`);
    return res.json();
  },
  async getQuizSubmissions(quizId: string): Promise<Submission[]> {
    const res = await fetch(`/api/submissions/quiz/${quizId}`);
    return res.json();
  },
  async submitQuiz(data: {
    quizId: string;
    studentId: string;
    studentName: string;
    studentEmail: string;
    answers: Record<string, any>;
    timeSpentSeconds: number;
  }): Promise<Submission> {
    const res = await fetch('/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  async gradeSubmission(
    submissionId: string,
    answerUpdates: Record<string, any>,
    generalFeedback?: string
  ): Promise<Submission> {
    const res = await fetch(`/api/submissions/${submissionId}/grade`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answerUpdates, generalFeedback }),
    });
    return res.json();
  },

  // System & Logs
  async getSystemStats(): Promise<SystemStats> {
    const res = await fetch('/api/analytics/system');
    return res.json();
  },
  async getAuditLogs(): Promise<AuditLog[]> {
    const res = await fetch('/api/logs');
    return res.json();
  },

  // AI Quiz Generation
  async generateAIQuiz(params: {
    topic: string;
    courseCode?: string;
    difficulty?: string;
    numberOfQuestions?: number;
    questionTypes?: string[];
  }): Promise<Partial<Quiz>> {
    const res = await fetch('/api/ai/generate-quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'AI quiz generation failed');
    }
    return res.json();
  },
};
