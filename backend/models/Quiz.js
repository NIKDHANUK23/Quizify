import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  text: { type: String, required: true },
  type: {
    type: String,
    enum: ['multiple-choice', 'true-false', 'fill-blank', 'short-answer'],
    default: 'multiple-choice',
  },
  options: [{ type: String }],
  correctAnswer: { type: mongoose.Schema.Types.Mixed },
  explanation: { type: String },
  points: { type: Number, default: 10 },
});

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  courseId: { type: String, required: true },
  courseCode: { type: String, required: true },
  courseName: { type: String },
  facultyId: { type: String, required: true },
  facultyName: { type: String },
  durationMinutes: { type: Number, default: 20 },
  passPercentage: { type: Number, default: 70 },
  totalPoints: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: true },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  questions: [questionSchema],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Quiz || mongoose.model('Quiz', quizSchema);
