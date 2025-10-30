import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Search, TrendingUp, Users, Briefcase, IndianRupee, ArrowRight, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import IndiaMap from '../components/IndiaMap';

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setSelectedDistrict, setUserLocation } = useApp();
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [selectedState, setSelectedState] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [stateSearchTerm, setStateSearchTerm] = useState('');
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const stateDropdownRef = useRef(null);
  const [districtSearchTerm, setDistrictSearchTerm] = useState('');
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
  const districtDropdownRef = useRef(null);

  const translations = {
    en: {
      title: 'Track MGNREGA Performance in Your District',
      subtitle: 'Understand how your district is performing in India\'s largest employment guarantee scheme',
      detectLocation: 'Auto-Detect My Location',
      orSelect: 'Or Select Your District',
      selectState: 'Select Your State',
      selectDistrict: 'Select Your District',
      viewData: 'View District Data',
      features: 'What You Can See',
      feature1Title: 'Employment Data',
      feature1Desc: 'See how many families got work and for how many days',
      feature2Title: 'Wages Information',
      feature2Desc: 'Check average daily wages and payment timelines',
      feature3Title: 'Works Progress',
      feature3Desc: 'Track completed and ongoing development projects',
      feature4Title: 'Performance Scores',
      feature4Desc: 'Simple ratings to understand district performance',
      locationDetected: 'Location Detected',
      locationError: 'Unable to detect location. Please select manually.',
      exploreNow: 'Explore Districts',
      learnMore: 'Learn More',
    },
    hi: {
      title: 'अपने जिले में मनरेगा के प्रदर्शन को ट्रैक करें',
      subtitle: 'भारत की सबसे बड़ी रोजगार गारंटी योजना में अपने जिले का प्रदर्शन समझें',
      detectLocation: 'मेरा स्थान खोजें',
      orSelect: 'या अपना जिला चुनें',
      selectState: 'अपना राज्य चुनें',
      selectDistrict: 'अपना जिला चुनें',
      viewData: 'जिला डेटा देखें',
      features: 'आप क्या देख सकते हैं',
      feature1Title: 'रोजगार डेटा',
      feature1Desc: 'देखें कितने परिवारों को काम मिला और कितने दिनों के लिए',
      feature2Title: 'मजदूरी की जानकारी',
      feature2Desc: 'औसत दैनिक मजदूरी और भुगतान समय देखें',
      feature3Title: 'कार्यों की प्रगति',
      feature3Desc: 'पूर्ण और चल रही विकास परियोजनाओं को ट्रैक करें',
      feature4Title: 'प्रदर्शन स्कोर',
      feature4Desc: 'जिले के प्रदर्शन को समझने के लिए सरल रेटिंग',
      locationDetected: 'स्थान मिल गया',
      locationError: 'स्थान का पता नहीं लगा। कृपया मैन्युअल रूप से चुनें।',
      exploreNow: 'जिले देखें',
      learnMore: 'और जानें',
    }
  };

  const t = translations[language];

  useEffect(() => {
    let isMounted = true;
    
    const fetchStates = async () => {
      try {
        setLoading(true);
        const response = await apiService.getStates();
        if (isMounted) {
          setStates(response.data || []);
          setError(null);
          
          // Check if we have a pre-selected state from navigation
          if (location.state?.selectedState) {
            setSelectedState(location.state.selectedState);
            setStateSearchTerm(location.state.selectedState);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchStates();

    return () => {
      isMounted = false;
    };
  }, [location.state]);

  useEffect(() => {
    let isMounted = true;

    const fetchDistricts = async (stateName) => {
      try {
        setLoading(true);
        const response = await apiService.getDistrictsByState(stateName);
        if (isMounted) {
          setDistricts(response.data || []);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (selectedState) {
      fetchDistricts(selectedState);
    }

    return () => {
      isMounted = false;
    };
  }, [selectedState]);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert(language === 'en' ? 'Geolocation is not supported by your browser' : 'आपका ब्राउज़र स्थान सुविधा का समर्थन नहीं करता');
      return;
    }

    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const locationData = await apiService.reverseGeocode(latitude, longitude);
          if (locationData && locationData.address) {
            const { state, state_district, county } = locationData.address;
            const detectedDistrict = state_district || county;
            setUserLocation({ latitude, longitude, state, district: detectedDistrict });
            
            // Try to auto-select state and district and navigate
            if (state) {
              // Find matching state
              const matchedState = states.find(s => 
                s.stateName?.toLowerCase().includes(state.toLowerCase()) || 
                state.toLowerCase().includes(s.stateName?.toLowerCase())
              );
              
              if (matchedState) {
                setSelectedState(matchedState.stateName);
                
                // Fetch districts for this state
                try {
                  const districtResponse = await apiService.getDistrictsByState(matchedState.stateName);
                  const stateDistricts = districtResponse.data || [];
                  
                  // Try to find matching district
                  if (detectedDistrict && stateDistricts.length > 0) {
                    const matchedDistrict = stateDistricts.find(d => 
                      d.districtName?.toLowerCase().includes(detectedDistrict.toLowerCase()) || 
                      detectedDistrict.toLowerCase().includes(d.districtName?.toLowerCase())
                    );
                    
                    if (matchedDistrict) {
                      // Automatically navigate to dashboard with detected district
                      setSelectedDistrict(matchedDistrict);
                      alert(`${t.locationDetected}: ${matchedDistrict.districtName}, ${matchedState.stateName}\n${language === 'en' ? 'Loading district data...' : 'जिला डेटा लोड हो रहा है...'}`);
                      navigate('/dashboard');
                      return;
                    }
                  }
                  
                  // If district not matched, show state info and let user select
                  alert(`${t.locationDetected}: ${state}\n${language === 'en' ? 'Please select your district from the list below' : 'कृपया नीचे की सूची से अपना जिला चुनें'}`);
                } catch (districtError) {
                  console.error('Error fetching districts:', districtError);
                  alert(`${t.locationDetected}: ${detectedDistrict}, ${state}\n${language === 'en' ? 'Please select your district manually' : 'कृपया अपना जिला मैन्युअल रूप से चुनें'}`);
                }
              } else {
                // State not matched
                alert(`${t.locationDetected}: ${detectedDistrict}, ${state}\n${language === 'en' ? 'Please select your state and district manually' : 'कृपया अपना राज्य और जिला मैन्युअल रूप से चुनें'}`);
              }
            }
          } else {
            alert(t.locationError);
          }
        } catch (err) {
          console.error('Geocoding error:', err);
          alert(t.locationError);
        } finally {
          setDetectingLocation(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert(t.locationError);
        setDetectingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleDistrictSelect = (district) => {
    setSelectedDistrict(district);
    navigate('/dashboard');
  };

  // Add retry function for states
  const retryFetchStates = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getStates();
      setStates(response.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: Users, title: t.feature1Title, description: t.feature1Desc, color: 'orange' },
    { icon: IndianRupee, title: t.feature2Title, description: t.feature2Desc, color: 'green' },
    { icon: Briefcase, title: t.feature3Title, description: t.feature3Desc, color: 'blue' },
    { icon: TrendingUp, title: t.feature4Title, description: t.feature4Desc, color: 'purple' },
  ];

  // Add new data for additional sections
  const howItWorksSteps = [
    {
      step: '01',
      title: language === 'en' ? 'Select Your District' : 'अपना जिला चुनें',
      description: language === 'en' 
        ? 'Choose your state and district from the dropdown or use auto-detect location feature'
        : 'ड्रॉपडाउन से अपना राज्य और जिला चुनें या ऑटो-डिटेक्ट लोकेशन फीचर का उपयोग करें'
    },
    {
      step: '02',
      title: language === 'en' ? 'View Dashboard' : 'डैशबोर्ड देखें',
      description: language === 'en'
        ? 'Access comprehensive data visualizations showing employment, wages, and works in simple graphs'
        : 'सरल ग्राफ़ में रोजगार, मजदूरी और कार्यों को दर्शाने वाले व्यापक डेटा विज़ुअलाइज़ेशन तक पहुंचें'
    },
    {
      step: '03',
      title: language === 'en' ? 'Compare Districts' : 'जिलों की तुलना करें',
      description: language === 'en'
        ? 'Compare multiple districts side-by-side to understand relative performance and identify best practices'
        : 'सापेक्ष प्रदर्शन को समझने और सर्वोत्तम प्रथाओं की पहचान करने के लिए कई जिलों की तुलना करें'
    },
    {
      step: '04',
      title: language === 'en' ? 'Ask Questions' : 'सवाल पूछें',
      description: language === 'en'
        ? 'Use our AI chatbot to get instant answers about MGNREGA data and policies in your language'
        : 'अपनी भाषा में मनरेगा डेटा और नीतियों के बारे में तत्काल उत्तर पाने के लिए हमारे AI चैटबॉट का उपयोग करें'
    }
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (stateDropdownRef.current && !stateDropdownRef.current.contains(event.target)) {
        setShowStateDropdown(false);
      }
      if (districtDropdownRef.current && !districtDropdownRef.current.contains(event.target)) {
        setShowDistrictDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter states based on search term
  const filteredStates = states.filter(state =>
    state.stateName.toLowerCase().includes(stateSearchTerm.toLowerCase())
  );

  // Filter districts based on search term
  const filteredDistricts = districts.filter(district =>
    district.districtName.toLowerCase().includes(districtSearchTerm.toLowerCase())
  );

  const handleStateSelect = (stateName) => {
    setSelectedState(stateName);
    setStateSearchTerm(stateName);
    setShowStateDropdown(false);
    setDistrictSearchTerm('');
  };

  const handleDistrictSelectFromSearch = (district) => {
    setDistrictSearchTerm(district.districtName);
    setShowDistrictDropdown(false);
    handleDistrictSelect(district);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fff9f1' }}>
      {/* Hero Section with Gradient Borders */}
      <div className="relative mx-auto my-10 flex max-w-7xl flex-col items-center justify-center px-8">
        {/* Left Border */}
        <div className="absolute inset-y-0 left-0 h-full w-px bg-neutral-200/80">
          <div className="absolute top-0 h-40 w-px bg-gradient-to-b from-transparent via-orange-500 to-transparent" />
        </div>
        {/* Right Border */}
        <div className="absolute inset-y-0 right-0 h-full w-px bg-neutral-200/80">
          <div className="absolute h-40 w-px bg-gradient-to-b from-transparent via-orange-500 to-transparent" />
        </div>
        {/* Bottom Border */}
        <div className="absolute inset-x-0 bottom-0 h-px w-full bg-neutral-200/80">
          <div className="absolute mx-auto h-px w-40 bg-gradient-to-r from-transparent via-orange-500 to-transparent" />
        </div>

        <div className="py-10 md:py-20 px-4">
          {/* Animated Title */}
          <h1 className="relative z-10 mx-auto max-w-4xl text-center text-3xl font-bold text-gray-800 md:text-5xl lg:text-7xl">
            {t.title.split(" ").map((word, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.1,
                  ease: "easeInOut",
                }}
                className="mr-2 inline-block"
              >
                {word}
              </motion.span>
            ))}
          </h1>

          {/* Animated Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.8 }}
            className="relative z-10 mx-auto max-w-2xl py-6 text-center text-lg font-normal text-gray-600 md:text-xl"
          >
            {t.subtitle}
          </motion.p>

          {/* Animated Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 1 }}
            className="relative z-10 mt-8 flex flex-wrap items-center justify-center gap-4"
          >
            <button 
              onClick={handleDetectLocation}
              disabled={detectingLocation}
              className="group flex w-60 transform items-center justify-center space-x-2 rounded-xl bg-linear-to-r from-orange-600 to-orange-500 px-6 py-3 font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50"
            >
              <MapPin className="w-5 h-5" />
              <span>{detectingLocation ? (language === 'en' ? 'Detecting...' : 'खोज रहे हैं...') : t.exploreNow}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button 
              onClick={() => {
                setChatbotOpen(true);
                // Dispatch custom event to open chatbot
                window.dispatchEvent(new CustomEvent('openChatbot'));
              }}
              className="group flex w-60 transform items-center justify-center space-x-2 rounded-xl border-2 border-orange-500 bg-white px-6 py-3 font-semibold text-orange-600 transition-all duration-300 hover:-translate-y-0.5 hover:bg-orange-50"
            >
              <Sparkles className="w-5 h-5" />
              <span>{t.learnMore}</span>
            </button>
          </motion.div>

          {/* Animated Selection Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 1.2 }}
            className="relative z-10 mt-20 rounded-3xl border-2 border-orange-200 bg-white/80 backdrop-blur-md p-8 mx-10 shadow-xl"
          >
            <div className="w-full">
              {error && <ErrorMessage message={error} onRetry={retryFetchStates} />}

              {/* State Selection */}
              <div className="space-y-6">
                <div>
                  <div className="relative" ref={stateDropdownRef}>
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none z-10" />
                    <input
                      type="text"
                      value={stateSearchTerm}
                      onChange={(e) => {
                        setStateSearchTerm(e.target.value);
                        setShowStateDropdown(true);
                      }}
                      onFocus={() => setShowStateDropdown(true)}
                      placeholder={language === 'en' ? 'Search or select a state...' : 'राज्य खोजें या चुनें...'}
                      className="w-full pl-12 pr-4 py-2 text-lg border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 bg-white cursor-text transition-all hover:border-gray-400 font-medium text-gray-700"
                      disabled={loading}
                    />
                    
                    {/* Custom State Dropdown */}
                    {showStateDropdown && filteredStates.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-20 w-full mt-2 bg-white border-2 border-gray-300 rounded-xl shadow-xl max-h-64 overflow-y-auto"
                      >
                        {filteredStates.map((state) => (
                          <button
                            key={state.stateCode || state.stateName}
                            onClick={() => handleStateSelect(state.stateName)}
                            className="w-full text-left px-4 py-3 hover:bg-orange-50 transition-colors border-b border-gray-100 last:border-b-0 font-medium text-gray-700 hover:text-orange-600"
                          >
                            {state.stateName}
                          </button>
                        ))}
                        
                        {filteredStates.length === 0 && stateSearchTerm && (
                          <div className="px-4 py-3 text-gray-500 text-center">
                            {language === 'en' ? 'No states found' : 'कोई राज्य नहीं मिला'}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* District Search - NEW */}
                {selectedState && districts.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                  >
                    <label className="block text-lg font-semibold text-gray-700 mb-3">
                      {t.selectDistrict}
                    </label>
                    
                    <div className="relative mb-4" ref={districtDropdownRef}>
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none z-10" />
                      <input
                        type="text"
                        value={districtSearchTerm}
                        onChange={(e) => {
                          setDistrictSearchTerm(e.target.value);
                          setShowDistrictDropdown(true);
                        }}
                        onFocus={() => setShowDistrictDropdown(true)}
                        placeholder={language === 'en' ? 'Search district...' : 'जिला खोजें...'}
                        className="w-full pl-12 pr-4 py-2 text-base border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 bg-white cursor-text transition-all hover:border-gray-400 font-medium text-gray-700"
                        disabled={loading}
                      />
                      
                      {/* Custom District Dropdown */}
                      {showDistrictDropdown && districtSearchTerm && filteredDistricts.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute z-20 w-full mt-2 bg-white border-2 border-gray-300 rounded-xl shadow-xl max-h-64 overflow-y-auto"
                        >
                          {filteredDistricts.map((district) => (
                            <button
                              key={district.districtCode}
                              onClick={() => handleDistrictSelectFromSearch(district)}
                              className="w-full text-left px-4 py-3 hover:bg-orange-50 transition-colors border-b border-gray-100 last:border-b-0 font-medium text-gray-700 hover:text-orange-600"
                            >
                              {district.districtName}
                            </button>
                          ))}
                        </motion.div>
                      )}
                      
                      {showDistrictDropdown && districtSearchTerm && filteredDistricts.length === 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute z-20 w-full mt-2 bg-white border-2 border-gray-300 rounded-xl shadow-lg px-4 py-3"
                        >
                          <p className="text-gray-500 text-center text-sm">
                            {language === 'en' ? 'No districts found' : 'कोई जिला नहीं मिला'}
                          </p>
                        </motion.div>
                      )}
                    </div>

                    {/* District Grid - Show when not searching or no results */}
                    {(!districtSearchTerm || filteredDistricts.length === 0) && (
                      <>
                        {loading ? (
                          <LoadingSpinner message={language === 'en' ? 'Loading districts...' : 'जिले लोड हो रहे हैं...'} size="small" />
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto p-2 bg-gray-50 rounded-xl border border-gray-200">
                            {districts.map((district) => (
                              <motion.button
                                key={district.districtCode}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleDistrictSelect(district)}
                                className="text-left p-4 border-2 border-gray-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all font-medium text-gray-800 bg-white hover:shadow-sm"
                              >
                                <div className="flex items-center justify-between">
                                  <span>{district.districtName}</span>
                                  <svg className="w-4 h-4 text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                </div>
                              </motion.button>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* How It Works Section - NEW */}
      <div className="bg-gradient-to-b from-white to-orange-50/30 py-16 md:py-24">
        <div className="container mx-auto px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              {language === 'en' ? 'How It Works' : 'यह कैसे काम करता है'}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {language === 'en' 
                ? 'Four simple steps to access and understand MGNREGA data in your district'
                : 'अपने जिले में मनरेगा डेटा तक पहुंचने और समझने के लिए चार सरल कदम'}
            </p>
          </motion.div>

          <div className="max-w-5xl mx-auto">
            {howItWorksSteps.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="relative"
              >
                {/* Connecting Line */}
                {index < howItWorksSteps.length - 1 && (
                  <div className="hidden md:block absolute left-12 top-24 w-0.5 h-full bg-gradient-to-b from-orange-400 to-orange-200" />
                )}

                <div className="flex flex-col md:flex-row items-start gap-6 mb-12 md:mb-16">
                  {/* Step Number */}
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="flex-shrink-0 w-24 h-24 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg relative z-10"
                  >
                    <span className="text-3xl font-bold text-white">{item.step}</span>
                  </motion.div>

                  {/* Content */}
                  <div className="flex-1 bg-white rounded-2xl p-6 md:p-8 border-2 border-orange-200 hover:border-orange-400 transition-all hover:shadow-xl">
                    <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-3">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* India Map Section - NEW */}
      <IndiaMap />

      {/* Features Section - MOVED HERE */}
      <div className="container mx-auto px-8 py-16 md:py-20">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12"
        >
          {t.features}
        </motion.h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 px-4 md:px-20 lg:px-20">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            
            return (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                className="group bg-white rounded-2xl p-8 border border-gray-200 hover:border-orange-300 transition-all hover:shadow-lg"
              >
                <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center mb-4 group-hover:bg-orange-100 transition-colors">
                  <Icon className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Compare Feature Showcase - NEW */}
      <div className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
                  {language === 'en' ? 'Compare & Analyze Districts' : 'जिलों की तुलना और विश्लेषण करें'}
                </h2>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  {language === 'en'
                    ? 'Compare multiple districts side-by-side to identify best performers, understand trends, and learn from successful implementations.'
                    : 'कई जिलों की तुलना करें, सर्वश्रेष्ठ प्रदर्शन करने वालों की पहचान करें, रुझानों को समझें और सफल कार्यान्वयन से सीखें।'}
                </p>
                <ul className="space-y-4 mb-8">
                  {[
                    language === 'en' ? 'Unlimited district comparisons' : 'असीमित जिला तुलना',
                    language === 'en' ? 'Visual charts and graphs' : 'दृश्य चार्ट और ग्राफ़',
                    language === 'en' ? 'Export data for analysis' : 'विश्लेषण के लिए डेटा निर्यात करें',
                    language === 'en' ? 'Year-over-year trends' : 'वर्ष-दर-वर्ष रुझान'
                  ].map((item, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                      className="flex items-center space-x-3"
                    >
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-gray-700 font-medium">{item}</span>
                    </motion.li>
                  ))}
                </ul>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/compare')}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-xl flex items-center space-x-2"
                >
                  <span>{language === 'en' ? 'Try Comparison Tool' : 'तुलना टूल आज़माएं'}</span>
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </motion.div>

              {/* Right Visual */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative"
              >
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-3xl p-8 border-2 border-orange-200">
                  {/* Mock Comparison Cards */}
                  <div className="space-y-4">
                    {[1, 2, 3].map((_, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                        className="bg-white rounded-xl p-4 shadow-md flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-12 h-12 rounded-lg ${
                            index === 0 ? 'bg-green-100' : index === 1 ? 'bg-blue-100' : 'bg-purple-100'
                          } flex items-center justify-center`}>
                            <TrendingUp className={`w-6 h-6 ${
                              index === 0 ? 'text-green-600' : index === 1 ? 'text-blue-600' : 'text-purple-600'
                            }`} />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800">
                              {language === 'en' ? 'District' : 'जिला'} {index + 1}
                            </div>
                            <div className="text-sm text-gray-500">
                              {language === 'en' ? 'Performance' : 'प्रदर्शन'}: {95 - index * 10}%
                            </div>
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-gray-800">
                          {95 - index * 10}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
