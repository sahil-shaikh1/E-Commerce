import React from 'react';

const Notification = ({ message, type = 'success' }) => {
  if (!message) return null;

  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
  const icon = type === 'success' ? '🎉' : '⚠️';

  return (
    <div className={`fixed top-24 right-5 ${bgColor} text-white py-3 px-6 rounded-lg shadow-2xl z-50 animate-fade-in-out border-l-4 ${type === 'success' ? 'border-green-400' : 'border-red-400'}`}>
      <div className="flex items-center gap-3">
        <span className="text-lg">{icon}</span>
        <span className="font-semibold">{message}</span>
      </div>
    </div>
  );
};

export default Notification;