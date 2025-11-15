import React from 'react';

const CompactForm = ({ 
  onSubmit, 
  children, 
  submitText = "Enregistrer",
  cancelText = "Annuler",
  onCancel,
  loading = false
}) => {
  return (
    <form onSubmit={onSubmit}>
      <div className="space-y-3">
        {children}
      </div>
      <div className="flex items-center justify-end space-x-2 mt-4 pt-3 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          disabled={loading}
        >
          {cancelText}
        </button>
        <button
          type="submit"
          className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'En cours...' : submitText}
        </button>
      </div>
    </form>
  );
};

// Composant pour les champs de formulaire compacts
export const CompactField = ({ 
  label, 
  children, 
  required = false,
  error = null 
}) => {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
};

// Composant pour les inputs compacts
export const CompactInput = ({ 
  type = "text", 
  placeholder, 
  value, 
  onChange, 
  required = false,
  className = "",
  ...props 
}) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      className={`w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500 ${className}`}
      {...props}
    />
  );
};

// Composant pour les selects compacts
export const CompactSelect = ({ 
  value, 
  onChange, 
  children, 
  required = false,
  className = "",
  ...props 
}) => {
  return (
    <select
      value={value}
      onChange={onChange}
      required={required}
      className={`w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500 ${className}`}
      {...props}
    >
      {children}
    </select>
  );
};

// Composant pour les textareas compacts
export const CompactTextarea = ({ 
  rows = 3, 
  placeholder, 
  value, 
  onChange, 
  required = false,
  className = "",
  ...props 
}) => {
  return (
    <textarea
      rows={rows}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      className={`w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500 resize-none ${className}`}
      {...props}
    />
  );
};

export default CompactForm;
