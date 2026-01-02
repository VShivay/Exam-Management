import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';

// Component Imports
import Login from './files/login';
import Dashboard from './files/dashboard'; // Layout Component containing Sidebar/Navbar + <Outlet />
import DashboardHome from './files/main/dashboard_home';

// Candidate Management
import ManageCandidates from './files/main/manage_candidate';
import CandidateDetail from './files/main/detail_info_candidate';

// Question Management
import ManageQuestions from './files/main/manage_questions';
import AddQuestions from './files/main/add_questions';

// Exam Results Management (New Imports)
import ManageExam from './files/main/manage_exam';
import ExamDetail from './files/main/exam_detail';


// 1. Create a Protected Route Wrapper
const ProtectedRoute = () => {
  const isAuthenticated = !!localStorage.getItem('token');
  // If authenticated, render the child routes (Outlet), otherwise send to login
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* --- Public Route --- */}
        <Route path="/login" element={<Login />} />

        {/* --- Protected Routes --- */}
        <Route element={<ProtectedRoute />}>
          
          {/* Dashboard Layout Wrapper */}
          <Route path="/" element={<Dashboard />}>
            
            {/* Default Redirect: / goes to /dashboard-home */}
            <Route index element={<Navigate to="dashboard-home" replace />} />
            
            {/* Dashboard Home */}
            <Route path="dashboard-home" element={<DashboardHome />} />
            
            {/* Candidate Routes */}
            <Route path="manage-candidates" element={<ManageCandidates />} />
            <Route path="candidate/:id" element={<CandidateDetail />} />
            
            {/* Question Routes */}
            <Route path="manage-questions" element={<ManageQuestions />} />
            <Route path="add-question" element={<AddQuestions />} />

            {/* Exam Result Routes (Added) */}
            <Route path="manage-exam-results" element={<ManageExam />} />
            <Route path="admin/exam/:id" element={<ExamDetail />} />
            
          </Route>
          
        </Route>

        {/* --- Catch-all (404) --- */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;