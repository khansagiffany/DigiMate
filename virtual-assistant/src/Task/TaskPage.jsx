import React, { useState, useEffect } from 'react';
import './TaskPage.css';

const API_URL = 'http://localhost:5000';

const TaskPage = () => {
  const [tasks, setTasks] = useState([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${API_URL}/api/tasks`);  // Updated URL
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const data = await response.json();
      setTasks(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Failed to load tasks. Please try again.');
    }
  };

  const addTask = async () => {
    if (!newTaskText.trim()) return;
    try {
      const response = await fetch(`${API_URL}/api/tasks`, {  // Updated URL
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: newTaskText,
          completed: false,
        }),
      });
      if (!response.ok) throw new Error('Failed to add task');
      const newTask = await response.json();
      setTasks([newTask, ...tasks]);
      setNewTaskText('');
      setError(null);
    } catch (error) {
      console.error('Error adding task:', error);
      setError('Failed to add task. Please try again.');
    }
  };

  const toggleTask = async (taskId) => {
    try {
      const task = tasks.find((t) => t.id === taskId);
      const response = await fetch(`${API_URL}/api/tasks/${taskId}`, {  // Updated URL
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completed: !task.completed,
        }),
      });
      if (!response.ok) throw new Error('Failed to update task');
      const updatedTask = await response.json();
      setTasks(tasks.map((t) => (t.id === taskId ? updatedTask : t)));
      setError(null);
    } catch (error) {
      console.error('Error updating task:', error);
      setError('Failed to update task. Please try again.');
    }
  };

  const deleteTask = async (taskId) => {
    try {
      const response = await fetch(`${API_URL}/api/tasks/${taskId}`, {  // Updated URL
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete task');
      setTasks(tasks.filter(task => task.id !== taskId));
      setError(null);
    } catch (error) {
      console.error('Error deleting task:', error);
      setError('Failed to delete task. Please try again.');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addTask();
    }
  };

  return (
    <div className="task-page">
      <header>
        <div className="title">DigiMate: Your Internship Companion</div>
      </header>

      <div className="task-content">
        <h1>Your Tasks</h1>
        <p>Keep it going.</p>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="task-input-container">
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter new task..."
            className="task-input"
          />
          <button className="add-task-btn" onClick={addTask}>
            Add Task
          </button>
        </div>

        <div className="task-list">
          {tasks.map((task) => (
            <div key={task.id} className="task-item-row">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTask(task.id)}
              />
              <span className={task.completed ? 'completed' : ''}>
                {task.text}
              </span>
              <button
                className="delete-task-btn"
                onClick={() => deleteTask(task.id)}
              >
                ✖
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaskPage;