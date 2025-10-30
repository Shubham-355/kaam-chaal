import { motion } from 'framer-motion';

const StatCard = ({ icon: Icon, title, value, subtitle, color = 'orange', info }) => {
  const colorClasses = {
    orange: 'bg-orange-50/80 border-orange-300 text-orange-800',
    blue: 'bg-blue-50/80 border-blue-300 text-blue-800',
    green: 'bg-green-50/80 border-green-300 text-green-800',
    purple: 'bg-purple-50/80 border-purple-300 text-purple-800',
    red: 'bg-red-50/80 border-red-300 text-red-800',
  };

  const iconColorClasses = {
    orange: 'text-orange-600 bg-orange-100/90',
    blue: 'text-blue-600 bg-blue-100/90',
    green: 'text-green-600 bg-green-100/90',
    purple: 'text-purple-600 bg-purple-100/90',
    red: 'text-red-600 bg-red-100/90',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className={`${colorClasses[color]} backdrop-blur-md border-2 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-4">
            {Icon && (
              <div className={`${iconColorClasses[color]} p-3 rounded-xl shadow-md`}>
                <Icon className="w-6 h-6" />
              </div>
            )}
            <h3 className="text-sm font-bold uppercase tracking-wide">{title}</h3>
          </div>
          <motion.p
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring" }}
            className="text-4xl md:text-5xl font-bold"
          >
            {value}
          </motion.p>
          {subtitle && (
            <p className="text-sm mt-3 opacity-80 font-semibold">{subtitle}</p>
          )}
        </div>
        {info}
      </div>
    </motion.div>
  );
};

export default StatCard;
