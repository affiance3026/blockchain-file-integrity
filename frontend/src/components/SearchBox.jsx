import React from "react";
import { Search } from "lucide-react";

const SearchBox = ({ value, onChange, placeholder = "Search..." }) => {
  return (
    <div
      className="
        flex
        items-center
        gap-2
        px-4
        py-2
        rounded-xl
        border
        bg-white/70
        dark:bg-white/5
        border-gray-200
        dark:border-white/10
        backdrop-blur-xl
        shadow-sm
        w-full
        max-w-sm
      "
    >
      <Search size={18} className="text-gray-500 dark:text-gray-300" />

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="
          w-full
          bg-transparent
          outline-none
          text-gray-900
          dark:text-white
          placeholder:text-gray-400
        "
      />
    </div>
  );
};

export default SearchBox;