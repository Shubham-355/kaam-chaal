import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw } from 'lucide-react';

const ErrorMessage = ({ message, onRetry }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-red-50 border-2 border-red-200 rounded-xl p-6 my-4"
    >
      <div className="flex items-start space-x-3">
        <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-lg font-bold text-red-800 mb-1">Error</h3>
          <p className="text-red-700">{message}</p>
          {onRetry && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onRetry}
              className="mt-3 inline-flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry</span>
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ErrorMessage;
