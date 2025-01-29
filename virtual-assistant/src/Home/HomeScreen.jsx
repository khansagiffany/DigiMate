import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomeScreen.css';

const API_URL = 'http://localhost:5000';

const HomeScreen = () => {
  const [internTasks, setInternTasks] = useState([]);
  const [profile, setProfile] = useState({
    name: '',
    role: '',
    age: '',
    photo: ''
  });
  const [chatHistory, setChatHistory] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const upcomingEvents = [
    { id: 1, event: 'Interview', date: '30 Jan' },
    { id: 2, event: 'Pengumuman akhir', date: '03 Feb' },
    { id: 3, event: 'Onboarding', date: '10 Feb' },
  ];

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${API_URL}/api/tasks`);
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const data = await response.json();
      setInternTasks(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Failed to load tasks. Please try again.');
    }
  };

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const response = await fetch(`${API_URL}/api/chat/recent`);
        if (!response.ok) throw new Error('Failed to fetch chat history');
        const data = await response.json();
        console.log("Fetched chat history:", data); 
        setChatHistory(data);
      } catch (error) {
        console.error('Error fetching chat history:', error);
      }
    };

    fetchChatHistory();
    const interval = setInterval(fetchChatHistory, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${API_URL}/api/profile`);
        if (!response.ok) throw new Error('Failed to fetch profile');
        const data = await response.json();
        setProfile(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to load profile. Please try again.');
      }
    };

    fetchProfile();
  }, []);

  const toggleTaskCompletion = async (taskId, currentStatus) => {
    try {
      const response = await fetch(`${API_URL}/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: !currentStatus }),
      });

      if (!response.ok) throw new Error('Failed to update task');
      const updatedTask = await response.json();
      setInternTasks(prevTasks =>
        prevTasks.map(task => (task.id === taskId ? updatedTask : task))
      );
      setError(null);
    } catch (error) {
      console.error('Error updating task:', error);
      setError('Failed to update task. Please try again.');
    }
  };

  const navigateToChat = (sessionId) => {
    navigate('/chat', { state: { sessionId } });
  };

  const truncateText = (text, maxLength = 50) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const formatDate = (dateString) => {
    try {
      const options = { 
        day: 'numeric', 
        month: 'short',
        hour: '2-digit', 
        minute: '2-digit'
      };
      return new Date(dateString).toLocaleDateString('id-ID', options);
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  return (
    <main className="main-content">
      <header className="header">
        <div className="app-title">
          <div>
            <div className="title">DigiMate: Your Internship Companion</div>
          </div>
        </div>
      </header>

      <div className="content">
        <div className="profile-section">
          {profile.photo && (
            <div className="profile-photo">
              <img
                src={`${API_URL}${profile.photo}`}
                alt="Profile"
                className="profile-img"
              />
            </div>
          )}
          <div className="profile-info">
            <h1>Hello, {profile.name || 'User'}</h1>
            <p>Here's Your Summary as a {profile.role || 'Intern'}</p>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="grid-container">
          {/* Tasks*/}
          <div className="card tasks-card">
            <h2>Intern Tasks</h2>
            <div className="tasks">
              {internTasks.map(task => (
                <div key={task.id} className="task-item">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTaskCompletion(task.id, task.completed)}
                  />
                  <span style={{
                    textDecoration: task.completed ? 'line-through' : 'none',
                    color: task.completed ? '#666' : 'inherit'
                  }}>
                    {task.text}
                  </span>
                </div>
              ))}
              {internTasks.length === 0 && (
                <div className="no-tasks">No tasks available</div>
              )}
            </div>
          </div>

          {/* Events*/}
          <div className="card events-card">
            <h2>Upcoming Event</h2>
            <div className="events">
              {upcomingEvents.map(event => (
                <div key={event.id} className="event-item">
                  <span>{event.event}</span>
                  <span className="date">{event.date}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Chats*/}
          <div className="card chats-card">
            <h2>Recent Chats</h2>
            <div className="chat-list">
              {chatHistory && chatHistory.map((chat) => {
                const lastUserMessage = chat.messages
                  .filter(msg => msg.type === 'user')
                  .pop();

                if (!lastUserMessage) return null;

                return (
                  <div 
                    key={chat.session_id} 
                    className="chat-preview"
                    onClick={() => navigateToChat(chat.session_id)}
                  >
                    <div className="chat-content">
                      <div className="chat-message">
                        {truncateText(lastUserMessage.content)}
                      </div>
                      <div className="chat-date">
                        {formatDate(lastUserMessage.created_at)}
                      </div>
                    </div>
                    <div className="chat-arrow">→</div>
                  </div>
                );
              })}
              {(!chatHistory || chatHistory.length === 0) && (
                <div className="no-chats">No chat history available</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default HomeScreen;