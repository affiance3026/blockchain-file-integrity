import React from "react";
import { LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
const Sidebar = (
  {
  title,
  menuItems,
  activeTab,
  setActiveTab,
  onLogout,
}) => {
  const { darkMode, toggleTheme } = useTheme();
  return (
    <div
      className="
        w-[280px]
        h-screen
        fixed
        left-0
        top-0
        border-r
        border-gray-200
        dark:border-white/10
        bg-white/60
        dark:bg-white/5
        backdrop-blur-2xl
        shadow-xl
        p-6
        flex
        flex-col
        justify-between
      "
    >
      {/* Top Section */}
      <div>
        <h1
          className="
            text-2xl
            font-bold
            mb-10
            bg-gradient-to-r
            from-blue-600
            via-cyan-500
            to-purple-500
            bg-clip-text
            text-transparent
          "
        >
          {title}
        </h1>

        <div className="space-y-3">
          {menuItems.map((item) => (
            <button
              key={item}
              onClick={() => setActiveTab(item)}
              className={`
                w-full
                text-left
                px-5
                py-3
                rounded-2xl
                font-medium
                transition-all
                duration-300
                ${
                  activeTab === item
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-white/10"
                }
              `}
            >
              {item}
            </button>
          ))}
        </div>
      </div>


      {/* Bottom Section */}
      <div className="space-y-3">

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="
            w-full
            flex
            items-center
            gap-3
            px-5
            py-3
            rounded-2xl
            text-gray-700
            dark:text-gray-200
            hover:bg-gray-100
            dark:hover:bg-white/10
            transition-all
            duration-300
            font-medium
          "
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}

          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>
        
        {/* Logout */}
        <button
          onClick={onLogout}
          className="
            w-full
            flex
            items-center
            gap-3
            px-5
            py-3
            rounded-2xl
            text-red-500
            hover:bg-red-50
            dark:hover:bg-red-500/10
            transition-all
            duration-300
            font-medium
          "
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;