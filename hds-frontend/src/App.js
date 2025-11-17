import React, { useState, useEffect } from 'react';
import './App.css';
import Map from './components/Map/Map';
import MissionControl from './components/MissionControl/MissionControl';
import MissionLogs from './components/MissionLogs/MissionLogs';
import DroneStatus from './components/DroneStatus/DroneStatus';
import { getDrones, getTelemetry } from './services/api';

function App() {
  const [drones, setDrones] = useState([]);
  const [telemetry, setTelemetry] = useState([]);
  const [logs, setLogs] = useState([]);
  const [mission, setMission] = useState(null);

  // Fetch drones and telemetry periodically
  useEffect(() => {
    const fetchData = async () => {
      try {
        const dronesData = await getDrones();
        const telemetryData = await getTelemetry();

        setDrones(dronesData.drones || []);
        setTelemetry(telemetryData.telemetry || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, []);

  const handleMissionStart = (missionData) => {
    setMission(missionData);
    const logEntry = {
      id: Date.now(),
      type: 'mission',
      timestamp: new Date().toLocaleTimeString(),
      message: `Misja rozpoczęta: ${missionData.droneCount} dronów, typ: ${missionData.missionType}`
    };
    setLogs(prev => [logEntry, ...prev]);
  };

  const handleMissionEnd = () => {
    const logEntry = {
      id: Date.now(),
      type: 'mission',
      timestamp: new Date().toLocaleTimeString(),
      message: 'Misja zakończona'
    };
    setLogs(prev => [logEntry, ...prev]);
    setMission(null);
  };

  const addLog = (type, message) => {
    const logEntry = {
      id: Date.now(),
      type: type,
      timestamp: new Date().toLocaleTimeString(),
      message: message
    };
    setLogs(prev => [logEntry, ...prev].slice(0, 100)); // Keep last 100 logs
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🚁 System Sterowania Chmarą Dronów UAS</h1>
        <p>Zadania Kooperacyjne & Rozproszona Koordynacja</p>
      </header>

      <div className="main-content">
        <div className="left-panel">
          <MissionControl
            onMissionStart={handleMissionStart}
            onMissionEnd={handleMissionEnd}
            activeMission={mission}
          />
          <DroneStatus drones={drones} telemetry={telemetry} />
        </div>

        <div className="center-panel">
          <Map
            drones={drones}
            telemetry={telemetry}
            mission={mission}
            onLog={addLog}
          />
        </div>

        <div className="right-panel">
          <MissionLogs logs={logs} />
        </div>
      </div>
    </div>
  );
}

export default App;