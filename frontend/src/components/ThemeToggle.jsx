import React from "react";
import { useTheme } from "../context/ThemeContext";

const ThemeToggle = () => {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="
        px-4 py-2
        rounded-xl
        border
        transition-all
        duration-300
        shadow-md
        backdrop-blur-md
        bg-white/10
        dark:bg-white/5
        border-gray-300
        dark:border-gray-700
        text-gray-800
        dark:text-white
        hover:scale-105
      "
    >
      {darkMode ? "☀ Light Mode" : "🌙 Dark Mode"}
    </button>
  );
};

export default ThemeToggle;