import React, { useState } from 'react';

const ChatBot = () => {
  const [chatMessages, setChatMessages] = useState([
    { text: 'Hi! How can I help you today?', sender: 'bot' },
  ]);
  const [userInput, setUserInput] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);

  const handleSend = async () => {
    if (userInput.trim() === '') return;

    const userMessage = { text: userInput, sender: 'user' };
    setChatMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsBotTyping(true);

    try {
      const res = await fetch('http://localhost:5001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userInput }),
      });

      const data = await res.json();

      const botMessage = {
        text: data.reply || `Error: ${data.error || 'No reply'}`,
        sender: 'bot',
      };
      setChatMessages(prev => [...prev, botMessage]);
    } catch (error) {
      setChatMessages(prev => [...prev, { text: `Error: ${error.message}`, sender: 'bot' }]);
    } finally {
      setIsBotTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div style={styles.wrapper}>
      <h2 style={{ textAlign: 'center' }}>🤖 AI Chat Assistant</h2>

      <div style={styles.chatWindow}>
        {chatMessages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              ...styles.message,
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              backgroundColor: msg.sender === 'user' ? '#dcf8c6' : '#ffffff',
            }}
          >
            {msg.text}
          </div>
        ))}
        {isBotTyping && (
          <div style={{ ...styles.message, fontStyle: 'italic' }}>
            Bot is typing...
          </div>
        )}
      </div>

      <div style={styles.inputContainer}>
        <input
          type="text"
          style={styles.input}
          placeholder="Type your message..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={isBotTyping}
        />
        <button style={styles.sendButton} onClick={handleSend} disabled={isBotTyping}>
          Send
        </button>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    width: '400px',
    margin: '50px auto',
    fontFamily: 'Arial, sans-serif',
    border: '1px solid #ccc',
    borderRadius: '10px',
    backgroundColor: '#f9f9f9',
    overflow: 'hidden',
  },
  chatWindow: {
    height: '500px',
    padding: '15px',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    backgroundColor: '#e5ddd5',
  },
  message: {
    padding: '10px',
    margin: '5px',
    borderRadius: '10px',
    maxWidth: '70%',
    fontSize: '14px',
  },
  inputContainer: {
    display: 'flex',
    padding: '10px',
    borderTop: '1px solid #ccc',
    backgroundColor: '#ffffff',
  },
  input: {
    flex: 1,
    padding: '10px',
    fontSize: '14px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    marginRight: '10px',
  },
  sendButton: {
    padding: '10px 20px',
    fontSize: '14px',
    borderRadius: '4px',
    backgroundColor: '#4caf50',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
  },
};

export default ChatBot;
