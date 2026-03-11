// Generate unique teacher ID (first letter of first name + first letter of last name + 3 numbers)
const generateTeacherId = async (firstName, lastName) => {
  const Teacher = require('../models/Teacher');
  
  // Get first letters and convert to uppercase
  const firstLetter = firstName ? firstName.charAt(0).toUpperCase() : 'X';
  const lastLetter = lastName ? lastName.charAt(0).toUpperCase() : 'X';
  
  let teacherId;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 1000;

  while (!isUnique && attempts < maxAttempts) {
    // Generate 3 random numbers (000-999)
    const randomNumber = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    teacherId = `${firstLetter}${lastLetter}${randomNumber}`;
    
    // Check if ID is unique
    const existingTeacher = await Teacher.findOne({ teacherId });
    if (!existingTeacher) {
      isUnique = true;
    }
    
    attempts++;
  }

  if (!isUnique) {
    throw new Error('Failed to generate unique teacher ID after multiple attempts');
  }

  return teacherId;
};

// Generate unique student roll number
const generateRollNumber = (className, admissionYear) => {
  const year = admissionYear || new Date().getFullYear();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${year}${className.toUpperCase()}${random}`;
};

// Generate unique class ID
const generateClassId = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 3);
  return `CLS${timestamp.toUpperCase()}${random.toUpperCase()}`;
};

// Generate unique subject ID
const generateSubjectId = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 3);
  return `SUB${timestamp.toUpperCase()}${random.toUpperCase()}`;
};

module.exports = {
  generateTeacherId,
  generateRollNumber,
  generateClassId,
  generateSubjectId,
};
