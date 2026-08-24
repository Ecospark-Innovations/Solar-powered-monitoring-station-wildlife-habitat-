import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiFilter } from 'react-icons/fi';
import api from '../services/api';
import DeviceCard from '../components/DeviceCard';
import './Devices.css';

function Devices() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({ status: 'all', habitat: 'all' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchDevices();
  }, [filter]);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter.status !== 'all') params.status = filter.status;
      if (filter.habitat !== 'all') params.habitat_type = filter.habitat;

      const response = await api.get('/devices', { params });
      setDevices(response.data.data);
      setError(null);
    } catch (err) {
      setError('Failed to load devices');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDevice = () => {
    navigate('/devices/new');
  };

  if (loading) return <div className="devices-loading">Loading devices...</div>;

  return (
    <div className="devices-page">
      <div className="page-header">
        <h1>Monitoring Stations</h1>
        <button onClick={handleAddDevice} className="btn-primary">
          <FiPlus /> Add Station
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* Filters */}
      <div className="filters">
        <div className="filter-group">
          <label>Status</label>
          <select value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })}>
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Habitat Type</label>
          <select value={filter.habitat} onChange={(e) => setFilter({ ...filter, habitat: e.target.value })}>
            <option value="all">All Types</option>
            <option value="birdhouse">Birdhouse</option>
            <option value="bat_box">Bat Box</option>
            <option value="pollinator_shelter">Pollinator Shelter</option>
            <option value="small_mammal_refuge">Small Mammal Refuge</option>
          </select>
        </div>
      </div>

      {/* Devices Grid */}
      <div className="devices-grid">
        {devices.length > 0 ? (
          devices.map((device) => <DeviceCard key={device.id} device={device} />)
        ) : (
          <div className="empty-state">
            <p>No devices found</p>
            <button onClick={handleAddDevice} className="btn-primary">
              Create your first station
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Devices;
