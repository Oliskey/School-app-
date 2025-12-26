
import React, { useState, lazy, Suspense, useEffect } from 'react';
import { DashboardType } from './types';
import Login from './components/auth/Login';
import AIChatScreen from './components/shared/AIChatScreen';
import { requestNotificationPermission, showNotification } from './components/shared/notifications';
import { ProfileProvider } from './context/ProfileContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { realtimeService } from './services/RealtimeService';

const AdminDashboard = lazy(() => import('./components/dashboards/AdminDashboard'));
const TeacherDashboard = lazy(() => import('./components/dashboards/TeacherDashboard'));
const ParentDashboard = lazy(() => import('./components/dashboards/ParentDashboard'));
const StudentDashboard = lazy(() => import('./components/dashboards/StudentDashboard'));

// A simple checkmark icon for the success animation
const CheckCircleIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className || ''}`.trim()} viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M9 12l2 2l4 -4" /></svg>;

const SuccessScreen: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full bg-green-500 animate-fade-in">
    <div className="w-24 h-24 bg-white/30 rounded-full flex items-center justify-center">
      <CheckCircleIcon className="w-20 h-20 text-white animate-checkmark-pop" />
    </div>
    <p className="mt-4 text-2xl font-bold text-white">Login Successful!</p>
  </div>
);

const LoadingScreen: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full bg-gray-100">
    <div className="w-12 h-12 border-4 border-t-4 border-gray-200 border-t-sky-500 rounded-full animate-spin"></div>
    <p className="mt-4 text-gray-600">Loading...</p>
  </div>
);

const AuthenticatedApp: React.FC = () => {
  const { user, role, signOut, loading } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isHomePage, setIsHomePage] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  // Show success screen briefly after login if needed, 
  // but usually we just want to show the dashboard immediately 
  // unless we're tracking a "just logged in" state.
  // For simplicity, we'll skip the explicit success screen transition logic managed by App
  // and let the user land directly on dashboard, or we could check a 'justLoggedIn' flag.

  useEffect(() => {
    if (user && role) {
      requestNotificationPermission();

      // Realtime Subscriptions
      const userId = user.id; // Or a numeric ID if mapped


      const notifChannel = realtimeService.subscribeToNotifications(userId, (payload) => {
        showNotification(payload.title || 'New Notification', {
          body: payload.message || payload.content,
          icon: 'https://cdn-icons-png.flaticon.com/512/1007/1007996.png'
        });
      });

      return () => {
        realtimeService.unsubscribeAll();
      };
    }
  }, [user, role]);

  if (loading) return <LoadingScreen />;

  if (!user || !role) {
    return <Login />;
  }

  const handleLogout = async () => {
    await signOut();
    setIsHomePage(true);
    setIsChatOpen(false);
  };

  const renderDashboard = () => {
    const props = { onLogout: handleLogout, setIsHomePage, currentUser: user };

    switch (role) {
      case DashboardType.Admin: return <AdminDashboard {...props} />;
      case DashboardType.Teacher: return <TeacherDashboard {...props} />;
      case DashboardType.Parent: return <ParentDashboard {...props} />;
      case DashboardType.Student: return <StudentDashboard {...props} />;
      default: return <StudentDashboard {...props} />;
    }
  };

  if (isChatOpen) {
    return <AIChatScreen onBack={() => setIsChatOpen(false)} dashboardType={role} />;
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      {renderDashboard()}
    </Suspense>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ProfileProvider>
        <div className="font-sans w-screen h-screen bg-[#F0F2F5] flex flex-col items-center justify-center">
          <div className="relative w-full h-full flex flex-col shadow-2xl">
            <AuthenticatedApp />
          </div>
        </div>
      </ProfileProvider>
    </AuthProvider>
  );
};

export default App;
