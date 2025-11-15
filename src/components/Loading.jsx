import React from "react";

const Loading = ({
  size = "md",
  text = "Chargement...",
  fullScreen = false,
  className = "",
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "w-6 h-6";
      case "lg":
        return "w-12 h-12";
      case "xl":
        return "w-16 h-16";
      default:
        return "w-8 h-8";
    }
  };

  const spinner = (
    <div
      className={`${getSizeClasses()} animate-spin rounded-full border-2 border-gray-300 border-t-green-600`}
    />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        <div className="text-center">
          {spinner}
          {text && <p className="mt-4 text-gray-600 text-sm">{text}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {spinner}
      {text && <p className="mt-2 text-gray-600 text-sm">{text}</p>}
    </div>
  );
};

export default Loading;

