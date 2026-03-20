import { useState, useEffect, useCallback } from 'react'
import type {
  Coordinates,
  CurrentWeather,
  AirQuality,
  HourlyData,
} from '../types/weather'
import { fetchCurrentAndHourly, fetchAirQuality, formatDate } from '../lib/api'

interface WeatherState {
  current: CurrentWeather | null
  airQuality: AirQuality | null
  hourly: HourlyData | null
  loading: boolean
  error: string | null
}

export function useWeatherData(coords: Coordinates | null, date?: Date) {
  const [state, setState] = useState<WeatherState>({
    current: null,
    airQuality: null,
    hourly: null,
    loading: false,
    error: null,
  })

  const load = useCallback(async () => {
    if (!coords) return
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const dateStr = formatDate(date ?? new Date())
      const [weatherResult, aqResult] = await Promise.all([
        fetchCurrentAndHourly(coords, dateStr),
        fetchAirQuality(coords, dateStr),
      ])

      // Merge PM data into hourly
      weatherResult.hourly.pm10 = aqResult.hourlyPm10
      weatherResult.hourly.pm25 = aqResult.hourlyPm25

      setState({
        current: weatherResult.current,
        airQuality: aqResult.aq,
        hourly: weatherResult.hourly,
        loading: false,
        error: null,
      })
    } catch (e) {
      setState((s) => ({ ...s, loading: false, error: String(e) }))
    }
  }, [coords, date])

  useEffect(() => {
    load()
  }, [load])

  return { ...state, refetch: load }
}
