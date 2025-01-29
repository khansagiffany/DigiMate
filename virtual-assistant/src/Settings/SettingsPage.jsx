import React, { useState, useEffect } from 'react';
import { useLanguage } from '../Contexts/LanguageContext';
import './SettingsPage.css';

const SettingsPage = () => {
  const { language, toggleLanguage } = useLanguage();
  const [showTranslatePrompt, setShowTranslatePrompt] = useState(false);
  const [isGoogleApiLoaded, setIsGoogleApiLoaded] = useState(false);
  const [error, setError] = useState(null);

  const translations = {
    en: {
      title: 'Switch to Bahasa Indonesia',
      translatePrompt: 'Would you like to translate this page to Bahasa Indonesia?',
      translate: 'Translate',
      cancel: 'Cancel',
      error: 'Translation service is not available at the moment'
    },
    id: {
      title: 'Ganti ke Bahasa Inggris',
      translatePrompt: 'Apakah Anda ingin menerjemahkan halaman ini ke Bahasa Inggris?',
      translate: 'Terjemahkan',
      cancel: 'Batal',
      error: 'Layanan terjemahan tidak tersedia saat ini'
    }
  };

  const handleLanguageToggle = () => {
    if (!isGoogleApiLoaded) {
      setError(translations[language].error);
      setTimeout(() => setError(null), 3000);
      return;
    }
    setShowTranslatePrompt(true);
  };

  const handleTranslateConfirm = () => {
    try {
      const newLang = language === 'en' ? 'id' : 'en';
      
      let translateElement = document.getElementById('google_translate_element');
      if (!translateElement) {
        translateElement = document.createElement('div');
        translateElement.id = 'google_translate_element';
        document.body.appendChild(translateElement);
      }

      if (window.google && window.google.translate) {
        window.google.translate.TranslateElement(
          {
            pageLanguage: language,
            includedLanguages: 'en,id',
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false
          },
          'google_translate_element'
        );
      }

      toggleLanguage();
      setShowTranslatePrompt(false);
    } catch (err) {
      console.error('Translation error:', err);
      setError(translations[language].error);
      setTimeout(() => setError(null), 3000);
    }
  };

  useEffect(() => {
    let script = null;
    try {
      const existingScript = document.querySelector('script[src*="translate.google.com"]');
      if (existingScript) {
        existingScript.remove();
      }

      script = document.createElement('script');
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      script.defer = true;

      script.onload = () => {
        window.googleTranslateElementInit = () => {
          setIsGoogleApiLoaded(true);
        };
      };

      script.onerror = () => {
        setError(translations[language].error);
        setIsGoogleApiLoaded(false);
      };

      document.body.appendChild(script);

    } catch (err) {
      console.error('Error loading Google Translate:', err);
      setError(translations[language].error);
    }

    return () => {
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }
      setIsGoogleApiLoaded(false);
      setError(null);
    };
  }, [language]);

  return (
    <div className="settings-container">
      <div className="settings-item">
        <span className="settings-title">
          {translations[language].title}
        </span>
        <button
          className={`switch-button ${language === 'id' ? 'active' : 'inactive'}`}
          onClick={handleLanguageToggle}
        >
          <span
            className={`switch-handle ${language === 'id' ? 'active' : 'inactive'}`}
          />
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {showTranslatePrompt && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p className="modal-text">
              {translations[language].translatePrompt}
            </p>
            <div className="modal-buttons">
              <button
                className="button button-cancel"
                onClick={() => setShowTranslatePrompt(false)}
              >
                {translations[language].cancel}
              </button>
              <button
                className="button button-confirm"
                onClick={handleTranslateConfirm}
              >
                {translations[language].translate}
              </button>
            </div>
          </div>
        </div>
      )}

      <div id="google_translate_element" className="hidden" />
    </div>
  );
};

export default SettingsPage;