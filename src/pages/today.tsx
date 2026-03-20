import { useState } from "react"
import { useGeolocation } from "../hooks/useGeolocation"
import { useWeatherData } from "../hooks/useWeatherData"
import { useCityName } from "../hooks/useCityName"
import { WeatherHero } from "../components/weather/weather-hero"
import { WeatherStats } from "../components/weather/weather-stats"
import { HourlyCharts } from "../components/charts/hourly-charts"
import { LoadingSpinner, ErrorState, GPSPrompt } from "../components/states"
import { formatDate } from "../lib/api"

export function TodayPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [tempUnit, setTempUnit] = useState<"C" | "F">("C")

  const { coords, loading: gpsLoading } = useGeolocation()
  const { current, airQuality, hourly, loading, error, refetch } =
    useWeatherData(coords, selectedDate)
  const cityName = useCityName(coords)

  const today = formatDate(new Date())
  const maxDate = today
  const minDate = "2020-01-01"

  if (gpsLoading) return <GPSPrompt />
  if (loading) return <LoadingSpinner />
  if (error) return <ErrorState message={error} onRetry={refetch} />
  if (!current) return <LoadingSpinner message="Initializing…" />

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <label
          htmlFor="date-picker"
          className="text-sm font-medium text-muted-foreground"
        >
          Select Date:
        </label>
        <input
          id="date-picker"
          type="date"
          value={formatDate(selectedDate)}
          min={minDate}
          max={maxDate}
          onChange={(e) => {
            if (e.target.value)
              setSelectedDate(new Date(e.target.value + "T12:00:00"))
          }}
          className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm shadow-sm transition-colors focus:ring-2 focus:ring-ring focus:outline-none"
        />
        {formatDate(selectedDate) !== today && (
          <button
            onClick={() => setSelectedDate(new Date())}
            className="rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent"
          >
            Back to Today
          </button>
        )}
      </div>

      <WeatherHero
        current={current}
        cityName={cityName}
        tempUnit={tempUnit}
        date={selectedDate}
      />

      <WeatherStats
        current={current}
        airQuality={airQuality}
        tempUnit={tempUnit}
        onToggleTempUnit={() => setTempUnit((u) => (u === "C" ? "F" : "C"))}
      />

      {hourly && (
        <div className="space-y-3">
          <h2 className="text-base font-semibold">Hourly Breakdown</h2>
          <HourlyCharts hourly={hourly} tempUnit={tempUnit} />
        </div>
      )}
    </div>
  )
}

export default TodayPage
