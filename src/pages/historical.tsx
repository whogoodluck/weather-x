import { useState, useCallback } from "react"
import { useGeolocation } from "../hooks/useGeolocation"
import { useCityName } from "../hooks/useCityName"
import { fetchHistorical, formatDate } from "../lib/api"
import { HistoricalCharts } from "../components/charts/historical-charts"
import { LoadingSpinner, ErrorState, GPSPrompt } from "../components/states"
import type { DailyHistoricalData } from "../types/weather"

function twoYearsAgo(): string {
  const d = new Date()
  d.setFullYear(d.getFullYear() - 2)
  return formatDate(d)
}

function archiveMaxDate(): string {
  const d = new Date()
  d.setDate(d.getDate() - 5)
  return formatDate(d)
}

export function HistoricalPage() {
  const { coords, loading: gpsLoading } = useGeolocation()
  const cityName = useCityName(coords)

  const minAllowed = twoYearsAgo()
  const maxAllowed = archiveMaxDate()

  const [startDate, setStartDate] = useState(() => {
    const d = new Date()
    d.setMonth(d.getMonth() - 3)
    const s = formatDate(d)
    return s < minAllowed ? minAllowed : s
  })
  const [endDate, setEndDate] = useState(maxAllowed)

  const [data, setData] = useState<DailyHistoricalData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fetched, setFetched] = useState(false)

  const handleFetch = useCallback(async () => {
    if (!coords) return
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffMs = end.getTime() - start.getTime()
    const diffDays = diffMs / (1000 * 60 * 60 * 24)
    if (diffDays < 1) {
      setError("End date must be after start date.")
      return
    }
    if (diffDays > 730) {
      setError("Maximum date range is 2 years (730 days).")
      return
    }
    setLoading(true)
    setError(null)
    try {
      const result = await fetchHistorical(coords, startDate, endDate)
      setData(result)
      setFetched(true)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }, [coords, startDate, endDate])

  if (gpsLoading) return <GPSPrompt />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Historical Weather</h1>
        <p className="text-sm text-muted-foreground">
          {cityName} — select up to 2 years of data
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              min={minAllowed}
              max={endDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-ring focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              min={startDate}
              max={maxAllowed}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-ring focus:outline-none"
            />
          </div>
          <button
            onClick={handleFetch}
            disabled={loading || !coords}
            className="self-end rounded-xl bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground shadow transition-opacity hover:opacity-85 disabled:opacity-50"
          >
            {loading ? "Loading…" : "Fetch Data"}
          </button>
        </div>

        {error && (
          <p className="mt-3 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
      </div>

      {loading && <LoadingSpinner message="Fetching historical data…" />}

      {!loading && fetched && data && data.time.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Showing {data.time.length} days from{" "}
            <span className="font-medium text-foreground">{startDate}</span> to{" "}
            <span className="font-medium text-foreground">{endDate}</span>
          </p>
          <HistoricalCharts data={data} />
        </div>
      )}

      {!loading && fetched && (!data || data.time.length === 0) && (
        <ErrorState message="No data available for the selected range." />
      )}

      {!fetched && !loading && (
        <div className="flex min-h-[30vh] flex-col items-center justify-center gap-3 text-center">
          <span className="text-4xl">📅</span>
          <p className="text-base font-medium">
            Choose a date range and click Fetch Data
          </p>
          <p className="text-sm text-muted-foreground">
            Historical data is available from 2020 onwards.
          </p>
        </div>
      )}
    </div>
  )
}

export default HistoricalPage
