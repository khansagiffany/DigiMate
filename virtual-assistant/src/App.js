import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { LanguageProvider } from './Contexts/LanguageContext';
import './App.css';

import SplashScreen from './SplashScreen/SplashScreen';
import HomeScreen from './Home/HomeScreen';
import ProfilePage from './Profile/ProfilePage';
import ChatPage from './Chat/ChatPage';
import TaskPage from './Task/TaskPage';
import SchedulePage from './Schedule/SchedulePage';
import SettingsPage from './Settings/SettingsPage';

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPage = location.pathname.substring(1) || 'home';

  const menuItems = [
    { icon: '🏠', label: 'Home', path: 'home' },
    { icon: '👤', label: 'Profile', path: 'profile' },
    { icon: '💬', label: 'Chat', path: 'chat' },
    { icon: '📝', label: 'Task', path: 'tasks' },
    { icon: '📅', label: 'Schedule', path: 'schedule' },
    { icon: '⚙️', label: 'Settings', path: 'settings' },
  ];

  const setCurrentPage = (page) => {
    navigate(`/${page === 'home' ? '' : page}`);
  };

  const renderPage = () => {
    switch(currentPage) {
      case 'tasks':
        return <TaskPage />;
      case 'profile':
        return <ProfilePage />;
      case 'schedule':
        return <SchedulePage />;
      case 'settings':
        return <SettingsPage />;
      case 'chat':
        return <ChatPage />;
      default:
        return <HomeScreen setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div className="app-container">
      <nav className="sidebar">
        <div className="logo-small"></div>
        <div className="nav-items">
          {menuItems.map((item) => (
            <div
              key={item.path}
              className={`nav-item ${currentPage === item.path ? 'active' : ''}`}
              onClick={() => setCurrentPage(item.path)}
            >
              <div className="nav-item-content">
                <span className="icon">{item.icon}</span>
                <span className="label">{item.label}</span>
              </div>
            </div>
          ))}
        </div>
      </nav>
      {renderPage()}
    </div>
  );
};

const AppContent = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <Routes>
      <Route path="/*" element={<MainLayout />} />
    </Routes>
  );
};

const App = () => {
  return (
    <LanguageProvider>
      <Router>
        <AppContent />
      </Router>
    </LanguageProvider>
  );
};

export default App;