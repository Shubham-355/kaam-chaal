import { useApp } from '../context/AppContext';
import { Heart, Github, Mail } from 'lucide-react';

const Footer = () => {
  const { language } = useApp();

  const translations = {
    en: {
      madeWith: 'Made with',
      for: 'for rural India',
      disclaimer: 'Data sourced from data.gov.in MGNREGA API. This is an independent tracker and not affiliated with any government body.',
      rights: '© 2025 MGNREGA Tracker. Empowering citizens through transparency.',
      contact: 'Contact',
      github: 'Source Code'
    },
    hi: {
      madeWith: 'ग्रामीण भारत के लिए',
      for: 'प्यार से बनाया गया',
      disclaimer: 'डेटा data.gov.in MGNREGA API से लिया गया है। यह एक स्वतंत्र ट्रैकर है और किसी भी सरकारी निकाय से संबद्ध नहीं है।',
      rights: '© 2025 मनरेगा ट्रैकर। पारदर्शिता के माध्यम से नागरिकों को सशक्त बनाना।',
      contact: 'संपर्क करें',
      github: 'सोर्स कोड'
    }
  };

  const t = translations[language];

  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">MGNREGA Tracker</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              {t.disclaimer}
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">{language === 'en' ? 'Quick Links' : 'त्वरित लिंक'}</h3>
            <ul className="space-y-2 text-gray-300">
              <li>
                <a href="https://nrega.nic.in/" target="_blank" rel="noopener noreferrer" className="hover:text-orange-400 transition-colors">
                  {language === 'en' ? 'Official MGNREGA Website' : 'आधिकारिक मनरेगा वेबसाइट'}
                </a>
              </li>
              <li>
                <a href="https://data.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-orange-400 transition-colors">
                  {language === 'en' ? 'Data.gov.in' : 'डेटा.जीओवी.इन'}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">{t.contact}</h3>
            <div className="flex flex-col space-y-3">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-gray-300 hover:text-orange-400 transition-colors">
                <Github className="w-5 h-5" />
                <span>{t.github}</span>
              </a>
              <a href="mailto:support@example.com" className="flex items-center space-x-2 text-gray-300 hover:text-orange-400 transition-colors">
                <Mail className="w-5 h-5" />
                <span>{language === 'en' ? 'Email Us' : 'ईमेल करें'}</span>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center">
          <p className="text-gray-300 flex items-center justify-center flex-wrap gap-2">
            <span>{t.madeWith}</span>
            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
            <span>{t.for}</span>
          </p>
          <p className="text-gray-400 text-sm mt-2">{t.rights}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
