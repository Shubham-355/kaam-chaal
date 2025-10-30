import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader2, Sparkles, User, Bot } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Chatbot = () => {
  const { language, selectedDistrict, setSelectedDistrict } = useApp();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const translations = {
    en: {
      title: 'MGNREGA Assistant',
      placeholder: 'Ask me anything or say "show Mumbai"...',
      send: 'Send',
      greeting: 'Hello! I can help you navigate and understand MGNREGA data. Try saying:\n• "Show me (cityname) data"\n• "Compare (state1) and (state2)"\n• "Take me to dashboard"\n• "What is MGNREGA?"',
      quickQuestions: [
        'Show me data of (cityname)',
        'Compare two districts',
        'What is MGNREGA?',
        'Go to dashboard'
      ],
      errorMessage: 'Sorry, I encountered an error. Please try again.',
      navigating: '🚀 Taking you there...',
      thinking: 'Thinking...',
      suggestions: 'Try asking:',
    },
    hi: {
      title: 'मनरेगा सहायक',
      placeholder: 'कुछ भी पूछें या कहें "दिल्ली दिखाओ"...',
      send: 'भेजें',
      greeting: 'नमस्ते! मैं आपको नेविगेट करने और मनरेगा डेटा समझने में मदद कर सकता हूं। कोशिश करें:\n• "दिल्ली का डेटा दिखाओ"\n• "गुजरात और महाराष्ट्र की तुलना"\n• "डैशबोर्ड पर ले जाओ"\n• "मनरेगा क्या है?"',
      quickQuestions: [
        'दिल्ली दिखाओ',
        'दो जिलों की तुलना',
        'मनरेगा क्या है?',
        'डैशबोर्ड खोलो'
      ],
      errorMessage: 'क्षमा करें, मुझे एक त्रुटि का सामना करना पड़ा। कृपया पुनः प्रयास करें।',
      navigating: '🚀 वहाँ ले जा रहे हैं...',
      thinking: 'सोच रहा हूं...',
      suggestions: 'पूछने की कोशिश करें:',
    }
  };

  const t = translations[language];

  useEffect(() => {
    // Listen for custom event to open chatbot
    const handleOpenChatbot = () => {
      setIsOpen(true);
      // Add a welcome message about MGNREGA if chatbot is opened via Learn More
      if (messages.length === 0) {
        const welcomeMessage = language === 'en' 
          ? 'Hello! I can help you learn about MGNREGA. Would you like to know:\n• What is MGNREGA?\n• How to check district data?\n• Understanding performance metrics?\n• How to use this tracker?'
          : 'नमस्ते! मैं आपको मनरेगा के बारे में जानने में मदद कर सकता हूं। क्या आप जानना चाहेंगे:\n• मनरेगा क्या है?\n• जिला डेटा कैसे देखें?\n• प्रदर्शन मेट्रिक्स को समझना?\n• इस ट्रैकर का उपयोग कैसे करें?';
        
        setMessages([{
          type: 'bot',
          content: welcomeMessage,
          timestamp: new Date()
        }]);
      }
    };

    window.addEventListener('openChatbot', handleOpenChatbot);
    return () => window.removeEventListener('openChatbot', handleOpenChatbot);
  }, [language, messages.length]);

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

      // Handle actions
      if (response.data.action) {
        handleAction(response.data.action);
      }
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

  const handleAction = (action) => {
    if (!action) return;

    // Show a smart navigating message based on action
    let navigatingMessage = '';
    
    if (action.target === 'compare' && action.states && action.states.length >= 2) {
      navigatingMessage = language === 'en' 
        ? `🚀 Taking you to compare ${action.states.map(s => s.stateName).join(' and ')}...` 
        : `🚀 ${action.states.map(s => s.stateName).join(' और ')} की तुलना के लिए ले जा रहे हैं...`;
    } else if (action.target === 'compare' && action.state) {
      navigatingMessage = language === 'en' 
        ? `🚀 Taking you to comparison tool with ${action.state.stateName} pre-selected...` 
        : `🚀 ${action.state.stateName} पूर्व-चयनित के साथ तुलना टूल पर ले जा रहे हैं...`;
    } else if (action.target === 'compare') {
      navigatingMessage = language === 'en' 
        ? `🚀 Opening comparison tool...` 
        : `🚀 तुलना टूल खोल रहे हैं...`;
    } else if (action.target === 'district' && action.district) {
      navigatingMessage = language === 'en' 
        ? `🚀 Opening ${action.district.districtName} dashboard...` 
        : `🚀 ${action.district.districtName} डैशबोर्ड खोल रहे हैं...`;
    } else if (action.target === 'state' && action.state) {
      navigatingMessage = language === 'en' 
        ? `🚀 Showing districts in ${action.state.stateName}...` 
        : `🚀 ${action.state.stateName} के जिले दिखा रहे हैं...`;
    } else if (action.target === 'about') {
      navigatingMessage = language === 'en' 
        ? `🚀 Taking you to about page...` 
        : `🚀 जानकारी पृष्ठ पर ले जा रहे हैं...`;
    } else if (action.target === 'dashboard') {
      navigatingMessage = language === 'en' 
        ? `🚀 Opening your dashboard...` 
        : `🚀 आपका डैशबोर्ड खोल रहे हैं...`;
    } else if (action.target === 'home') {
      navigatingMessage = language === 'en' 
        ? `🚀 Taking you home...` 
        : `🚀 मुख्य पृष्ठ पर ले जा रहे हैं...`;
    } else {
      navigatingMessage = t.navigating;
    }
    
    setMessages(prev => [...prev, {
      type: 'bot',
      content: navigatingMessage,
      timestamp: new Date(),
      isSystem: true
    }]);

    setTimeout(() => {
      switch (action.type) {
        case 'navigate':
          if (action.target === 'compare') {
            // Navigate to compare page
            if (action.states && action.states.length >= 2) {
              navigate('/compare', { state: { preSelectedStates: action.states.map(s => s.stateName) } });
            } else if (action.state) {
              navigate('/compare', { state: { preSelectedState: action.state.stateName } });
            } else {
              navigate('/compare');
            }
            setIsOpen(false);
          } else if (action.target === 'district' && action.district) {
            setSelectedDistrict(action.district);
            navigate('/dashboard');
            setIsOpen(false);
          } else if (action.target === 'state' && action.state) {
            navigate('/', { state: { selectedState: action.state.stateName } });
            setIsOpen(false);
          } else if (action.target === 'about') {
            navigate('/about');
            setIsOpen(false);
          } else if (action.target === 'dashboard') {
            if (selectedDistrict) {
              navigate('/dashboard');
            } else {
              navigate('/');
            }
            setIsOpen(false);
          } else if (action.target === 'home') {
            navigate('/');
            setIsOpen(false);
          }
          break;
        
        case 'compare':
          if (action.district) {
            setSelectedDistrict(action.district);
            navigate('/compare', { state: { preSelectedDistrict: action.district } });
            setIsOpen(false);
          } else if (action.state) {
            navigate('/compare', { state: { preSelectedState: action.state.stateName } });
            setIsOpen(false);
          } else {
            navigate('/compare');
            setIsOpen(false);
          }
          break;
        
        default:
          break;
      }
    }, 600);
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
              <X className="w-6 h-6 pl-1" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageCircle className="w-6 h-6 pl-1" />
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
                    <span className="text-sm text-gray-600">{t.thinking}</span>
                  </div>
                </motion.div>
              )}

              {/* Smart Quick Questions - Context aware */}
              {messages.length === 1 && !loading && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-500 text-center mb-2 font-medium">{t.suggestions}</p>
                  {t.quickQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickQuestion(question)}
                      className="w-full text-left p-3 text-xs bg-white hover:bg-orange-50 border border-gray-200 hover:border-orange-400 rounded-lg transition-all font-medium text-gray-700 hover:text-orange-600 hover:shadow-sm"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              )}

              {/* Smart Suggestions after action */}
              {messages.length > 2 && !loading && messages[messages.length - 1].isSystem && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2 mt-2"
                >
                  <p className="text-xs text-gray-500 text-center mb-2">{language === 'en' ? 'Need help with anything else?' : 'कुछ और मदद चाहिए?'}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      language === 'en' ? 'Compare districts' : 'जिलों की तुलना',
                      language === 'en' ? 'Go home' : 'होम जाएं'
                    ].map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuickQuestion(suggestion)}
                        className="text-xs p-2 bg-orange-50 hover:bg-orange-100 border border-orange-200 hover:border-orange-300 rounded-lg transition-all font-medium text-orange-700"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </motion.div>
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
