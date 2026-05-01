import React from "react";

const ConfirmModal = ({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  confirmColor = "bg-blue-600 hover:bg-blue-700",
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/40
        backdrop-blur-sm
        px-4
      "
    >
      <div
        className="
          w-full
          max-w-md
          rounded-3xl
          border
          bg-white/90
          dark:bg-[#0B1120]/90
          border-gray-200
          dark:border-white/10
          backdrop-blur-2xl
          shadow-2xl
          p-8
          animate-fadeIn
        "
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {title}
        </h2>

        <p className="mt-4 text-gray-600 dark:text-gray-300 leading-relaxed">
          {message}
        </p>

        <div className="flex gap-4 mt-8">
          <button
            onClick={onCancel}
            className="
              flex-1
              py-3
              rounded-2xl
              border
              border-gray-300
              dark:border-gray-700
              text-gray-700
              dark:text-gray-200
              hover:bg-gray-100
              dark:hover:bg-white/10
              transition-all
              duration-300
              font-medium
            "
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            className={`
              flex-1
              py-3
              rounded-2xl
              text-white
              font-medium
              transition-all
              duration-300
              shadow-lg
              ${confirmColor}
            `}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;