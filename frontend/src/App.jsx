import React from "react";
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

export default function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ดึง 24h forecast
  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        setLoading(true);
        const url = `${import.meta.env.VITE_BACKEND_URL}/api/forecast-24h`;
        const response = await fetch(url);
        const json = await response.json();

        console.log("24h forecast:", json.hours);
        setData(json.hours || []);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching weather data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, []);

  const getWeatherIcon = (weather) => {
    if (!weather) return "🌤️";
    const w = weather.toLowerCase();
    if (w.includes("clear")) return "☀️";
    if (w.includes("partly") || w.includes("mainly")) return "⛅";
    if (w.includes("overcast") || w.includes("cloud")) return "☁️";
    if (w.includes("thunder")) return "⛈️";
    if (w.includes("snow")) return "❄️";
    if (w.includes("drizzle") || w.includes("rain")) return "🌧️";
    if (w.includes("fog")) return "🌫️";
    return "🌤️";
  };

  const formatChartTime = (timeString) => {
    return new Date(timeString).toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const prepareChartData = () => {
    return data.map((item) => ({
      time: formatChartTime(item.time),
      อุณหภูมิ: item.temp,
      ความชื้น: item.humidity,
      ฝน: item.precipitation,
      ลม: item.windspeed,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-600 mt-4 text-center">
            กำลังโหลดข้อมูลสภาพอากาศ...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-xl max-w-md">
          <div className="text-red-500 text-4xl text-center mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 text-center mb-2">
            เกิดข้อผิดพลาด
          </h2>
          <p className="text-gray-600 text-center">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🌤️ Weather Dashboard
          </h1>
          <p className="text-blue-100">พยากรณ์อากาศ 24 ชั่วโมงข้างหน้า</p>
        </div>

        {/* Current Weather Summary */}
        {data.length > 0 && (
          <div className="bg-white/20 backdrop-blur-md rounded-xl p-6 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold">ขณะนี้</h2>
                <p className="text-blue-100">{formatChartTime(data[0].time)}</p>
              </div>
              <div className="text-center">
                <div className="text-6xl mb-2">
                  {getWeatherIcon(data[0].weather)}
                </div>
                <p className="text-lg">{data[0].weather}</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold">{data[0].temp}°C</div>
                <p className="text-blue-100">ความชื้น {data[0].humidity}%</p>
              </div>
            </div>
          </div>
        )}

        {/* Charts Section */}
        {data.length > 0 && (
          <div className="grid gap-6 lg:grid-cols-2 mb-8">
            {/* Temperature and Humidity Chart */}
            <div className="bg-white rounded-xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                อุณหภูมิ & ความชื้น
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={prepareChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis yAxisId="temp" orientation="left" />
                  <YAxis yAxisId="humidity" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="temp"
                    type="monotone"
                    dataKey="อุณหภูมิ"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }}
                  />
                  <Line
                    yAxisId="humidity"
                    type="monotone"
                    dataKey="ความชื้น"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Precipitation and Wind Chart */}
            <div className="bg-white rounded-xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                ฝน & ลม
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={prepareChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis yAxisId="rain" orientation="left" />
                  <YAxis yAxisId="wind" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar
                    yAxisId="rain"
                    dataKey="ฝน"
                    fill="#06b6d4"
                    opacity={0.8}
                  />
                  <Line
                    yAxisId="wind"
                    type="monotone"
                    dataKey="ลม"
                    stroke="#10b981"
                    strokeWidth={3}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Hourly Forecast */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4">
            <h3 className="text-xl font-semibold text-white">
              พยากรณ์รายชั่วโมง
            </h3>
          </div>

          <div className="p-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {data.map((hour, idx) => (
                <div
                  key={idx}
                  className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-600">
                      {formatChartTime(hour.time)}
                    </span>
                    <span className="text-2xl">
                      {getWeatherIcon(hour.weather)}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-gray-800">
                        {hour.temp}°C
                      </span>
                    </div>

                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex justify-between">
                        <span>💧 ความชื้น:</span>
                        <span className="font-medium">{hour.humidity}%</span>
                      </div>

                      <div className="flex justify-between">
                        <span>🌧️ ฝน:</span>
                        <span className="font-medium">
                          {hour.precipitation}%
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span>💨 ลม:</span>
                        <span className="font-medium">
                          {hour.windspeed} km/h
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-xs text-center text-gray-600 font-medium">
                        {hour.weather}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-blue-100 text-sm">
            อัพเดทล่าสุด: {new Date().toLocaleString("th-TH")}
          </p>
        </div>
      </div>
    </div>
  );
}
