import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, Plus, ArrowLeft, Edit, Trash2, Eye } from 'lucide-react';
import { adminAPI } from '../services/api';
import Modal from '../components/Modal';

const ClassDetail = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [classData, setClassData] = useState(null);
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    dateOfBirth: '',
    gender: 'male',
    address: '',
    parentName: '',
    parentPhone: ''
  });

  useEffect(() => {
    fetchClassData();
    fetchStudents();
  }, [classId]);

  const fetchClassData = async () => {
    try {
      const data = await adminAPI.getClasses();
      const classItem = data.classes?.find(cls => cls._id === classId);
      setClassData(classItem);
    } catch (error) {
      setError('Failed to load class data');
      console.error('Class data error:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const data = await adminAPI.getStudents();
      const classStudents = data.students?.filter(student => 
        student.class === classId
      );
      setStudents(classStudents || []);
    } catch (error) {
      setError('Failed to load students');
      console.error('Students error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    try {
      const studentData = {
        ...formData,
        class: classId
      };
      await adminAPI.createStudent(studentData);
      setIsCreateModalOpen(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        dateOfBirth: '',
        gender: 'male',
        address: '',
        parentName: '',
        parentPhone: ''
      });
      fetchStudents();
    } catch (error) {
      setError('Failed to create student');
      console.error('Create student error:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (isLoading || !classData) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="spinner" />
          <p>Loading class details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <button 
          className="btn btn-secondary"
          onClick={() => navigate('/admin/classes')}
        >
          <ArrowLeft />
          Back to Classes
        </button>
        <h1>{classData.name} - Students</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus />
          Add Student
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="class-info">
        <div className="info-card">
          <h3>Class Information</h3>
          <p><strong>Grade:</strong> {classData.grade}</p>
          <p><strong>Section:</strong> {classData.section}</p>
          <p><strong>Academic Year:</strong> {classData.academicYear}</p>
          <p><strong>Max Students:</strong> {classData.maxStudents}</p>
          <p><strong>Current Students:</strong> {students.length}/{classData.maxStudents}</p>
        </div>
      </div>

      <div className="students-section">
        <h2>All Students ({students.length})</h2>
        
        <div className="search-bar">
          <Users />
          <input
            type="text"
            placeholder="Search students..."
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="data-grid">
          {students.map((student) => (
            <div key={student._id} className="card">
              <div className="card-content">
                <h3>{student.firstName} {student.lastName}</h3>
                <p>Roll Number: {student.rollNumber}</p>
                <p>Email: {student.email}</p>
                <p>Phone: {student.phone}</p>
              </div>
              <div className="card-actions">
                <button className="btn btn-secondary">
                  <Eye />
                </button>
                <button className="btn btn-secondary">
                  <Edit />
                </button>
                <button className="btn btn-danger">
                  <Trash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add New Student"
      >
        <form onSubmit={handleCreateStudent}>
          <div className="form-group">
            <label className="form-label">First Name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Date of Birth</label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className="form-select"
              required
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="form-input"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Parent Name</label>
            <input
              type="text"
              name="parentName"
              value={formData.parentName}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Parent Phone</label>
            <input
              type="tel"
              name="parentPhone"
              value={formData.parentPhone}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Add Student to Class
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ClassDetail;
