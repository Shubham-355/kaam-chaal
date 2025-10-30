import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, MapPin, Calendar, GitCompare, BarChart3 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { formatCount, formatIndianNumber, calculatePerformanceScore } from '../utils/helpers';

const Compare = () => {
  const { language } = useApp();
  const [comparisonMode, setComparisonMode] = useState('districts');
  const [states, setStates] = useState([]);
  
  // For district comparison
  const [selectedState, setSelectedState] = useState('');
  const [districts, setDistricts] = useState([]);
  const [selectedDistricts, setSelectedDistricts] = useState([]);
  
  // For state comparison
  const [selectedStates, setSelectedStates] = useState([]);
  
  // For year comparison
  const [yearComparisonState, setYearComparisonState] = useState('');
  const [yearComparisonDistrict, setYearComparisonDistrict] = useState(null);
  const [yearDistricts, setYearDistricts] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]);
  const availableYears = ['2024-25', '2023-24', '2022-23', '2021-22', '2020-21'];
  
  const [comparisonData, setComparisonData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const translations = {
    en: {
      title: 'Compare MGNREGA Performance',
      subtitle: 'Analyze and compare data across districts, states, or years',
      compareDistricts: 'Compare Districts',
      compareStates: 'Compare States',
      compareYears: 'Compare Years',
      selectState: 'Select State',
      selectDistricts: 'Select Districts to Compare (2-4)',
      selectStates: 'Select States to Compare (2-4)',
      selectDistrictForYear: 'Select District',
      selectYears: 'Select Years to Compare (2-3)',
      compare: 'Compare Now',
      metric: 'Metric',
      noSelection: 'Please make proper selections to compare',
      households: 'Families Worked',
      avgDays: 'Avg Days/Family',
      expenditure: 'Total Expenditure',
      avgWage: 'Avg Daily Wage',
      worksCompleted: 'Works Completed',
      performanceScore: 'Performance Score',
      loadingData: 'Loading comparison data...',
      selected: 'Please select at least 2 districts/states/years to compare',
      districtMode: 'Compare multiple districts within a state',
      stateMode: 'Compare overall performance across states',
      yearMode: 'Compare same district across different years',
      best: 'Best',
      worst: 'Worst',
    },
    hi: {
      title: 'मनरेगा प्रदर्शन की तुलना करें',
      subtitle: 'जिलों, राज्यों या वर्षों में डेटा का विश्लेषण और तुलना करें',
      compareDistricts: 'जिलों की तुलना',
      compareStates: 'राज्यों की तुलना',
      compareYears: 'वर्षों की तुलना',
      selectState: 'राज्य चुनें',
      selectDistricts: 'तुलना के लिए जिले चुनें (2-4)',
      selectStates: 'तुलना के लिए राज्य चुनें (2-4)',
      selectDistrictForYear: 'जिला चुनें',
      selectYears: 'तुलना के लिए वर्ष चुनें (2-3)',
      compare: 'अभी तुलना करें',
      metric: 'मापदंड',
      noSelection: 'तुलना करने के लिए उचित चयन करें',
      households: 'परिवारों ने काम किया',
      avgDays: 'औसत दिन/परिवार',
      expenditure: 'कुल व्यय',
      avgWage: 'औसत दैनिक मजदूरी',
      worksCompleted: 'पूर्ण कार्य',
      performanceScore: 'प्रदर्शन स्कोर',
      loadingData: 'तुलना डेटा लोड हो रहा है...',
      selected: 'कृपया तुलना करने के लिए कम से कम 2 जिले/राज्य/वर्ष चुनें',
      districtMode: 'एक राज्य के भीतर कई जिलों की तुलना करें',
      stateMode: 'राज्यों में समग्र प्रदर्शन की तुलना करें',
      yearMode: 'विभिन्न वर्षों में एक ही जिले की तुलना करें',
      best: 'सर्वश्रेष्ठ',
      worst: 'सबसे खराब',
    }
  };

  const t = translations[language];

  useEffect(() => {
    fetchStates();
  }, []);

  useEffect(() => {
    if (comparisonMode === 'districts' && selectedState) {
      fetchDistricts(selectedState);
    }
  }, [selectedState, comparisonMode]);

  useEffect(() => {
    if (comparisonMode === 'years' && yearComparisonState) {
      fetchYearDistricts(yearComparisonState);
    }
  }, [yearComparisonState, comparisonMode]);

  const fetchStates = async () => {
    try {
      const response = await apiService.getStates();
      setStates(response.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load states');
    }
  };

  const fetchDistricts = async (stateName) => {
    try {
      setLoading(true);
      const response = await apiService.getDistrictsByState(stateName);
      setDistricts(response.data || []);
      setSelectedDistricts([]);
      setComparisonData([]);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchYearDistricts = async (stateName) => {
    try {
      setLoading(true);
      const response = await apiService.getDistrictsByState(stateName);
      setYearDistricts(response.data || []);
      setYearComparisonDistrict(null);
      setSelectedYears([]);
      setComparisonData([]);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDistrictToggle = (district) => {
    setSelectedDistricts(prev => {
      const exists = prev.find(d => d.districtCode === district.districtCode);
      if (exists) {
        return prev.filter(d => d.districtCode !== district.districtCode);
      } else if (prev.length < 4) {
        return [...prev, district];
      }
      return prev;
    });
  };

  const handleStateToggle = (state) => {
    setSelectedStates(prev => {
      const exists = prev.includes(state);
      if (exists) {
        return prev.filter(s => s !== state);
      } else if (prev.length < 4) {
        return [...prev, state];
      }
      return prev;
    });
  };

  const handleYearToggle = (year) => {
    setSelectedYears(prev => {
      const exists = prev.includes(year);
      if (exists) {
        return prev.filter(y => y !== year);
      } else if (prev.length < 3) {
        return [...prev, year];
      }
      return prev;
    });
  };

  const handleCompare = async () => {
    if (comparisonMode === 'districts' && selectedDistricts.length < 2) {
      alert(t.noSelection);
      return;
    }
    if (comparisonMode === 'states' && selectedStates.length < 2) {
      alert(t.noSelection);
      return;
    }
    if (comparisonMode === 'years' && (selectedYears.length < 2 || !yearComparisonDistrict)) {
      alert(t.noSelection);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (comparisonMode === 'districts') {
        const dataPromises = selectedDistricts.map(district =>
          apiService.getDistrictData(district.districtCode)
        );
        const responses = await Promise.all(dataPromises);
        
        const comparison = responses.map((response, index) => {
          const records = response.data?.records || [];
          const latest = records[0] || {};
          
          const totalHouseholds = records.reduce((sum, r) => sum + Number(r.totalHouseholdsWorked || 0), 0);
          const totalExpenditure = records.reduce((sum, r) => sum + Number(r.totalExpenditure || 0), 0);
          const avgWage = records.length > 0 ? records.reduce((sum, r) => sum + (r.avgWageRate || 0), 0) / records.length : 0;
          const totalWorks = records.reduce((sum, r) => sum + Number(r.totalWorksCompleted || 0), 0);
          const avgDays = records.length > 0 ? records.reduce((sum, r) => sum + (r.avgDaysEmployment || 0), 0) / records.length : 0;

          return {
            name: selectedDistricts[index].districtName,
            households: totalHouseholds,
            avgDays: Math.round(avgDays * 10) / 10,
            expenditure: totalExpenditure,
            avgWage: Math.round(avgWage),
            worksCompleted: totalWorks,
            performanceScore: calculatePerformanceScore(latest),
          };
        });

        setComparisonData(comparison);
      } else if (comparisonMode === 'states') {
        const dataPromises = selectedStates.map(async (stateName) => {
          const districtsResponse = await apiService.getDistrictsByState(stateName);
          const stateDistricts = districtsResponse.data || [];
          
          const districtDataPromises = stateDistricts.slice(0, 10).map(d =>
            apiService.getDistrictData(d.districtCode).catch(() => ({ data: { records: [] } }))
          );
          const districtResponses = await Promise.all(districtDataPromises);
          
          let totalHouseholds = 0;
          let totalExpenditure = 0;
          let totalWage = 0;
          let totalWorks = 0;
          let totalDays = 0;
          let recordCount = 0;
          let scoreCount = 0;
          let totalScore = 0;
          
          districtResponses.forEach(response => {
            const records = response.data?.records || [];
            records.forEach(r => {
              totalHouseholds += Number(r.totalHouseholdsWorked || 0);
              totalExpenditure += Number(r.totalExpenditure || 0);
              totalWage += Number(r.avgWageRate || 0);
              totalWorks += Number(r.totalWorksCompleted || 0);
              totalDays += Number(r.avgDaysEmployment || 0);
              recordCount++;
              
              const score = calculatePerformanceScore(r);
              if (score > 0) {
                totalScore += score;
                scoreCount++;
              }
            });
          });
          
          return {
            name: stateName,
            households: totalHouseholds,
            avgDays: recordCount > 0 ? Math.round((totalDays / recordCount) * 10) / 10 : 0,
            expenditure: totalExpenditure,
            avgWage: recordCount > 0 ? Math.round(totalWage / recordCount) : 0,
            worksCompleted: totalWorks,
            performanceScore: scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0,
          };
        });
        
        const comparison = await Promise.all(dataPromises);
        setComparisonData(comparison);
      } else if (comparisonMode === 'years') {
        const dataPromises = selectedYears.map(year =>
          apiService.getDistrictData(yearComparisonDistrict.districtCode, year)
        );
        const responses = await Promise.all(dataPromises);
        
        const comparison = responses.map((response, index) => {
          const records = response.data?.records || [];
          const latest = records[0] || {};
          
          const totalHouseholds = records.reduce((sum, r) => sum + Number(r.totalHouseholdsWorked || 0), 0);
          const totalExpenditure = records.reduce((sum, r) => sum + Number(r.totalExpenditure || 0), 0);
          const avgWage = records.length > 0 ? records.reduce((sum, r) => sum + (r.avgWageRate || 0), 0) / records.length : 0;
          const totalWorks = records.reduce((sum, r) => sum + Number(r.totalWorksCompleted || 0), 0);
          const avgDays = records.length > 0 ? records.reduce((sum, r) => sum + (r.avgDaysEmployment || 0), 0) / records.length : 0;

          return {
            name: selectedYears[index],
            households: totalHouseholds,
            avgDays: Math.round(avgDays * 10) / 10,
            expenditure: totalExpenditure,
            avgWage: Math.round(avgWage),
            worksCompleted: totalWorks,
            performanceScore: calculatePerformanceScore(latest),
          };
        });

        setComparisonData(comparison);
      }
    } catch (err) {
      console.error('Comparison error:', err);
      setError(err.message || 'Failed to fetch comparison data');
    } finally {
      setLoading(false);
    }
  };

  const getComparisonIndicator = (values, index, higherIsBetter = true) => {
    const numericValues = values.filter(v => typeof v === 'number' && !isNaN(v));
    if (numericValues.length === 0) return <Minus className="w-5 h-5 text-gray-400" />;
    
    const max = Math.max(...numericValues);
    const min = Math.min(...numericValues);
    const value = values[index];

    if (typeof value !== 'number' || isNaN(value)) {
      return <Minus className="w-5 h-5 text-gray-400" />;
    }

    if (value === max && max !== min) {
      return higherIsBetter ? (
        <TrendingUp className="w-5 h-5 text-green-500" />
      ) : (
        <TrendingDown className="w-5 h-5 text-red-500" />
      );
    } else if (value === min && max !== min) {
      return higherIsBetter ? (
        <TrendingDown className="w-5 h-5 text-red-500" />
      ) : (
        <TrendingUp className="w-5 h-5 text-green-500" />
      );
    }
    return <Minus className="w-5 h-5 text-gray-400" />;
  };

  const handleModeChange = (mode) => {
    setComparisonMode(mode);
    setComparisonData([]);
    setError(null);
    // Reset selections based on mode
    if (mode === 'districts') {
      setSelectedStates([]);
      setYearComparisonDistrict(null);
      setSelectedYears([]);
    } else if (mode === 'states') {
      setSelectedDistricts([]);
      setYearComparisonDistrict(null);
      setSelectedYears([]);
    } else if (mode === 'years') {
      setSelectedDistricts([]);
      setSelectedStates([]);
    }
  };

  const comparisonModes = [
    { mode: 'districts', icon: MapPin, label: t.compareDistricts },
    { mode: 'states', icon: BarChart3, label: t.compareStates },
    { mode: 'years', icon: Calendar, label: t.compareYears },
  ];

  return (
    <div className="min-h-screen md:px-20 lg:px-23" style={{ backgroundColor: '#fff9f1' }}>
      <div className="container mx-auto px-8 py-10 md:py-12">
        {/* Minimal Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            {t.title}
          </h1>
          <p className="text-gray-600">
            {t.subtitle}
          </p>
        </div>

        {/* Minimal Mode Tabs */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-8 max-w-3xl mx-auto">
          <div className="grid grid-cols-3 gap-2">
            {comparisonModes.map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                onClick={() => handleModeChange(mode)}
                className={`flex flex-col items-center justify-center p-3 rounded-lg font-medium text-sm transition-colors ${
                  comparisonMode === mode
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span>{label}</span>
              </button>
            ))}
          </div>
          <p className="text-center text-xs text-gray-600 mt-3">
            {comparisonMode === 'districts' && t.districtMode}
            {comparisonMode === 'states' && t.stateMode}
            {comparisonMode === 'years' && t.yearMode}
          </p>
        </div>

        {/* Error & Loading */}
        {error && !loading && (
          <div className="mb-6">
            <ErrorMessage message={error} onRetry={() => setError(null)} />
          </div>
        )}

        {loading && (
          <div className="mb-6">
            <LoadingSpinner message={t.loadingData} />
          </div>
        )}

        {/* Selection Forms - Minimal */}
        <AnimatePresence mode="wait">
          {comparisonMode === 'districts' && (
            <motion.div
              key="districts"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white border border-gray-200 rounded-xl p-6 mb-8"
            >
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.selectState}
                  </label>
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-orange-500 focus:ring-1 focus:ring-orange-200 focus:outline-none text-sm"
                  >
                    <option value="">{language === 'en' ? 'Choose...' : 'चुनें...'}</option>
                    {states.map((state) => (
                      <option key={state.stateCode || state.stateName} value={state.stateName}>
                        {state.stateName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.selectDistricts}
                  </label>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <p className="text-xs font-medium text-orange-800">
                      {t.selected}: {selectedDistricts.length}/4
                    </p>
                    {selectedDistricts.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {selectedDistricts.map(d => (
                          <span key={d.districtCode} className="text-xs bg-white text-orange-800 px-2 py-0.5 rounded">
                            {d.districtName}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {selectedState && districts.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-80 overflow-y-auto p-2 border border-gray-200 rounded-lg bg-gray-50 mb-4">
                  {districts.map((district) => {
                    const isSelected = selectedDistricts.find(d => d.districtCode === district.districtCode);
                    return (
                      <button
                        key={district.districtCode}
                        onClick={() => handleDistrictToggle(district)}
                        disabled={!isSelected && selectedDistricts.length >= 4}
                        className={`p-2 text-xs border rounded-lg font-medium transition-colors ${
                          isSelected
                            ? 'border-orange-500 bg-orange-50 text-orange-800'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700 disabled:opacity-50'
                        }`}
                      >
                        {district.districtName}
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="text-center">
                <button
                  onClick={handleCompare}
                  disabled={selectedDistricts.length < 2 || loading}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 inline-flex items-center space-x-2"
                >
                  <GitCompare className="w-4 h-4" />
                  <span>{loading ? '...' : t.compare}</span>
                </button>
              </div>
            </motion.div>
          )}

          {comparisonMode === 'states' && (
            <motion.div
              key="states"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white border border-gray-200 rounded-xl p-6 mb-8"
            >
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.selectStates}
                </label>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                  <p className="text-xs font-medium text-orange-800">
                    {t.selected}: {selectedStates.length}/4
                  </p>
                  {selectedStates.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {selectedStates.map(s => (
                        <span key={s} className="text-xs bg-white text-orange-800 px-2 py-0.5 rounded">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-80 overflow-y-auto p-2 border border-gray-200 rounded-lg bg-gray-50">
                {states.map((state) => {
                  const isSelected = selectedStates.includes(state.stateName);
                  return (
                    <button
                      key={state.stateCode || state.stateName}
                      onClick={() => handleStateToggle(state.stateName)}
                      disabled={!isSelected && selectedStates.length >= 4}
                      className={`p-2 text-xs border rounded-lg font-medium transition-colors ${
                        isSelected
                          ? 'border-orange-500 bg-orange-50 text-orange-800'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700 disabled:opacity-50'
                      }`}
                    >
                      {state.stateName}
                    </button>
                  );
                })}
              </div>

              <div className="text-center">
                <button
                  onClick={handleCompare}
                  disabled={selectedStates.length < 2 || loading}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 inline-flex items-center space-x-2"
                >
                  <GitCompare className="w-4 h-4" />
                  <span>{loading ? '...' : t.compare}</span>
                </button>
              </div>
            </motion.div>
          )}

          {comparisonMode === 'years' && (
            <motion.div
              key="years"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white border border-gray-200 rounded-xl p-6 mb-8"
            >
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.selectState}
                  </label>
                  <select
                    value={yearComparisonState}
                    onChange={(e) => setYearComparisonState(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-orange-500 focus:ring-1 focus:ring-orange-200 focus:outline-none text-sm"
                  >
                    <option value="">{language === 'en' ? 'Choose...' : 'चुनें...'}</option>
                    {states.map((state) => (
                      <option key={state.stateCode || state.stateName} value={state.stateName}>
                        {state.stateName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.selectDistrictForYear}
                  </label>
                  <select
                    value={yearComparisonDistrict?.districtCode || ''}
                    onChange={(e) => {
                      const district = yearDistricts.find(d => d.districtCode === e.target.value);
                      setYearComparisonDistrict(district || null);
                    }}
                    disabled={!yearComparisonState}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-orange-500 focus:ring-1 focus:ring-orange-200 focus:outline-none text-sm disabled:opacity-50"
                  >
                    <option value="">{language === 'en' ? 'Choose...' : 'चुनें...'}</option>
                    {yearDistricts.map((district) => (
                      <option key={district.districtCode} value={district.districtCode}>
                        {district.districtName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.selectYears}
                </label>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                  <p className="text-xs font-medium text-orange-800">
                    {t.selected}: {selectedYears.length}/3
                  </p>
                  {selectedYears.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {selectedYears.map(y => (
                        <span key={y} className="text-xs bg-white text-orange-800 px-2 py-0.5 rounded">
                          {y}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                {availableYears.map((year) => {
                  const isSelected = selectedYears.includes(year);
                  return (
                    <button
                      key={year}
                      onClick={() => handleYearToggle(year)}
                      disabled={(!isSelected && selectedYears.length >= 3) || !yearComparisonDistrict}
                      className={`p-3 text-sm border rounded-lg font-medium transition-colors ${
                        isSelected
                          ? 'border-orange-500 bg-orange-50 text-orange-800'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700 disabled:opacity-50'
                      }`}
                    >
                      {year}
                    </button>
                  );
                })}
              </div>

              <div className="text-center mt-4">
                <button
                  onClick={handleCompare}
                  disabled={selectedYears.length < 2 || !yearComparisonDistrict || loading}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 inline-flex items-center space-x-2"
                >
                  <GitCompare className="w-4 h-4" />
                  <span>{loading ? '...' : t.compare}</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results - Minimal */}
        <AnimatePresence>
          {!loading && comparisonData.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Summary Cards - Minimal */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {comparisonData.map((data, index) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:border-orange-300 transition-colors"
                  >
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">
                        {comparisonMode === 'districts' && (language === 'en' ? 'District' : 'जिला')}
                        {comparisonMode === 'states' && (language === 'en' ? 'State' : 'राज्य')}
                        {comparisonMode === 'years' && (language === 'en' ? 'Year' : 'वर्ष')}
                      </p>
                      <p className="font-bold text-sm text-orange-600 line-clamp-1 mb-2">
                        {data.name}
                      </p>
                      <p className="text-2xl font-bold text-gray-800">{data.performanceScore}</p>
                      <p className="text-xs text-gray-500">{t.performanceScore}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Table - Minimal */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 sticky left-0 bg-gray-50">
                          {t.metric}
                        </th>
                        {comparisonData.map((data, index) => (
                          <th key={index} className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                            <div className="truncate max-w-[100px]" title={data.name}>
                              {data.name}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-700 sticky left-0 bg-white">
                          {t.performanceScore}
                        </td>
                        {comparisonData.map((data, index) => (
                          <td key={index} className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center space-x-1">
                              {getComparisonIndicator(
                                comparisonData.map(d => d.performanceScore),
                                index,
                                true
                              )}
                              <span className="text-lg font-bold text-gray-800">
                                {data.performanceScore}
                              </span>
                            </div>
                          </td>
                        ))}
                      </tr>

                      <tr className="bg-gray-50 border-b hover:bg-gray-100">
                        <td className="px-4 py-3 text-sm font-medium text-gray-700 sticky left-0 bg-gray-50">
                          {t.households}
                        </td>
                        {comparisonData.map((data, index) => (
                          <td key={index} className="px-4 py-3 text-center">
                            <div className="flex flex-col items-center space-y-1">
                              <div className="flex items-center space-x-2">
                                {getComparisonIndicator(
                                  comparisonData.map(d => d.households),
                                  index,
                                  true
                                )}
                                <span className="text-xl font-bold text-blue-600">
                                  {formatCount(data.households)}
                                </span>
                              </div>
                            </div>
                          </td>
                        ))}
                      </tr>

                      <tr className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-700 sticky left-0 bg-white">
                          {t.avgDays}
                        </td>
                        {comparisonData.map((data, index) => (
                          <td key={index} className="px-4 py-3 text-center">
                            <div className="flex flex-col items-center space-y-1">
                              <div className="flex items-center space-x-2">
                                {getComparisonIndicator(
                                  comparisonData.map(d => d.avgDays),
                                  index,
                                  true
                                )}
                                <span className="text-xl font-bold text-green-600">
                                  {data.avgDays}
                                </span>
                              </div>
                            </div>
                          </td>
                        ))}
                      </tr>

                      <tr className="bg-gray-50 border-b hover:bg-gray-100">
                        <td className="px-4 py-3 text-sm font-medium text-gray-700 sticky left-0 bg-gray-50">
                          {t.expenditure}
                        </td>
                        {comparisonData.map((data, index) => (
                          <td key={index} className="px-4 py-3 text-center">
                            <div className="flex flex-col items-center space-y-1">
                              <div className="flex items-center space-x-2">
                                {getComparisonIndicator(
                                  comparisonData.map(d => d.expenditure),
                                  index,
                                  true
                                )}
                                <span className="text-xl font-bold text-indigo-600">
                                  ₹{formatIndianNumber(data.expenditure)}
                                </span>
                              </div>
                            </div>
                          </td>
                        ))}
                      </tr>

                      <tr className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-700 sticky left-0 bg-white">
                          {t.avgWage}
                        </td>
                        {comparisonData.map((data, index) => (
                          <td key={index} className="px-4 py-3 text-center">
                            <div className="flex flex-col items-center space-y-1">
                              <div className="flex items-center space-x-2">
                                {getComparisonIndicator(
                                  comparisonData.map(d => d.avgWage),
                                  index,
                                  true
                                )}
                                <span className="text-xl font-bold text-orange-600">
                                  ₹{data.avgWage}
                                </span>
                              </div>
                            </div>
                          </td>
                        ))}
                      </tr>

                      <tr className="bg-gray-50 border-b hover:bg-gray-100">
                        <td className="px-4 py-3 text-sm font-medium text-gray-700 sticky left-0 bg-gray-50">
                          {t.worksCompleted}
                        </td>
                        {comparisonData.map((data, index) => (
                          <td key={index} className="px-4 py-3 text-center">
                            <div className="flex flex-col items-center space-y-1">
                              <div className="flex items-center space-x-2">
                                {getComparisonIndicator(
                                  comparisonData.map(d => d.worksCompleted),
                                  index,
                                  true
                                )}
                                <span className="text-xl font-bold text-teal-600">
                                  {formatCount(data.worksCompleted)}
                                </span>
                              </div>
                            </div>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Best/Worst - Minimal */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                  <h3 className="text-sm font-semibold text-green-800 mb-3 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    {t.best} {t.performanceScore}
                  </h3>
                  {(() => {
                    const best = comparisonData.reduce((prev, current) => 
                      (current.performanceScore > prev.performanceScore) ? current : prev
                    );
                    return (
                      <div>
                        <p className="text-lg font-bold text-green-700 mb-1">{best.name}</p>
                        <p className="text-3xl font-bold text-green-600">{best.performanceScore}</p>
                      </div>
                    );
                  })()}
                </div>

                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                  <h3 className="text-sm font-semibold text-red-800 mb-3 flex items-center">
                    <TrendingDown className="w-4 h-4 mr-2" />
                    {t.worst} {t.performanceScore}
                  </h3>
                  {(() => {
                    const worst = comparisonData.reduce((prev, current) => 
                      (current.performanceScore < prev.performanceScore) ? current : prev
                    );
                    return (
                      <div>
                        <p className="text-lg font-bold text-red-700 mb-1">{worst.name}</p>
                        <p className="text-3xl font-bold text-red-600">{worst.performanceScore}</p>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Compare;
                      