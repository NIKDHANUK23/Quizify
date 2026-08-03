import Submission from '../models/Submission.js';
import Quiz from '../models/Quiz.js';
import { memoryStore, isConnected } from '../config/db.js';

export const getSubmissions = async (req, res) => {
  try {
    if (isConnected()) {
      const subs = await Submission.find().sort({ submittedAt: -1 });
      return res.json(subs);
    }
    return res.json(memoryStore.submissions);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const submitQuiz = async (req, res) => {
  try {
    const { quizId, studentId, studentName, studentEmail, answers, timeSpentSeconds } = req.body;

    let targetQuiz = null;
    if (isConnected()) {
      targetQuiz = await Quiz.findOne({ $or: [{ _id: quizId }, { id: quizId }] });
    }
    if (!targetQuiz) {
      targetQuiz = memoryStore.quizzes.find((q) => q.id === quizId || q._id === quizId);
    }

    if (!targetQuiz) {
      return res.status(404).json({ error: 'Quiz target not found' });
    }

    let earnedScore = 0;
    const processedAnswers = {};

    targetQuiz.questions.forEach((q) => {
      const studentAns = answers[q.id];
      let isCorrect = false;
      let pts = 0;

      if (q.type === 'multiple-choice' || q.type === 'true-false') {
        if (Number(studentAns) === Number(q.correctAnswer)) {
          isCorrect = true;
          pts = Number(q.points || 10);
        }
      } else if (q.type === 'fill-blank') {
        if (String(studentAns || '').trim().toLowerCase() === String(q.correctAnswer || '').trim().toLowerCase()) {
          isCorrect = true;
          pts = Number(q.points || 10);
        }
      } else {
        // short answer - grant default credit or pending manual grading
        if (studentAns && String(studentAns).trim().length > 0) {
          isCorrect = true;
          pts = Number(q.points || 10);
        }
      }

      earnedScore += pts;
      processedAnswers[q.id] = {
        answer: studentAns,
        isCorrect,
        pointsEarned: pts,
        feedback: isCorrect ? 'Correct response' : 'Incorrect',
      };
    });

    const totalPossible = targetQuiz.questions.reduce((sum, q) => sum + Number(q.points || 10), 0) || 1;
    const percentage = Math.round((earnedScore / totalPossible) * 100);
    const passed = percentage >= (targetQuiz.passPercentage || 70);

    const submissionData = {
      id: `sub-${Date.now()}`,
      _id: `sub-${Date.now()}`,
      quizId,
      quizTitle: targetQuiz.title,
      courseCode: targetQuiz.courseCode,
      studentId,
      studentName,
      studentEmail,
      score: earnedScore,
      totalPossible,
      percentage,
      passed,
      timeSpentSeconds: Number(timeSpentSeconds) || 0,
      submittedAt: new Date().toISOString(),
      answers: processedAnswers,
    };

    if (isConnected()) {
      const doc = await Submission.create(submissionData);
      return res.status(201).json(doc);
    }

    memoryStore.submissions.unshift(submissionData);
    return res.status(201).json(submissionData);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const gradeSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { answerUpdates } = req.body;

    let sub = null;
    if (isConnected()) {
      sub = await Submission.findOne({ $or: [{ _id: id }, { id: id }] });
    }
    if (!sub) {
      sub = memoryStore.submissions.find((s) => s.id === id || s._id === id);
    }

    if (!sub) return res.status(404).json({ error: 'Submission not found' });

    const answers = { ...sub.answers, ...answerUpdates };
    let newScore = 0;
    Object.keys(answers).forEach((qId) => {
      newScore += Number(answers[qId].pointsEarned || 0);
    });

    const totalPossible = sub.totalPossible || 1;
    const percentage = Math.round((newScore / totalPossible) * 100);
    const passed = percentage >= 70;

    const updates = {
      answers,
      score: newScore,
      percentage,
      passed,
    };

    if (isConnected()) {
      const updated = await Submission.findOneAndUpdate(
        { $or: [{ _id: id }, { id: id }] },
        updates,
        { new: true }
      );
      if (updated) {
        const idx = memoryStore.submissions.findIndex((s) => s.id === id || s._id === id);
        if (idx !== -1) memoryStore.submissions[idx] = updated;
        return res.json(updated);
      }
    }

    const index = memoryStore.submissions.findIndex((s) => s.id === id || s._id === id);
    memoryStore.submissions[index] = { ...memoryStore.submissions[index], ...updates };
    return res.json(memoryStore.submissions[index]);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
