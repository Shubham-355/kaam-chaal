import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
      // API now returns { success: true, data: { records: [...] } }
      const records = response.data?.records || [];
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
    <div className="min-h-screen md:px-20 lg:px-23" style={{ backgroundColor: '#fff9f1' }}>
      <div className="container mx-auto px-8 py-10 md:py-12">
        {/* Minimal Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <motion.button
            whileHover={{ x: -3 }}
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-gray-600 hover:text-orange-600 font-medium mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.backToHome}</span>
          </motion.button>
          
          {/* Clean Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-1">
                {selectedDistrict.districtName}
              </h1>
              <p className="text-gray-600 flex items-center space-x-2">
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                <span>{selectedDistrict.stateName}</span>
              </p>
            </div>
            
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:border-orange-500 focus:ring-1 focus:ring-orange-200 focus:outline-none bg-white text-sm"
            >
              <option value="">{t.allYears}</option>
              {[...new Set(allRecords.map(r => r.finYear))].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* Minimal Performance Score */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{t.performanceScore}</p>
                <div className="flex items-baseline space-x-2">
                  <span className="text-4xl md:text-5xl font-bold text-gray-800">
                    {performanceScore}
                  </span>
                  <span className="text-xl text-gray-500">/100</span>
                </div>
                <span className="inline-block mt-2 text-sm font-medium text-orange-600 bg-orange-50 px-3 py-1 rounded-lg">
                  {performanceRating.label}
                </span>
              </div>
              <Award className="w-16 h-16 md:w-20 md:h-20 text-gray-200" />
            </div>
          </div>
        </motion.div>

        {/* Minimal Key Metrics */}
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
          {t.keyMetrics}
        </h2>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-orange-300 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <Users className="w-5 h-5 text-orange-600" />
              <InfoTooltip text={metricExplanations.totalHouseholdsWorked[language]} />
            </div>
            <p className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">
              {formatCount(totalHouseholds)}
            </p>
            <p className="text-xs text-gray-600">{t.householdsWorked}</p>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-orange-300 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <Calendar className="w-5 h-5 text-blue-600" />
              <InfoTooltip text={metricExplanations.avgDaysEmployment[language]} />
            </div>
            <p className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">
              {Math.round(avgDaysEmployment)}
            </p>
            <p className="text-xs text-gray-600">{t.avgDays}</p>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-orange-300 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <IndianRupee className="w-5 h-5 text-green-600" />
              <InfoTooltip text={metricExplanations.totalExpenditure[language]} />
            </div>
            <p className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">
              {formatIndianNumber(totalExpenditure)}
            </p>
            <p className="text-xs text-gray-600">{t.totalSpent}</p>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-orange-300 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <InfoTooltip text={metricExplanations.avgWageRate[language]} />
            </div>
            <p className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">
              ₹{Math.round(avgWageRate)}
            </p>
            <p className="text-xs text-gray-600">{t.avgWage}</p>
          </div>
        </div>

        {/* Works & Inclusion */}
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
          {t.works} & {t.inclusion}
        </h2>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Works - Minimal */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <Briefcase className="w-4 h-4 mr-2 text-orange-600" />
              {t.works}
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="border border-green-200 rounded-lg p-4">
                <p className="text-xs text-gray-600 mb-1">{t.completed}</p>
                <p className="text-2xl font-bold text-green-700">{formatCount(totalWorksCompleted)}</p>
              </div>
              <div className="border border-yellow-200 rounded-lg p-4">
                <p className="text-xs text-gray-600 mb-1">{t.ongoing}</p>
                <p className="text-2xl font-bold text-yellow-700">{formatCount(totalWorksOngoing)}</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={worksData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={70}
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

          {/* Social Inclusion - Minimal */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <Users className="w-4 h-4 mr-2 text-orange-600" />
              {t.inclusion}
            </h3>
            <div className="space-y-5">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-700">{t.womenWork}</span>
                  <span className="text-sm font-bold text-pink-600">
                    {formatCount(latestRecord.womenPersondays)}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ 
                      width: `${Math.min(
                        (Number(latestRecord.womenPersondays) /
                          Number(latestRecord.totalHouseholdsWorked)) *
                          10,
                        100
                      )}%`
                    }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                    className="bg-pink-500 h-1.5 rounded-full"
                  ></motion.div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-700">{t.scWorkers}</span>
                  <span className="text-sm font-bold text-blue-600">
                    {formatCount(latestRecord.scWorkers)}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ 
                      width: `${Math.min(
                        (Number(latestRecord.scWorkers) /
                          Number(latestRecord.totalActiveWorkers)) *
                          100,
                        100
                      )}%`
                    }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="bg-blue-500 h-1.5 rounded-full"
                  ></motion.div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-700">{t.stWorkers}</span>
                  <span className="text-sm font-bold text-green-600">
                    {formatCount(latestRecord.stWorkers)}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ 
                      width: `${Math.min(
                        (Number(latestRecord.stWorkers) /
                          Number(latestRecord.totalActiveWorkers)) *
                          100,
                        100
                      )}%`
                    }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.4 }}
                    className="bg-green-500 h-1.5 rounded-full"
                  ></motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trends - Minimal */}
        {monthlyData.length > 1 && (
          <>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
              {t.trends}
            </h2>

            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-12 space-y-8">
              <div>
                <h4 className="text-base font-semibold text-gray-800 mb-4">{t.monthlyEmployment}</h4>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" style={{ fontSize: '12px' }} />
                    <YAxis style={{ fontSize: '12px' }} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                    <Line 
                      type="monotone" 
                      dataKey="households" 
                      stroke="#f97316" 
                      strokeWidth={2}
                      dot={{ fill: '#f97316', r: 3 }}
                      name={language === 'en' ? 'Households' : 'परिवार'}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h4 className="text-base font-semibold text-gray-800 mb-4">{t.expenditure} (₹ Cr)</h4>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" style={{ fontSize: '12px' }} />
                    <YAxis style={{ fontSize: '12px' }} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                    <Bar 
                      dataKey="expenditure" 
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                      name={language === 'en' ? 'Expenditure' : 'व्यय'}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {/* CTA - Minimal */}
        <div className="text-center py-6">
          <button
            onClick={() => navigate('/compare')}
            className="inline-flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium text-sm transition-colors"
          >
            <span>{language === 'en' ? 'Compare Districts' : 'जिलों की तुलना करें'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
