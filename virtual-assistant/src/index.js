import React from 'react';
import { createRoot } from 'react-dom/client';
import { LanguageProvider } from './Contexts/LanguageContext';
import './index.css';
import App from './App';

if (process.env.NODE_ENV === 'development') {
  console.warn = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('React does not recognize the')) {
      return;
    }
    console.warn(...args);
  };
}

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);