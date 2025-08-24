import React from "react";

// Input: reusable input component for forms/search
const Input = React.forwardRef(({ className = "", ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={`w-full px-3 py-2 border border-gray-200 rounded text-neutral bg-background focus:outline-none focus:ring-2 focus:ring-primary ${className}`}
      {...props}
    />
  );
});
Input.displayName = "Input";

export default Input;
