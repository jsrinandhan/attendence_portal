# School Attendance Management System

A comprehensive web-based attendance management system built with Node.js, Express, React, and MongoDB. This system provides role-based access for administrators, teachers, and students to manage and track attendance efficiently.

## 🚀 Features

### Admin Features
- **Dashboard**: Overview of system statistics and health
- **Class Management**: Create, read, update, and delete classes
- **Subject Management**: Manage subjects and curriculum
- **Teacher Management**: Add and manage teacher accounts
- **Student Management**: Enroll and manage student records
- **Assignment Management**: Assign subjects to teachers and teachers to classes
- **Auto-generation**: Generate unique teacher IDs and student roll numbers
- **Reports**: View class-wise and subject-wise attendance reports

### Teacher Features
- **Dashboard**: View assigned classes and subjects
- **Attendance Marking**: Mark attendance for students in assigned classes
- **Class Selection**: Select class, subject, period, and date
- **Quick Actions**: Mark all present/absent with one click
- **Attendance History**: View previous attendance records
- **Statistics**: Track attendance rates and patterns

### Student Features
- **Dashboard**: Personal attendance overview
- **Attendance Views**: 
  - Overall attendance percentage
  - Subject-wise attendance
  - Period-wise attendance
  - Date-range reports
- **Analytics**: Visual attendance trends and monthly statistics
- **Low Attendance Warnings**: Automatic alerts for poor attendance

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

### Frontend
- **React.js** - UI framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Lucide React** - Icon library
- **Recharts** - Chart library
- **Vite** - Build tool

### Styling
- **CSS3** - Modern CSS with variables
- **Flexbox & Grid** - Layout systems
- **CSS Animations** - Smooth transitions
- **Responsive Design** - Mobile-first approach

## 📁 Project Structure

```
attendance-portal/
│
├── backend/
│   ├── server.js                 # Main server file
│   ├── package.json              # Backend dependencies
│   ├── .env                      # Environment variables
│   ├── config/
│   │   ├── db.js                 # Database configuration
│   │   └── auth.js               # Authentication configuration
│   ├── models/
│   │   ├── Admin.js              # Admin model
│   │   ├── Teacher.js            # Teacher model
│   │   ├── Student.js            # Student model
│   │   ├── Class.js              # Class model
│   │   ├── Subject.js            # Subject model
│   │   └── Attendance.js         # Attendance model
│   ├── controllers/
│   │   ├── adminController.js    # Admin logic
│   │   ├── teacherController.js  # Teacher logic
│   │   ├── studentController.js  # Student logic
│   │   └── attendanceController.js # Attendance logic
│   ├── routes/
│   │   ├── adminRoutes.js        # Admin routes
│   │   ├── teacherRoutes.js      # Teacher routes
│   │   ├── studentRoutes.js      # Student routes
│   │   └── attendanceRoutes.js   # Attendance routes
│   ├── middleware/
│   │   ├── authMiddleware.js     # Authentication middleware
│   │   └── roleMiddleware.js     # Role-based access control
│   └── utils/
│       └── generateId.js         # ID generation utilities
│
├── frontend/
│   ├── package.json              # Frontend dependencies
│   ├── vite.config.js            # Vite configuration
│   ├── index.html                # HTML template
│   ├── src/
│   │   ├── main.jsx              # Application entry point
│   │   ├── App.jsx               # Main app component
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Navigation bar
│   │   │   ├── Sidebar.jsx       # Sidebar navigation
│   │   │   └── ProtectedRoute.jsx # Route protection
│   │   ├── pages/
│   │   │   ├── Login.jsx         # Login page
│   │   │   ├── AdminDashboard.jsx # Admin dashboard
│   │   │   ├── TeacherDashboard.jsx # Teacher dashboard
│   │   │   ├── StudentDashboard.jsx # Student dashboard
│   │   │   └── AttendanceMark.jsx # Attendance marking
│   │   ├── services/
│   │   │   └── api.js            # API service
│   │   └── styles/
│   │       ├── main.css          # Main styles
│   │       ├── dashboard.css     # Dashboard styles
│   │       └── attendance.css   # Attendance styles
│
└── README.md                     # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd attendance-portal
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Setup**
   
   Create a `.env` file in the `backend` directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/attendance-portal
   JWT_SECRET=your_jwt_secret_key_here_change_in_production
   NODE_ENV=development
   ```

