import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Menu, Globe } from 'lucide-react';

const Header = () => {
  const { language, setLanguage, selectedDistrict } = useApp();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  const translations = {
    en: {
      title: 'MGNREGA Tracker',
      subtitle: 'Your Rights, Your Data',
      home: 'Home',
      myDistrict: 'My District',
      compare: 'Compare',
      about: 'About'
    },
    hi: {
      title: 'मनरेगा ट्रैकर',
      subtitle: 'आपके अधिकार, आपका डेटा',
      home: 'होम',
      myDistrict: 'मेरा जिला',
      compare: 'तुलना करें',
      about: 'बारे में'
    }
  };

  const t = translations[language];

  return (
    <header className="bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <div className="bg-white p-2 rounded-lg">
              <img 
                src="/emblem.png" 
                alt="Emblem" 
                className="h-10 w-10"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{t.title}</h1>
              <p className="text-sm text-orange-100">{t.subtitle}</p>
            </div>
          </Link>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg transition-colors"
              aria-label="Toggle Language"
            >
              <Globe className="w-5 h-5" />
              <span className="hidden sm:inline font-semibold">
                {language === 'en' ? 'हिन्दी' : 'English'}
              </span>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-4 flex flex-wrap gap-3">
          <Link
            to="/"
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors font-medium"
          >
            {t.home}
          </Link>
          {selectedDistrict && (
            <Link
              to="/dashboard"
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors font-medium"
            >
              {t.myDistrict}
            </Link>
          )}
          <Link
            to="/compare"
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors font-medium"
          >
            {t.compare}
          </Link>
          <Link
            to="/about"
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors font-medium"
          >
            {t.about}
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
