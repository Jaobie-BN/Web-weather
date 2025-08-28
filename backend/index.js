// backend/index.js (เพิ่มส่วนนี้)
import axios from "axios";
import { weatherCodeMap } from "./weatherCodes.js";

// GET /api/forecast-24h — พยากรณ์ 24 ชั่วโมงข้างหน้า
app.get("/api/forecast-24h", async (req, res) => {
  try {
    // พิกัดกรุงเทพ
    const lat = 13.75;
    const lon = 100.5167;

    // ขอข้อมูลรายชั่วโมง 2 วัน (เพื่อเผื่อข้ามเที่ยงคืน) แล้วค่อย slice 24 ชม.ถัดไปเอง
    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${lat}&longitude=${lon}` +
      `&hourly=temperature_2m,relative_humidity_2m,precipitation,weathercode,windspeed_10m` +
      `&forecast_days=2` +
      `&timezone=Asia%2FBangkok`;

    const r = await axios.get(url);
    const h = r.data.hourly; // { time:[], temperature_2m:[], ... }

    // หา index ของชั่วโมงปัจจุบันใน timezone เอเชีย/กทม แล้วตัดมา 24 ชม.
    const nowISO = new Date().toLocaleString("sv-SE", { timeZone: "Asia/Bangkok", hour12: false }).replace(" ", "T")+":00";
    // ตัวอย่าง nowISO => "2025-08-28T16:00:00" (ฟอร์แมตตรงกับ h.time)

    // หา index ที่ time >= ตอนนี้ (ถ้าไม่เจอให้เริ่ม 0)
    let idx = h.time.findIndex(t => t >= nowISO);
    if (idx < 0) idx = 0;

    const N = 24;
    const out = [];
    for (let i = idx; i < Math.min(idx + N, h.time.length); i++) {
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
      hours: out, // array ความยาว ~24 รายการ
    });
  } catch (e) {
    console.error("forecast-24h error:", e.message);
    res.status(500).json({ error: "failed to fetch 24h forecast" });
  }
});
