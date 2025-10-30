import { useApp } from '../context/AppContext';
import { Heart, Github, Mail, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

const Footer = () => {
  const { language } = useApp();

  const translations = {
    en: {
      madeWith: 'Made with',
      for: 'for rural India',
      disclaimer: 'Data sourced from data.gov.in MGNREGA API. This is an independent tracker and not affiliated with any government body.',
      rights: '© 2025 MGNREGA Tracker. Empowering citizens through transparency.',
      contact: 'Get In Touch',
      github: 'Source Code',
      quickLinks: 'Quick Links',
      officialSite: 'Official MGNREGA Website',
      dataGov: 'Data.gov.in',
      emailUs: 'Email Us',
      about: 'About MGNREGA',
      aboutDesc: 'The Mahatma Gandhi National Rural Employment Guarantee Act guarantees 100 days of wage employment per year to rural households.',
    },
    hi: {
      madeWith: 'ग्रामीण भारत के लिए',
      for: 'प्यार से बनाया गया',
      disclaimer: 'डेटा data.gov.in MGNREGA API से लिया गया है। यह एक स्वतंत्र ट्रैकर है और किसी भी सरकारी निकाय से संबद्ध नहीं है।',
      rights: '© 2025 मनरेगा ट्रैकर। पारदर्शिता के माध्यम से नागरिकों को सशक्त बनाना।',
      contact: 'संपर्क करें',
      github: 'सोर्स कोड',
      quickLinks: 'त्वरित लिंक',
      officialSite: 'आधिकारिक मनरेगा वेबसाइट',
      dataGov: 'डेटा.जीओवी.इन',
      emailUs: 'ईमेल करें',
      about: 'मनरेगा के बारे में',
      aboutDesc: 'महात्मा गांधी राष्ट्रीय ग्रामीण रोजगार गारंटी अधिनियम ग्रामीण परिवारों को प्रति वर्ष 100 दिनों के वेतन रोजगार की गारंटी देता है।',
    }
  };

  const t = translations[language];

  return (
    <footer className="relative mt-auto" style={{ backgroundColor: '#fff9f1' }}>
      {/* Decorative Top Border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-neutral-200/80">
        <div className="absolute left-1/2 -translate-x-1/2 h-px w-40 bg-gradient-to-r from-transparent via-orange-500 to-transparent" />
      </div>

      <div className="container mx-auto px-8 py-12 md:py-16">
        <div className="grid md:grid-cols-3 gap-8 md:gap-12 mb-8">
          {/* About Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <div className="flex items-center space-x-3">
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
              <h3 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                MGNREGA Tracker
              </h3>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              {t.aboutDesc}
            </p>
            <div className="bg-yellow-50/80 backdrop-blur-sm border border-yellow-200 rounded-xl p-4">
              <p className="text-xs text-yellow-800 leading-relaxed">
                {t.disclaimer}
              </p>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-lg font-bold text-gray-800 mb-4">{t.quickLinks}</h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="https://nrega.nic.in/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="group flex items-center space-x-2 text-gray-600 hover:text-orange-600 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  <span>{t.officialSite}</span>
                </a>
              </li>
              <li>
                <a 
                  href="https://data.gov.in" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="group flex items-center space-x-2 text-gray-600 hover:text-orange-600 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  <span>{t.dataGov}</span>
                </a>
              </li>
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-lg font-bold text-gray-800 mb-4">{t.contact}</h3>
            <div className="space-y-3">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="group flex items-center space-x-3 text-gray-600 hover:text-orange-600 transition-colors"
              >
                <div className="bg-gray-100 group-hover:bg-orange-100 p-2 rounded-lg transition-colors">
                  <Github className="w-5 h-5" />
                </div>
                <span className="font-medium">{t.github}</span>
              </a>
              <a 
                href="mailto:support@example.com" 
                className="group flex items-center space-x-3 text-gray-600 hover:text-orange-600 transition-colors"
              >
                <div className="bg-gray-100 group-hover:bg-orange-100 p-2 rounded-lg transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <span className="font-medium">{t.emailUs}</span>
              </a>
            </div>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-gray-600 flex items-center flex-wrap justify-center gap-2 text-sm"
            >
              <span>{t.madeWith}</span>
              <Heart className="w-5 h-5 text-red-500 fill-red-500 animate-pulse" />
              <span>{t.for}</span>
            </motion.p>
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-gray-500 text-sm text-center"
            >
              {t.rights}
            </motion.p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
