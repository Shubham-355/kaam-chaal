import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Home, MapPin, GitCompare, Info, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

const Header = () => {
  const { language, setLanguage, selectedDistrict } = useApp();
  const location = useLocation();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  const translations = {
    en: {
      title: 'MGNREGA Tracker',
      home: 'Home',
      myDistrict: 'My District',
      compare: 'Compare',
      about: 'About'
    },
    hi: {
      title: 'मनरेगा ट्रैकर',
      home: 'होम',
      myDistrict: 'मेरा जिला',
      compare: 'तुलना करें',
      about: 'बारे में'
    }
  };

  const t = translations[language];

  const navItems = [
    {
      name: t.home,
      link: "/",
      icon: Home,
    },
    {
      name: t.myDistrict,
      link: "/dashboard",
      icon: MapPin,
      showOnlyWhen: selectedDistrict,
    },
    {
      name: t.compare,
      link: "/compare",
      icon: GitCompare,
    },
    {
      name: t.about,
      link: "/about",
      icon: Info,
    },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
      <nav className="max-w-7xl mx-auto bg-white/80 backdrop-blur-lg border border-gray-200/50 rounded-2xl shadow-lg">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo/Brand */}
            <Link to="/" className="flex items-center space-x-2 shrink-0">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2 rounded-xl">
                <img 
                  src="/emblem.png" 
                  alt="Emblem" 
                  className="h-8 w-8"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                  {t.title}
                </h1>
              </div>
            </Link>

            {/* Center Navigation */}
            <div className="hidden md:flex items-center space-x-1 flex-1 justify-center">
              {navItems.map((item) => {
                if (item.showOnlyWhen !== undefined && !item.showOnlyWhen) {
                  return null;
                }
                const Icon = item.icon;
                const active = isActive(item.link);
                
                return (
                  <Link
                    key={item.link}
                    to={item.link}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-xl font-medium transition-all ${
                      active
                        ? 'bg-orange-500 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Language Toggle */}
            <motion.button
              key={language}
              onClick={toggleLanguage}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center space-x-1 px-3 py-2 rounded-lg font-semibold transition-all shrink-0 ${
                language === 'en'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">
                {language === 'en' ? 'हिन्दी' : 'English'}
              </span>
            </motion.button>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-200">
            {navItems.map((item) => {
              if (item.showOnlyWhen !== undefined && !item.showOnlyWhen) {
                return null;
              }
              const Icon = item.icon;
              const active = isActive(item.link);
              
              return (
                <Link
                  key={item.link}
                  to={item.link}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                    active
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
