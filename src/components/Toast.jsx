import { AlertCircle, CheckCircle, Info, X, XCircle } from "lucide-react";
import React, { useEffect, useState } from "react";

const Toast = ({
  type = "info",
  title,
  message,
  duration = 5000,
  onClose,
  show = true,
}) => {
  const [isVisible, setIsVisible] = useState(show);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  useEffect(() => {
    setIsVisible(show);
  }, [show]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, 300);
  };

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case "error":
        return <XCircle className="w-5 h-5 text-red-400" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      default:
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getStyles = () => {
    const baseStyles = "transform transition-all duration-300 ease-in-out";
    const positionStyles = isExiting
      ? "translate-x-full opacity-0"
      : "translate-x-0 opacity-100";

    switch (type) {
      case "success":
        return `bg-green-50 border-green-200 text-green-800 ${baseStyles} ${positionStyles}`;
      case "error":
        return `bg-red-50 border-red-200 text-red-800 ${baseStyles} ${positionStyles}`;
      case "warning":
        return `bg-yellow-50 border-yellow-200 text-yellow-800 ${baseStyles} ${positionStyles}`;
      default:
        return `bg-blue-50 border-blue-200 text-blue-800 ${baseStyles} ${positionStyles}`;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
      <div className={`rounded-lg border p-4 shadow-lg ${getStyles()}`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">{getIcon()}</div>
          <div className="ml-3 flex-1">
            {title && <h3 className="text-sm font-medium">{title}</h3>}
            {message && <p className="text-sm mt-1">{message}</p>}
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={handleClose}
              className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toast;


