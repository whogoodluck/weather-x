import { useState, useCallback } from 'react'
import {
  format,
  differenceInDays,
  subMonths,
  subYears,
  subDays,
} from 'date-fns'
import { CalendarIcon } from 'lucide-react'

import { useGeolocation } from '../hooks/useGeolocation'
import { useCityName } from '../hooks/useCityName'
import { fetchHistorical, formatDate } from '../lib/api'
import { HistoricalCharts } from '../components/charts/historical-charts'
import { LoadingSpinner, ErrorState, GPSPrompt } from '../components/states'
import type { DailyHistoricalData } from '../types/weather'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

const MIN_DATE = new Date('2020-01-01')
const MAX_DATE = subDays(new Date(), 5)

const PRESETS: { label: string; getRange: () => [Date, Date] }[] = [
  {
    label: 'Last 3 months',
    getRange: () => [subMonths(MAX_DATE, 3), MAX_DATE],
  },
  {
    label: 'Last 6 months',
    getRange: () => [subMonths(MAX_DATE, 6), MAX_DATE],
  },
  { label: 'Last year', getRange: () => [subYears(MAX_DATE, 1), MAX_DATE] },
  { label: 'Last 2 years', getRange: () => [subYears(MAX_DATE, 2), MAX_DATE] },
]

export function HistoricalPage() {
  const { coords, loading: gpsLoading } = useGeolocation()
  const cityName = useCityName(coords)

  const [startDate, setStartDate] = useState<Date>(subMonths(MAX_DATE, 3))
  const [endDate, setEndDate] = useState<Date>(MAX_DATE)
  const [startOpen, setStartOpen] = useState(false)
  const [endOpen, setEndOpen] = useState(false)

  const [data, setData] = useState<DailyHistoricalData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fetched, setFetched] = useState(false)

  const diffDays = differenceInDays(endDate, startDate)

  const handleFetch = useCallback(async () => {
    if (!coords) return
    if (diffDays < 1) {
      setError('End date must be after start date.')
      return
    }
    if (diffDays > 730) {
      setError('Maximum date range is 2 years (730 days).')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const result = await fetchHistorical(
        coords,
        formatDate(startDate),
        formatDate(endDate)
      )
      setData(result)
      setFetched(true)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }, [coords, startDate, endDate, diffDays])

  const applyPreset = (getRange: () => [Date, Date]) => {
    const [s, e] = getRange()
    setStartDate(s)
    setEndDate(e)
    setError(null)
  }

  if (gpsLoading) return <GPSPrompt />

  return (
    <div className='space-y-4 sm:space-y-6'>
      <div>
        <h1 className='text-lg font-bold sm:text-xl'>Historical Weather</h1>
        <p className='text-xs text-muted-foreground sm:text-sm'>
          {cityName} — select up to 2 years of data
        </p>
      </div>

      <div className='space-y-4 rounded-xl border border-border bg-card p-4 shadow-sm sm:rounded-2xl sm:p-5'>
        <div className='flex flex-wrap gap-1.5'>
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => applyPreset(p.getRange)}
              className='rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground'
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className='h-px bg-border' />

        <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4'>
          <div className='flex flex-1 flex-col gap-1.5'>
            <label className='text-[10px] font-semibold tracking-wide text-muted-foreground uppercase sm:text-xs'>
              Start Date
            </label>
            <Popover open={startOpen} onOpenChange={setStartOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant='outline'
                  className='w-full justify-start gap-2 font-normal'
                >
                  <CalendarIcon className='h-4 w-4 shrink-0 text-muted-foreground' />
                  {format(startDate, 'PP')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-auto p-0' align='start'>
                <Calendar
                  mode='single'
                  selected={startDate}
                  onSelect={(day) => {
                    if (day) {
                      setStartDate(day)
                      if (day >= endDate) setEndDate(subDays(day, -1))
                      setStartOpen(false)
                    }
                  }}
                  disabled={(date) => date > MAX_DATE || date < MIN_DATE}
                  defaultMonth={startDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <span className='hidden pb-2 text-lg text-muted-foreground sm:block'>
            →
          </span>

          <div className='flex flex-1 flex-col gap-1.5'>
            <label className='text-[10px] font-semibold tracking-wide text-muted-foreground uppercase sm:text-xs'>
              End Date
            </label>
            <Popover open={endOpen} onOpenChange={setEndOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant='outline'
                  className='w-full justify-start gap-2 font-normal'
                >
                  <CalendarIcon className='h-4 w-4 shrink-0 text-muted-foreground' />
                  {format(endDate, 'PP')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-auto p-0' align='start'>
                <Calendar
                  mode='single'
                  selected={endDate}
                  onSelect={(day) => {
                    if (day) {
                      setEndDate(day)
                      setEndOpen(false)
                    }
                  }}
                  disabled={(date) =>
                    date > MAX_DATE || date < MIN_DATE || date <= startDate
                  }
                  defaultMonth={endDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <Button
            onClick={handleFetch}
            disabled={loading || !coords || diffDays < 1 || diffDays > 730}
            className='w-full sm:w-auto sm:self-end'
          >
            {loading ? 'Loading…' : 'Fetch Data'}
          </Button>
        </div>

        <div className='flex min-h-5 flex-wrap items-center gap-2'>
          {diffDays >= 1 && diffDays <= 730 && (
            <span className='text-xs text-muted-foreground'>
              {diffDays} day{diffDays !== 1 ? 's' : ''} selected
            </span>
          )}
          {diffDays > 730 && (
            <span className='text-xs font-medium text-destructive'>
              ⚠ Range exceeds 2 years — please shorten it
            </span>
          )}
          {error && (
            <span className='text-xs font-medium text-destructive'>
              ⚠ {error}
            </span>
          )}
        </div>
      </div>

      {loading && <LoadingSpinner message='Fetching historical data…' />}

      {!loading && fetched && data && data.time.length > 0 && (
        <div className='space-y-2 sm:space-y-3'>
          <p className='text-xs text-muted-foreground sm:text-sm'>
            Showing{' '}
            <span className='font-medium text-foreground'>
              {data.time.length} days
            </span>{' '}
            from{' '}
            <span className='font-medium text-foreground'>
              {format(startDate, 'PP')}
            </span>{' '}
            to{' '}
            <span className='font-medium text-foreground'>
              {format(endDate, 'PP')}
            </span>
          </p>
          <HistoricalCharts data={data} />
        </div>
      )}

      {!loading && fetched && (!data || data.time.length === 0) && (
        <ErrorState message='No data available for the selected range.' />
      )}

      {!fetched && !loading && (
        <div className='flex min-h-[30vh] flex-col items-center justify-center gap-3 text-center'>
          <span className='text-4xl'>📅</span>
          <p className='text-sm font-medium sm:text-base'>
            Choose a date range and click Fetch Data
          </p>
          <p className='text-xs text-muted-foreground sm:text-sm'>
            Historical data is available from January 2020 onwards.
          </p>
        </div>
      )}
    </div>
  )
}

export default HistoricalPage
