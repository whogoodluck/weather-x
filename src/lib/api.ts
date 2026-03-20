import type {
  Coordinates,
  CurrentWeather,
  AirQuality,
  HourlyData,
  DailyHistoricalData,
} from '../types/weather'

const BASE_URL = 'https://api.open-meteo.com/v1'
const AIR_URL = 'https://air-quality-api.open-meteo.com/v1'

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

function parseTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata',
  })
}

export async function fetchCurrentAndHourly(
  coords: Coordinates,
  date: string
): Promise<{ current: CurrentWeather; hourly: HourlyData }> {
  const url = new URL(`${BASE_URL}/forecast`)
  url.searchParams.set('latitude', String(coords.lat))
  url.searchParams.set('longitude', String(coords.lon))
  url.searchParams.set('start_date', date)
  url.searchParams.set('end_date', date)
  url.searchParams.set(
    'hourly',
    'temperature_2m,relative_humidity_2m,precipitation,visibility,wind_speed_10m'
  )
  url.searchParams.set(
    'daily',
    'temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum,wind_speed_10m_max,uv_index_max,precipitation_probability_max,weather_code'
  )
  url.searchParams.set(
    'current',
    'temperature_2m,relative_humidity_2m,weather_code'
  )
  url.searchParams.set('timezone', 'auto')

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error('Weather fetch failed')
  const data = await res.json()

  const daily = data.daily
  const current: CurrentWeather = {
    temperature: data.current?.temperature_2m ?? daily.temperature_2m_max[0],
    temperatureMin: daily.temperature_2m_min[0],
    temperatureMax: daily.temperature_2m_max[0],
    precipitation: daily.precipitation_sum[0],
    precipitationProbabilityMax: daily.precipitation_probability_max[0],
    sunrise: parseTime(daily.sunrise[0]),
    sunset: parseTime(daily.sunset[0]),
    windspeedMax: daily.wind_speed_10m_max[0],
    relativeHumidity: data.current?.relative_humidity_2m ?? 0,
    uvIndex: daily.uv_index_max[0],
    weatherCode: daily.weather_code[0],
  }

  const hourly: HourlyData = {
    time: data.hourly.time,
    temperature2m: data.hourly.temperature_2m,
    relativeHumidity2m: data.hourly.relative_humidity_2m,
    precipitation: data.hourly.precipitation,
    visibility: data.hourly.visibility,
    windspeed10m: data.hourly.wind_speed_10m,
    pm10: [],
    pm25: [],
  }

  return { current, hourly }
}

export async function fetchAirQuality(
  coords: Coordinates,
  date: string
): Promise<{ aq: AirQuality; hourlyPm10: number[]; hourlyPm25: number[] }> {
  const url = new URL(`${AIR_URL}/air-quality`)
  url.searchParams.set('latitude', String(coords.lat))
  url.searchParams.set('longitude', String(coords.lon))
  url.searchParams.set('start_date', date)
  url.searchParams.set('end_date', date)
  url.searchParams.set(
    'hourly',
    'pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,european_aqi'
  )
  url.searchParams.set(
    'current',
    'pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,european_aqi'
  )
  url.searchParams.set('timezone', 'auto')

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error('Air quality fetch failed')
  const data = await res.json()

  const c = data.current ?? {}
  const h = data.hourly ?? {}

  const aq: AirQuality = {
    pm10: c.pm10 ?? h.pm10?.[12] ?? 0,
    pm25: c.pm2_5 ?? h.pm2_5?.[12] ?? 0,
    carbonMonoxide: c.carbon_monoxide ?? h.carbon_monoxide?.[12] ?? 0,
    carbonDioxide: null, // not provided by open-meteo
    nitrogenDioxide: c.nitrogen_dioxide ?? h.nitrogen_dioxide?.[12] ?? 0,
    sulphurDioxide: c.sulphur_dioxide ?? h.sulphur_dioxide?.[12] ?? 0,
    europeanAqi: c.european_aqi ?? h.european_aqi?.[12] ?? 0,
  }

  return {
    aq,
    hourlyPm10: h.pm10 ?? [],
    hourlyPm25: h.pm2_5 ?? [],
  }
}

