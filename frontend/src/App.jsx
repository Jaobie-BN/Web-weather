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
  ComposedChart,
} from "recharts";

export default function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Mock data for demo (replace with your API)
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const url = `${import.meta.env.VITE_BACKEND_URL}/api/forecast-24h`;
        const r = await fetch(url);
        const json = await r.json();
        setData(json.hours || []);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching weather data:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
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

  const getWeatherGradient = (weather) => {
    if (!weather) return "from-blue-400 to-blue-600";
    const w = weather.toLowerCase();
    if (w.includes("clear")) return "from-amber-400 to-orange-500";
    if (w.includes("partly")) return "from-blue-400 to-cyan-500";
    if (w.includes("cloud") || w.includes("overcast"))
      return "from-gray-400 to-gray-600";
    if (w.includes("rain")) return "from-slate-400 to-slate-600";
    if (w.includes("thunder")) return "from-purple-500 to-indigo-700";
    return "from-blue-400 to-blue-600";
  };

  const formatChartTime = (timeString) => {
    return new Date(timeString).toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatFullTime = (date) => {
    return date.toLocaleString("th-TH", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const prepareChartData = () => {
    return data.slice(0, 12).map((item) => ({
      time: formatChartTime(item.time),
      fullTime: item.time,
      อุณหภูมิ: item.temp,
      ความชื้น: item.humidity,
      ฝน: item.precipitation ?? 0,
      ลม: item.windspeed ?? null,
    }));
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-2xl border border-white/20">
          <p className="font-semibold text-gray-800 mb-2">{`เวลา: ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value}${
                entry.dataKey === "อุณหภูมิ"
                  ? "°C"
                  : entry.dataKey === "ความชื้น" || entry.dataKey === "ฝน"
                  ? "%"
                  : entry.dataKey === "ลม"
                  ? " km/h"
                  : ""
              }`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-white/30 rounded-full animate-spin"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-t-white rounded-full animate-spin"></div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-white rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-2 h-2 bg-white rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
            <p className="text-white/90 text-lg font-medium">
              กำลังโหลดข้อมูลสภาพอากาศ
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20 max-w-md">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-pulse">⚠️</div>
            <h2 className="text-2xl font-bold text-white mb-4">
              เกิดข้อผิดพลาด
            </h2>
            <p className="text-white/80 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-xl font-medium transition-all duration-200 hover:scale-105"
            >
              ลองใหม่
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentWeather = data[0];
  const backgroundGradient = currentWeather
    ? getWeatherGradient(currentWeather.weather)
    : "from-blue-400 to-blue-600";

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${backgroundGradient} relative overflow-hidden`}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-block bg-white/10 backdrop-blur-md rounded-2xl px-8 py-6 shadow-2xl border border-white/20">
            <h1 className="text-5xl font-bold text-white mb-2 bg-gradient-to-r from-white to-white/80 bg-clip-text">
              Weather Dashboard
            </h1>
            <p className="text-white/80 text-lg">พยากรณ์อากาศแบบเรียลไทม์</p>
            <p className="text-white/60 text-sm mt-2">
              {formatFullTime(currentTime)}
            </p>
          </div>
        </div>

        {/* Current Weather Hero Section */}
        {data.length > 0 && (
          <div className="bg-white/15 backdrop-blur-md rounded-3xl p-8 mb-8 text-white shadow-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 animate-slide-up">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              <div className="text-center md:text-left">
                <h2 className="text-3xl font-bold mb-2">สภาพอากาศปัจจุบัน</h2>
                <p className="text-white/80 text-lg">
                  {formatChartTime(data[0].time)}
                </p>
                <div className="mt-4">
                  <div className="text-6xl font-bold">{data[0].temp}°C</div>
                  <p className="text-white/80 mt-2">
                    รู้สึกเหมือน {data[0].temp + 2}°C
                  </p>
                </div>
              </div>

              <div className="text-center">
                <div className="text-8xl mb-4 animate-bounce">
                  {getWeatherIcon(data[0].weather)}
                </div>
                <p className="text-xl font-semibold">{data[0].weather}</p>
              </div>

              <div className="space-y-4">
                <div className="bg-white/10 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">💧 ความชื้น</span>
                    <span className="text-xl font-bold">
                      {data[0].humidity}%
                    </span>
                  </div>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">🌧️ โอกาสฝนตก</span>
                    <span className="text-xl font-bold">
                      {data[0].precipitation}%
                    </span>
                  </div>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">💨 ความเร็วลม</span>
                    <span className="text-xl font-bold">
                      {data[0].windspeed} km/h
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts Section */}
        {data.length > 0 && (
          <div className="grid gap-8 lg:grid-cols-2 mb-8">
            {/* Temperature and Humidity Chart */}
            <div
              className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 overflow-hidden hover:bg-white/15 transition-all duration-300 animate-slide-up"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="bg-gradient-to-r from-red-500/20 to-blue-500/20 p-6 border-b border-white/20">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <span className="mr-2">🌡️</span>
                  อุณหภูมิ & ความชื้น
                </h3>
              </div>
              <div className="p-6">
                <ResponsiveContainer width="100%" height={350}>
                  <ComposedChart data={prepareChartData()}>
                    <defs>
                      <linearGradient
                        id="tempGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#ef4444"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#ef4444"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                      <linearGradient
                        id="humidityGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#3b82f6"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#3b82f6"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.1)"
                    />
                    <XAxis
                      dataKey="time"
                      tick={{ fontSize: 12, fill: "rgba(255,255,255,0.8)" }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      stroke="rgba(255,255,255,0.3)"
                    />
                    <YAxis
                      yAxisId="temp"
                      orientation="left"
                      tick={{ fill: "rgba(255,255,255,0.8)" }}
                      stroke="rgba(255,255,255,0.3)"
                    />
                    <YAxis
                      yAxisId="humidity"
                      orientation="right"
                      tick={{ fill: "rgba(255,255,255,0.8)" }}
                      stroke="rgba(255,255,255,0.3)"
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      yAxisId="temp"
                      type="monotone"
                      dataKey="อุณหภูมิ"
                      stroke="#ef4444"
                      strokeWidth={3}
                      dot={{ fill: "#ef4444", strokeWidth: 2, r: 6 }}
                      activeDot={{ r: 8, stroke: "#ef4444", strokeWidth: 2 }}
                    />
                    <Line
                      yAxisId="humidity"
                      type="monotone"
                      dataKey="ความชื้น"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={{ fill: "#3b82f6", strokeWidth: 2, r: 6 }}
                      activeDot={{ r: 8, stroke: "#3b82f6", strokeWidth: 2 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Precipitation and Wind Chart */}
            <div
              className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 overflow-hidden hover:bg-white/15 transition-all duration-300 animate-slide-up"
              style={{ animationDelay: "0.4s" }}
            >
              <div className="bg-gradient-to-r from-cyan-500/20 to-green-500/20 p-6 border-b border-white/20">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <span className="mr-2">🌧️</span>
                  ฝน & ลม
                </h3>
              </div>
              <div className="p-6">
                <ResponsiveContainer width="100%" height={350}>
                  <ComposedChart data={prepareChartData()}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.1)"
                    />
                    <XAxis
                      dataKey="time"
                      tick={{ fontSize: 12, fill: "rgba(255,255,255,0.8)" }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      stroke="rgba(255,255,255,0.3)"
                    />
                    <YAxis
                      yAxisId="rain"
                      orientation="left"
                      tick={{ fill: "rgba(255,255,255,0.8)" }}
                      stroke="rgba(255,255,255,0.3)"
                    />
                    <YAxis
                      yAxisId="wind"
                      orientation="right"
                      tick={{ fill: "rgba(255,255,255,0.8)" }}
                      stroke="rgba(255,255,255,0.3)"
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar
                      yAxisId="rain"
                      dataKey="ฝน"
                      fill="url(#rainGradient)"
                      radius={[4, 4, 0, 0]}
                    />
                    <Line
                      yAxisId="wind"
                      type="monotone"
                      dataKey="ลม"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ fill: "#10b981", strokeWidth: 2, r: 6 }}
                      activeDot={{ r: 8, stroke: "#10b981", strokeWidth: 2 }}
                    />
                    <defs>
                      <linearGradient
                        id="rainGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#06b6d4"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#06b6d4"
                          stopOpacity={0.3}
                        />
                      </linearGradient>
                    </defs>
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Hourly Forecast */}
        <div
          className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 overflow-hidden animate-slide-up"
          style={{ animationDelay: "0.6s" }}
        >
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-6 border-b border-white/20">
            <h3 className="text-2xl font-bold text-white flex items-center">
              <span className="mr-3">📊</span>
              พยากรณ์รายชั่วโมง (24 ชั่วโมง)
            </h3>
          </div>

          <div className="p-8">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
              {data.map((hour, idx) => (
                <div
                  key={idx}
                  className="group bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all duration-300 border border-white/20 hover:scale-105 hover:shadow-2xl animate-fade-in"
                  style={{ animationDelay: `${0.1 * idx}s` }}
                >
                  <div className="text-center">
                    <div className="text-white/80 text-sm font-medium mb-3">
                      {formatChartTime(hour.time)}
                    </div>

                    <div className="text-5xl mb-3 group-hover:scale-110 transition-transform duration-300">
                      {getWeatherIcon(hour.weather)}
                    </div>

                    <div className="text-3xl font-bold text-white mb-4">
                      {hour.temp}°C
                    </div>

                    <div className="space-y-3">
                      <div className="bg-white/10 rounded-lg p-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/70">💧</span>
                          <span className="text-white font-medium">
                            {hour.humidity}%
                          </span>
                        </div>
                      </div>

                      <div className="bg-white/10 rounded-lg p-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/70">🌧️</span>
                          <span className="text-white font-medium">{hour.precipitation ?? 0} มม.</span>
                        </div>
                      </div>

                      <div className="bg-white/10 rounded-lg p-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/70">💨</span>
                          <span className="text-white font-medium">
                            {hour.windspeed} km/h
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/20">
                      <p className="text-xs text-white/80 font-medium">
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
        <div
          className="text-center mt-12 animate-fade-in"
          style={{ animationDelay: "0.8s" }}
        >
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 inline-block border border-white/20">
            <p className="text-white/80 text-sm">
              ⚡ อัพเดทล่าสุด: {formatFullTime(currentTime)}
            </p>
            <p className="text-white/60 text-xs mt-1">
              ข้อมูลจาก Open-Meteo
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
