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
    max: 4, // Updated for college years (1-4)
  },
  section: {
    type: String,
    required: [true, 'Section is required'],
    trim: true,
    uppercase: true,
  },
}, {
  timestamps: true,
});

// Create compound index for unique grade and section combinations
classSchema.index({ grade: 1, section: 1 }, { unique: true });

// Virtual for class display name
classSchema.virtual('displayName').get(function () {
  return `Grade ${this.grade} - Section ${this.section}`;
});

module.exports = mongoose.model('Class', classSchema);
