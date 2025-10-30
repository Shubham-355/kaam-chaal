import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, IndianRupee, Briefcase, TrendingUp, Calendar, 
  Award, AlertCircle, ChevronRight, ArrowLeft 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import StatCard from '../components/StatCard';
import InfoTooltip from '../components/InfoTooltip';
import { 
  formatIndianNumber, formatCount, formatPercentage,
  calculatePerformanceScore, getPerformanceRating, metricExplanations 
} from '../utils/helpers';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const Dashboard = () => {
  const navigate = useNavigate();
  const { language, selectedDistrict } = useApp();
  const [districtData, setDistrictData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState('');

  const translations = {
    en: {
      backToHome: 'Back to Home',
      selectYear: 'Select Financial Year',
      allYears: 'All Years',
      performanceScore: 'Performance Score',
      keyMetrics: 'Key Metrics',
      employment: 'Employment',
      householdsWorked: 'Families Worked',
      avgDays: 'Avg Days per Family',
      financial: 'Financial',
      totalSpent: 'Total Spent',
      avgWage: 'Avg Daily Wage',
      works: 'Works Progress',
      completed: 'Completed',
      ongoing: 'Ongoing',
      inclusion: 'Social Inclusion',
      womenWork: 'Women Work Days',
      scWorkers: 'SC Workers',
      stWorkers: 'ST Workers',
      trends: 'Historical Trends',
      monthlyEmployment: 'Monthly Employment',
      expenditure: 'Monthly Expenditure',
      noData: 'No data available for this district',
      loadingData: 'Loading district data...',
    },
    hi: {
      backToHome: 'होम पर वापस जाएं',
      selectYear: 'वित्तीय वर्ष चुनें',
      allYears: 'सभी वर्ष',
      performanceScore: 'प्रदर्शन स्कोर',
      keyMetrics: 'मुख्य आंकड़े',
      employment: 'रोजगार',
      householdsWorked: 'परिवारों ने काम किया',
      avgDays: 'प्रति परिवार औसत दिन',
      financial: 'वित्तीय',
      totalSpent: 'कुल खर्च',
      avgWage: 'औसत दैनिक मजदूरी',
      works: 'कार्यों की प्रगति',
      completed: 'पूर्ण',
      ongoing: 'चालू',
      inclusion: 'सामाजिक समावेश',
      womenWork: 'महिला कार्य दिवस',
      scWorkers: 'अनुसूचित जाति श्रमिक',
      stWorkers: 'अनुसूचित जनजाति श्रमिक',
      trends: 'ऐतिहासिक रुझान',
      monthlyEmployment: 'मासिक रोजगार',
      expenditure: 'मासिक व्यय',
      noData: 'इस जिले के लिए कोई डेटा उपलब्ध नहीं है',
      loadingData: 'जिला डेटा लोड हो रहा है...',
    }
  };

  const t = translations[language];

  useEffect(() => {
    if (!selectedDistrict) {
      navigate('/');
      return;
    }
    fetchDistrictData();
  }, [selectedDistrict, selectedYear]);

  const fetchDistrictData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getDistrictData(
        selectedDistrict.districtCode,
        selectedYear || null
      );
      // API returns { success: true, data: [...] }
      // Transform to the expected format
      const records = Array.isArray(response.data) ? response.data : [];
      setDistrictData({ records });
      setError(null);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err.response?.data?.error?.message || err.message || 'Failed to load district data');
    } finally {
      setLoading(false);
    }
  };

  if (!selectedDistrict) {
    return null;
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <LoadingSpinner message={t.loadingData} size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <ErrorMessage message={error} onRetry={fetchDistrictData} />
      </div>
    );
  }

  if (!districtData || !districtData.records || districtData.records.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-8 text-center">
          <AlertCircle className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-yellow-800 mb-2">{t.noData}</h2>
          <button
            onClick={() => navigate('/')}
            className="mt-4 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            {t.backToHome}
          </button>
        </div>
      </div>
    );
  }

  const latestRecord = districtData.records[0];
  const allRecords = districtData.records;

  // Calculate aggregated stats
  const totalHouseholds = allRecords.reduce((sum, r) => sum + Number(r.totalHouseholdsWorked || 0), 0);
  const totalExpenditure = allRecords.reduce((sum, r) => sum + Number(r.totalExpenditure || 0), 0);
  const avgWageRate = allRecords.reduce((sum, r) => sum + (r.avgWageRate || 0), 0) / allRecords.length;
  const totalWorksCompleted = allRecords.reduce((sum, r) => sum + Number(r.totalWorksCompleted || 0), 0);
  const totalWorksOngoing = allRecords.reduce((sum, r) => sum + Number(r.totalWorksOngoing || 0), 0);
  const avgDaysEmployment = allRecords.reduce((sum, r) => sum + (r.avgDaysEmployment || 0), 0) / allRecords.length;
  
  const performanceScore = calculatePerformanceScore(latestRecord);
  const performanceRating = getPerformanceRating(performanceScore);

  // Prepare chart data
  const monthlyData = allRecords.slice(0, 12).reverse().map(record => ({
    month: record.month,
    households: Number(record.totalHouseholdsWorked || 0),
    expenditure: Number(record.totalExpenditure || 0) / 10000000, // Convert to crores
    wage: Number(record.avgWageRate || 0),
  }));

  // Works distribution
  const worksData = [
    { name: language === 'en' ? 'Completed' : 'पूर्ण', value: Number(totalWorksCompleted) },
    { name: language === 'en' ? 'Ongoing' : 'चालू', value: Number(totalWorksOngoing) },
  ];

  const COLORS = ['#10b981', '#f59e0b'];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 font-semibold mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{t.backToHome}</span>
          </button>
          
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                  {selectedDistrict.districtName}
                </h1>
                <p className="text-lg text-gray-600 mt-1">{selectedDistrict.stateName}</p>
              </div>
              
              <div className="mt-4 md:mt-0">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.selectYear}
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none bg-white"
                >
                  <option value="">{t.allYears}</option>
                  {[...new Set(allRecords.map(r => r.finYear))].map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Performance Score */}
            <div className="mt-6 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 border-2 border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-purple-800 mb-1">
                    {t.performanceScore}
                  </h3>
                  <div className="flex items-center space-x-3">
                    <span className="text-5xl font-bold text-purple-900">{performanceScore}</span>
                    <span className="text-2xl text-purple-700">/100</span>
                  </div>
                  <div className="mt-2 flex items-center space-x-2">
                    <span className="text-3xl">{performanceRating.emoji}</span>
                    <span className="text-xl font-semibold text-purple-800">{performanceRating.label}</span>
                  </div>
                </div>
                <Award className="w-24 h-24 text-purple-300" />
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <h2 className="text-2xl font-bold text-gray-800 mb-6">{t.keyMetrics}</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Users}
            title={t.householdsWorked}
            value={formatCount(totalHouseholds)}
            subtitle={t.employment}
            color="orange"
            info={
              <InfoTooltip text={metricExplanations.totalHouseholdsWorked[language]} />
            }
          />
          
          <StatCard
            icon={Calendar}
            title={t.avgDays}
            value={Math.round(avgDaysEmployment)}
            subtitle={language === 'en' ? 'days' : 'दिन'}
            color="blue"
            info={
              <InfoTooltip text={metricExplanations.avgDaysEmployment[language]} />
            }
          />
          
          <StatCard
            icon={IndianRupee}
            title={t.totalSpent}
            value={formatIndianNumber(totalExpenditure)}
            subtitle={t.financial}
            color="green"
            info={
              <InfoTooltip text={metricExplanations.totalExpenditure[language]} />
            }
          />
          
          <StatCard
            icon={TrendingUp}
            title={t.avgWage}
            value={`₹${Math.round(avgWageRate)}`}
            subtitle={language === 'en' ? 'per day' : 'प्रति दिन'}
            color="purple"
            info={
              <InfoTooltip text={metricExplanations.avgWageRate[language]} />
            }
          />
        </div>

        {/* Works Progress */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <Briefcase className="w-6 h-6 mr-2 text-orange-600" />
              {t.works}
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                <p className="text-sm text-green-700 font-semibold mb-1">{t.completed}</p>
                <p className="text-3xl font-bold text-green-800">{formatCount(totalWorksCompleted)}</p>
              </div>
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                <p className="text-sm text-yellow-700 font-semibold mb-1">{t.ongoing}</p>
                <p className="text-3xl font-bold text-yellow-800">{formatCount(totalWorksOngoing)}</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={worksData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {worksData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Social Inclusion */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6">{t.inclusion}</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-semibold text-gray-700">{t.womenWork}</span>
                  <span className="font-bold text-gray-800">
                    {formatCount(latestRecord.womenPersondays)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-pink-500 h-3 rounded-full"
                    style={{
                      width: `${Math.min(
                        (Number(latestRecord.womenPersondays) /
                          Number(latestRecord.totalHouseholdsWorked)) *
                          10,
                        100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-semibold text-gray-700">{t.scWorkers}</span>
                  <span className="font-bold text-gray-800">
                    {formatCount(latestRecord.scWorkers)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-500 h-3 rounded-full"
                    style={{
                      width: `${Math.min(
                        (Number(latestRecord.scWorkers) /
                          Number(latestRecord.totalActiveWorkers)) *
                          100,
                        100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-semibold text-gray-700">{t.stWorkers}</span>
                  <span className="font-bold text-gray-800">
                    {formatCount(latestRecord.stWorkers)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-500 h-3 rounded-full"
                    style={{
                      width: `${Math.min(
                        (Number(latestRecord.stWorkers) /
                          Number(latestRecord.totalActiveWorkers)) *
                          100,
                        100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Historical Trends */}
        {monthlyData.length > 1 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6">{t.trends}</h3>
            
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-700 mb-4">{t.monthlyEmployment}</h4>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="households" 
                    stroke="#f97316" 
                    strokeWidth={3}
                    name={language === 'en' ? 'Households' : 'परिवार'}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-700 mb-4">{t.expenditure} (₹ Crores)</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar 
                    dataKey="expenditure" 
                    fill="#10b981"
                    name={language === 'en' ? 'Expenditure' : 'व्यय'}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* View More Link */}
        <div className="text-center">
          <button
            onClick={() => navigate('/compare')}
            className="inline-flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors shadow-lg"
          >
            <span>{language === 'en' ? 'Compare with Other Districts' : 'अन्य जिलों से तुलना करें'}</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
