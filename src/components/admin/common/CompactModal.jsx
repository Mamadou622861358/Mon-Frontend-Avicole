import React from 'react';
import { X } from 'lucide-react';

const CompactModal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'sm' // sm, md, lg
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md', 
    lg: 'max-w-lg'
  };

  return (
    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-start justify-center pt-8 z-50">
      <div className={`bg-white rounded-lg p-4 w-full ${sizeClasses[size]} mx-4 shadow-lg max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default CompactModal;
