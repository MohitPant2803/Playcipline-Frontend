import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Toast({ message, type = 'success', duration = 3000 }) {
  const [visible, setVisible] = useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  if (!visible) return null;

  const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';

  return (
    <div className={`toast ${bgColor}`}>
      {message}
    </div>
  );
}
