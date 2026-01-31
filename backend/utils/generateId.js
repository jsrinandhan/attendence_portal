// Generate unique teacher ID
const generateTeacherId = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `TCH${timestamp.toUpperCase()}${random.toUpperCase()}`;
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
