import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader2, Sparkles, User, Bot } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';

const Chatbot = () => {
  const { language, selectedDistrict } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const translations = {
    en: {
      title: 'MGNREGA Assistant',
      placeholder: 'Ask about MGNREGA data...',
      send: 'Send',
      greeting: 'Hello! I can help you understand MGNREGA data. Ask me anything about employment, wages, or district performance.',
      quickQuestions: [
        'What is MGNREGA?',
        'How to check my district data?',
        'Explain performance score',
        'What are the key metrics?'
      ],
      errorMessage: 'Sorry, I encountered an error. Please try again.',
    },
    hi: {
      title: 'मनरेगा सहायक',
      placeholder: 'मनरेगा डेटा के बारे में पूछें...',
      send: 'भेजें',
      greeting: 'नमस्ते! मैं आपको मनरेगा डेटा समझने में मदद कर सकता हूं। रोजगार, मजदूरी, या जिले के प्रदर्शन के बारे में कुछ भी पूछें।',
      quickQuestions: [
        'मनरेगा क्या है?',
        'मेरे जिले का डेटा कैसे देखें?',
        'प्रदर्शन स्कोर समझाएं',
        'मुख्य मापदंड क्या हैं?'
      ],
      errorMessage: 'क्षमा करें, मुझे एक त्रुटि का सामना करना पड़ा। कृपया पुनः प्रयास करें।',
    }
  };

  const t = translations[language];

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          type: 'bot',
          content: t.greeting,
          timestamp: new Date()
        }
      ]);
    }
  }, [isOpen, t.greeting]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatBotResponse = (text) => {
    // Convert markdown-like formatting to JSX
    const lines = text.split('\n');
    const formatted = [];
    let inList = false;
    let listItems = [];

    lines.forEach((line, index) => {
      // Skip empty lines unless we're in a list
      if (!line.trim() && !inList) {
        return;
      }

      // Headers (## or ###)
      if (line.match(/^#{1,3}\s/)) {
        if (inList) {
          formatted.push(<ul key={`list-${index}`} className="list-disc ml-5 mb-3 space-y-1">{listItems}</ul>);
          listItems = [];
          inList = false;
        }
        const level = line.match(/^#+/)[0].length;
        const text = line.replace(/^#+\s*/, '');
        const Tag = `h${Math.min(level + 2, 6)}`; // h3, h4, h5, h6
        formatted.push(
          <Tag key={index} className="font-bold text-lg mb-2 text-orange-700 mt-3">
            {text}
          </Tag>
        );
      }
      // Bullet points (*, -, or •)
      else if (line.match(/^[*\-•]\s/)) {
        const content = line.replace(/^[*\-•]\s/, '');
        const processedContent = processBoldText(content);
        inList = true;
        listItems.push(
          <li key={`item-${index}`} className="mb-1 text-gray-700">
            {processedContent}
          </li>
        );
      }
      // Regular text with possible bold markers
      else if (line.trim()) {
        if (inList) {
          formatted.push(<ul key={`list-${index}`} className="list-disc ml-5 mb-3 space-y-1">{listItems}</ul>);
          listItems = [];
          inList = false;
        }
        const processedContent = processBoldText(line);
        formatted.push(
          <p key={index} className="mb-2 text-gray-700 leading-relaxed">
            {processedContent}
          </p>
        );
      }
    });

    // Close any remaining list
    if (inList && listItems.length > 0) {
      formatted.push(<ul key="final-list" className="list-disc ml-5 mb-3 space-y-1">{listItems}</ul>);
    }

    return <div className="space-y-1">{formatted}</div>;
  };

  // Helper function to process bold text (**text**)
  const processBoldText = (text) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-orange-600">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  const handleSend = async (messageText = input) => {
    if (!messageText.trim() || loading) return;

    const userMessage = {
      type: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const context = {
        language,
        district: selectedDistrict ? {
          districtName: selectedDistrict.districtName,
          stateName: selectedDistrict.stateName,
          districtCode: selectedDistrict.districtCode
        } : null
      };

      const response = await apiService.sendChatMessage(messageText, context);

      const botMessage = {
        type: 'bot',
        content: response.data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        type: 'bot',
        content: t.errorMessage,
        timestamp: new Date(),
        isError: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickQuestion = (question) => {
    handleSend(question);
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-br from-orange-500 to-orange-600 text-white p-4 rounded-full shadow-2xl hover:shadow-orange-300 transition-shadow"
        style={{ width: '60px', height: '60px' }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageCircle className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chatbot Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
            style={{ maxWidth: 'calc(100vw - 3rem)' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{t.title}</h3>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-2 max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.type === 'user' ? 'bg-orange-500' : 'bg-gray-200'
                    }`}>
                      {message.type === 'user' ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-gray-600" />
                      )}
                    </div>
                    <div className={`p-3 rounded-2xl ${
                      message.type === 'user'
                        ? 'bg-orange-500 text-white'
                        : message.isError
                        ? 'bg-red-50 text-red-800 border border-red-200'
                        : 'bg-white border border-gray-200'
                    }`}>
                      {message.type === 'user' ? (
                        <p className="text-sm">{message.content}</p>
                      ) : (
                        <div className="text-sm text-gray-700">
                          {formatBotResponse(message.content)}
                        </div>
                      )}
                      <p className="text-xs opacity-60 mt-1">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="flex items-center space-x-2 bg-white border border-gray-200 p-3 rounded-2xl">
                    <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                    <span className="text-sm text-gray-600">Thinking...</span>
                  </div>
                </motion.div>
              )}

              {/* Quick Questions */}
              {messages.length === 1 && !loading && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-500 text-center mb-2">Quick questions:</p>
                  {t.quickQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickQuestion(question)}
                      className="w-full text-left p-2 text-xs bg-white hover:bg-orange-50 border border-gray-200 hover:border-orange-300 rounded-lg transition-colors"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={t.placeholder}
                  disabled={loading}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-200 text-sm disabled:opacity-50"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || loading}
                  className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
