// collector/index.js
import axios from "axios";
import { MongoClient } from "mongodb";
import cron from "node-cron";

const MONGO_URI = process.env.MONGO_URI || "mongodb://mongo:27017";
const DB_NAME = "weatherdb";
const COLLECTION = "weather";
const API_KEY = process.env.OPENWEATHER_API_KEY;
const CITY = "Bangkok";

async function fetchWeather() {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${CITY}&appid=${API_KEY}&units=metric`;
  const response = await axios.get(url);
  return {
    city: CITY,
    temp: response.data.main.temp,
    humidity: response.data.main.humidity,
    weather: response.data.weather[0].description,
    timestamp: new Date()
  };
}

async function saveWeather(data) {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db(DB_NAME);
  await db.collection(COLLECTION).insertOne(data);
  await client.close();
}

cron.schedule("*/30 * * * *", async () => {
  try {
    const weatherData = await fetchWeather();
    await saveWeather(weatherData);
    console.log("✅ Saved weather:", weatherData);
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
});
