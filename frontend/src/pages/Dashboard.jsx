import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiRefreshCw, FiDownload } from 'react-icons/fi';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import StatsCard from '../components/StatsCard';
import './Dashboard.css';

function Dashboard() {
  const [devices, setDevices] = useState([]);
  const [telemetry, setTelemetry] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);  // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      const [devicesRes, telemetryRes, eventsRes] = await Promise.all([
        api.get('/devices'),
        api.get('/telemetry?limit=100'),
        api.get('/events?limit=50')
      ]);

      setDevices(devicesRes.data.data);
      setTelemetry(telemetryRes.data.data);
      setEvents(eventsRes.data.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
      setLoading(false);
    }
  };

  const activeDevices = devices.filter(d => d.status === 'active').length;
  const avgTemp = telemetry.length > 0
    ? (telemetry.reduce((sum, t) => sum + t.temperature, 0) / telemetry.length).toFixed(1)
    : 'N/A';
  const avgHumidity = telemetry.length > 0
    ? (telemetry.reduce((sum, t) => sum + t.humidity, 0) / telemetry.length).toFixed(1)
    : 'N/A';

  if (loading) return <div className="dashboard-loading">Loading dashboard...</div>;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Wildlife Monitoring Dashboard</h1>
        <button onClick={fetchDashboardData} className="btn-refresh">
          <FiRefreshCw /> Refresh
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* Stats Cards */}
      <div className="stats-grid">
        <StatsCard
          title="Active Devices"
          value={activeDevices}
          total={devices.length}
          icon="📡"
          color="blue"
        />
        <StatsCard
          title="Avg Temperature"
          value={avgTemp}
          unit="°C"
          icon="🌡️"
          color="orange"
        />
        <StatsCard
          title="Avg Humidity"
          value={avgHumidity}
          unit="%"
          icon="💧"
          color="cyan"
        />
        <StatsCard
          title="Recent Events"
          value={events.length}
          icon="📹"
          color="green"
        />
      </div>

      {/* Charts */}
      <div className="charts-grid">
        {/* Temperature Trend */}
        <div className="chart-card">
          <h3>Temperature Trend (Last 24h)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={telemetry.slice(0, 24)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="createdAt" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="temperature" stroke="#ff7300" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Humidity Trend */}
        <div className="chart-card">
          <h3>Humidity Trend (Last 24h)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={telemetry.slice(0, 24)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="createdAt" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="humidity" fill="#82ca9d" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Air Quality */}
        <div className="chart-card">
          <h3>Air Quality (PM2.5)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={telemetry.slice(0, 24)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="createdAt" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="pm25" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Events */}
      <div className="recent-section">
        <div className="section-header">
          <h3>Recent Wildlife Events</h3>
          <Link to="/events">View all →</Link>
        </div>
        <div className="events-list">
          {events.slice(0, 5).map((event) => (
            <div key={event.id} className="event-item">
              <div className="event-type">{event.event_type}</div>
              <div className="event-details">
                <span className="device-name">{event.device?.name}</span>
                <span className="event-time">{new Date(event.createdAt).toLocaleString()}</span>
              </div>
              {event.confidence && <span className="confidence">{(event.confidence * 100).toFixed(0)}%</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
