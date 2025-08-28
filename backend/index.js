import express from "express";
import { MongoClient } from "mongodb";
import cors from "cors";
import axios from "axios";
import cron from "node-cron";

const app = express();
app.use(cors());

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = "weatherdb";
const API_KEY = process.env.OPENWEATHER_API_KEY;
const CITY = "Bangkok";

// ====== Cron job (รันทุก 30 นาที) ======
async function fetchWeather() {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${CITY}&appid=${API_KEY}&units=metric`;
  const res = await axios.get(url);
  return {
    city: CITY,
    temp: res.data.main.temp,
    humidity: res.data.main.humidity,
    weather: res.data.weather[0].description,
    timestamp: new Date(),
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
// =======================================

// REST API
app.get("/api/weather", async (req, res) => {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const data = await client.db(DB_NAME)
    .collection("weather")
    .find({})
    .sort({ timestamp: -1 })
    .limit(10)
    .toArray();
  await client.close();
  res.json(data);
});

app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
