import React from 'react';
import '../../Styles/PopupDialog.css';

const icons = {
  success: (
    <svg className="popup-icon" viewBox="0 0 48 48" width="48" height="48">
      <circle cx="24" cy="24" r="24" fill="#2d2a81" />
      <polyline points="14,26 22,34 34,16" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  error: (
    <svg className="popup-icon" viewBox="0 0 48 48" width="48" height="48">
      <circle cx="24" cy="24" r="24" fill="#dc3545" />
      <line x1="16" y1="16" x2="32" y2="32" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
      <line x1="32" y1="16" x2="16" y2="32" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
    </svg>
  ),
  warning: (
    <svg className="popup-icon" viewBox="0 0 48 48" width="48" height="48">
      <circle cx="24" cy="24" r="24" fill="#ffc107" />
      <line x1="24" y1="14" x2="24" y2="28" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
      <circle cx="24" cy="36" r="2.5" fill="#fff" />
    </svg>
  ),
};

export default function PopupDialog({ open, type = 'success', title, message, onClose, children }) {
  if (!open) return null;
  return (
    <div className="popup-overlay">
      <div className="popup-dialog">
        <button className="popup-close" onClick={onClose}>&times;</button>
        <div className="popup-icon-wrapper">{icons[type]}</div>
        <div className="popup-title">{title}</div>
        <div className="popup-message">{message}</div>
        {children}
      </div>
    </div>
  );
} 