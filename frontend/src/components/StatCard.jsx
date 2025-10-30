const StatCard = ({ icon: Icon, title, value, subtitle, color = 'orange', info }) => {
  const colorClasses = {
    orange: 'bg-orange-50 border-orange-200 text-orange-800',
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    green: 'bg-green-50 border-green-200 text-green-800',
    purple: 'bg-purple-50 border-purple-200 text-purple-800',
    red: 'bg-red-50 border-red-200 text-red-800',
  };

  const iconColorClasses = {
    orange: 'text-orange-600',
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    red: 'text-red-600',
  };

  return (
    <div className={`${colorClasses[color]} border-2 rounded-xl p-6 hover:shadow-lg transition-shadow`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            {Icon && <Icon className={`w-6 h-6 ${iconColorClasses[color]}`} />}
            <h3 className="text-sm font-semibold uppercase tracking-wide">{title}</h3>
          </div>
          <p className="text-3xl md:text-4xl font-bold mt-3">{value}</p>
          {subtitle && (
            <p className="text-sm mt-2 opacity-75">{subtitle}</p>
          )}
        </div>
        {info}
      </div>
    </div>
  );
};

export default StatCard;
