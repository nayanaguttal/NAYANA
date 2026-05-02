import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './pages/Auth';
import OnboardingPage from './pages/Onboarding';
import PatientDashboard from './pages/Patient/Dashboard';
import PatientUpload from './pages/Patient/Upload';
import PatientTimeline from './pages/Patient/Timeline';
import DoctorDashboard from './pages/Doctor/Dashboard';
import DoctorPatientView from './pages/Doctor/PatientView';
import Navbar from './components/Layout/Navbar';
import HealthuChat from './components/AI/HealthuChat';

const ProtectedRoute = ({ children, allowedRole }: { children: React.ReactNode, allowedRole?: 'patient' | 'doctor' }) => {
  const { user, profile, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/auth" />;
  
  if (profile && !profile.onboardingComplete && window.location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" />;
  }

  if (allowedRole && profile && profile.role !== allowedRole) {
    return <Navigate to={profile.role === 'patient' ? '/patient' : '/doctor'} />;
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans selection:bg-blue-100">
          <Navbar />
          <main className="container mx-auto px-4 py-6 max-w-lg">
            <Routes>
              <Route path="/auth" element={<AuthPage />} />
              
              <Route path="/onboarding" element={
                <ProtectedRoute>
                  <OnboardingPage />
                </ProtectedRoute>
              } />

              <Route path="/patient" element={
                <ProtectedRoute allowedRole="patient">
                  <PatientDashboard />
                </ProtectedRoute>
              } />
              <Route path="/patient/upload" element={
                <ProtectedRoute allowedRole="patient">
                  <PatientUpload />
                </ProtectedRoute>
              } />
              <Route path="/patient/timeline" element={
                <ProtectedRoute allowedRole="patient">
                  <PatientTimeline />
                </ProtectedRoute>
               } />

              <Route path="/doctor" element={
                <ProtectedRoute allowedRole="doctor">
                  <DoctorDashboard />
                </ProtectedRoute>
              } />
              <Route path="/doctor/patient/:id" element={
                <ProtectedRoute allowedRole="doctor">
                  <DoctorPatientView />
                </ProtectedRoute>
              } />

              <Route path="/" element={<Navigate to="/auth" />} />
            </Routes>
          </main>
          <HealthuChat />
        </div>
      </AuthProvider>
    </Router>
  );
}
