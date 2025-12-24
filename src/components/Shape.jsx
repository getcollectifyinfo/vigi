import React from 'react';

const Shape = ({ type, color, size = 100 }) => {
  const getColor = (c) => {
    const map = {
      red: '#ef4444',
      blue: '#3b82f6',
      green: '#22c55e',
      yellow: '#eab308',
      purple: '#a855f7'
    };
    return map[c] || c;
  };

  const fill = getColor(color);

  const renderShape = () => {
    switch (type) {
      case 'square':
        return <rect x="10" y="10" width="80" height="80" fill={fill} rx="4" />;
      case 'triangle':
        return <polygon points="50,10 90,90 10,90" fill={fill} />;
      case 'circle':
      default:
        return <circle cx="50" cy="50" r="40" fill={fill} />;
    }
  };

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className="transition-all duration-300 ease-in-out">
      {renderShape()}
    </svg>
  );
};

export default Shape;
