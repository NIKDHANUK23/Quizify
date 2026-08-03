import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { User, Course, Quiz, Submission, AuditLog, SystemStats, Question } from './src/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// ==========================================
// IN-MEMORY DATABASE SEED DATA
// ==========================================

let users: User[] = [
  {
    id: 'u-1',
    name: 'Dr. Arthur Vance',
    email: 'admin@quizmaster.edu',
    role: 'admin',
    department: 'Administration',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    createdAt: '2025-01-10T08:00:00Z',
  },
  {
    id: 'u-2',
    name: 'Prof. Elena Rostova',
    email: 'elena.rostova@quizmaster.edu',
    role: 'faculty',
    department: 'Computer Science',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    createdAt: '2025-01-12T09:30:00Z',
  },
  {
    id: 'u-3',
    name: 'Prof. David Chen',
    email: 'david.chen@quizmaster.edu',
    role: 'faculty',
    department: 'Mathematics',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    createdAt: '2025-01-15T10:15:00Z',
  },
  {
    id: 'u-4',
    name: 'Alex Rivera',
    email: 'alex.rivera@student.quizmaster.edu',
    role: 'student',
    department: 'Computer Science',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    createdAt: '2025-02-01T11:00:00Z',
  },
  {
    id: 'u-5',
    name: 'Maya Lin',
    email: 'maya.lin@student.quizmaster.edu',
    role: 'student',
    department: 'Computer Science',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    createdAt: '2025-02-01T11:30:00Z',
  },
  {
    id: 'u-6',
    name: 'Liam Patel',
    email: 'liam.patel@student.quizmaster.edu',
    role: 'student',
    department: 'Mathematics',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    createdAt: '2025-02-02T09:00:00Z',
  },
];

let courses: Course[] = [
  {
    id: 'c-101',
    code: 'CS101',
    title: 'Introduction to Computer Science',
    department: 'Computer Science',
    facultyId: 'u-2',
    facultyName: 'Prof. Elena Rostova',
  },
  {
    id: 'c-201',
    code: 'CS201',
    title: 'Data Structures & Algorithms',
    department: 'Computer Science',
    facultyId: 'u-2',
    facultyName: 'Prof. Elena Rostova',
  },
  {
    id: 'c-301',
    code: 'MATH202',
    title: 'Linear Algebra & Calculus',
    department: 'Mathematics',
    facultyId: 'u-3',
    facultyName: 'Prof. David Chen',
  },
  {
    id: 'c-401',
    code: 'AI301',
    title: 'Artificial Intelligence Foundations',
    department: 'Computer Science',
    facultyId: 'u-2',
    facultyName: 'Prof. Elena Rostova',
  },
];

