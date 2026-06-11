import React from "react";
import "./style/AuthPopup.css";

const AuthPopup = ({ onClose, onLogin }) => {
  return (
    <div className="auth-popup-overlay">
      <div className="auth-popup-content">
        <button className="auth-popup-close" onClick={onClose}>
          ✕
        </button>
        <div className="auth-popup-icon">🔒</div>
        <h3>Authentication Required</h3>
        <p>Please sign in to access this feature.</p>
        <button className="auth-popup-btn" onClick={onLogin}>
          Continue with Google
        </button>
      </div>
    </div>
  );
};

export default AuthPopup;
