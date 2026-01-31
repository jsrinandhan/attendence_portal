const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const teacherSchema = new mongoose.Schema({
  teacherId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
  },
  phone: {
    type: String,
    trim: true,
  },
  qualification: {
    type: String,
    trim: true,
  },
  experience: {
    type: Number,
    default: 0,
  },
  assignedClasses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
  }],
  assignedSubjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  role: {
    type: String,
    default: 'teacher',
    enum: ['teacher'],
  },
}, {
  timestamps: true,
});

// Hash password before saving
teacherSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
teacherSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
teacherSchema.methods.toJSON = function () {
  const teacherObject = this.toObject();
  delete teacherObject.password;
  return teacherObject;
};

// Virtual for full name
teacherSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model('Teacher', teacherSchema);
