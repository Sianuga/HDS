import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Drone endpoints
export const getDrones = async () => {
  const response = await api.get('/drones/');
  return response.data;
};

export const createDrone = async (droneData) => {
  const response = await api.post('/drones/', droneData);
  return response.data;
};

export const updateDrone = async (droneId, droneData) => {
  const response = await api.put(`/drones/${droneId}`, droneData);
  return response.data;
};

export const deleteDrone = async (droneId) => {
  await api.delete(`/drones/${droneId}`);
};

// Telemetry endpoints
export const getTelemetry = async (droneId = null) => {
  const url = droneId ? `/telemetry/?drone_id=${droneId}` : '/telemetry/';
  const response = await api.get(url);
  return response.data;
};

export const createTelemetry = async (telemetryData) => {
  const response = await api.post('/telemetry/', telemetryData);
  return response.data;
};

export const getLatestTelemetry = async (droneId) => {
  const response = await api.get(`/telemetry/drone/${droneId}/latest`);
  return response.data;
};

export default api;