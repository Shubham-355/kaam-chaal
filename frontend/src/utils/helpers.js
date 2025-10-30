// Format numbers for Indian locale (lakhs, crores)
export const formatIndianNumber = (num) => {
  if (!num && num !== 0) return 'N/A';
  
  const number = Number(num);
  if (isNaN(number)) return 'N/A';
  
  if (number >= 10000000) { // Crores
    return `₹${(number / 10000000).toFixed(2)} Cr`;
  } else if (number >= 100000) { // Lakhs
    return `₹${(number / 100000).toFixed(2)} L`;
  } else if (number >= 1000) { // Thousands
    return `₹${(number / 1000).toFixed(2)} K`;
  }
  return `₹${number.toLocaleString('en-IN')}`;
};

// Format count numbers
export const formatCount = (num) => {
  if (!num && num !== 0) return '0';
  
  const number = Number(num);
  if (isNaN(number)) return '0';
  
  if (number >= 10000000) {
    return `${(number / 10000000).toFixed(2)} Cr`;
  } else if (number >= 100000) {
    return `${(number / 100000).toFixed(2)} L`;
  } else if (number >= 1000) {
    return `${(number / 1000).toFixed(1)} K`;
  }
  return number.toLocaleString('en-IN');
};

// Format percentage
export const formatPercentage = (num) => {
  if (!num && num !== 0) return '0%';
  const number = Number(num);
  if (isNaN(number)) return '0%';
  return `${number.toFixed(1)}%`;
};

// Get month name from abbreviation
export const getMonthName = (monthAbbr) => {
  const months = {
    'Jan': 'January', 'Feb': 'February', 'Mar': 'March',
    'Apr': 'April', 'May': 'May', 'Jun': 'June',
    'Jul': 'July', 'Aug': 'August', 'Sep': 'September',
    'Oct': 'October', 'Nov': 'November', 'Dec': 'December'
  };
  return months[monthAbbr] || monthAbbr;
};

// Get financial year display
export const formatFinancialYear = (finYear) => {
  if (!finYear) return 'N/A';
  return finYear; // Already in format "2024-2025"
};

// Calculate performance score (0-100)
export const calculatePerformanceScore = (record) => {
  if (!record) return 0;
  
  let score = 0;
  let criteria = 0;
  
  // Criterion 1: Payment efficiency (within 15 days)
  if (record.percentPayments15Days !== null) {
    criteria++;
    score += Math.min((record.percentPayments15Days / 100) * 25, 25);
  }
  
  // Criterion 2: Employment days provided
  if (record.avgDaysEmployment !== null) {
    criteria++;
    score += Math.min((record.avgDaysEmployment / 100) * 25, 25);
  }
  
  // Criterion 3: Works completion rate
  if (record.totalWorksCompleted && record.totalWorksTakenup) {
    criteria++;
    const completionRate = (Number(record.totalWorksCompleted) / Number(record.totalWorksTakenup)) * 100;
    score += Math.min((completionRate / 100) * 25, 25);
  }
  
  // Criterion 4: Active participation rate
  if (record.totalActiveWorkers && record.totalWorkers) {
    criteria++;
    const participationRate = (Number(record.totalActiveWorkers) / Number(record.totalWorkers)) * 100;
    score += Math.min((participationRate / 100) * 25, 25);
  }
  
  return criteria > 0 ? Math.round(score) : 0;
};

// Get performance rating
export const getPerformanceRating = (score) => {
  if (score >= 80) return { label: 'Excellent', color: 'green' };
  if (score >= 60) return { label: 'Good', color: 'blue' };
  if (score >= 40) return { label: 'Average', color: 'yellow' };
  if (score >= 20) return { label: 'Needs Improvement', color: 'orange' };
  return { label: 'Poor', color: 'red' };
};

// Simple explanations for metrics (in both English and Hindi)
export const metricExplanations = {
  totalHouseholdsWorked: {
    en: 'Number of families who got work under MGNREGA',
    hi: 'मनरेगा के तहत काम पाने वाले परिवारों की संख्या'
  },
  avgDaysEmployment: {
    en: 'Average days of work each family got',
    hi: 'प्रत्येक परिवार को मिले औसत कार्य दिवस'
  },
  avgWageRate: {
    en: 'Average daily wage paid to workers',
    hi: 'मजदूरों को दी गई औसत दैनिक मजदूरी'
  },
  totalWorksCompleted: {
    en: 'Total projects completed in the district',
    hi: 'जिले में पूर्ण हुई कुल परियोजनाएं'
  },
  totalExpenditure: {
    en: 'Total money spent on MGNREGA in the district',
    hi: 'जिले में मनरेगा पर खर्च की गई कुल राशि'
  },
  womenPersondays: {
    en: 'Work days provided to women workers',
    hi: 'महिला श्रमिकों को प्रदान किए गए कार्य दिवस'
  },
  percentPayments15Days: {
    en: 'Percentage of wages paid within 15 days',
    hi: '15 दिनों में भुगतान की गई मजदूरी का प्रतिशत'
  }
};

// Detect user's preferred language from browser
export const detectLanguage = () => {
  const browserLang = navigator.language || navigator.userLanguage;
  if (browserLang.startsWith('hi')) return 'hi';
  if (browserLang.startsWith('mr')) return 'mr';
  if (browserLang.startsWith('ta')) return 'ta';
  if (browserLang.startsWith('te')) return 'te';
  if (browserLang.startsWith('bn')) return 'bn';
  return 'en'; // Default to English
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Normalize location names for better matching
export const normalizeLocationName = (name) => {
  if (!name) return '';
  
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ') // normalize spaces
    .replace(/[^\w\s]/g, '') // remove special characters
    .replace(/\b(district|जिला)\b/gi, '') // remove "district" word
    .trim();
};

// Common location aliases for better matching
export const locationAliases = {
  'delhi': ['new delhi', 'dilli', 'दिल्ली'],
  'mumbai': ['bombay', 'मुंबई'],
  'bengaluru': ['bangalore', 'बेंगलुरु'],
  'kolkata': ['calcutta', 'कोलकाता'],
  'chennai': ['madras', 'चेन्नई'],
  'hyderabad': ['हैदराबाद'],
  'ahmedabad': ['अहमदाबाद'],
  'pune': ['पुणे'],
  'gandhinagar': ['गांधीनगर'],
  'jaipur': ['जयपुर'],
  'lucknow': ['लखनऊ'],
  'patna': ['पटना'],
  'bhopal': ['भोपाल'],
  'thiruvananthapuram': ['trivandrum', 'तिरुवनंतपुरम'],
};

// Match location with aliases
export const matchLocationWithAlias = (input, locationName) => {
  const normalizedInput = normalizeLocationName(input);
  const normalizedLocation = normalizeLocationName(locationName);
  
  // Direct match
  if (normalizedInput.includes(normalizedLocation) || normalizedLocation.includes(normalizedInput)) {
    return true;
  }
  
  // Check aliases
  for (const [key, aliases] of Object.entries(locationAliases)) {
    if (normalizedLocation.includes(key) || key.includes(normalizedLocation)) {
      return aliases.some(alias => 
        normalizedInput.includes(normalizeLocationName(alias)) || 
        normalizeLocationName(alias).includes(normalizedInput)
      );
    }
  }
  
  return false;
};
