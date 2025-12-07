import React, { useState, useEffect } from "react";

const FlashMessage = ({ message, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onClose();
    }, 3000);

    return () => {
      clearTimeout(timer);
    };
  }, [onClose]);

  const handleClose = () => {
    setVisible(false);
    onClose();
  };

  return (
    visible && (
      <div className="fixed top-24 right-4 z-[60]">
        <div className="flex items-center gap-3 rounded-md bg-slate-700 text-white px-4 py-2 shadow-lg border border-slate-600">
          <p className="text-sm">{message}</p>
          <button
            type="button"
            onClick={handleClose}
            className="text-white/80 hover:text-white text-sm"
            aria-label="Close"
          >
            ×
          </button>
        </div>
      </div>
    )
  );
};

export default FlashMessage;