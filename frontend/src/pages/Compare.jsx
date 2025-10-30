import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, MapPin, Calendar, GitCompare, BarChart3, X, Plus, BarChart, LineChart as LineChartIcon, PieChart as PieChartIcon, ChevronDown, Download, FileSpreadsheet } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { formatCount, formatIndianNumber, calculatePerformanceScore } from '../utils/helpers';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import * as XLSX from 'xlsx';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

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
  const availableYears = ['2024-25', '2023-24', '2022-23', '2021-22', '2020-21', '2019-20', '2018-19', '2017-18', '2016-17', '2015-16'];
  
  // For mixed comparison (new feature)
  const [mixedMode, setMixedMode] = useState(false);
  const [mixedItems, setMixedItems] = useState([]);
  
  const [comparisonData, setComparisonData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'graph'
  const [chartType, setChartType] = useState('bar'); // 'bar', 'line', 'pie'

  const translations = {
    en: {
      title: 'Compare MGNREGA Performance',
      subtitle: 'Analyze and compare data across districts, states, or years - No limits!',
      compareDistricts: 'Compare Districts',
      compareStates: 'Compare States',
      compareYears: 'Compare Years',
      mixedCompare: 'Mixed Compare',
      selectState: 'Select State',
      selectDistricts: 'Select Districts to Compare',
      selectStates: 'Select States to Compare',
      selectDistrictForYear: 'Select District',
      selectYears: 'Select Years to Compare',
      compare: 'Compare Now',
      addMore: 'Add More',
      remove: 'Remove',
      clear: 'Clear All',
      metric: 'Metric',
      noSelection: 'Please select at least 2 items to compare',
      households: 'Families Worked',
      avgDays: 'Avg Days/Family',
      expenditure: 'Total Expenditure',
      avgWage: 'Avg Daily Wage',
      worksCompleted: 'Works Completed',
      performanceScore: 'Performance Score',
      loadingData: 'Loading comparison data...',
      selected: 'Selected',
      districtMode: 'Compare multiple districts within a state - unlimited!',
      stateMode: 'Compare overall performance across any number of states',
      yearMode: 'Compare same district across any number of years',
      mixedMode: 'Mix and match: Compare any combination of districts, states, and years',
      best: 'Best',
      worst: 'Worst',
      selectItems: 'Select items to compare',
      noLimit: 'No limit - add as many as you want!',
      viewAsGraph: 'View as Graph',
      viewAsTable: 'View as Table',
      barChart: 'Bar Chart',
      lineChart: 'Line Chart',
      pieChart: 'Pie Chart',
      selectChartType: 'Select Chart Type',
      exportCSV: 'Export CSV',
      exportExcel: 'Export Excel',
      exportData: 'Export Data',
    },
    hi: {
      title: 'मनरेगा प्रदर्शन की तुलना करें',
      subtitle: 'जिलों, राज्यों या वर्षों में डेटा का विश्लेषण और तुलना करें - कोई सीमा नहीं!',
      compareDistricts: 'जिलों की तुलना',
      compareStates: 'राज्यों की तुलना',
      compareYears: 'वर्षों की तुलना',
      mixedCompare: 'मिश्रित तुलना',
      selectState: 'राज्य चुनें',
      selectDistricts: 'तुलना के लिए जिले चुनें',
      selectStates: 'तुलना के लिए राज्य चुनें',
      selectDistrictForYear: 'जिला चुनें',
      selectYears: 'तुलना के लिए वर्ष चुनें',
      compare: 'अभी तुलना करें',
      addMore: 'और जोड़ें',
      remove: 'हटाएं',
      clear: 'सभी साफ़ करें',
      metric: 'मापदंड',
      noSelection: 'तुलना करने के लिए कम से कम 2 आइटम चुनें',
      households: 'परिवारों ने काम किया',
      avgDays: 'औसत दिन/परिवार',
      expenditure: 'कुल व्यय',
      avgWage: 'औसत दैनिक मजदूरी',
      worksCompleted: 'पूर्ण कार्य',
      performanceScore: 'प्रदर्शन स्कोर',
      loadingData: 'तुलना डेटा लोड हो रहा है...',
      selected: 'चयनित',
      districtMode: 'एक राज्य के भीतर कितने भी जिलों की तुलना करें - असीमित!',
      stateMode: 'किसी भी संख्या में राज्यों में समग्र प्रदर्शन की तुलना करें',
      yearMode: 'किसी भी संख्या में वर्षों में एक ही जिले की तुलना करें',
      mixedMode: 'मिक्स और मैच: जिलों, राज्यों और वर्षों का कोई भी संयोजन तुलना करें',
      best: 'सर्वश्रेष्ठ',
      worst: 'सबसे खराब',
      selectItems: 'तुलना के लिए आइटम चुनें',
      noLimit: 'कोई सीमा नहीं - जितने चाहें उतने जोड़ें!',
      viewAsGraph: 'ग्राफ़ के रूप में देखें',
      viewAsTable: 'तालिका के रूप में देखें',
      barChart: 'बार चार्ट',
      lineChart: 'लाइन चार्ट',
      pieChart: 'पाई चार्ट',
      selectChartType: 'चार्ट प्रकार चुनें',
      exportCSV: 'CSV निर्यात करें',
      exportExcel: 'Excel निर्यात करें',
      exportData: 'डेटा निर्यात करें',
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
      } else {
        return [...prev, district]; // No limit
      }
    });
  };

  const handleStateToggle = (state) => {
    setSelectedStates(prev => {
      const exists = prev.includes(state);
      if (exists) {
        return prev.filter(s => s !== state);
      } else {
        return [...prev, state]; // No limit
      }
    });
  };

  const handleYearToggle = (year) => {
    setSelectedYears(prev => {
      const exists = prev.includes(year);
      if (exists) {
        return prev.filter(y => y !== year);
      } else {
        return [...prev, year]; // No limit
      }
    });
  };

  const handleClearAll = () => {
    setSelectedDistricts([]);
    setSelectedStates([]);
    setSelectedYears([]);
    setMixedItems([]);
    setComparisonData([]);
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
  };

  const comparisonModes = [
    { mode: 'districts', icon: MapPin, label: t.compareDistricts },
    { mode: 'states', icon: BarChart3, label: t.compareStates },
    { mode: 'years', icon: Calendar, label: t.compareYears },
  ];

  const getSelectedCount = () => {
    if (comparisonMode === 'districts') return selectedDistricts.length;
    if (comparisonMode === 'states') return selectedStates.length;
    if (comparisonMode === 'years') return selectedYears.length;
    return 0;
  };

  // Prepare chart data
  const prepareChartData = (metric) => {
    const labels = comparisonData.map(d => d.name);
    const data = comparisonData.map(d => d[metric]);
    
    const colors = [
      'rgba(249, 115, 22, 0.8)',  // orange
      'rgba(59, 130, 246, 0.8)',  // blue
      'rgba(16, 185, 129, 0.8)',  // green
      'rgba(168, 85, 247, 0.8)',  // purple
      'rgba(236, 72, 153, 0.8)',  // pink
      'rgba(251, 191, 36, 0.8)',  // yellow
      'rgba(239, 68, 68, 0.8)',   // red
      'rgba(6, 182, 212, 0.8)',   // cyan
    ];

    return {
      labels,
      datasets: [{
        label: metric.charAt(0).toUpperCase() + metric.slice(1),
        data,
        backgroundColor: colors.slice(0, data.length),
        borderColor: colors.slice(0, data.length).map(c => c.replace('0.8', '1')),
        borderWidth: 2,
      }]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        cornerRadius: 8,
        titleFont: {
          size: 14,
          weight: 'bold',
        },
        bodyFont: {
          size: 13,
        },
      },
    },
    scales: chartType !== 'pie' ? {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          font: {
            size: 12,
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
          },
          maxRotation: 45,
          minRotation: 45,
        },
      },
    } : undefined,
  };

  const chartTypeOptions = [
    { value: 'bar', label: t.barChart, icon: BarChart },
    { value: 'line', label: t.lineChart, icon: LineChartIcon },
    { value: 'pie', label: t.pieChart, icon: PieChartIcon },
  ];

  const renderChart = (metric, title) => {
    const data = prepareChartData(metric);
    
    return (
      <div className="bg-white/80 backdrop-blur-md border-2 border-orange-200 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">{title}</h3>
        <div className="h-80">
          {chartType === 'bar' && <Bar data={data} options={chartOptions} />}
          {chartType === 'line' && <Line data={data} options={chartOptions} />}
          {chartType === 'pie' && <Pie data={data} options={chartOptions} />}
        </div>
      </div>
    );
  };

  // Export functions
  const exportToCSV = () => {
    if (comparisonData.length === 0) return;

    // Prepare CSV data
    const headers = [
      language === 'en' ? 'Name' : 'नाम',
      t.performanceScore,
      t.households,
      t.avgDays,
      t.expenditure,
      t.avgWage,
      t.worksCompleted
    ];

    const rows = comparisonData.map(data => [
      data.name,
      data.performanceScore,
      data.households,
      data.avgDays,
      data.expenditure,
      data.avgWage,
      data.worksCompleted
    ]);

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `mgnrega-comparison-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = () => {
    if (comparisonData.length === 0) return;

    // Prepare Excel data
    const headers = [
      language === 'en' ? 'Name' : 'नाम',
      t.performanceScore,
      t.households,
      t.avgDays,
      t.expenditure,
      t.avgWage,
      t.worksCompleted
    ];

    const data = comparisonData.map(item => ({
      [headers[0]]: item.name,
      [headers[1]]: item.performanceScore,
      [headers[2]]: item.households,
      [headers[3]]: item.avgDays,
      [headers[4]]: item.expenditure,
      [headers[5]]: item.avgWage,
      [headers[6]]: item.worksCompleted
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(data);

    // Set column widths
    ws['!cols'] = [
      { wch: 25 }, // Name
      { wch: 18 }, // Performance Score
      { wch: 15 }, // Households
      { wch: 15 }, // Avg Days
      { wch: 18 }, // Expenditure
      { wch: 15 }, // Avg Wage
      { wch: 18 }  // Works Completed
    ];

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Comparison Data');

    // Add metadata sheet
    const metaData = [
      { Key: 'Comparison Type', Value: comparisonMode === 'districts' ? (language === 'en' ? 'Districts' : 'जिले') : comparisonMode === 'states' ? (language === 'en' ? 'States' : 'राज्य') : (language === 'en' ? 'Years' : 'वर्ष') },
      { Key: 'Export Date', Value: new Date().toLocaleString() },
      { Key: 'Total Items', Value: comparisonData.length },
      { Key: 'Best Performer', Value: comparisonData.reduce((prev, current) => (current.performanceScore > prev.performanceScore) ? current : prev).name },
      { Key: 'Worst Performer', Value: comparisonData.reduce((prev, current) => (current.performanceScore < prev.performanceScore) ? current : prev).name }
    ];
    const wsMeta = XLSX.utils.json_to_sheet(metaData);
    XLSX.utils.book_append_sheet(wb, wsMeta, 'Metadata');

    // Download file
    XLSX.writeFile(wb, `mgnrega-comparison-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fff9f1' }}>
      <div className="container mx-auto px-8 py-10 md:py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-bold text-gray-800 mb-3"
          >
            {t.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-600"
          >
            {t.subtitle}
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4 inline-flex items-center space-x-2 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 px-6 py-2 rounded-full"
          >
            <Plus className="w-4 h-4 text-green-600" />
            <span className="text-sm font-semibold text-green-800">{t.noLimit}</span>
          </motion.div>
        </div>

        {/* Mode Tabs - WITHOUT Graph/Table Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 backdrop-blur-md border-2 border-orange-200 rounded-3xl p-6 mb-8 max-w-4xl mx-auto shadow-xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            {comparisonModes.map(({ mode, icon: Icon, label }) => (
              <motion.button
                key={mode}
                onClick={() => handleModeChange(mode)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex flex-col items-center justify-center p-4 rounded-xl font-semibold text-sm transition-all ${
                  comparisonMode === mode
                    ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg'
                    : 'bg-gray-50 text-gray-700 hover:bg-orange-50 hover:text-orange-600 border-2 border-gray-200 hover:border-orange-300'
                }`}
              >
                <Icon className="w-6 h-6 mb-2" />
                <span>{label}</span>
              </motion.button>
            ))}
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-center">
            <p className="text-sm text-orange-800 font-medium">
              {comparisonMode === 'districts' && t.districtMode}
              {comparisonMode === 'states' && t.stateMode}
              {comparisonMode === 'years' && t.yearMode}
            </p>
          </div>
        </motion.div>

        {/* Error & Loading */}
        {error && !loading && (
          <div className="mb-6 max-w-4xl mx-auto">
            <ErrorMessage message={error} onRetry={() => setError(null)} />
          </div>
        )}

        {loading && (
          <div className="mb-6">
            <LoadingSpinner message={t.loadingData} />
          </div>
        )}

        {/* Selection Forms */}
        <AnimatePresence mode="wait">
          {comparisonMode === 'districts' && (
            <motion.div
              key="districts"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/80 backdrop-blur-md border-2 border-orange-200 rounded-3xl p-8 mb-8 max-w-6xl mx-auto shadow-xl"
            >
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-3">
                    {t.selectState}
                  </label>
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none text-base font-medium text-gray-700 bg-white"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23f97316'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 1rem center',
                      backgroundSize: '1.5rem',
                      appearance: 'none'
                    }}
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
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-lg font-semibold text-gray-700">
                      {t.selectDistricts}
                    </label>
                    {selectedDistricts.length > 0 && (
                      <button
                        onClick={handleClearAll}
                        className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center space-x-1"
                      >
                        <X className="w-4 h-4" />
                        <span>{t.clear}</span>
                      </button>
                    )}
                  </div>
                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-orange-800">
                        {selectedDistricts.length} {t.selected}
                      </p>
                      <div className="flex items-center space-x-1 text-green-600">
                        <Plus className="w-4 h-4" />
                        <span className="text-xs font-bold">{language === 'en' ? 'UNLIMITED' : 'असीमित'}</span>
                      </div>
                    </div>
                    {selectedDistricts.length > 0 && (
                      <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                        {selectedDistricts.map(d => (
                          <motion.span
                            key={d.districtCode}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="inline-flex items-center space-x-1 text-xs bg-white text-orange-800 px-3 py-1 rounded-lg font-medium border border-orange-300 shadow-sm"
                          >
                            <span>{d.districtName}</span>
                            <button
                              onClick={() => handleDistrictToggle(d)}
                              className="hover:bg-orange-100 rounded-full p-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </motion.span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {selectedState && districts.length > 0 && (
                <div className="mb-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-80 overflow-y-auto p-3 border-2 border-gray-200 rounded-xl bg-gray-50">
                    {districts.map((district) => {
                      const isSelected = selectedDistricts.find(d => d.districtCode === district.districtCode);
                      return (
                        <motion.button
                          key={district.districtCode}
                          onClick={() => handleDistrictToggle(district)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`p-3 text-sm border-2 rounded-xl font-medium transition-all ${
                            isSelected
                              ? 'border-orange-500 bg-orange-50 text-orange-800 shadow-sm'
                              : 'border-gray-200 hover:border-orange-300 text-gray-700 bg-white'
                          }`}
                        >
                          {district.districtName}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="text-center">
                <motion.button
                  onClick={handleCompare}
                  disabled={selectedDistricts.length < 2 || loading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white px-8 py-4 rounded-xl font-semibold text-base transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <GitCompare className="w-5 h-5" />
                  <span>{loading ? (language === 'en' ? 'Comparing...' : 'तुलना हो रही है...') : t.compare}</span>
                </motion.button>
              </div>
            </motion.div>
          )}

          {comparisonMode === 'states' && (
            <motion.div
              key="states"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/80 backdrop-blur-md border-2 border-orange-200 rounded-3xl p-8 mb-8 max-w-6xl mx-auto shadow-xl"
            >
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-lg font-semibold text-gray-700">
                    {t.selectStates}
                  </label>
                  {selectedStates.length > 0 && (
                    <button
                      onClick={handleClearAll}
                      className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center space-x-1"
                    >
                      <X className="w-4 h-4" />
                      <span>{t.clear}</span>
                    </button>
                  )}
                </div>
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-orange-800">
                      {selectedStates.length} {t.selected}
                    </p>
                    <div className="flex items-center space-x-1 text-green-600">
                      <Plus className="w-4 h-4" />
                      <span className="text-xs font-bold">{language === 'en' ? 'UNLIMITED' : 'असीमित'}</span>
                    </div>
                  </div>
                  {selectedStates.length > 0 && (
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                      {selectedStates.map(s => (
                        <motion.span
                          key={s}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="inline-flex items-center space-x-1 text-xs bg-white text-orange-800 px-3 py-1 rounded-lg font-medium border border-orange-300 shadow-sm"
                        >
                          <span>{s}</span>
                          <button
                            onClick={() => handleStateToggle(s)}
                            className="hover:bg-orange-100 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </motion.span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-80 overflow-y-auto p-3 border-2 border-gray-200 rounded-xl bg-gray-50 mb-6">
                {states.map((state) => {
                  const isSelected = selectedStates.includes(state.stateName);
                  return (
                    <motion.button
                      key={state.stateCode || state.stateName}
                      onClick={() => handleStateToggle(state.stateName)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-3 text-sm border-2 rounded-xl font-medium transition-all ${
                        isSelected
                          ? 'border-orange-500 bg-orange-50 text-orange-800 shadow-sm'
                          : 'border-gray-200 hover:border-orange-300 text-gray-700 bg-white'
                      }`}
                    >
                      {state.stateName}
                    </motion.button>
                  );
                })}
              </div>

              <div className="text-center">
                <motion.button
                  onClick={handleCompare}
                  disabled={selectedStates.length < 2 || loading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white px-8 py-4 rounded-xl font-semibold text-base transition-all shadow-lg disabled:opacity-50"
                >
                  <GitCompare className="w-5 h-5" />
                  <span>{loading ? (language === 'en' ? 'Comparing...' : 'तुलना हो रही है...') : t.compare}</span>
                </motion.button>
              </div>
            </motion.div>
          )}

          {comparisonMode === 'years' && (
            <motion.div
              key="years"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/80 backdrop-blur-md border-2 border-orange-200 rounded-3xl p-8 mb-8 max-w-6xl mx-auto shadow-xl"
            >
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-3">
                    {t.selectState}
                  </label>
                  <select
                    value={yearComparisonState}
                    onChange={(e) => setYearComparisonState(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none text-base font-medium text-gray-700 bg-white"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23f97316'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 1rem center',
                      backgroundSize: '1.5rem',
                      appearance: 'none'
                    }}
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
                  <label className="block text-lg font-semibold text-gray-700 mb-3">
                    {t.selectDistrictForYear}
                  </label>
                  <select
                    value={yearComparisonDistrict?.districtCode || ''}
                    onChange={(e) => {
                      const district = yearDistricts.find(d => d.districtCode === e.target.value);
                      setYearComparisonDistrict(district || null);
                    }}
                    disabled={!yearComparisonState}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none text-base font-medium text-gray-700 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23f97316'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 1rem center',
                      backgroundSize: '1.5rem',
                      appearance: 'none'
                    }}
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

              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-lg font-semibold text-gray-700">
                    {t.selectYears}
                  </label>
                  {selectedYears.length > 0 && (
                    <button
                      onClick={handleClearAll}
                      className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center space-x-1"
                    >
                      <X className="w-4 h-4" />
                      <span>{t.clear}</span>
                    </button>
                  )}
                </div>
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-orange-800">
                      {selectedYears.length} {t.selected}
                    </p>
                    <div className="flex items-center space-x-1 text-green-600">
                      <Plus className="w-4 h-4" />
                      <span className="text-xs font-bold">{language === 'en' ? 'UNLIMITED' : 'असीमित'}</span>
                    </div>
                  </div>
                  {selectedYears.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedYears.map(y => (
                        <motion.span
                          key={y}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="inline-flex items-center space-x-1 text-xs bg-white text-orange-800 px-3 py-1 rounded-lg font-medium border border-orange-300 shadow-sm"
                        >
                          <span>{y}</span>
                          <button
                            onClick={() => handleYearToggle(y)}
                            className="hover:bg-orange-100 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </motion.span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                {availableYears.map((year) => {
                  const isSelected = selectedYears.includes(year);
                  return (
                    <motion.button
                      key={year}
                      onClick={() => handleYearToggle(year)}
                      disabled={!yearComparisonDistrict}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`p-4 text-base border-2 rounded-xl font-semibold transition-all ${
                        isSelected
                          ? 'border-orange-500 bg-orange-50 text-orange-800 shadow-sm'
                          : 'border-gray-200 hover:border-orange-300 text-gray-700 bg-white disabled:opacity-40'
                      }`}
                    >
                      {year}
                    </motion.button>
                  );
                })}
              </div>

              <div className="text-center">
                <motion.button
                  onClick={handleCompare}
                  disabled={selectedYears.length < 2 || !yearComparisonDistrict || loading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white px-8 py-4 rounded-xl font-semibold text-base transition-all shadow-lg disabled:opacity-50"
                >
                  <GitCompare className="w-5 h-5" />
                  <span>{loading ? (language === 'en' ? 'Comparing...' : 'तुलना हो रही है...') : t.compare}</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results - WITH Graph Toggle in relevant section */}
        <AnimatePresence>
          {!loading && comparisonData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8 max-w-full"
            >
              {/* View Toggle and Chart Type Selector with Export Buttons */}
              <div className="flex flex-col gap-3 bg-white/80 backdrop-blur-md border-2 border-orange-200 rounded-2xl p-4">
                {/* Row 1: View Mode Toggle and Export Options */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setViewMode(viewMode === 'table' ? 'graph' : 'table')}
                      className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                        viewMode === 'graph'
                          ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {viewMode === 'table' ? (
                        <>
                          <BarChart className="w-4 h-4" />
                          <span>{t.viewAsGraph}</span>
                        </>
                      ) : (
                        <>
                          <BarChart3 className="w-4 h-4" />
                          <span>{t.viewAsTable}</span>
                        </>
                      )}
                    </button>

                    <div className="text-sm text-gray-600 font-medium hidden sm:block">
                      {comparisonData.length} {language === 'en' ? 'items compared' : 'आइटम की तुलना'}
                    </div>
                  </div>

                  {/* Export Buttons */}
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-600 font-medium hidden sm:inline">{t.exportData}:</span>
                    <motion.button
                      onClick={exportToCSV}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium text-sm transition-all shadow-sm"
                    >
                      <Download className="w-4 h-4" />
                      <span className="hidden sm:inline">{t.exportCSV}</span>
                      <span className="sm:hidden">CSV</span>
                    </motion.button>
                    <motion.button
                      onClick={exportToExcel}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium text-sm transition-all shadow-sm"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      <span className="hidden sm:inline">{t.exportExcel}</span>
                      <span className="sm:hidden">Excel</span>
                    </motion.button>
                  </div>
                </div>

                {/* Row 2: Chart Type Selector - Horizontal Buttons (Only show when in graph mode) */}
                {viewMode === 'graph' && (
                  <div className="flex items-center space-x-2 pt-2 border-t border-gray-200">
                    <span className="text-xs text-gray-600 font-medium mr-2">{t.selectChartType}:</span>
                    <div className="flex items-center space-x-2">
                      {chartTypeOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                          <motion.button
                            key={option.value}
                            onClick={() => setChartType(option.value)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                              chartType === option.value
                                ? 'bg-orange-500 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            <span>{option.label}</span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Summary Cards - Always show */}
              <div className="overflow-x-auto pb-4">
                <div className="flex gap-4 min-w-max px-2">
                  {comparisonData.map((data, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white/80 backdrop-blur-md border-2 border-orange-200 rounded-2xl p-5 hover:border-orange-400 transition-all shadow-lg hover:shadow-xl min-w-[180px]"
                    >
                      <div className="text-center">
                        <p className="text-xs text-gray-600 mb-1 font-medium">
                          {comparisonMode === 'districts' && (language === 'en' ? 'District' : 'जिला')}
                          {comparisonMode === 'states' && (language === 'en' ? 'State' : 'राज्य')}
                          {comparisonMode === 'years' && (language === 'en' ? 'Year' : 'वर्ष')}
                        </p>
                        <p className="font-bold text-sm text-orange-600 line-clamp-2 mb-3 px-1 min-h-[2.5rem]">
                          {data.name}
                        </p>
                        <p className="text-3xl font-bold text-gray-800 mb-1">{data.performanceScore}</p>
                        <p className="text-xs text-gray-500 font-medium">{t.performanceScore}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Conditional Rendering: Table or Graph */}
              {viewMode === 'table' ? (
                <>
                  {/* Comparison Table */}
                  <div className="bg-white/80 backdrop-blur-md border-2 border-orange-200 rounded-3xl overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gradient-to-r from-orange-500 to-orange-600">
                          <tr>
                            <th className="px-6 py-4 text-left text-sm font-bold text-white sticky left-0 bg-orange-600">
                              {t.metric}
                            </th>
                            {comparisonData.map((data, index) => (
                              <th key={index} className="px-6 py-4 text-center text-sm font-bold text-white">
                                <div className="truncate max-w-[120px]" title={data.name}>
                                  {data.name}
                                </div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white">
                          <tr className="border-b-2 border-gray-100 hover:bg-orange-50/30 transition-colors">
                            <td className="px-6 py-4 text-sm font-semibold text-gray-800 sticky left-0 bg-white">
                              {t.performanceScore}
                            </td>
                            {comparisonData.map((data, index) => (
                              <td key={index} className="px-6 py-4 text-center">
                                <div className="flex items-center justify-center space-x-2">
                                  {getComparisonIndicator(
                                    comparisonData.map(d => d.performanceScore),
                                    index,
                                    true
                                  )}
                                  <span className="text-xl font-bold text-gray-800">
                                    {data.performanceScore}
                                  </span>
                                </div>
                              </td>
                            ))}
                          </tr>

                          <tr className="bg-gray-50 border-b hover:bg-gray-100">
                            <td className="px-6 py-4 text-sm font-medium text-gray-700 sticky left-0 bg-gray-50">
                              {t.households}
                            </td>
                            {comparisonData.map((data, index) => (
                              <td key={index} className="px-6 py-4 text-center">
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
                            <td className="px-6 py-4 text-sm font-medium text-gray-700 sticky left-0 bg-white">
                              {t.avgDays}
                            </td>
                            {comparisonData.map((data, index) => (
                              <td key={index} className="px-6 py-4 text-center">
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
                            <td className="px-6 py-4 text-sm font-medium text-gray-700 sticky left-0 bg-gray-50">
                              {t.expenditure}
                            </td>
                            {comparisonData.map((data, index) => (
                              <td key={index} className="px-6 py-4 text-center">
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
                            <td className="px-6 py-4 text-sm font-medium text-gray-700 sticky left-0 bg-white">
                              {t.avgWage}
                            </td>
                            {comparisonData.map((data, index) => (
                              <td key={index} className="px-6 py-4 text-center">
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
                            <td className="px-6 py-4 text-sm font-medium text-gray-700 sticky left-0 bg-gray-50">
                              {t.worksCompleted}
                            </td>
                            {comparisonData.map((data, index) => (
                              <td key={index} className="px-6 py-4 text-center">
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

                  {/* Best/Worst Cards */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-3xl p-8 shadow-lg"
                    >
                      <h3 className="text-base font-bold text-green-800 mb-4 flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2" />
                        {t.best} {t.performanceScore}
                      </h3>
                      {(() => {
                        const best = comparisonData.reduce((prev, current) => 
                          (current.performanceScore > prev.performanceScore) ? current : prev
                        );
                        return (
                          <div>
                            <p className="text-xl font-bold text-green-700 mb-2 line-clamp-2">{best.name}</p>
                            <p className="text-5xl font-bold text-green-600">{best.performanceScore}</p>
                          </div>
                        );
                      })()}
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-300 rounded-3xl p-8 shadow-lg"
                    >
                      <h3 className="text-base font-bold text-red-800 mb-4 flex items-center">
                        <TrendingDown className="w-5 h-5 mr-2" />
                        {t.worst} {t.performanceScore}
                      </h3>
                      {(() => {
                        const worst = comparisonData.reduce((prev, current) => 
                          (current.performanceScore < prev.performanceScore) ? current : prev
                        );
                        return (
                          <div>
                            <p className="text-xl font-bold text-red-700 mb-2 line-clamp-2">{worst.name}</p>
                            <p className="text-5xl font-bold text-red-600">{worst.performanceScore}</p>
                          </div>
                        );
                      })()}
                    </motion.div>
                  </div>
                </>
              ) : (
                // Graph View
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid md:grid-cols-2 gap-6"
                >
                  {renderChart('performanceScore', t.performanceScore)}
                  {renderChart('households', t.households)}
                  {renderChart('avgDays', t.avgDays)}
                  {renderChart('expenditure', t.expenditure)}
                  {renderChart('avgWage', t.avgWage)}
                  {renderChart('worksCompleted', t.worksCompleted)}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};


export default Compare;
