import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import App from './App';
import AdminPage from './pages/AdminPage';
import QuestionPackagePage from './pages/QuestionPackagePage';
import QuestionListPage from './pages/QuestionListPage'; // Bu sayfanın var olduğundan emin olun
import LoginPage from './pages/LoginPage';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
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
                  <Route path="questions-package/:id" element={<QuestionListPage />} /> {/* Yeni rota eklendi */}
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  </StrictMode>,
);