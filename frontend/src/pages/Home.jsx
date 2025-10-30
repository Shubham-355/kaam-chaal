import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Search, TrendingUp, Users, Briefcase, IndianRupee } from 'lucide-react';
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
            const { state, state_district } = locationData.address;
            setUserLocation({ latitude, longitude, state, district: state_district });
            
            // Try to auto-select state and district
            if (state) {
              const matchedState = states.find(s => 
                s.toLowerCase().includes(state.toLowerCase()) || 
                state.toLowerCase().includes(s.toLowerCase())
              );
              if (matchedState) {
                setSelectedState(matchedState);
              }
            }
            
            alert(`${t.locationDetected}: ${state_district}, ${state}`);
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
      }
    );
  };

  const handleDistrictSelect = (district) => {
    setSelectedDistrict(district);
    navigate('/dashboard');
  };

  const features = [
    { icon: Users, title: t.feature1Title, description: t.feature1Desc, color: 'orange' },
    { icon: IndianRupee, title: t.feature2Title, description: t.feature2Desc, color: 'green' },
    { icon: Briefcase, title: t.feature3Title, description: t.feature3Desc, color: 'blue' },
    { icon: TrendingUp, title: t.feature4Title, description: t.feature4Desc, color: 'purple' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-500 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              {t.title}
            </h1>
            <p className="text-xl md:text-2xl text-orange-100 leading-relaxed">
              {t.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Selection Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
          {/* Auto Detect Location */}
          <button
            onClick={handleDetectLocation}
            disabled={detectingLocation}
            className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-6 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MapPin className="w-6 h-6" />
            <span>{detectingLocation ? (language === 'en' ? 'Detecting...' : 'खोज रहे हैं...') : t.detectLocation}</span>
          </button>

          <div className="flex items-center my-8">
            <div className="flex-1 border-t-2 border-gray-300"></div>
            <span className="px-4 text-gray-500 font-semibold">{t.orSelect}</span>
            <div className="flex-1 border-t-2 border-gray-300"></div>
          </div>

          {error && <ErrorMessage message={error} onRetry={fetchStates} />}

          {/* State Selection */}
          <div className="space-y-6">
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-3">
                {t.selectState}
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none appearance-none bg-white cursor-pointer"
                  disabled={loading}
                >
                  <option value="">{language === 'en' ? 'Choose a state...' : 'एक राज्य चुनें...'}</option>
                  {states.map((state) => (
                    <option key={state.stateCode || state.stateName} value={state.stateName}>
                      {state.stateName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* District Selection */}
            {selectedState && (
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-3">
                  {t.selectDistrict}
                </label>
                {loading ? (
                  <LoadingSpinner message={language === 'en' ? 'Loading districts...' : 'जिले लोड हो रहे हैं...'} size="small" />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto p-2">
                    {districts.map((district) => (
                      <button
                        key={district.districtCode}
                        onClick={() => handleDistrictSelect(district)}
                        className="text-left p-4 border-2 border-gray-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all font-medium"
                      >
                        {district.districtName}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12">
            {t.features}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const colorClasses = {
                orange: 'bg-orange-100 text-orange-600',
                green: 'bg-green-100 text-green-600',
                blue: 'bg-blue-100 text-blue-600',
                purple: 'bg-purple-100 text-purple-600',
              };
              
              return (
                <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className={`${colorClasses[feature.color]} w-14 h-14 rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
