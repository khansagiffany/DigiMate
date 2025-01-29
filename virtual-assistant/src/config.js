// src/config.js
const REACT_APP_GEMINI_API_KEY='AIzaSyA9tid1hNRCSC3qBwx3foC_m9oS9y4hDpo';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';

// Debug logging
console.log('Checking API key configuration...');
console.log('API Key status:', REACT_APP_GEMINI_API_KEY ? 'Available' : 'Not found');

if (!REACT_APP_GEMINI_API_KEY) {
    console.error('Gemini API Key tidak ditemukan');
} else {
    console.log('Gemini API Key tersedia dan memiliki panjang:', REACT_APP_GEMINI_API_KEY.length);
}

const GEMINI_CONFIG = {
    temperature: 0.7,
    maxOutputTokens: 800,
    safetySettings: [
        {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
    ]
};

export { 
    REACT_APP_GEMINI_API_KEY as GEMINI_API_KEY,
    GEMINI_API_URL,
    GEMINI_CONFIG
};