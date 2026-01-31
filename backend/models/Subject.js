const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  subjectId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  name: {
    type: String,
    required: [true, 'Subject name is required'],
    trim: true,
  },
  code: {
    type: String,
    required: [true, 'Subject code is required'],
    unique: true,
    trim: true,
    uppercase: true,
  },
  description: {
    type: String,
    trim: true,
  },
  type: {
    type: String,
    enum: ['core', 'elective', 'optional'],
    default: 'core',
  },
  credits: {
    type: Number,
    default: 1,
    min: 1,
    max: 5,
  },
  grades: [{
    type: Number,
    min: 1,
    max: 12,
  }],
  assignedTeachers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
  }],
  assignedClasses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
  }],
  totalPeriodsPerWeek: {
    type: Number,
    default: 5,
    min: 1,
    max: 10,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Subject', subjectSchema);
