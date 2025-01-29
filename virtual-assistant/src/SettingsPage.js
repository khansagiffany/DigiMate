import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const SettingsPage = () => {
  const { language, toggleLanguage } = useLanguage();

  const translations = {
    en: {
      title: 'Switch to Bahasa Indonesia',
    },
    id: {
      title: 'Ganti ke Bahasa Inggris',
    }
  };

  return (
    <div className="m-4 p-6 bg-white rounded-lg shadow-sm">
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <span className="text-sm">
          {translations[language].title}
        </span>
        <button
          className={`relative inline-flex h-6 w-11 items-center rounded-full ${
            language === 'id' ? 'bg-red-500' : 'bg-gray-200'
          }`}
          onClick={toggleLanguage}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
              language === 'id' ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;