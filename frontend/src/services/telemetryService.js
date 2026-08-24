import api from '../api';

const teleService = {
  // Get telemetry data
  getTelemetry: async (params = {}) => {
    const response = await api.get('/telemetry', { params });
    return response.data;
  },

  // Get telemetry by device
  getDeviceTelemetry: async (deviceId, params = {}) => {
    const response = await api.get('/telemetry', {
      params: { ...params, deviceId }
    });
    return response.data;
  },

  // Get telemetry statistics
  getTelemetryStats: async (params = {}) => {
    const response = await api.get('/telemetry/stats/summary', { params });
    return response.data;
  }
};

export default teleService;