export async function fetchHistorical(
  coords: Coordinates,
  startDate: string,
  endDate: string
): Promise<DailyHistoricalData> {
  const [weatherRes, aqRes] = await Promise.all([
    fetch(
      `${BASE_URL}/archive?latitude=${coords.lat}&longitude=${coords.lon}&start_date=${startDate}&end_date=${endDate}&daily=temperature_2m_max,temperature_2m_min,temperature_2m_mean,sunrise,sunset,precipitation_sum,wind_speed_10m_max,wind_direction_10m_dominant&timezone=auto`
    ),
    fetch(
      `${AIR_URL}/air-quality?latitude=${coords.lat}&longitude=${coords.lon}&start_date=${startDate}&end_date=${endDate}&hourly=pm10,pm2_5&timezone=auto`
    ),
  ])

  const wData = await weatherRes.json()
  const aqData = await aqRes.json()

  const hourlyPm10: number[] = aqData.hourly?.pm10 ?? []
  const hourlyPm25: number[] = aqData.hourly?.pm2_5 ?? []
  const days = wData.daily?.time?.length ?? 0

  const dailyPm10: number[] = []
  const dailyPm25: number[] = []
  for (let i = 0; i < days; i++) {
    const slice10 = hourlyPm10
      .slice(i * 24, i * 24 + 24)
      .filter((v) => v != null)
    const slice25 = hourlyPm25
      .slice(i * 24, i * 24 + 24)
      .filter((v) => v != null)
    dailyPm10.push(
      slice10.length ? slice10.reduce((a, b) => a + b, 0) / slice10.length : 0
    )
    dailyPm25.push(
      slice25.length ? slice25.reduce((a, b) => a + b, 0) / slice25.length : 0
    )
  }

  const daily = wData.daily ?? {}

  const toIST = (iso: string) => {
    if (!iso) return ''
    const d = new Date(iso)
    return d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Kolkata',
    })
  }

  return {
    time: daily.time ?? [],
    temperatureMean: daily.temperature_2m_mean ?? [],
    temperatureMax: daily.temperature_2m_max ?? [],
    temperatureMin: daily.temperature_2m_min ?? [],
    sunrise: (daily.sunrise ?? []).map(toIST),
    sunset: (daily.sunset ?? []).map(toIST),
    precipitation: daily.precipitation_sum ?? [],
    windspeedMax: daily.wind_speed_10m_max ?? [],
    winddirectionDominant: daily.wind_direction_10m_dominant ?? [],
    pm10: dailyPm10,
    pm25: dailyPm25,
  }
}

export function getWeatherDescription(code: number): string {
  const map: Record<number, string> = {
    0: 'Clear Sky',
    1: 'Mainly Clear',
    2: 'Partly Cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Icy Fog',
    51: 'Light Drizzle',
    53: 'Drizzle',
    55: 'Heavy Drizzle',
    61: 'Slight Rain',
    63: 'Rain',
    65: 'Heavy Rain',
    71: 'Slight Snow',
    73: 'Snow',
    75: 'Heavy Snow',
    77: 'Snow Grains',
    80: 'Slight Showers',
    81: 'Showers',
    82: 'Violent Showers',
    85: 'Snow Showers',
    86: 'Heavy Snow Showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm w/ Hail',
    99: 'Thunderstorm w/ Heavy Hail',
  }
  return map[code] ?? 'Unknown'
}

export function getWeatherEmoji(code: number) {
  if (code === 0 || code === 1) return '☀️'
  if (code === 2) return '⛅'
  if (code === 3) return '☁️'
  if (code <= 48) return '🌫️'
  if (code <= 55) return '🌦️'
  if (code <= 65) return '🌧️'
  if (code <= 77) return '❄️'
  if (code <= 82) return '🌩️'
  if (code <= 86) return '🌨️'
  return '⛈️'
}

export function getAqiLabel(aqi: number) {
  if (aqi <= 20) return { label: 'Good', color: '#22c55e' }
  if (aqi <= 40) return { label: 'Fair', color: '#84cc16' }
  if (aqi <= 60) return { label: 'Moderate', color: '#eab308' }
  if (aqi <= 80) return { label: 'Poor', color: '#f97316' }
  if (aqi <= 100) return { label: 'Very Poor', color: '#ef4444' }
  return { label: 'Extremely Poor', color: '#7c3aed' }
}

export { formatDate }
