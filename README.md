# 🌤️ WeatherX — Weather Dashboard

> Assignment submission for Junior ReactJS Frontend Developer role at The Lattice.

**Live Demo:** [your-live-url-here](https://weather-x-two.vercel.app)

---

## Screenshot

![WeatherX Dashboard](./dashboard-screenshot.png)

---

## Tech Stack

|             |                                                            |
| ----------- | ---------------------------------------------------------- |
| Framework   | React 19 + Vite + TypeScript                               |
| Styling     | Tailwind CSS v4 + shadcn/ui                                |
| Charts      | Recharts                                                   |
| Routing     | React Router v7                                            |
| Weather API | [Open-Meteo](https://open-meteo.com) — no API key required |

---

## Features

**Page 1 — Daily Weather**

- Auto-detects location via browser GPS (fallback: New Delhi)
- shadcn Calendar date picker — view any date from 2020 onwards
- Current conditions: Temperature (°C/°F toggle), Precipitation, Humidity, UV Index, Wind, Sunrise/Sunset, Precip Probability
- Air Quality: AQI, PM10, PM2.5, CO, CO₂, NO₂, SO₂
- 6 hourly charts: Temperature, Humidity, Precipitation, Visibility, Wind Speed, PM10 & PM2.5

**Page 2 — Historical (up to 2 years)**

- Date range picker with quick presets (3 months, 6 months, 1 year, 2 years)
- 5 charts: Temperature (mean/max/min), Sunrise & Sunset, Precipitation, Wind speed & direction, PM10 & PM2.5
- All charts: horizontal scroll + zoom in/out

**General**

- Fully responsive — mobile friendly
- Dark / light mode
- GPS state loaded once on app start (no re-fetch on navigation)

---

## Setup

```bash
npm install
npm run dev
```

```bash
npm run build
```