let quizzes: Quiz[] = [
  {
    id: 'q-1',
    title: 'CS101 Midterm Assessment',
    description: 'Covers core principles of computing, memory structures, logic gates, and basic programming concepts.',
    courseId: 'c-101',
    courseCode: 'CS101',
    courseName: 'Introduction to Computer Science',
    facultyId: 'u-2',
    facultyName: 'Prof. Elena Rostova',
    durationMinutes: 20,
    passPercentage: 70,
    startDate: '2026-08-01T00:00:00Z',
    endDate: '2026-08-15T23:59:59Z',
    isPublished: true,
    shuffleQuestions: true,
    showAnswersPostSubmission: true,
    maxAttempts: 2,
    totalPoints: 40,
    createdAt: '2026-07-28T10:00:00Z',
    questions: [
      {
        id: 'q1-1',
        text: 'What is the primary function of the Central Processing Unit (CPU) in a computer?',
        type: 'multiple-choice',
        options: [
          'To store persistent user files and operating system data',
          'To execute instructions and process program logic',
          'To render high-resolution 3D graphics on display',
          'To convert AC electrical power into DC voltage'
        ],
        correctAnswer: 1,
        explanation: 'The CPU is the primary component that performs arithmetic, logic, and control operations to execute code instructions.',
        points: 10
      },
      {
        id: 'q1-2',
        text: 'In binary numbering system, what decimal value does the 8-bit binary string "00001010" represent?',
        type: 'multiple-choice',
        options: ['8', '10', '12', '16'],
        correctAnswer: 1,
        explanation: 'In binary, 00001010 is equal to (1 * 2^3) + (1 * 2^1) = 8 + 2 = 10.',
        points: 10
      },
      {
        id: 'q1-3',
        text: 'RAM (Random Access Memory) is volatile memory that loses its contents when power is switched off.',
        type: 'true-false',
        options: ['True', 'False'],
        correctAnswer: 0,
        explanation: 'True. RAM requires constant electric power to maintain stored data.',
        points: 10
      },
      {
        id: 'q1-4',
        text: 'Explain briefly the difference between a high-level compiled language and an interpreted language.',
        type: 'short-answer',
        correctAnswer: 'Compiled languages (like C++) translate source code into machine code prior to execution, whereas interpreted languages (like Python) execute line-by-line using an interpreter.',
        explanation: 'Compilation generates executable binaries ahead of time; interpretation executes source instructions dynamically.',
        points: 10
      }
    ]
  },
  {
    id: 'q-2',
    title: 'Data Structures Quick Check: Arrays & Trees',
    description: 'Short quiz testing binary search tree properties, array indexing time complexity, and stack FIFO/LIFO rules.',
    courseId: 'c-201',
    courseCode: 'CS201',
    courseName: 'Data Structures & Algorithms',
    facultyId: 'u-2',
    facultyName: 'Prof. Elena Rostova',
    durationMinutes: 15,
    passPercentage: 60,
    startDate: '2026-08-02T00:00:00Z',
    endDate: '2026-08-20T23:59:59Z',
    isPublished: true,
    shuffleQuestions: false,
    showAnswersPostSubmission: true,
    maxAttempts: 3,
    totalPoints: 30,
    createdAt: '2026-07-30T14:20:00Z',
    questions: [
      {
        id: 'q2-1',
        text: 'What is the worst-case time complexity for searching an element in an unsorted array of size N?',
        type: 'multiple-choice',
        options: ['O(1)', 'O(log N)', 'O(N)', 'O(N^2)'],
        correctAnswer: 2,
        explanation: 'Unsorted arrays require linear scanning, which inspects up to N elements in worst case O(N).',
        points: 10
      },
      {
        id: 'q2-2',
        text: 'A Stack data structure operates on a First-In, First-Out (FIFO) principle.',
        type: 'true-false',
        options: ['True', 'False'],
        correctAnswer: 1,
        explanation: 'False. A Stack operates on LIFO (Last-In, First-Out). Queues operate on FIFO.',
        points: 10
      },
      {
        id: 'q2-3',
        text: 'In a balanced Binary Search Tree (BST) with N nodes, what is the height of the tree?',
        type: 'multiple-choice',
        options: ['O(N)', 'O(log N)', 'O(N log N)', 'O(1)'],
        correctAnswer: 1,
        explanation: 'A balanced BST halves the search domain at each level, resulting in height O(log N).',
        points: 10
      }
    ]
  },
  {
    id: 'q-3',
    title: 'MATH202 Vector Spaces & Eigenvalues',
    description: 'Evaluates understanding of matrix determinants, rank, basis vectors, and linear transformations.',
    courseId: 'c-301',
    courseCode: 'MATH202',
    courseName: 'Linear Algebra & Calculus',
    facultyId: 'u-3',
    facultyName: 'Prof. David Chen',
    durationMinutes: 30,
    passPercentage: 75,
    startDate: '2026-07-15T00:00:00Z',
    endDate: '2026-07-30T23:59:59Z',
    isPublished: true,
    shuffleQuestions: true,
    showAnswersPostSubmission: true,
    maxAttempts: 1,
    totalPoints: 30,
    createdAt: '2026-07-10T11:00:00Z',
    questions: [
      {
        id: 'q3-1',
        text: 'If a square matrix A has a determinant equal to zero, what can be concluded about matrix A?',
        type: 'multiple-choice',
        options: [
          'It is invertible and has full rank',
          'It is singular (non-invertible) and its columns are linearly dependent',
          'It is an identity matrix',
          'Its eigenvalues are all strictly positive real numbers'
        ],
        correctAnswer: 1,
        explanation: 'Zero determinant indicates singular matrix with linearly dependent rows/columns and zero inverse.',
        points: 10
      },
      {
        id: 'q3-2',
        text: 'The dimension of the vector space R^3 is 3.',
        type: 'true-false',
        options: ['True', 'False'],
        correctAnswer: 0,
        explanation: 'True. Any basis for R^3 contains exactly 3 linearly independent vectors.',
        points: 10
      },
      {
        id: 'q3-3',
        text: 'What is the sum of the eigenvalues of a matrix equal to?',
        type: 'multiple-choice',
        options: ['The determinant of the matrix', 'The trace of the matrix', 'The rank of the matrix', 'Zero'],
        correctAnswer: 1,
        explanation: 'The sum of the eigenvalues equals the trace (sum of main diagonal elements) of the matrix.',
        points: 10
      }
    ]
  }
];

