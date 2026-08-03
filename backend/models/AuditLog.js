import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  _id: { type: String },
  id: { type: String },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  userRole: { type: String, required: true },
  action: { type: String, required: true },
  details: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);
