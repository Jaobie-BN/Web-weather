import express from "express";
import { MongoClient } from "mongodb";
import cors from "cors";
import axios from "axios";
import cron from "node-cron";
import { weatherCodeMap } from "./weatherCodes.js";

const app = express();
app.use(cors());

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = "weatherdb";

// ====== Function ดึง weather ปัจจุบันจาก Open-Meteo ======
async function fetchWeather() {
  const url =
    "https://api.open-meteo.com/v1/forecast?latitude=13.75&longitude=100.5167&current_weather=true&timezone=Asia%2FBangkok";
  const res = await axios.get(url);
  const cw = res.data.current_weather;

  return {
    city: "Bangkok",
    temp: cw.temperature,
    windspeed: cw.windspeed,
    weather: weatherCodeMap[cw.weathercode] || "Unknown",
    timestamp: new Date(cw.time),
  };
}

// ====== บันทึกลง MongoDB ======
async function saveWeather(data) {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  await client.db(DB_NAME).collection("weather").insertOne(data);
  await client.close();
}

// ====== Cron Job (ทุก 30 นาที) ======
cron.schedule("*/30 * * * *", async () => {
  try {
    const data = await fetchWeather();
    await saveWeather(data);
    console.log("✅ Weather saved:", data);
  } catch (err) {
    console.error("❌ Cron error:", err.message);
  }
});

// ====== REST APIs ======

// ล่าสุดจาก DB
app.get("/api/weather", async (req, res) => {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const data = await client
    .db(DB_NAME)
    .collection("weather")
    .find({})
    .sort({ timestamp: -1 })
    .limit(10)
    .toArray();
  await client.close();
  res.json(data);
});

// พยากรณ์ 24 ชั่วโมง
app.get("/api/forecast-24h", async (req, res) => {
  try {
    const url =
      "https://api.open-meteo.com/v1/forecast?latitude=13.75&longitude=100.5167" +
      "&hourly=temperature_2m,relative_humidity_2m,precipitation,weathercode,windspeed_10m" +
      "&forecast_days=2&timezone=Asia%2FBangkok";

    const r = await axios.get(url);
    const h = r.data.hourly;

    // current time
    const nowISO =
      new Date()
        .toLocaleString("sv-SE", { timeZone: "Asia/Bangkok", hour12: false })
        .replace(" ", "T") + ":00";

    let idx = h.time.findIndex((t) => t >= nowISO);
    if (idx < 0) idx = 0;

    const out = [];
    for (let i = idx; i < Math.min(idx + 24, h.time.length); i++) {
      out.push({
        time: h.time[i],
        temp: h.temperature_2m[i],
        humidity: h.relative_humidity_2m?.[i],
        precipitation: h.precipitation?.[i],
        windspeed: h.windspeed_10m?.[i],
        weather: weatherCodeMap[h.weathercode?.[i]] || "Unknown",
      });
    }

    res.json({
      city: "Bangkok",
      timezone: r.data.timezone,
      hours: out,
    });
  } catch (e) {
    console.error("forecast-24h error:", e.message);
    res.status(500).json({ error: "failed to fetch 24h forecast" });
  }
});

// ====== Start server ======
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
