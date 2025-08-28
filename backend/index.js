// backend/index.js
import express from "express";
import { MongoClient } from "mongodb";
import cors from "cors";

const app = express();
app.use(cors());

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://mongo:27017";
const DB_NAME = "weatherdb";

app.get("/api/weather", async (req, res) => {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db(DB_NAME);
  const data = await db.collection("weather")
    .find({})
    .sort({ timestamp: -1 })
    .limit(10)
    .toArray();
  await client.close();
  res.json(data);
});

app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
