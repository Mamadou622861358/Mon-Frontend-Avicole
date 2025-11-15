import React from 'react';
import Toast from './Toast';

const ToastContainer = ({ toasts, onClose, position = 'top-right' }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          type={toast.type}
          title={toast.title}
          message={toast.message}
          duration={toast.duration}
          position={position}
          onClose={onClose}
        />
      ))}
    </div>
  );
};

export default ToastContainer;
