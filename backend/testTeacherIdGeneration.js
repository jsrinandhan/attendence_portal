const mongoose = require('mongoose');
require('dotenv').config();
const { generateTeacherId } = require('./utils/generateId');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance-portal')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Test teacher ID generation
const testTeacherIdGeneration = async () => {
  try {
    console.log('Testing Teacher ID Generation...\n');
    
    // Test with different teacher names
    const testNames = [
      { firstName: 'John', lastName: 'Smith' },
      { firstName: 'Mary', lastName: 'Johnson' },
      { firstName: 'David', lastName: 'Brown' },
      { firstName: 'Sarah', lastName: 'Davis' },
      { firstName: 'Michael', lastName: 'Wilson' }
    ];
    
    const teacherIds = [];
    
    for (let i = 0; i < testNames.length; i++) {
      const { firstName, lastName } = testNames[i];
      const teacherId = await generateTeacherId(firstName, lastName);
      teacherIds.push(teacherId);
      console.log(`${firstName} ${lastName} → Teacher ID: ${teacherId}`);
    }
    
    // Verify all IDs are unique
    const uniqueIds = [...new Set(teacherIds)];
    if (uniqueIds.length === teacherIds.length) {
      console.log('\n✅ All generated IDs are unique!');
    } else {
      console.log('\n❌ Duplicate IDs found!');
    }
    
    // Verify format (first letter + first letter + 3 numbers)
    const formatRegex = /^[A-Z]{2}\d{3}$/;
    const validFormat = teacherIds.every(id => formatRegex.test(id));
    
    if (validFormat) {
      console.log('✅ All IDs follow the correct format (2 letters + 3 numbers)');
    } else {
      console.log('❌ Some IDs have incorrect format');
    }
    
    // Verify name-based prefix
    const expectedPrefixes = testNames.map(({ firstName, lastName }) => 
      `${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}`
    );
    
    const correctPrefixes = teacherIds.every((id, index) => 
      id.startsWith(expectedPrefixes[index])
    );
    
    if (correctPrefixes) {
      console.log('✅ All IDs have correct name-based prefixes');
    } else {
      console.log('❌ Some IDs have incorrect prefixes');
    }
    
    console.log('\nGenerated IDs:', teacherIds);
    
  } catch (error) {
    console.error('Error testing teacher ID generation:', error);
  } finally {
    mongoose.disconnect();
  }
};

// Run the test
testTeacherIdGeneration();
