import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

// Auth services
export const authAPI = {
  // Admin login
  login: (credentials) => api.post('/admin/login', credentials),
  changePassword: (passwordData) => api.post('/admin/change-password', passwordData),
  
  // Teacher login
  teacherLogin: (credentials) => api.post('/teacher/login', credentials),
  
  // Student login
  studentLogin: (credentials) => api.post('/student/login', credentials),
};

// Admin services
export const adminAPI = {
  // Dashboard
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  
  // Classes
  createClass: (classData) => api.post('/admin/classes', classData),
  getClasses: () => api.get('/admin/classes'),
  updateClass: (id, classData) => api.put(`/admin/classes/${id}`, classData),
  deleteClass: (id) => api.delete(`/admin/classes/${id}`),
  
  // Subjects
  createSubject: (subjectData) => api.post('/admin/subjects', subjectData),
  getSubjects: () => api.get('/admin/subjects'),
  updateSubject: (id, subjectData) => api.put(`/admin/subjects/${id}`, subjectData),
  deleteSubject: (id) => api.delete(`/admin/subjects/${id}`),
  
  // Teachers
  createTeacher: (teacherData) => api.post('/admin/teachers', teacherData),
  getTeachers: () => api.get('/admin/teachers'),
  updateTeacher: (id, teacherData) => api.put(`/admin/teachers/${id}`, teacherData),
  deleteTeacher: (id) => api.delete(`/admin/teachers/${id}`),
  
  // Students
  createStudent: (studentData) => api.post('/admin/students', studentData),
  getStudents: () => api.get('/admin/students'),
  
  // Assignments
  assignSubjectToTeacher: (data) => api.post('/admin/assign-subject', data),
  assignTeacherToClass: (data) => api.post('/admin/assign-teacher', data),
};

// Teacher services
export const teacherAPI = {
  // Profile
  getProfile: () => api.get('/teacher/profile'),
  getAssignedClassesAndSubjects: () => api.get('/teacher/assigned'),
  
  // Attendance
  getStudentsForAttendance: (params) => api.get('/teacher/students', { params }),
  markAttendance: (attendanceData) => api.post('/teacher/attendance/mark', attendanceData),
  getAttendanceRecords: (params) => api.get('/teacher/attendance', { params }),
  getTodayAttendance: (params) => api.get('/teacher/attendance/today', { params }),
  getAttendanceStatistics: (params) => api.get('/teacher/attendance/statistics', { params }),
};

// Student services
export const studentAPI = {
  // Profile
  getProfile: () => api.get('/student/profile'),
  
  // Attendance
  getOverallAttendance: (params) => api.get('/student/attendance/overall', { params }),
  getSubjectWiseAttendance: (params) => api.get('/student/attendance/subject-wise', { params }),
  getPeriodWiseAttendance: (params) => api.get('/student/attendance/period-wise', { params }),
  getDateRangeAttendance: (params) => api.get('/student/attendance/date-range', { params }),
  getAttendanceSummary: () => api.get('/student/attendance/summary'),
};

// Attendance services
export const attendanceAPI = {
  getReport: (params) => api.get('/attendance/report', { params }),
  getLowAttendanceStudents: (params) => api.get('/attendance/low-attendance', { params }),
  getAnalytics: (params) => api.get('/attendance/analytics', { params }),
  exportData: (params) => api.get('/attendance/export', { params }),
};

export default api;
