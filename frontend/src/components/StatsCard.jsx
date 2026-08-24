import React from 'react';
import './StatsCard.css';

function StatsCard({ title, value, total, unit, icon, color = 'blue' }) {
  const percentage = total ? ((value / total) * 100).toFixed(0) : null;

  return (
    <div className={`stats-card stats-card-${color}`}>
      <div className="stats-icon">{icon}</div>
      <div className="stats-content">
        <div className="stats-title">{title}</div>
        <div className="stats-value">
          {value}
          {unit && <span className="stats-unit">{unit}</span>}
        </div>
        {total && <div className="stats-meta">{percentage}% of {total}</div>}
      </div>
    </div>
  );
}

export default StatsCard;
