const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student reference is required'],
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: [true, 'Class reference is required'],
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: [true, 'Subject reference is required'],
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: [true, 'Teacher reference is required'],
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
  },
  periodNumber: {
    type: Number,
    required: [true, 'Period number is required'],
    min: 1,
    max: 8,
  },
  status: {
    type: String,
    required: [true, 'Attendance status is required'],
    enum: ['present', 'absent', 'late', 'excused'],
    default: 'present',
  },
  remarks: {
    type: String,
    trim: true,
    maxlength: [200, 'Remarks cannot exceed 200 characters'],
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: [true, 'Marked by reference is required'],
  },
  markedAt: {
    type: Date,
    default: Date.now,
  },
  isEdited: {
    type: Boolean,
    default: false,
  },
  editedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
  },
  editedAt: {
    type: Date,
  },
  editReason: {
    type: String,
    trim: true,
    maxlength: [200, 'Edit reason cannot exceed 200 characters'],
  },
}, {
  timestamps: true,
});

// Compound index to prevent duplicate attendance entries
attendanceSchema.index(
  { student: 1, class: 1, subject: 1, date: 1, periodNumber: 1 },
  { unique: true }
);

// Index for efficient queries
attendanceSchema.index({ student: 1, date: 1 });
attendanceSchema.index({ class: 1, date: 1 });
attendanceSchema.index({ subject: 1, date: 1 });
attendanceSchema.index({ teacher: 1, date: 1 });

// Virtual for attendance percentage (to be calculated at query time)
attendanceSchema.virtual('isPresent').get(function () {
  return this.status === 'present' || this.status === 'late';
});

// Pre-save middleware to validate date is not in future
attendanceSchema.pre('save', function (next) {
  if (this.date > new Date()) {
    const error = new Error('Attendance cannot be marked for future dates');
    return next(error);
  }
  next();
});

module.exports = mongoose.model('Attendance', attendanceSchema);
