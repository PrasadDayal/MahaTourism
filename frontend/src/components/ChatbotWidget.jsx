import React, { useState } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import api from '../services/api';

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hello! I am your Maharashtra travel assistant. Ask me anything!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', { message: userMessage });
      setMessages(prev => [...prev, { sender: 'ai', text: res.data.data }]);
    } catch (error) {
      setMessages(prev => [...prev, { sender: 'ai', text: 'Sorry, I am having trouble connecting to the server.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white w-80 h-[450px] rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-4 border border-gray-200">
          <div className="bg-emerald-600 text-white p-4 flex justify-between items-center">
            <h3 className="font-bold">Travel Assistant</h3>
            <button onClick={() => setIsOpen(false)} className="hover:text-gray-200"><X className="w-5 h-5" /></button>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`max-w-[80%] p-3 rounded-lg text-sm ${msg.sender === 'user' ? 'bg-emerald-600 text-white self-end rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 self-start rounded-bl-none'}`}>
                {msg.text}
              </div>
            ))}
            {loading && (
              <div className="bg-white border border-gray-200 text-gray-800 self-start p-3 rounded-lg rounded-bl-none text-sm animate-pulse">
                Typing...
              </div>
            )}
          </div>

          <form onSubmit={sendMessage} className="p-3 bg-white border-t flex items-center">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..." 
              className="flex-1 p-2 border rounded-l-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <button type="submit" disabled={loading} className="bg-emerald-600 text-white p-2 rounded-r-lg hover:bg-emerald-700 transition">
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-emerald-600 text-white p-4 rounded-full shadow-xl hover:bg-emerald-700 transition transform hover:scale-105"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

export default ChatbotWidget;
