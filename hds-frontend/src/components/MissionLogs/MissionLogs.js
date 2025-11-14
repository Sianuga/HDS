import React, { useRef, useEffect } from 'react';
import './MissionLogs.css';

function MissionLogs({ logs }) {
  const logsEndRef = useRef(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const getLogIcon = (type) => {
    const icons = {
      'mission': '📡',
      'alert': '⚠️',
      'error': '❌',
      'success': '✓',
      'info': 'ℹ️'
    };
    return icons[type] || 'ℹ️';
  };

  const getLogClass = (type) => {
    return `log-entry log-${type}`;
  };

  return (
    <div className="mission-logs">
      <div className="panel-header">
        <span className="icon">📋</span>
        <h2>Telemetria & Logi Misji</h2>
      </div>

      <div className="logs-subtitle">
        Zapis trajektorii, decyzji i stanu technicznego
      </div>

      <div className="logs-container">
        {logs.length === 0 ? (
          <div className="no-logs">
            <p>Brak logów</p>
            <p className="hint">Logi pojawią się po rozpoczęciu misji</p>
          </div>
        ) : (
          <div className="logs-list">
            {logs.map(log => (
              <div key={log.id} className={getLogClass(log.type)}>
                <span className="log-icon">{getLogIcon(log.type)}</span>
                <div className="log-content">
                  <span className="log-type">{log.type}</span>
                  <span className="log-timestamp">{log.timestamp}</span>
                  <p className="log-message">{log.message}</p>
                </div>
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        )}
      </div>

      <div className="logs-footer">
        <span>Łącznie logów: {logs.length}</span>
        {logs.length > 0 && (
          <button
            className="btn-clear-logs"
            onClick={() => window.location.reload()}
          >
            🗑️ Wyczyść
          </button>
        )}
      </div>
    </div>
  );
}

export default MissionLogs;