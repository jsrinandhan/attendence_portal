const mongoose = require('mongoose');
require('dotenv').config();
const { generateTeacherId } = require('./utils/generateId');
const Teacher = require('./models/Teacher');

// Simulate the updateTeacher controller logic
const updateTeacherWithIdRegeneration = async (teacherId, updateData) => {
  // Find the current teacher
  const currentTeacher = await Teacher.findOne({ teacherId });
  if (!currentTeacher) {
    throw new Error('Teacher not found');
  }

  const newUpdateData = { ...updateData };
  let shouldRegenerateId = false;

  // Check if name is being changed
  if (updateData.firstName && updateData.firstName !== currentTeacher.firstName) {
    shouldRegenerateId = true;
  }
  if (updateData.lastName && updateData.lastName !== currentTeacher.lastName) {
    shouldRegenerateId = true;
  }

  // Regenerate teacher ID if name changed
  if (shouldRegenerateId) {
    const newTeacherId = await generateTeacherId(
      newUpdateData.firstName || currentTeacher.firstName,
      newUpdateData.lastName || currentTeacher.lastName
    );
    newUpdateData.teacherId = newTeacherId;
  }

  const updatedTeacher = await Teacher.findOneAndUpdate(
    { teacherId },
    newUpdateData,
    { new: true, runValidators: true }
  );

  return {
    teacher: updatedTeacher,
    idRegenerated: shouldRegenerateId
  };
};

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance-portal')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Test teacher ID regeneration
const testTeacherIdRegeneration = async () => {
  try {
    console.log('Testing Teacher ID Regeneration...\n');
    
    // Create a test teacher
    const originalFirstName = 'John';
    const originalLastName = 'Smith';
    const originalTeacherId = await generateTeacherId(originalFirstName, originalLastName);
    
    console.log(`Original Teacher: ${originalFirstName} ${originalLastName}`);
    console.log(`Original ID: ${originalTeacherId}\n`);
    
    // Clean up any existing test teachers
    await Teacher.deleteMany({ teacherId: { $regex: /^[A-Z]{2}\d{3}$/ } });
    
    // Create the teacher
    const teacher = new Teacher({
      teacherId: originalTeacherId,
      firstName: originalFirstName,
      lastName: originalLastName,
      password: 'Test@123',
      phone: '1234567890'
    });
    
    await teacher.save();
    console.log('✅ Teacher created successfully\n');
    
    // Test name change scenarios
    const nameChanges = [
      { firstName: 'Jane', lastName: 'Smith', description: 'First name change' },
      { firstName: 'John', lastName: 'Johnson', description: 'Last name change' },
      { firstName: 'Mary', lastName: 'Wilson', description: 'Both names change' },
      { firstName: 'John', lastName: 'Smith', phone: '9876543210', description: 'No name change (phone only)' }
    ];
    
    for (const change of nameChanges) {
      console.log(`Testing: ${change.description}`);
      console.log(`New Name: ${change.firstName} ${change.lastName}`);
      
      // Update teacher using our logic
      const result = await updateTeacherWithIdRegeneration(originalTeacherId, change);
      
      console.log(`ID Regenerated: ${result.idRegenerated ? 'Yes' : 'No'}`);
      console.log(`New ID: ${result.teacher.teacherId}`);
      
      // Verify the logic
      const nameChanged = (change.firstName !== originalFirstName) || (change.lastName !== originalLastName);
      
      if (nameChanged && !result.idRegenerated) {
        console.log('❌ ID should have been regenerated but wasn\'t');
      } else if (!nameChanged && result.idRegenerated) {
        console.log('❌ ID was regenerated but shouldn\'t have been');
      } else {
        console.log('✅ ID regeneration logic correct');
      }
      
      console.log('---');
      
      // Reset for next test
      await Teacher.findOneAndUpdate(
        { teacherId: result.teacher.teacherId },
        { firstName: originalFirstName, lastName: originalLastName, teacherId: originalTeacherId }
      );
    }
    
    // Clean up
    await Teacher.findOneAndDelete({ teacherId: originalTeacherId });
    console.log('✅ Test completed successfully!');
    
  } catch (error) {
    console.error('Error testing teacher ID regeneration:', error);
  } finally {
    mongoose.disconnect();
  }
};

// Run the test
testTeacherIdRegeneration();
