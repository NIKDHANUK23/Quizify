import { memoryStore, isConnected } from '../config/db.js';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Quiz from '../models/Quiz.js';
import Submission from '../models/Submission.js';
import AuditLog from '../models/AuditLog.js';

export const getSystemStats = async (req, res) => {
  try {
    let users = memoryStore.users;
    let courses = memoryStore.courses;
    let quizzes = memoryStore.quizzes;
    let submissions = memoryStore.submissions;

    if (isConnected()) {
      users = await User.find();
      courses = await Course.find();
      quizzes = await Quiz.find();
      submissions = await Submission.find();
    }

    const totalUsers = users.length;
    const totalStudents = users.filter((u) => u.role === 'student').length;
    const totalFaculty = users.filter((u) => u.role === 'faculty').length;
    const totalCourses = courses.length;
    const totalQuizzes = quizzes.length;
    const totalSubmissions = submissions.length;

    const passCount = submissions.filter((s) => s.passed).length;
    const averagePassRate = totalSubmissions ? Math.round((passCount / totalSubmissions) * 100) : 100;

    return res.json({
      totalUsers,
      totalStudents,
      totalFaculty,
      totalCourses,
      totalQuizzes,
      totalSubmissions,
      averagePassRate,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getAuditLogs = async (req, res) => {
  try {
    if (isConnected()) {
      const logs = await AuditLog.find().sort({ timestamp: -1 });
      return res.json(logs);
    }
    return res.json(memoryStore.logs);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
