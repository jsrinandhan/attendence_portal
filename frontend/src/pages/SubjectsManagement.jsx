import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Search, Edit, Trash2 } from 'lucide-react';
import { adminAPI } from '../services/api';
import Modal from '../components/Modal';

const SubjectsManagement = () => {
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: ''
  });

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const data = await adminAPI.getSubjects();
      setSubjects(data.subjects || []);
    } catch (error) {
      setError('Failed to load subjects');
      console.error('Subjects error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.createSubject(formData);
      setIsCreateModalOpen(false);
      setFormData({
        name: '',
        code: ''
      });
      fetchSubjects();
    } catch (error) {
      setError('Failed to create subject');
      console.error('Create subject error:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDeleteSubject = async (subjectId) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      try {
        await adminAPI.deleteSubject(subjectId);
        fetchSubjects();
      } catch (error) {
        setError('Failed to delete subject');
        console.error('Delete subject error:', error);
      }
    }
  };

  const handleEditSubject = (subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      code: subject.code
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateSubject = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.updateSubject(editingSubject._id, formData);
      setIsEditModalOpen(false);
      setEditingSubject(null);
      setFormData({
        name: '',
        code: ''
      });
      fetchSubjects();
    } catch (error) {
      setError('Failed to update subject');
      console.error('Update subject error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="spinner" />
          <p>Loading subjects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Subjects Management</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus />
          Add New Subject
        </button>
      </div>

      <div className="search-bar">
        <Search />
        <input
          type="text"
          placeholder="Search subjects..."
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
        {subjects
          .filter(subject => 
            subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            subject.code.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((subject) => (
            <div key={subject._id} className="card">
              <div className="card-content">
                <h3>{subject.name}</h3>
                <p>Code: {subject.code}</p>
              </div>
              <div className="card-actions">
                <button className="btn btn-secondary" onClick={() => handleEditSubject(subject)}>
                  <Edit />
                </button>
                <button className="btn btn-danger" onClick={() => handleDeleteSubject(subject._id)}>
                  <Trash2 />
                </button>
              </div>
            </div>
          ))}
      </div>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Subject"
      >
        <form onSubmit={handleCreateSubject}>
          <div className="form-group">
            <label className="form-label">Subject Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="form-input"
              placeholder="e.g., Mathematics, Physics, Computer Science"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Subject Code</label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleInputChange}
              className="form-input"
              placeholder="e.g., MATH101, PHY201, CS301"
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
              Create Subject
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Subject"
      >
        <form onSubmit={handleUpdateSubject}>
          <div className="form-group">
            <label className="form-label">Subject Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="form-input"
              placeholder="e.g., Mathematics, Physics, Computer Science"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Subject Code</label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleInputChange}
              className="form-input"
              placeholder="e.g., MATH101, PHY201, CS301"
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
              Update Subject
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SubjectsManagement;
