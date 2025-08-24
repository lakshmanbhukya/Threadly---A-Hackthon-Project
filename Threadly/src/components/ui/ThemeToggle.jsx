import React, { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "./button";

export function ThemeToggle() {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    // Check if user has a saved theme preference
    const savedTheme = localStorage.getItem("threadly-theme");
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle(
        "light",
        savedTheme === "light"
      );
    } else {
      // Default to dark theme
      setTheme("dark");
      document.documentElement.classList.remove("light");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);

    // Toggle the light class on the document element
    document.documentElement.classList.toggle("light", newTheme === "light");

    // Save theme preference
    localStorage.setItem("threadly-theme", newTheme);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="w-9 h-9 p-0"
      title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
