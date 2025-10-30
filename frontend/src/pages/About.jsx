import { Book, Users, TrendingUp, Shield, Globe, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';

const About = () => {
  const { language } = useApp();

  const translations = {
    en: {
      title: 'About MGNREGA Tracker',
      subtitle: 'Empowering Citizens Through Transparency',
      
      whatIs: 'What is MGNREGA?',
      whatIsDesc: 'The Mahatma Gandhi National Rural Employment Guarantee Act (MGNREGA) is one of the largest social security initiatives in the world. It guarantees 100 days of wage employment per year to rural households whose adult members volunteer to do unskilled manual work.',
      
      ourMission: 'Our Mission',
      ourMissionDesc: 'We believe that every citizen has the right to understand how government programs are performing in their district. This tracker makes MGNREGA data accessible to everyone, especially those with low digital literacy, by presenting complex data in simple, visual formats.',
      
      features: 'What Makes Us Different',
      feature1: 'Simple & Visual',
      feature1Desc: 'Large fonts, clear icons, and simple language for everyone to understand',
      feature2: 'Low-Literacy Friendly',
      feature2Desc: 'Designed specifically for rural populations with explanations in multiple languages',
      feature3: 'Location-Based',
      feature3Desc: 'Automatically detects your location to show relevant district information',
      feature4: 'Always Available',
      feature4Desc: 'Data is stored locally, so you can access it even if government APIs are down',
      
      howItWorks: 'How It Works',
      step1: 'We fetch data from the official data.gov.in API regularly',
      step2: 'Data is stored in our database for fast, reliable access',
      step3: 'Complex metrics are converted into simple visual indicators',
      step4: 'You get instant access to your district\'s performance',
      
      dataSource: 'Data Source',
      dataSourceDesc: 'All data is sourced from the official Government of India Open Data Platform (data.gov.in). We update our database daily to ensure you have the latest information.',
      
      disclaimer: 'Disclaimer',
      disclaimerDesc: 'This is an independent citizen initiative and is not affiliated with any government body. While we strive for accuracy, please verify critical information from official sources.',
      
      contact: 'Get In Touch',
      contactDesc: 'Have questions or suggestions? We\'d love to hear from you!',
    },
    hi: {
      title: 'मनरेगा ट्रैकर के बारे में',
      subtitle: 'पारदर्शिता के माध्यम से नागरिकों को सशक्त बनाना',
      
      whatIs: 'मनरेगा क्या है?',
      whatIsDesc: 'महात्मा गांधी राष्ट्रीय ग्रामीण रोजगार गारंटी अधिनियम (मनरेगा) दुनिया की सबसे बड़ी सामाजिक सुरक्षा पहलों में से एक है। यह ग्रामीण परिवारों को प्रति वर्ष 100 दिनों के वेतन रोजगार की गारंटी देता है।',
      
      ourMission: 'हमारा मिशन',
      ourMissionDesc: 'हम मानते हैं कि प्रत्येक नागरिक को यह समझने का अधिकार है कि उनके जिले में सरकारी कार्यक्रम कैसे काम कर रहे हैं। यह ट्रैकर मनरेगा डेटा को सभी के लिए सुलभ बनाता है, विशेष रूप से कम डिजिटल साक्षरता वाले लोगों के लिए।',
      
      features: 'हमें क्या अलग बनाता है',
      feature1: 'सरल और दृश्य',
      feature1Desc: 'सभी को समझने के लिए बड़े फ़ॉन्ट, स्पष्ट आइकन और सरल भाषा',
      feature2: 'कम साक्षरता के अनुकूल',
      feature2Desc: 'विशेष रूप से ग्रामीण आबादी के लिए कई भाषाओं में स्पष्टीकरण के साथ डिज़ाइन किया गया',
      feature3: 'स्थान-आधारित',
      feature3Desc: 'प्रासंगिक जिला जानकारी दिखाने के लिए स्वचालित रूप से आपके स्थान का पता लगाता है',
      feature4: 'हमेशा उपलब्ध',
      feature4Desc: 'डेटा स्थानीय रूप से संग्रहीत है, इसलिए सरकारी API डाउन होने पर भी आप इसे एक्सेस कर सकते हैं',
      
      howItWorks: 'यह कैसे काम करता है',
      step1: 'हम नियमित रूप से आधिकारिक data.gov.in API से डेटा प्राप्त करते हैं',
      step2: 'तेज़, विश्वसनीय पहुंच के लिए डेटा हमारे डेटाबेस में संग्रहीत है',
      step3: 'जटिल मेट्रिक्स को सरल दृश्य संकेतकों में परिवर्तित किया जाता है',
      step4: 'आपको अपने जिले के प्रदर्शन तक तुरंत पहुंच मिलती है',
      
      dataSource: 'डेटा स्रोत',
      dataSourceDesc: 'सभी डेटा आधिकारिक भारत सरकार ओपन डेटा प्लेटफॉर्म (data.gov.in) से लिया गया है। हम यह सुनिश्चित करने के लिए दैनिक अपने डेटाबेस को अपडेट करते हैं कि आपके पास नवीनतम जानकारी हो।',
      
      disclaimer: 'अस्वीकरण',
      disclaimerDesc: 'यह एक स्वतंत्र नागरिक पहल है और किसी भी सरकारी निकाय से संबद्ध नहीं है। जबकि हम सटीकता के लिए प्रयास करते हैं, कृपया आधिकारिक स्रोतों से महत्वपूर्ण जानकारी सत्यापित करें।',
      
      contact: 'संपर्क करें',
      contactDesc: 'प्रश्न या सुझाव हैं? हम आपसे सुनना पसंद करेंगे!',
    }
  };

  const t = translations[language];

  const features = [
    { icon: Book, title: t.feature1, description: t.feature1Desc, color: 'orange' },
    { icon: Users, title: t.feature2, description: t.feature2Desc, color: 'blue' },
    { icon: Globe, title: t.feature3, description: t.feature3Desc, color: 'green' },
    { icon: Shield, title: t.feature4, description: t.feature4Desc, color: 'purple' },
  ];

  return (
    <div className="min-h-screen md:px-20 lg:px-23" style={{ backgroundColor: '#fff9f1' }}>
      {/* Hero Section - Minimal */}
      <div className="container mx-auto px-8 py-10 md:py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            {t.title}
          </h1>
          <p className="text-gray-600">
            {t.subtitle}
          </p>
        </div>

        {/* What is MGNREGA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white border border-gray-200 rounded-xl p-6 md:p-8 mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">{t.whatIs}</h2>
          <p className="text-base text-gray-700 leading-relaxed mb-6">
            {t.whatIsDesc}
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-5 text-center hover:border-orange-300 transition-colors">
              <p className="text-3xl font-bold text-orange-600 mb-2">100</p>
              <p className="text-sm font-medium text-gray-700">
                {language === 'en' ? 'Days Guaranteed' : 'गारंटीड दिन'}
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 text-center hover:border-blue-300 transition-colors">
              <p className="text-3xl font-bold text-blue-600 mb-2">12.15 Cr</p>
              <p className="text-sm font-medium text-gray-700">
                {language === 'en' ? 'Beneficiaries (2025)' : 'लाभार्थी (2025)'}
              </p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-5 text-center hover:border-green-300 transition-colors">
              <p className="text-3xl font-bold text-green-600 mb-2">
                {language === 'en' ? 'Largest' : 'सबसे बड़ा'}
              </p>
              <p className="text-sm font-medium text-gray-700">
                {language === 'en' ? 'Employment Scheme' : 'रोजगार योजना'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Our Mission */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="bg-white border border-gray-200 rounded-xl p-6 md:p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            <div className="bg-red-50 border border-red-200 p-4 rounded-xl shrink-0">
              <Heart className="w-10 h-10 text-red-500" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">{t.ourMission}</h2>
              <p className="text-base text-gray-700 leading-relaxed">
                {t.ourMissionDesc}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Features */}
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
            {t.features}
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const colorClasses = {
                orange: 'bg-orange-50 text-orange-600 border-orange-200',
                blue: 'bg-blue-50 text-blue-600 border-blue-200',
                green: 'bg-green-50 text-green-600 border-green-200',
                purple: 'bg-purple-50 text-purple-600 border-purple-200',
              };
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="bg-white border border-gray-200 rounded-xl p-6 hover:border-orange-300 transition-all"
                >
                  <div className={`${colorClasses[feature.color]} w-12 h-12 rounded-xl flex items-center justify-center mb-4 border`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white border border-gray-200 rounded-xl p-6 md:p-8 mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">{t.howItWorks}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[t.step1, t.step2, t.step3, t.step4].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="bg-orange-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {index + 1}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed font-medium">{step}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Data Source */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 md:p-8 mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-blue-800 mb-3">{t.dataSource}</h2>
          <p className="text-base text-blue-900 leading-relaxed mb-4">
            {t.dataSourceDesc}
          </p>
          <a
            href="https://data.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors text-sm"
          >
            {language === 'en' ? 'Visit data.gov.in' : 'data.gov.in पर जाएं'}
          </a>
        </div>

        {/* Disclaimer */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 md:p-8 mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-yellow-800 mb-3">{t.disclaimer}</h2>
          <p className="text-base text-yellow-900 leading-relaxed">
            {t.disclaimerDesc}
          </p>
        </div>

        {/* Contact */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">{t.contact}</h2>
          <p className="text-base text-gray-700 mb-6">{t.contactDesc}</p>
          <a
            href="mailto:support@example.com"
            className="inline-block bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
          >
            {language === 'en' ? 'Email Us' : 'हमें ईमेल करें'}
          </a>
        </div>
      </div>
    </div>
  );
};

export default About;
