import React, { useEffect, useRef, useState } from 'react';
import './Map.css';

function Map({ drones, telemetry, mission, onLog }) {
  const canvasRef = useRef(null);
  const [obstacles, setObstacles] = useState([
    { x: 150, y: 150, radius: 30 },
    { x: 350, y: 200, radius: 40 },
    { x: 250, y: 350, radius: 35 }
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = '#0a0e27';
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = '#1a2744';
    ctx.lineWidth = 1;
    for (let i = 0; i <= width; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }
    for (let i = 0; i <= height; i += 50) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }

    // Draw geofencing border
    ctx.strokeStyle = '#00d9ff';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 5]);
    ctx.strokeRect(10, 10, width - 20, height - 20);
    ctx.setLineDash([]);

    // Draw obstacles (UC5: Omijanie przeszkody)
    obstacles.forEach(obstacle => {
      ctx.fillStyle = 'rgba(255, 68, 68, 0.3)';
      ctx.beginPath();
      ctx.arc(obstacle.x, obstacle.y, obstacle.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ff4444';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Draw target if mission is active
    if (mission && mission.target) {
      const { x, y } = mission.target;
      ctx.fillStyle = 'rgba(0, 255, 136, 0.2)';
      ctx.beginPath();
      ctx.arc(x, y, 50, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#00ff88';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y, 50, 0, Math.PI * 2);
      ctx.stroke();

      // Draw crosshair
      ctx.beginPath();
      ctx.moveTo(x - 15, y);
      ctx.lineTo(x + 15, y);
      ctx.moveTo(x, y - 15);
      ctx.lineTo(x, y + 15);
      ctx.stroke();
    }

    // Draw drones with telemetry data
    telemetry.forEach((tel, index) => {
      const x = tel.position_x;
      const y = tel.position_y;

      // Determine drone color based on status
      let droneColor;
      let statusText;
      switch (tel.status) {
        case 'active':
          droneColor = '#00ff88';
          statusText = 'Aktywny';
          break;
        case 'returning':
          droneColor = '#ffaa00';
          statusText = 'Powrót (RTH)';
          break;
        case 'error':
          droneColor = '#ff4444';
          statusText = 'Awaria';
          break;
        case 'offline':
          droneColor = '#666666';
          statusText = 'Przeszkoda';
          break;
        default:
          droneColor = '#00d9ff';
          statusText = 'Gotowy';
      }

      // Draw drone circle
      ctx.fillStyle = droneColor;
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fill();

      // Draw drone outline
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw heading indicator
      if (tel.heading !== undefined) {
        const headingRad = (tel.heading * Math.PI) / 180;
        const lineLength = 15;
        const endX = x + Math.cos(headingRad) * lineLength;
        const endY = y + Math.sin(headingRad) * lineLength;

        ctx.strokeStyle = droneColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      }

      // Draw drone label
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px monospace';
      ctx.fillText(`D${tel.drone_id}`, x + 12, y - 5);

      // Draw battery indicator
      const batteryWidth = 30;
      const batteryHeight = 4;
      const batteryX = x - batteryWidth / 2;
      const batteryY = y + 15;

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.strokeRect(batteryX, batteryY, batteryWidth, batteryHeight);

      const batteryFillWidth = (tel.battery / 100) * batteryWidth;
      ctx.fillStyle = tel.battery > 20 ? '#00ff88' : '#ff4444';
      ctx.fillRect(batteryX, batteryY, batteryFillWidth, batteryHeight);
    });

    // Draw legend
    const legendX = 20;
    const legendY = height - 80;

    ctx.font = '12px monospace';
    ctx.fillStyle = '#00ff88';
    ctx.fillText('● Aktywny', legendX, legendY);

    ctx.fillStyle = '#ffaa00';
    ctx.fillText('● Powrót (RTH)', legendX + 100, legendY);

    ctx.fillStyle = '#ff4444';
    ctx.fillText('● Awaria', legendX, legendY + 20);

    ctx.fillStyle = '#666666';
    ctx.fillText('● Przeszkoda', legendX + 100, legendY + 20);

  }, [drones, telemetry, mission, obstacles]);

  return (
    <div className="map-container">
      <div className="map-header">
        <h3>Algorytm Boids (flocking) • UC5: Unikanie kolizji • Komunikacja sąsiedzka</h3>
      </div>
      <canvas
        ref={canvasRef}
        width={500}
        height={500}
        className="map-canvas"
      />
      <div className="map-info">
        <span>Dronów aktywnych: {telemetry.filter(t => t.status === 'active').length}</span>
        <span>Cel: {mission ? `(${mission.target.x}, ${mission.target.y})` : 'Brak'}</span>
      </div>
    </div>
  );
}

export default Map;