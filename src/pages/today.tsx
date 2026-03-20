import { useState } from 'react'
import { format, isToday } from 'date-fns'
import { CalendarIcon } from 'lucide-react'

import { useGeolocation } from '../hooks/useGeolocation'
import { useWeatherData } from '../hooks/useWeatherData'
import { useCityName } from '../hooks/useCityName'
import { WeatherHero } from '../components/weather/weather-hero'
import { WeatherStats } from '../components/weather/weather-stats'
import { HourlyCharts } from '../components/charts/hourly-charts'
import { LoadingSpinner, ErrorState, GPSPrompt } from '../components/states'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

const MIN_DATE = new Date('2020-01-01')

export function TodayPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C')
  const [calendarOpen, setCalendarOpen] = useState(false)

  const { coords, loading: gpsLoading } = useGeolocation()
  const { current, airQuality, hourly, loading, error, refetch } =
    useWeatherData(coords, selectedDate)
  const cityName = useCityName(coords)

  if (gpsLoading) return <GPSPrompt />
  if (loading) return <LoadingSpinner />
  if (error) return <ErrorState message={error} onRetry={refetch} />
  if (!current) return <LoadingSpinner message='Initializing…' />

  const handleDaySelect = (day: Date | undefined) => {
    if (day) {
      setSelectedDate(day)
      setCalendarOpen(false)
    }
  }

  const handleBackToToday = () => {
    setSelectedDate(new Date())
    setCalendarOpen(false)
  }

  return (
    <div className='space-y-4 sm:space-y-6'>
      <div className='flex flex-wrap items-center gap-2 sm:gap-3'>
        <span className='shrink-0 text-sm font-medium text-muted-foreground'>
          Date:
        </span>

        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant='outline'
              className='w-50 justify-start gap-2 font-normal sm:w-50'
            >
              <CalendarIcon className='h-4 w-4 shrink-0 text-muted-foreground' />
              <span>{format(selectedDate, 'PPP')}</span>
            </Button>
          </PopoverTrigger>

          <PopoverContent className='w-auto p-0' align='start'>
            <Calendar
              mode='single'
              selected={selectedDate}
              onSelect={handleDaySelect}
              disabled={(date) => date > new Date() || date < MIN_DATE}
              initialFocus
            />
            {!isToday(selectedDate) && (
              <div className='border-t border-border px-3 py-2'>
                <Button
                  variant='ghost'
                  size='sm'
                  className='w-full text-xs'
                  onClick={handleBackToToday}
                >
                  Jump to Today
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>

        {isToday(selectedDate) ? (
          <span className='rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary'>
            Today
          </span>
        ) : (
          <Button
            variant='ghost'
            size='sm'
            className='h-7 rounded-full px-2.5 text-xs text-muted-foreground'
            onClick={handleBackToToday}
          >
            ← Back to Today
          </Button>
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
        onToggleTempUnit={() => setTempUnit((u) => (u === 'C' ? 'F' : 'C'))}
      />

      {hourly && (
        <div className='space-y-2 sm:space-y-3'>
          <h2 className='text-sm font-semibold sm:text-base'>
            Hourly Breakdown
          </h2>
          <HourlyCharts hourly={hourly} tempUnit={tempUnit} />
        </div>
      )}
    </div>
  )
}

export default TodayPage
