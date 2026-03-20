export interface Coordinates {
  lat: number
  lon: number
}

export interface CurrentWeather {
  temperature: number
  temperatureMin: number
  temperatureMax: number
  precipitation: number
  precipitationProbabilityMax: number
  sunrise: string
  sunset: string
  windspeedMax: number
  relativeHumidity: number
  uvIndex: number
  weatherCode: number
}

export interface AirQuality {
  pm10: number
  pm25: number
  carbonMonoxide: number
  carbonDioxide: number | null
  nitrogenDioxide: number
  sulphurDioxide: number
  europeanAqi: number
}

export interface HourlyData {
  time: string[]
  temperature2m: number[]
  relativeHumidity2m: number[]
  precipitation: number[]
  visibility: number[]
  windspeed10m: number[]
  pm10: number[]
  pm25: number[]
}

export interface DailyHistoricalData {
  time: string[]
  temperatureMean: number[]
  temperatureMax: number[]
  temperatureMin: number[]
  sunrise: string[]
  sunset: string[]
  precipitation: number[]
  windspeedMax: number[]
  winddirectionDominant: number[]
  pm10: number[]
  pm25: number[]
}
