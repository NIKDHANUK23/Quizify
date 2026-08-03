import { Router } from 'express';
import { getUsers, loginUser, createUser, updateUser, deleteUser } from '../controllers/userController.js';
import { getCourses, createCourse } from '../controllers/courseController.js';
import { getQuizzes, createQuiz, updateQuiz, deleteQuiz, generateAIQuiz } from '../controllers/quizController.js';
import { getSubmissions, submitQuiz, gradeSubmission } from '../controllers/submissionController.js';
import { getSystemStats, getAuditLogs } from '../controllers/statsController.js';

const router = Router();

// Health Check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', stack: 'MERN', framework: 'Vite Express' });
});

// Users & Authentication
router.post('/auth/login', loginUser);
router.get('/users', getUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Courses
router.get('/courses', getCourses);
router.post('/courses', createCourse);

// Quizzes
router.get('/quizzes', getQuizzes);
router.post('/quizzes', createQuiz);
router.put('/quizzes/:id', updateQuiz);
router.delete('/quizzes/:id', deleteQuiz);
router.post('/quizzes/generate-ai', generateAIQuiz);

// Submissions & Grading
router.get('/submissions', getSubmissions);
router.post('/submissions', submitQuiz);
router.put('/submissions/:id/grade', gradeSubmission);

// Admin Stats & System Logs
router.get('/stats', getSystemStats);
router.get('/logs', getAuditLogs);

export default router;
