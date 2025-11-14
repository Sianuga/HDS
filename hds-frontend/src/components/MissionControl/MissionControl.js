import React, { useState } from 'react';
import './MissionControl.css';
import { createDrone } from '../../services/api';

function MissionControl({ onMissionStart, onMissionEnd, activeMission }) {
  const [droneCount, setDroneCount] = useState(5);
  const [missionType, setMissionType] = useState('formation');
  const [formationType, setFormationType] = useState('V');
  const [targetX, setTargetX] = useState(250);
  const [targetY, setTargetY] = useState(250);

  const handleStartMission = async () => {
    try {
      // Create drones for the mission
      const dronePromises = [];
      for (let i = 0; i < droneCount; i++) {
        dronePromises.push(
          createDrone({
            name: `Dron-${Date.now()}-${i}`,
            status: 'active',
            battery: 100.0
          })
        );
      }

      await Promise.all(dronePromises);

      const missionData = {
        droneCount,
        missionType,
        formationType,
        target: { x: targetX, y: targetY }
      };

      onMissionStart(missionData);
    } catch (error) {
      console.error('Error starting mission:', error);
      alert('Błąd podczas rozpoczynania misji');
    }
  };

  return (
    <div className="mission-control">
      <div className="panel-header">
        <span className="icon">📡</span>
        <h2>Panel Sterowania Misją</h2>
      </div>

      <div className="mission-info">
        {activeMission ? (
          <p className="mission-active">✓ Misja aktywna</p>
        ) : (
          <p className="mission-inactive">UC1: Uruchomienie i zarządzanie misją</p>
        )}
      </div>

      <div className="control-group">
        <label>Liczba dronów (N): {droneCount}</label>
        <input
          type="range"
          min="3"
          max="20"
          value={droneCount}
          onChange={(e) => setDroneCount(parseInt(e.target.value))}
          disabled={activeMission !== null}
        />
      </div>

      <div className="control-group">
        <label>Typ misji:</label>
        <select
          value={missionType}
          onChange={(e) => setMissionType(e.target.value)}
          disabled={activeMission !== null}
        >
          <option value="formation">UC3: Formacja lotu</option>
          <option value="search">UC2: Poszukiwanie obiektu</option>
          <option value="patrol">Patrol obszaru</option>
        </select>
      </div>

      <div className="control-group">
        <label>Typ formacji:</label>
        <select
          value={formationType}
          onChange={(e) => setFormationType(e.target.value)}
          disabled={activeMission !== null}
        >
          <option value="V">Formacja V</option>
          <option value="line">Linia</option>
          <option value="circle">Okrąg</option>
        </select>
      </div>

      <div className="control-group">
        <label>Pozycja celu X: {targetX}px</label>
        <input
          type="range"
          min="50"
          max="450"
          value={targetX}
          onChange={(e) => setTargetX(parseInt(e.target.value))}
          disabled={activeMission !== null}
        />
      </div>

      <div className="control-group">
        <label>Pozycja celu Y: {targetY}px</label>
        <input
          type="range"
          min="50"
          max="450"
          value={targetY}
          onChange={(e) => setTargetY(parseInt(e.target.value))}
          disabled={activeMission !== null}
        />
      </div>

      {!activeMission ? (
        <button className="btn-start" onClick={handleStartMission}>
          ⏵ Zakończ misję
        </button>
      ) : (
        <button className="btn-stop" onClick={onMissionEnd}>
          ⏹ Zakończ misję
        </button>
      )}
    </div>
  );
}

export default MissionControl;