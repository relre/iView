import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import App from './App';
import AdminPage from './pages/AdminPage';
import QuestionPackagePage from './pages/QuestionPackagePage';
import QuestionListPage from './pages/QuestionListPage';
import LoginPage from './pages/LoginPage';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import InterviewPage from './pages/InterviewPage';
import ApplicationForm from './pages/ApplicationForm';
import ApplicationsPage from './pages/ApplicationsPage'; // AdminApplicationsPage bileşenini içe aktarın
import ApplicationDetailPage from './pages/ApplicationDetailPage'; // ApplicationDetailPage bileşenini içe aktarın

// Router yapılandırması

import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
    <ErrorBoundary>
      <Routes>
      
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<App />} />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="admins" element={<AdminPage />} />
                  <Route path="question-packages" element={<QuestionPackagePage />} />
                  <Route path="questions-package/:id" element={<QuestionListPage />} />
                  <Route path="interviews" element={<InterviewPage />} />
                  <Route path="interview/:link/:id" element={<ApplicationsPage />} />
                  <Route path="interview/:id/applications/:applicationId" element={<ApplicationDetailPage/>} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route path="/interview/:link/:id" element={<ApplicationForm />} /> {/* Yeni rota eklendi */}
        
      </Routes>
      </ErrorBoundary>
    </Router>
  </StrictMode>,
);