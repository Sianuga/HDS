import React from 'react';
import './DroneStatus.css';

function DroneStatus({ drones, telemetry }) {
  const getDroneStatus = (droneId) => {
    const tel = telemetry.find(t => t.drone_id === droneId);
    return tel || null;
  };

  const getStatusBadge = (status) => {
    const badges = {
      'active': { text: 'Aktywny', class: 'status-active' },
      'idle': { text: 'Gotowy', class: 'status-idle' },
      'returning': { text: 'Powrót', class: 'status-returning' },
      'error': { text: 'Awaria', class: 'status-error' },
      'offline': { text: 'Offline', class: 'status-offline' }
    };
    return badges[status] || badges['idle'];
  };

  return (
    <div className="drone-status">
      <div className="panel-header">
        <span className="icon">📊</span>
        <h2>Status Dronów</h2>
      </div>

      <div className="drone-list">
        {drones.length === 0 ? (
          <div className="no-drones">
            <p>Brak aktywnych dronów</p>
            <p className="hint">Rozpocznij misję aby utworzyć drony</p>
          </div>
        ) : (
          drones.slice(0, 4).map(drone => {
            const status = getDroneStatus(drone.id);
            const badge = getStatusBadge(drone.status);

            return (
              <div key={drone.id} className="drone-card">
                <div className="drone-card-header">
                  <span className="drone-icon">🚁</span>
                  <span className="drone-name">{drone.name}</span>
                  <span className={`status-badge ${badge.class}`}>
                    {badge.text}
                  </span>
                </div>

                <div className="drone-card-body">
                  <div className="stat-row">
                    <span className="stat-label">🔋 Bateria:</span>
                    <div className="battery-bar">
                      <div
                        className="battery-fill"
                        style={{
                          width: `${drone.battery}%`,
                          background: drone.battery > 20 ? '#00ff88' : '#ff4444'
                        }}
                      />
                      <span className="battery-text">{drone.battery.toFixed(0)}%</span>
                    </div>
                  </div>

                  {status && (
                    <>
                      <div className="stat-row">
                        <span className="stat-label">📍 Pozycja X:</span>
                        <span className="stat-value">{status.position_x.toFixed(0)} px</span>
                      </div>

                      <div className="stat-row">
                        <span className="stat-label">📍 Pozycja Y:</span>
                        <span className="stat-value">{status.position_y.toFixed(0)} px</span>
                      </div>

                      <div className="stat-row">
                        <span className="stat-label">⚡ Prędkość:</span>
                        <span className="stat-value">{status.velocity.toFixed(1)} px/s</span>
                      </div>

                      <div className="stat-row">
                        <span className="stat-label">🧭 Kierunek:</span>
                        <span className="stat-value">{status.heading.toFixed(0)}°</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {drones.length > 4 && (
        <div className="more-drones">
          +{drones.length - 4} więcej dronów
        </div>
      )}
    </div>
  );
}

export default DroneStatus;