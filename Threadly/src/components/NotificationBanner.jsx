import React from "react";

// NotificationBanner: shows alerts/messages (info, error, success)
const typeStyles = {
  info: "bg-primary/10 text-primary border-primary",
  error: "bg-danger/10 text-danger border-danger",
  success: "bg-green-100 text-green-700 border-green-400",
};

const NotificationBanner = ({ message, type = "info", onClose }) => {
  if (!message) return null;
  return (
    <div
      className={`w-full px-4 py-2 rounded border mb-4 flex items-center justify-between shadow-card ${
        typeStyles[type] || typeStyles.info
      }`}
    >
      <span>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-4 text-xl font-bold leading-none focus:outline-none"
        >
          &times;
        </button>
      )}
    </div>
  );
};

export default NotificationBanner;