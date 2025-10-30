import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ message, size = 'medium' }) => {
  const sizes = {
    small: 'w-6 h-6',
    medium: 'w-12 h-12',
    large: 'w-16 h-16'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <Loader2 className={`${sizes[size]} animate-spin text-orange-600`} />
      {message && (
        <p className="mt-4 text-gray-600 text-lg">{message}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
