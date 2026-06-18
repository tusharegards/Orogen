import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  is_active: {
    type: Boolean,
    default: true
  },
  pay_rate: {
    type: Number,
    default: 0,
    min: 0
  },
  currency: {
    type: String,
    enum: ['INR', 'USD'],
    default: 'USD'
  }
}, {
  timestamps: true
});

const Project = mongoose.model('Project', projectSchema);
export default Project;
