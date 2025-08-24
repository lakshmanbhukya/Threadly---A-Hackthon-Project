import React from "react";

export function Card({ className = "", children, ...props }) {
  return (
    <div
      className={`bg-card rounded-lg shadow-card border border-gray-100 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