let submissions: Submission[] = [
  {
    id: 'sub-1',
    quizId: 'q-3',
    quizTitle: 'MATH202 Vector Spaces & Eigenvalues',
    courseCode: 'MATH202',
    studentId: 'u-6',
    studentName: 'Liam Patel',
    studentEmail: 'liam.patel@student.quizmaster.edu',
    answers: {
      'q3-1': { answer: 1, isCorrect: true, pointsEarned: 10 },
      'q3-2': { answer: 0, isCorrect: true, pointsEarned: 10 },
      'q3-3': { answer: 1, isCorrect: true, pointsEarned: 10 }
    },
    score: 30,
    totalPossible: 30,
    percentage: 100,
    passed: true,
    startedAt: '2026-07-20T10:00:00Z',
    submittedAt: '2026-07-20T10:18:30Z',
    timeSpentSeconds: 1110,
    attemptNumber: 1,
    status: 'completed'
  },
  {
    id: 'sub-2',
    quizId: 'q-1',
    quizTitle: 'CS101 Midterm Assessment',
    courseCode: 'CS101',
    studentId: 'u-4',
    studentName: 'Alex Rivera',
    studentEmail: 'alex.rivera@student.quizmaster.edu',
    answers: {
      'q1-1': { answer: 1, isCorrect: true, pointsEarned: 10 },
      'q1-2': { answer: 1, isCorrect: true, pointsEarned: 10 },
      'q1-3': { answer: 0, isCorrect: true, pointsEarned: 10 },
      'q1-4': { answer: 'Compiled code translates to binary machine instructions ahead of time, while interpreted code is executed line by line dynamically.', isCorrect: true, pointsEarned: 10, feedback: 'Excellent and clear explanation!' }
    },
    score: 40,
    totalPossible: 40,
    percentage: 100,
    passed: true,
    startedAt: '2026-08-02T09:00:00Z',
    submittedAt: '2026-08-02T09:14:20Z',
    timeSpentSeconds: 860,
    attemptNumber: 1,
    status: 'completed'
  },
  {
    id: 'sub-3',
    quizId: 'q-1',
    quizTitle: 'CS101 Midterm Assessment',
    courseCode: 'CS101',
    studentId: 'u-5',
    studentName: 'Maya Lin',
    studentEmail: 'maya.lin@student.quizmaster.edu',
    answers: {
      'q1-1': { answer: 1, isCorrect: true, pointsEarned: 10 },
      'q1-2': { answer: 0, isCorrect: false, pointsEarned: 0 },
      'q1-3': { answer: 0, isCorrect: true, pointsEarned: 10 },
      'q1-4': { answer: 'Compiled is faster and interpreted reads code as it runs.', isCorrect: true, pointsEarned: 8, feedback: 'Good distinction, briefly mentioned.' }
    },
    score: 28,
    totalPossible: 40,
    percentage: 70,
    passed: true,
    startedAt: '2026-08-02T11:00:00Z',
    submittedAt: '2026-08-02T11:18:00Z',
    timeSpentSeconds: 1080,
    attemptNumber: 1,
    status: 'completed'
  }
];

let auditLogs: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    userName: 'Prof. Elena Rostova',
    userRole: 'faculty',
    action: 'CREATE_QUIZ',
    details: 'Created "CS101 Midterm Assessment" with 4 questions (40 points).'
  },
  {
    id: 'log-2',
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
    userName: 'Dr. Arthur Vance',
    userRole: 'admin',
    action: 'ADD_USER',
    details: 'Enrolled new student Liam Patel into Mathematics department.'
  },
  {
    id: 'log-3',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    userName: 'Alex Rivera',
    userRole: 'student',
    action: 'SUBMIT_QUIZ',
    details: 'Submitted CS101 Midterm Assessment - Score 40/40 (Passed).'
  }
];

