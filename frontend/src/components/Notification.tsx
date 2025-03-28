import { useEffect } from 'react';

interface NotificationProps {
  message: string;
  type?: 'success' | 'error';
  onClose?: () => void;
  duration?: number;
}

function Notification({ message, type = 'success', onClose, duration = 5000 }: NotificationProps) {
  useEffect(() => {
    if (onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [onClose, duration]);

  const backgroundColor = type === 'success' ? '#4caf50' : '#f44336';

  return (
    <div
      style={{
        position: 'fixed',
        top: '1rem',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '1rem 2rem',
        backgroundColor,
        color: 'white',
        borderRadius: '4px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
      }}
    >
      <span>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            fontSize: '1.2rem',
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}

export default Notification;
