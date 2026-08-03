import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  code: { type: String, required: true },
  title: { type: String, required: true },
  department: { type: String, required: true },
  facultyId: { type: String, required: true },
  facultyName: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Course || mongoose.model('Course', courseSchema);