function logAction(userName: string, userRole: 'admin' | 'faculty' | 'student', action: string, details: string) {
  auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userName,
    userRole,
    action,
    details
  });
}

// ==========================================
// REST API ENDPOINTS
// ==========================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth / Current User / Users Management
app.get('/api/users', (req, res) => {
  res.json(users);
});

app.post('/api/users', (req, res) => {
  const { name, email, role, department } = req.body;
  if (!name || !email || !role) {
    return res.status(400).json({ error: 'Name, email, and role are required' });
  }
  const newUser: User = {
    id: `u-${Date.now()}`,
    name,
    email,
    role,
    department: department || 'General',
    status: 'active',
    avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random()*1000000)}?w=150`,
    createdAt: new Date().toISOString()
  };
  users.push(newUser);
  logAction('Admin System', 'admin', 'CREATE_USER', `Added user ${name} (${role})`);
  res.status(201).json(newUser);
});

app.put('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const user = users.find(u => u.id === id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  
  Object.assign(user, req.body);
  logAction('Admin System', 'admin', 'UPDATE_USER', `Updated user ${user.name}`);
  res.json(user);
});

app.delete('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return res.status(404).json({ error: 'User not found' });
  const deleted = users.splice(index, 1)[0];
  logAction('Admin System', 'admin', 'DELETE_USER', `Deleted user ${deleted.name}`);
  res.json({ success: true, deleted });
});

// Course Management
app.get('/api/courses', (req, res) => {
  res.json(courses);
});

app.post('/api/courses', (req, res) => {
  const { code, title, department, facultyId, facultyName } = req.body;
  if (!code || !title) {
    return res.status(400).json({ error: 'Course code and title are required' });
  }
  const newCourse: Course = {
    id: `c-${Date.now()}`,
    code,
    title,
    department: department || 'General',
    facultyId: facultyId || 'u-2',
    facultyName: facultyName || 'Prof. Elena Rostova'
  };
  courses.push(newCourse);
  logAction('Admin System', 'admin', 'CREATE_COURSE', `Created course ${code}: ${title}`);
  res.status(201).json(newCourse);
});

// Quiz Management
app.get('/api/quizzes', (req, res) => {
  res.json(quizzes);
});

app.get('/api/quizzes/:id', (req, res) => {
  const quiz = quizzes.find(q => q.id === req.params.id);
  if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
  res.json(quiz);
});

app.post('/api/quizzes', (req, res) => {
  const quizData = req.body;
  const totalPoints = (quizData.questions || []).reduce((acc: number, q: Question) => acc + (q.points || 0), 0);
  
  const newQuiz: Quiz = {
    id: `q-${Date.now()}`,
    title: quizData.title || 'Untitled Quiz',
    description: quizData.description || '',
    courseId: quizData.courseId || courses[0]?.id || 'c-101',
    courseCode: quizData.courseCode || 'CS101',
    courseName: quizData.courseName || 'Introduction to Computer Science',
    facultyId: quizData.facultyId || 'u-2',
    facultyName: quizData.facultyName || 'Prof. Elena Rostova',
    durationMinutes: Number(quizData.durationMinutes) || 15,
    passPercentage: Number(quizData.passPercentage) || 70,
    startDate: quizData.startDate || new Date().toISOString(),
    endDate: quizData.endDate || new Date(Date.now() + 86400000 * 30).toISOString(),
    isPublished: quizData.isPublished ?? true,
    shuffleQuestions: quizData.shuffleQuestions ?? false,
    showAnswersPostSubmission: quizData.showAnswersPostSubmission ?? true,
    maxAttempts: Number(quizData.maxAttempts) || 1,
    questions: quizData.questions || [],
    totalPoints,
    createdAt: new Date().toISOString()
  };

  quizzes.unshift(newQuiz);
  logAction(newQuiz.facultyName, 'faculty', 'CREATE_QUIZ', `Created quiz "${newQuiz.title}" for ${newQuiz.courseCode}`);
  res.status(201).json(newQuiz);
});

app.put('/api/quizzes/:id', (req, res) => {
  const { id } = req.params;
  const quiz = quizzes.find(q => q.id === id);
  if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

  const updated = req.body;
  if (updated.questions) {
    updated.totalPoints = updated.questions.reduce((acc: number, q: Question) => acc + (q.points || 0), 0);
  }

  Object.assign(quiz, updated);
  logAction(quiz.facultyName, 'faculty', 'UPDATE_QUIZ', `Updated quiz "${quiz.title}"`);
  res.json(quiz);
});

app.delete('/api/quizzes/:id', (req, res) => {
  const { id } = req.params;
  const index = quizzes.findIndex(q => q.id === id);
  if (index === -1) return res.status(404).json({ error: 'Quiz not found' });
  const deleted = quizzes.splice(index, 1)[0];
  logAction(deleted.facultyName, 'faculty', 'DELETE_QUIZ', `Deleted quiz "${deleted.title}"`);
  res.json({ success: true, deleted });
});

// Submissions & Grading
app.get('/api/submissions', (req, res) => {
  res.json(submissions);
});

app.get('/api/submissions/student/:studentId', (req, res) => {
  const studentSubmissions = submissions.filter(s => s.studentId === req.params.studentId);
  res.json(studentSubmissions);
});

app.get('/api/submissions/quiz/:quizId', (req, res) => {
  const quizSubmissions = submissions.filter(s => s.quizId === req.params.quizId);
  res.json(quizSubmissions);
});

app.post('/api/submissions', (req, res) => {
  const { quizId, studentId, studentName, studentEmail, answers, timeSpentSeconds } = req.body;
  const quiz = quizzes.find(q => q.id === quizId);
  if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

  // Evaluate auto-gradable questions
  let score = 0;
  const processedAnswers: Record<string, any> = {};

  quiz.questions.forEach((q) => {
    const studentAns = answers[q.id];
    let isCorrect = false;
    let pointsEarned = 0;

    if (studentAns !== undefined && studentAns !== null && studentAns !== '') {
      if (q.type === 'multiple-choice' || q.type === 'true-false') {
        if (Number(studentAns) === Number(q.correctAnswer)) {
          isCorrect = true;
          pointsEarned = q.points;
        }
      } else if (q.type === 'fill-blank') {
        if (String(studentAns).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase()) {
          isCorrect = true;
          pointsEarned = q.points;
        }
      } else if (q.type === 'short-answer') {
        // Auto grant partial/full if keywords match or mark pending manual check
        const keyword = String(q.correctAnswer).split(' ')[0] || '';
        if (String(studentAns).toLowerCase().includes(keyword.toLowerCase())) {
          isCorrect = true;
          pointsEarned = q.points;
        } else {
          pointsEarned = Math.floor(q.points * 0.5); // temporary partial
        }
      }
    }

    score += pointsEarned;
    processedAnswers[q.id] = {
      answer: studentAns,
      isCorrect,
      pointsEarned,
    };
  });

  const percentage = Math.round((score / (quiz.totalPoints || 1)) * 100);
  const passed = percentage >= quiz.passPercentage;

  // Count existing attempts
  const previousAttempts = submissions.filter(s => s.quizId === quizId && s.studentId === studentId);

  const newSubmission: Submission = {
    id: `sub-${Date.now()}`,
    quizId,
    quizTitle: quiz.title,
    courseCode: quiz.courseCode,
    studentId,
    studentName,
    studentEmail,
    answers: processedAnswers,
    score,
    totalPossible: quiz.totalPoints,
    percentage,
    passed,
    startedAt: new Date(Date.now() - (timeSpentSeconds || 600) * 1000).toISOString(),
    submittedAt: new Date().toISOString(),
    timeSpentSeconds: timeSpentSeconds || 300,
    attemptNumber: previousAttempts.length + 1,
    status: 'completed'
  };

  submissions.unshift(newSubmission);
  logAction(studentName, 'student', 'SUBMIT_QUIZ', `Submitted quiz "${quiz.title}" with score ${score}/${quiz.totalPoints} (${percentage}%)`);
  res.status(201).json(newSubmission);
});

app.put('/api/submissions/:id/grade', (req, res) => {
  const { id } = req.params;
  const { answerUpdates, generalFeedback } = req.body;
  const sub = submissions.find(s => s.id === id);
  if (!sub) return res.status(404).json({ error: 'Submission not found' });

  let newScore = 0;
  if (answerUpdates) {
    Object.keys(answerUpdates).forEach(qId => {
      if (sub.answers[qId]) {
        sub.answers[qId].pointsEarned = answerUpdates[qId].pointsEarned;
        sub.answers[qId].isCorrect = answerUpdates[qId].isCorrect;
        sub.answers[qId].feedback = answerUpdates[qId].feedback;
      }
    });
  }

  // Recalculate total score
  Object.values(sub.answers).forEach(a => {
    newScore += (a.pointsEarned || 0);
  });

  sub.score = newScore;
  sub.percentage = Math.round((newScore / sub.totalPossible) * 100);
  const quiz = quizzes.find(q => q.id === sub.quizId);
  sub.passed = sub.percentage >= (quiz?.passPercentage || 70);
  sub.status = 'manually-graded';

  logAction('Faculty System', 'faculty', 'GRADE_SUBMISSION', `Graded submission for ${sub.studentName} on ${sub.quizTitle}`);
  res.json(sub);
});

// System Analytics & Audit Logs
app.get('/api/analytics/system', (req, res) => {
  const totalUsers = users.length;
  const totalFaculty = users.filter(u => u.role === 'faculty').length;
  const totalStudents = users.filter(u => u.role === 'student').length;
  const totalCourses = courses.length;
  const totalQuizzes = quizzes.length;
  const totalSubmissions = submissions.length;
  const averagePassRate = submissions.length > 0
    ? Math.round((submissions.filter(s => s.passed).length / submissions.length) * 100)
    : 0;

  const stats: SystemStats = {
    totalUsers,
    totalFaculty,
    totalStudents,
    totalCourses,
    totalQuizzes,
    totalSubmissions,
    averagePassRate
  };

  res.json(stats);
});

app.get('/api/logs', (req, res) => {
  res.json(auditLogs);
});

// ==========================================
// AI QUIZ GENERATION ENDPOINT (GEMINI API)
// ==========================================
app.post('/api/ai/generate-quiz', async (req, res) => {
  try {
    const { topic, courseCode, difficulty, numberOfQuestions, questionTypes } = req.body;
    
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required for AI quiz generation' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({ 
        error: 'Gemini API Key is not configured. Please add GEMINI_API_KEY in the Secrets panel.' 
      });
    }

    const prompt = `Generate a high quality academic quiz on the topic: "${topic}".
Course Code: ${courseCode || 'GENERAL'}
Difficulty Level: ${difficulty || 'intermediate'}
Total Number of Questions: ${numberOfQuestions || 4}
Include question types: ${questionTypes ? questionTypes.join(', ') : 'multiple-choice, true-false, fill-blank, short-answer'}.

Return a JSON object containing a title, short description, suggested duration in minutes (e.g. 15), pass percentage (e.g. 70), and an array of questions.
Each question must have:
- id: string
- text: string
- type: 'multiple-choice' | 'true-false' | 'fill-blank' | 'short-answer'
- options: array of 4 string choices (for multiple-choice and true-false)
- correctAnswer: number (0-3 index for multiple-choice/true-false) OR string (for fill-blank and short-answer)
- explanation: comprehensive explanation of the correct answer
- points: 10
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            durationMinutes: { type: Type.NUMBER },
            passPercentage: { type: Type.NUMBER },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  text: { type: Type.STRING },
                  type: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  correctAnswer: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  points: { type: Type.NUMBER }
                },
                required: ['id', 'text', 'type', 'points']
              }
            }
          },
          required: ['title', 'description', 'questions']
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) {
      return res.status(500).json({ error: 'Empty response from AI generator' });
    }

    const parsedQuiz = JSON.parse(jsonText);
    
    // Format question IDs and ensure correctAnswer format
    parsedQuiz.questions = (parsedQuiz.questions || []).map((q: any, index: number) => {
      let formattedCorrectAnswer: any = q.correctAnswer;
      if (q.type === 'multiple-choice' || q.type === 'true-false') {
        const num = Number(q.correctAnswer);
        formattedCorrectAnswer = isNaN(num) ? 0 : num;
      }
      return {
        ...q,
        id: `ai-q-${Date.now()}-${index}`,
        points: q.points || 10,
        correctAnswer: formattedCorrectAnswer
      };
    });

    logAction('AI Assistant', 'faculty', 'GENERATE_AI_QUIZ', `AI generated quiz structure for topic "${topic}"`);
    res.json(parsedQuiz);

  } catch (err: any) {
    console.error('Error generating AI quiz:', err);
    res.status(500).json({ error: err.message || 'Failed to generate quiz with AI' });
  }
});


// ==========================================
// VITE / STATIC SERVING SETUP
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
