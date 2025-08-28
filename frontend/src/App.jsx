// frontend/src/App.jsx
import { useEffect, useState } from "react";

export default function App() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("http://localhost:4000/api/weather")
      .then(res => res.json())
      .then(setData);
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">🌤️ Weather Dashboard</h1>
      <div className="grid gap-4">
        {data.map((w, idx) => (
          <div key={idx} className="p-4 bg-white rounded shadow">
            <h2 className="text-xl">{w.city}</h2>
            <p>🌡️ Temp: {w.temp}°C</p>
            <p>💧 Humidity: {w.humidity}%</p>
            <p>☁️ {w.weather}</p>
            <small>{new Date(w.timestamp).toLocaleString()}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