5. **Start MongoDB**
   ```bash
   # Make sure MongoDB is running on your system
   mongod
   ```

6. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```

7. **Start the frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```

8. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 🔐 Default Credentials

### Admin
- **Username**: admin
- **Password**: admin123

### Teacher & Student
- Teachers and students need to be created by the admin
- Use the generated Teacher ID / Roll Number to login
- Default password can be set during creation

## 📊 API Endpoints

### Authentication
- `POST /api/admin/login` - Admin login
- `POST /api/teacher/login` - Teacher login
- `POST /api/student/login` - Student login

### Admin Routes
- `GET /api/admin/dashboard/stats` - Dashboard statistics
- `POST /api/admin/classes` - Create class
- `GET /api/admin/classes` - Get all classes
- `PUT /api/admin/classes/:id` - Update class
- `DELETE /api/admin/classes/:id` - Delete class
- `POST /api/admin/subjects` - Create subject
- `GET /api/admin/subjects` - Get all subjects
- `POST /api/admin/teachers` - Create teacher
- `GET /api/admin/teachers` - Get all teachers
- `POST /api/admin/students` - Create student
- `GET /api/admin/students` - Get all students

### Teacher Routes
- `GET /api/teacher/profile` - Get teacher profile
- `GET /api/teacher/assigned` - Get assigned classes and subjects
- `GET /api/teacher/students` - Get students for attendance
- `POST /api/teacher/attendance/mark` - Mark attendance
- `GET /api/teacher/attendance` - Get attendance records

### Student Routes
- `GET /api/student/profile` - Get student profile
- `GET /api/student/attendance/overall` - Get overall attendance
- `GET /api/student/attendance/subject-wise` - Get subject-wise attendance
- `GET /api/student/attendance/summary` - Get attendance summary

## 🎨 UI/UX Features

- **Modern Design**: Clean, professional interface with smooth animations
- **Responsive Layout**: Works seamlessly on desktop, tablet, and mobile
- **Dark Mode Ready**: CSS variables support for theming
- **Accessibility**: Semantic HTML and ARIA labels
- **Loading States**: Proper loading indicators and skeleton screens
- **Error Handling**: User-friendly error messages and validation
- **Micro-interactions**: Hover effects, transitions, and animations

## 🔧 Development

### Scripts

**Backend:**
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
```

**Frontend:**
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
```

### Code Quality

- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **Git Hooks**: Pre-commit hooks for code quality

## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Build the application
3. Deploy to your preferred hosting platform (Heroku, AWS, etc.)

### Frontend Deployment
1. Build the React application
2. Deploy static files to hosting service (Netlify, Vercel, etc.)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions, please:
1. Check the existing issues
2. Create a new issue with detailed information
3. Include screenshots if applicable

## 🔄 Updates

- **v1.0.0** - Initial release with core functionality
- **v1.1.0** - Added export functionality (PDF/CSV)
- **v1.2.0** - Enhanced analytics and reporting
- **v1.3.0** - Mobile app compatibility

## 📈 Future Enhancements

- [ ] Mobile application (React Native)
- [ ] Email notifications for low attendance
- [ ] Advanced analytics dashboard
- [ ] Biometric attendance integration
- [ ] Parent portal for attendance monitoring
- [ ] SMS notifications
- [ ] Multi-language support
- [ ] Advanced reporting with charts
- [ ] Bulk data import/export
- [ ] Integration with school management systems

---

**Built with ❤️ for educational institutions**
