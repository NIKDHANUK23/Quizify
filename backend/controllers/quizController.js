import Quiz from '../models/Quiz.js';
import { memoryStore, isConnected } from '../config/db.js';
import { generateAIQuizService } from '../services/geminiService.js';

export const getQuizzes = async (req, res) => {
  try {
    if (isConnected()) {
      const quizzes = await Quiz.find().sort({ createdAt: -1 });
      return res.json(quizzes);
    }
    return res.json(memoryStore.quizzes);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const createQuiz = async (req, res) => {
  try {
    const data = req.body;
    const questions = data.questions || [];
    const totalPoints = questions.reduce((sum, q) => sum + Number(q.points || 10), 0);

    const newQuiz = {
      id: `q-${Date.now()}`,
      _id: `q-${Date.now()}`,
      ...data,
      totalPoints,
      isPublished: data.isPublished !== undefined ? data.isPublished : true,
      createdAt: new Date().toISOString(),
    };

    if (isConnected()) {
      const quizDoc = await Quiz.create(newQuiz);
      return res.status(201).json(quizDoc);
    }

    memoryStore.quizzes.unshift(newQuiz);
    return res.status(201).json(newQuiz);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.questions) {
      updates.totalPoints = updates.questions.reduce((sum, q) => sum + Number(q.points || 10), 0);
    }

    if (isConnected()) {
      const updated = await Quiz.findByIdAndUpdate(id, updates, { new: true });
      return res.json(updated);
    }

    const index = memoryStore.quizzes.findIndex((q) => q.id === id || q._id === id);
    if (index !== -1) {
      memoryStore.quizzes[index] = { ...memoryStore.quizzes[index], ...updates };
      return res.json(memoryStore.quizzes[index]);
    }
    return res.status(404).json({ error: 'Quiz not found' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;

    if (isConnected()) {
      await Quiz.findByIdAndDelete(id);
      return res.json({ success: true });
    }

    memoryStore.quizzes = memoryStore.quizzes.filter((q) => q.id !== id && q._id !== id);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const generateAIQuiz = async (req, res) => {
  try {
    const { topic, courseCode, difficulty, numberOfQuestions } = req.body;
    const result = await generateAIQuizService({ topic, courseCode, difficulty, numberOfQuestions });
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
