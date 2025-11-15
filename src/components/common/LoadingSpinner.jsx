import React from 'react';

const LoadingSpinner = ({ 
  size = 'md', 
  color = 'green', 
  text = 'Chargement...', 
  fullScreen = false,
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colorClasses = {
    green: 'border-green-600',
    blue: 'border-blue-600',
    gray: 'border-gray-600',
    red: 'border-red-600'
  };

  const spinnerClass = `animate-spin rounded-full border-2 border-t-transparent ${sizeClasses[size]} ${colorClasses[color]}`;

  const content = (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      <div className={spinnerClass}></div>
      {text && (
        <span className="text-gray-600 text-sm font-medium">{text}</span>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;
