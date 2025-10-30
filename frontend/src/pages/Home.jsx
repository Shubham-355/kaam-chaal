import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Search, TrendingUp, Users, Briefcase, IndianRupee, ArrowRight, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const Home = () => {
  const navigate = useNavigate();
  const { language, setSelectedDistrict, setUserLocation } = useApp();
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [selectedState, setSelectedState] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [detectingLocation, setDetectingLocation] = useState(false);

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
  }, []);

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
              onClick={() => navigate('/about')}
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
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none z-10" />
                    <select
                      value={selectedState}
                      onChange={(e) => setSelectedState(e.target.value)}
                      className="w-full pl-12 pr-8 py-2 text-lg border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 appearance-none bg-white cursor-pointer transition-all hover:border-gray-400 font-medium text-gray-700"
                      disabled={loading}
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23f97316'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 1rem center',
                        backgroundSize: '1.5rem'
                      }}
                    >
                      <option value="" className="text-gray-500">
                        {language === 'en' ? 'Choose a state...' : 'एक राज्य चुनें...'}
                      </option>
                      {states.map((state) => (
                        <option 
                          key={state.stateCode || state.stateName} 
                          value={state.stateName}
                          className="py-2 text-gray-800"
                        >
                          {state.stateName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* District Selection */}
                {selectedState && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                  >
                    <label className="block text-lg font-semibold text-gray-700 mb-3">
                      {t.selectDistrict}
                    </label>
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
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
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
    </div>
  );
};

export default Home;
