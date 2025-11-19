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
      <div className="flash-message">
        <p>{message}</p>
        <button onClick={handleClose}>x</button>
      </div>
    )
  );
};

export default FlashMessage;