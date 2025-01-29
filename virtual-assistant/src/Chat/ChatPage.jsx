import React, { useState, useRef, useEffect, useCallback } from 'react';
import debounce from 'lodash/debounce';
import ReactMarkdown from 'react-markdown';
import './ChatPage.css';

const GEMINI_API_KEY = 'AIzaSyBh-__Kzw-cvPn3ccyb9zKPLvWA1brRSzE';

const RECOMMENDED_QUESTIONS = [
  "Apa saja yang perlu dipersiapkan untuk magang?",
  "Bagaimana tips menghadapi wawancara magang?",
  "Apa yang harus dilakukan di hari pertama magang?",
  "Bagaimana cara adaptasi dengan tim baru?",
  "Tips berkomunikasi dengan mentor?",
  "Cara membuat laporan magang yang baik?"
];

const createNewSession = () => {
  const newSessionId = crypto.randomUUID();
  localStorage.setItem('chatSessionId', newSessionId);
  return newSessionId;
};

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(() => {
    const saved = localStorage.getItem('chatSessionId');
    if (saved) return saved;
    return createNewSession();
  });
  const messagesEndRef = useRef(null);

  const handleNewConversation = async () => {
    const newSessionId = createNewSession();
    setSessionId(newSessionId);
    
    // Set pesan awal untuk sesi baru
    const initialMessages = [
      {
        type: 'assistant',
        content: 'Saya DigiHelp, virtual assistant DigiMate. Ada yang bisa dibantu?',
        created_at: new Date().toISOString()
      }
    ];
    
    try {
      // Simpan pesan awal dengan session ID baru
      const response = await fetch(`http://localhost:5000/api/chat-history?session_id=${newSessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(initialMessages)
      });
  
      if (response.ok) {
        setMessages(initialMessages);
      } else {
        console.error('Failed to save initial messages');
      }
    } catch (error) {
      console.error('Error creating new conversation:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/chat-history?session_id=${sessionId}`);
        if (response.ok) {
          const history = await response.json();
          if (history.length === 0) {
            // If no history, set initial messages
            const initialMessages = [
              {
                type: 'assistant',
                content: 'Saya DigiHelp, virtual assistant DigiMate.',
                created_at: new Date().toISOString()
              },
              {
                type: 'assistant',
                content: 'Ada yang bisa DigiHelp bantu?',
                created_at: new Date().toISOString()
              }
            ];
            await saveMessages(initialMessages);
          } else {
            setMessages(history);
          }
        }
      } catch (error) {
        console.error('Error fetching chat history:', error);
      }
    };

    fetchChatHistory();
  }, [sessionId]);

  const saveMessages = async (newMessages) => {
    try {
      const response = await fetch(`http://localhost:5000/api/chat-history?session_id=${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newMessages)
      });

      if (response.ok) {
        const updatedHistory = await response.json();
        setMessages(updatedHistory);
      }
    } catch (error) {
      console.error('Error saving messages:', error);
    }
  };

  const debouncedSendMessage = useCallback(
    debounce(async (text) => {
      if (!text.trim()) return;

      setIsLoading(true);
      
      try {
        // Create new user message
        const userMessage = {
          type: 'user',
          content: text,
          created_at: new Date().toISOString()
        };

        // Update messages state with user message
        const updatedMessages = [...messages, userMessage];
        await saveMessages(updatedMessages);
        
        // Send to Gemini API
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: text
                }]
              }],
              generationConfig: {
                temperature: 0.9,
                topK: 1,
                topP: 1,
                maxOutputTokens: 2048,
              },
              safetySettings: [
                {
                  category: "HARM_CATEGORY_HARASSMENT",
                  threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                  category: "HARM_CATEGORY_HATE_SPEECH",
                  threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                  category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                  threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                  category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                  threshold: "BLOCK_MEDIUM_AND_ABOVE"
                }
              ]
            })
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const assistantMessage = {
          type: 'assistant',
          content: data.candidates[0].content.parts[0].text,
          created_at: new Date().toISOString()
        };

        // Save final messages including assistant response
        await saveMessages([...updatedMessages, assistantMessage]);

      } catch (error) {
        console.error('Error:', error);
        const errorMessage = {
          type: 'assistant',
          content: 'Maaf, terjadi kesalahan. Silakan coba lagi nanti.',
          created_at: new Date().toISOString()
        };
        
        await saveMessages([...messages, errorMessage]);
      } finally {
        setIsLoading(false);
        setInputMessage('');
        scrollToBottom();
      }
    }, 1000, { leading: true, trailing: false }),
    [messages, sessionId]
  );

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && inputMessage.trim()) {
        debouncedSendMessage(inputMessage);
      }
    }
  }, [debouncedSendMessage, inputMessage, isLoading]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (!isLoading && inputMessage.trim()) {
      debouncedSendMessage(inputMessage);
    }
  }, [debouncedSendMessage, inputMessage, isLoading]);

  return (
    <div className="chat-page">
      <header className="chat-header">
        <div className="title">DigiMate: Your Internship Companion</div>
        <button 
          className="new-conversation-btn"
          onClick={handleNewConversation}
        >
          New
        </button>
      </header>

      <div className="chat-container">
        <div className="recommended-questions">
          <h3>Pertanyaan yang Direkomendasikan:</h3>
          {RECOMMENDED_QUESTIONS.map((question, index) => (
            <button
              key={index}
              className="question-item"
              onClick={() => debouncedSendMessage(question)}
              disabled={isLoading}
            >
              {question}
            </button>
          ))}
        </div>

        <div className="chat-messages">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`message-wrapper ${message.type}`}
            >
              {message.type === 'assistant' && (
                <div className="message-avatar">
                  DM
                </div>
              )}
              <div className="message-bubble">
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message-wrapper assistant">
              <div className="message-avatar">
                DM
              </div>
              <div className="typing-indicator">
                <span>Mengetik</span>
                <span className="dots">...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="chat-input-container">
        <form onSubmit={handleSubmit} className="chat-input-form">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ketik pesan..."
            className="chat-input"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="send-button"
            disabled={isLoading || !inputMessage.trim()}
          >
            Kirim
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;