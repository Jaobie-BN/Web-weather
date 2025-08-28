import express from "express";
import { MongoClient } from "mongodb";
import cors from "cors";
import axios from "axios";
import cron from "node-cron";
import { weatherCodeMap } from "./weatherCodes.js";  // 👈 import mapping

const app = express();
app.use(cors());

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = "weatherdb";

// ====== Cron job ======
async function fetchWeather() {
  const url =
    "https://api.open-meteo.com/v1/forecast?latitude=13.75&longitude=100.5167&current_weather=true";
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

async function saveWeather(data) {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  await client.db(DB_NAME).collection("weather").insertOne(data);
  await client.close();
}

cron.schedule("*/30 * * * *", async () => {
  try {
    const data = await fetchWeather();
    await saveWeather(data);
    console.log("✅ Weather saved:", data);
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
});
// =======================

// REST API
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

app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
