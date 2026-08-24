import React from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin, FiBattery, FiWifi } from 'react-icons/fi';
import './DeviceCard.css';

function DeviceCard({ device }) {
  const statusColors = {
    active: '#10b981',
    inactive: '#6b7280',
    maintenance: '#f59e0b',
    error: '#ef4444'
  };

  const habitatIcons = {
    birdhouse: '🐦',
    bat_box: '🦇',
    pollinator_shelter: '🐝',
    small_mammal_refuge: '🐿️'
  };

  return (
    <Link to={`/devices/${device.id}`} className="device-card">
      <div className="device-header">
        <div className="device-icon">{habitatIcons[device.habitat_type] || '📡'}</div>
        <div className="device-status" style={{ backgroundColor: statusColors[device.status] }}>
          {device.status}
        </div>
      </div>

      <h3>{device.name}</h3>
      <p className="device-id">{device.deviceId}</p>

      <div className="device-meta">
        {device.latitude && device.longitude && (
          <div className="meta-item">
            <FiMapPin size={16} />
            <span>{device.latitude.toFixed(4)}, {device.longitude.toFixed(4)}</span>
          </div>
        )}
        {device.battery_percentage !== null && (
          <div className="meta-item">
            <FiBattery size={16} />
            <span>{device.battery_percentage?.toFixed(0)}%</span>
          </div>
        )}
        {device.last_telemetry_at && (
          <div className="meta-item">
            <FiWifi size={16} />
            <span>{new Date(device.last_telemetry_at).toLocaleTimeString()}</span>
          </div>
        )}
      </div>
    </Link>
  );
}

export default DeviceCard;
