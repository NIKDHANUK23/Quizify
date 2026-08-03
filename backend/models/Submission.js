import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  quizId: { type: String, required: true },
  quizTitle: { type: String, required: true },
  courseCode: { type: String, required: true },
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  studentEmail: { type: String, required: true },
  score: { type: Number, default: 0 },
  totalPossible: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 },
  passed: { type: Boolean, default: false },
  timeSpentSeconds: { type: Number, default: 0 },
  submittedAt: { type: Date, default: Date.now },
  answers: { type: mongoose.Schema.Types.Mixed, default: {} },
});

export default mongoose.models.Submission || mongoose.model('Submission', submissionSchema);
