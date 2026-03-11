import React, { useState, useEffect } from 'react';
import { User, Plus, Search, Edit, Trash2 } from 'lucide-react';
import { adminAPI } from '../services/api';
import Modal from '../components/Modal';

const TeachersManagement = () => {
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: ''
  });

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const data = await adminAPI.getTeachers();
      setTeachers(data.teachers || []);
    } catch (error) {
      setError('Failed to load teachers');
      console.error('Teachers error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTeacher = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.createTeacher(formData);
      setIsCreateModalOpen(false);
      setFormData({
        firstName: '',
        lastName: '',
        phone: ''
      });
      fetchTeachers();
    } catch (error) {
      setError('Failed to create teacher');
      console.error('Create teacher error:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDeleteTeacher = async (teacherId) => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      try {
        await adminAPI.deleteTeacher(teacherId);
        fetchTeachers();
      } catch (error) {
        setError('Failed to delete teacher');
        console.error('Delete teacher error:', error);
      }
    }
  };

  const handleEditTeacher = (teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      phone: teacher.phone
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateTeacher = async (e) => {
    e.preventDefault();
    try {
      const response = await adminAPI.updateTeacher(editingTeacher._id, formData);
      setIsEditModalOpen(false);
      setEditingTeacher(null);
      setFormData({
        firstName: '',
        lastName: '',
        phone: ''
      });
      fetchTeachers();
      
      // Show notification if ID was regenerated
      if (response.idRegenerated) {
        alert(`Teacher updated successfully!\n\nNew Teacher ID: ${response.teacher.teacherId}\n\nThe teacher will need to use this new ID for login.`);
      }
    } catch (error) {
      setError('Failed to update teacher');
      console.error('Update teacher error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="spinner" />
          <p>Loading teachers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Teachers Management</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus />
          Add New Teacher
        </button>
      </div>

      <div className="search-bar">
        <Search />
        <input
          type="text"
          placeholder="Search teachers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Teacher"
      >
        <form onSubmit={handleCreateTeacher}>
          <div className="form-group">
            <label className="form-label">First Name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className="form-input"
              placeholder="e.g., John"
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
              placeholder="e.g., Smith"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="form-input"
              placeholder="e.g., +1234567890"
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
              Create Teacher
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Teacher"
      >
        <form onSubmit={handleUpdateTeacher}>
          <div className="form-group">
            <label className="form-label">First Name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className="form-input"
              placeholder="e.g., John"
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
              placeholder="e.g., Smith"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="form-input"
              placeholder="e.g., +1234567890"
              required
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Update Teacher
            </button>
          </div>
        </form>
      </Modal>

      <div className="data-grid">
        {teachers.map((teacher) => (
          <div key={teacher._id} className="card">
            <div className="card-content">
              <h3>{teacher.firstName} {teacher.lastName}</h3>
              <p>Teacher ID: {teacher.teacherId}</p>
              <p>Phone: {teacher.phone}</p>
            </div>
            <div className="card-actions">
              <button className="btn btn-secondary" onClick={() => handleEditTeacher(teacher)}>
                <Edit />
              </button>
              <button className="btn btn-danger" onClick={() => handleDeleteTeacher(teacher._id)}>
                <Trash2 />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeachersManagement;
