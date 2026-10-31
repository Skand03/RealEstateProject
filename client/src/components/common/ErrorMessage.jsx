import { AlertCircle } from 'lucide-react';

const ErrorMessage = ({ message = 'Something went wrong.', onRetry }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <AlertCircle className="h-12 w-12 text-red-400 mb-3" />
    <p className="text-gray-600 mb-4">{message}</p>
    {onRetry && (
      <button onClick={onRetry} className="btn-primary text-sm px-4 py-2">
        Try Again
      </button>
    )}
  </div>
);

export default ErrorMessage;
