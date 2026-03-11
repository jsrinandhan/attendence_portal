import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import { adminAPI } from '../services/api';
import Modal from '../components/Modal';

const ClassesManagement = () => {
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [formData, setFormData] = useState({
    grade: '',
    section: ''
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const data = await adminAPI.getClasses();
      setClasses(data.classes || []);
    } catch (error) {
      setError('Failed to load classes');
      console.error('Classes error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.createClass(formData);
      setIsCreateModalOpen(false);
      setFormData({
        grade: '',
        section: ''
      });
      fetchClasses();
    } catch (error) {
      setError('Failed to create class');
      console.error('Create class error:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDeleteClass = async (classId) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      try {
        await adminAPI.deleteClass(classId);
        fetchClasses();
      } catch (error) {
        setError('Failed to delete class');
        console.error('Delete class error:', error);
      }
    }
  };

  const handleEditClass = (classItem) => {
    setEditingClass(classItem);
    setFormData({
      grade: classItem.grade,
      section: classItem.section
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateClass = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.updateClass(editingClass._id, formData);
      setIsEditModalOpen(false);
      setEditingClass(null);
      setFormData({
        grade: '',
        section: ''
      });
      fetchClasses();
    } catch (error) {
      setError('Failed to update class');
      console.error('Update class error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="spinner" />
          <p>Loading classes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Classes Management</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus />
          Add New Class
        </button>
      </div>

      <div className="search-bar">
        <Search />
        <input
          type="text"
          placeholder="Search classes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="data-grid">
        {classes.map((classItem) => (
          <div key={classItem._id} className="card">
            <div className="card-content">
              <h3>{classItem.name}</h3>
              <p>Year: {classItem.grade}</p>
              <p>Section: {classItem.section}</p>
            </div>
            <div className="card-actions">
              <button className="btn btn-primary" onClick={() => window.location.href = `/admin/classes/${classItem._id}`}>
                <Eye />
                View Details
              </button>
              <button className="btn btn-secondary" onClick={() => handleEditClass(classItem)}>
                <Edit />
              </button>
              <button className="btn btn-danger" onClick={() => handleDeleteClass(classItem._id)}>
                <Trash2 />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Class"
      >
        <form onSubmit={handleCreateClass}>
          <div className="form-group">
            <label className="form-label">Year</label>
            <select
              name="grade"
              value={formData.grade}
              onChange={handleInputChange}
              className="form-select"
              required
            >
              <option value="">Select Year</option>
              {[1, 2, 3, 4].map(grade => (
                <option key={grade} value={grade}>
                  {grade} Year
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Section</label>
            <input
              type="text"
              name="section"
              value={formData.section}
              onChange={handleInputChange}
              className="form-input"
              placeholder="e.g., A, B, C"
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
              Create Class
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Class"
      >
        <form onSubmit={handleUpdateClass}>
          <div className="form-group">
            <label className="form-label">Year</label>
            <select
              name="grade"
              value={formData.grade}
              onChange={handleInputChange}
              className="form-select"
              required
            >
              <option value="">Select Year</option>
              {[1, 2, 3, 4].map(grade => (
                <option key={grade} value={grade}>
                  {grade} Year
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Section</label>
            <input
              type="text"
              name="section"
              value={formData.section}
              onChange={handleInputChange}
              className="form-input"
              placeholder="e.g., A, B, C"
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
              Update Class
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ClassesManagement;
