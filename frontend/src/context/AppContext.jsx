import { createContext, useContext, useState, useEffect } from 'react';
import { detectLanguage } from '../utils/helpers';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || detectLanguage();
  });
  
  const [selectedDistrict, setSelectedDistrict] = useState(() => {
    const saved = localStorage.getItem('selectedDistrict');
    return saved ? JSON.parse(saved) : null;
  });

  const [userLocation, setUserLocation] = useState(null);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  useEffect(() => {
    if (selectedDistrict) {
      localStorage.setItem('selectedDistrict', JSON.stringify(selectedDistrict));
    }
  }, [selectedDistrict]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const value = {
    language,
    setLanguage,
    selectedDistrict,
    setSelectedDistrict,
    userLocation,
    setUserLocation,
    theme,
    setTheme,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
