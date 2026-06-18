import mongoose from 'mongoose';

const timesheetLogSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  project_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  log_date: {
    type: String, // Stored as YYYY-MM-DD for straightforward local date matching
    required: true
  },
  hours_logged: {
    type: Number,
    required: true,
    min: 0.5,
    max: 24.0
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  amount_paid: {
    type: Number,
    default: 0,
    min: 0
  },
  payment_status: {
    type: String,
    enum: ['unpaid', 'paid', 'partially_paid'],
    default: 'unpaid'
  }
}, {
  timestamps: true
});

const TimesheetLog = mongoose.model('TimesheetLog', timesheetLogSchema);
export default TimesheetLog;
