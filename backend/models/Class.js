const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  classId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  name: {
    type: String,
    required: [true, 'Class name is required'],
    trim: true,
  },
  grade: {
    type: Number,
    required: [true, 'Grade level is required'],
    min: 1,
    max: 12,
  },
  section: {
    type: String,
    required: [true, 'Section is required'],
    trim: true,
    uppercase: true,
  },
  academicYear: {
    type: String,
    required: [true, 'Academic year is required'],
    trim: true,
  },
  maxStudents: {
    type: Number,
    default: 40,
  },
  currentStudents: {
    type: Number,
    default: 0,
  },
  classTeacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
  },
  subjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
  }],
  timetable: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      required: true,
    },
    periods: [{
      periodNumber: {
        type: Number,
        required: true,
        min: 1,
        max: 8,
      },
      subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true,
      },
      teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true,
      },
      startTime: {
        type: String,
        required: true,
      },
      endTime: {
        type: String,
        required: true,
      },
    }],
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Virtual for class display name
classSchema.virtual('displayName').get(function () {
  return `Grade ${this.grade} - Section ${this.section}`;
});

module.exports = mongoose.model('Class', classSchema);
