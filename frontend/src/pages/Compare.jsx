import { useState, useEffect } from 'react';
import { Search, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { formatCount, formatIndianNumber, calculatePerformanceScore } from '../utils/helpers';

const Compare = () => {
  const { language } = useApp();
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistricts, setSelectedDistricts] = useState([]);
  const [comparisonData, setComparisonData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const translations = {
    en: {
      title: 'Compare Districts',
      subtitle: 'See how different districts are performing',
      selectState: 'Select State',
      selectDistricts: 'Select Districts to Compare (up to 3)',
      compare: 'Compare Now',
      metric: 'Metric',
      noSelection: 'Please select at least 2 districts to compare',
      households: 'Families Worked',
      avgDays: 'Avg Days',
      expenditure: 'Total Spent',
      avgWage: 'Avg Wage',
      worksCompleted: 'Works Done',
      performanceScore: 'Performance',
      loadingData: 'Loading comparison data...',
    },
    hi: {
      title: 'जिलों की तुलना करें',
      subtitle: 'देखें कि विभिन्न जिले कैसे प्रदर्शन कर रहे हैं',
      selectState: 'राज्य चुनें',
      selectDistricts: 'तुलना के लिए जिले चुनें (अधिकतम 3)',
      compare: 'अभी तुलना करें',
      metric: 'मापदंड',
      noSelection: 'तुलना करने के लिए कम से कम 2 जिले चुनें',
      households: 'परिवारों ने काम किया',
      avgDays: 'औसत दिन',
      expenditure: 'कुल खर्च',
      avgWage: 'औसत मजदूरी',
      worksCompleted: 'पूर्ण कार्य',
      performanceScore: 'प्रदर्शन',
      loadingData: 'तुलना डेटा लोड हो रहा है...',
    }
  };

  const t = translations[language];

  useEffect(() => {
    fetchStates();
  }, []);

  useEffect(() => {
    if (selectedState) {
      fetchDistricts(selectedState);
    }
  }, [selectedState]);

  const fetchStates = async () => {
    try {
      const response = await apiService.getStates();
      setStates(response.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDistricts = async (stateName) => {
    try {
      setLoading(true);
      const response = await apiService.getDistrictsByState(stateName);
      setDistricts(response.data || []);
      setSelectedDistricts([]);
      setComparisonData([]);
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
      } else if (prev.length < 3) {
        return [...prev, district];
      }
      return prev;
    });
  };

  const handleCompare = async () => {
    if (selectedDistricts.length < 2) {
      alert(t.noSelection);
      return;
    }

    try {
      setLoading(true);
      const dataPromises = selectedDistricts.map(district =>
        apiService.getDistrictData(district.districtCode)
      );
      const responses = await Promise.all(dataPromises);
      
      const comparison = responses.map((response, index) => {
        const records = response.data.records || [];
        const latest = records[0] || {};
        
        const totalHouseholds = records.reduce((sum, r) => sum + Number(r.totalHouseholdsWorked || 0), 0);
        const totalExpenditure = records.reduce((sum, r) => sum + Number(r.totalExpenditure || 0), 0);
        const avgWage = records.reduce((sum, r) => sum + (r.avgWageRate || 0), 0) / records.length;
        const totalWorks = records.reduce((sum, r) => sum + Number(r.totalWorksCompleted || 0), 0);
        const avgDays = records.reduce((sum, r) => sum + (r.avgDaysEmployment || 0), 0) / records.length;

        return {
          district: selectedDistricts[index],
          households: totalHouseholds,
          avgDays: Math.round(avgDays),
          expenditure: totalExpenditure,
          avgWage: Math.round(avgWage),
          worksCompleted: totalWorks,
          performanceScore: calculatePerformanceScore(latest),
        };
      });

      setComparisonData(comparison);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getComparisonIndicator = (values, index) => {
    const max = Math.max(...values);
    const min = Math.min(...values);
    const value = values[index];

    if (value === max && max !== min) {
      return <TrendingUp className="w-5 h-5 text-green-500" />;
    } else if (value === min && max !== min) {
      return <TrendingDown className="w-5 h-5 text-red-500" />;
    }
    return <Minus className="w-5 h-5 text-gray-400" />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            {t.title}
          </h1>
          <p className="text-xl text-gray-600">{t.subtitle}</p>
        </div>

        {/* Selection Panel */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-6">
            {/* State Selection */}
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-3">
                {t.selectState}
              </label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none bg-white"
              >
                <option value="">{language === 'en' ? 'Choose a state...' : 'एक राज्य चुनें...'}</option>
                {states.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Districts Count */}
            <div className="flex items-end">
              <div className="w-full">
                <label className="block text-lg font-semibold text-gray-700 mb-3">
                  {t.selectDistricts}
                </label>
                <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4">
                  <p className="text-lg font-semibold text-orange-800">
                    {language === 'en' ? 'Selected:' : 'चयनित:'} {selectedDistricts.length}/3
                  </p>
                  {selectedDistricts.map(d => (
                    <span key={d.districtCode} className="inline-block bg-orange-200 text-orange-800 px-3 py-1 rounded-lg text-sm mr-2 mt-2">
                      {d.districtName}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Districts Grid */}
          {selectedState && districts.length > 0 && (
            <div className="mt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-96 overflow-y-auto p-2">
                {districts.map((district) => {
                  const isSelected = selectedDistricts.find(d => d.districtCode === district.districtCode);
                  return (
                    <button
                      key={district.districtCode}
                      onClick={() => handleDistrictToggle(district)}
                      className={`p-3 border-2 rounded-lg font-medium transition-all ${
                        isSelected
                          ? 'border-orange-500 bg-orange-100 text-orange-800'
                          : 'border-gray-200 hover:border-orange-300 text-gray-700'
                      }`}
                    >
                      {district.districtName}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Compare Button */}
          <div className="mt-6 text-center">
            <button
              onClick={handleCompare}
              disabled={selectedDistricts.length < 2 || loading}
              className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (language === 'en' ? 'Loading...' : 'लोड हो रहा है...') : t.compare}
            </button>
          </div>
        </div>

        {error && <ErrorMessage message={error} />}

        {/* Comparison Results */}
        {comparisonData.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-lg font-bold text-gray-800">
                      {t.metric}
                    </th>
                    {comparisonData.map((data, index) => (
                      <th key={index} className="px-6 py-4 text-center text-lg font-bold text-gray-800">
                        {data.district.districtName}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Performance Score */}
                  <tr className="border-t">
                    <td className="px-6 py-4 font-semibold text-gray-700">{t.performanceScore}</td>
                    {comparisonData.map((data, index) => (
                      <td key={index} className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          {getComparisonIndicator(
                            comparisonData.map(d => d.performanceScore),
                            index
                          )}
                          <span className="text-2xl font-bold text-purple-600">
                            {data.performanceScore}
                          </span>
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Households */}
                  <tr className="bg-gray-50 border-t">
                    <td className="px-6 py-4 font-semibold text-gray-700">{t.households}</td>
                    {comparisonData.map((data, index) => (
                      <td key={index} className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          {getComparisonIndicator(
                            comparisonData.map(d => d.households),
                            index
                          )}
                          <span className="text-xl font-bold">{formatCount(data.households)}</span>
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Avg Days */}
                  <tr className="border-t">
                    <td className="px-6 py-4 font-semibold text-gray-700">{t.avgDays}</td>
                    {comparisonData.map((data, index) => (
                      <td key={index} className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          {getComparisonIndicator(
                            comparisonData.map(d => d.avgDays),
                            index
                          )}
                          <span className="text-xl font-bold">{data.avgDays}</span>
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Expenditure */}
                  <tr className="bg-gray-50 border-t">
                    <td className="px-6 py-4 font-semibold text-gray-700">{t.expenditure}</td>
                    {comparisonData.map((data, index) => (
                      <td key={index} className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          {getComparisonIndicator(
                            comparisonData.map(d => d.expenditure),
                            index
                          )}
                          <span className="text-xl font-bold">{formatIndianNumber(data.expenditure)}</span>
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Avg Wage */}
                  <tr className="border-t">
                    <td className="px-6 py-4 font-semibold text-gray-700">{t.avgWage}</td>
                    {comparisonData.map((data, index) => (
                      <td key={index} className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          {getComparisonIndicator(
                            comparisonData.map(d => d.avgWage),
                            index
                          )}
                          <span className="text-xl font-bold">₹{data.avgWage}</span>
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Works Completed */}
                  <tr className="bg-gray-50 border-t">
                    <td className="px-6 py-4 font-semibold text-gray-700">{t.worksCompleted}</td>
                    {comparisonData.map((data, index) => (
                      <td key={index} className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          {getComparisonIndicator(
                            comparisonData.map(d => d.worksCompleted),
                            index
                          )}
                          <span className="text-xl font-bold">{formatCount(data.worksCompleted)}</span>
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Compare;
