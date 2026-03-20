import type { CurrentWeather } from '../../types/weather'
import { getWeatherDescription, getWeatherEmoji } from '../../lib/api'

interface Props {
  current: CurrentWeather
  cityName: string
  tempUnit: 'C' | 'F'
  date: Date
}

function toF(c: number) {
  return parseFloat(((c * 9) / 5 + 32).toFixed(1))
}

export function WeatherHero({ current, cityName, tempUnit, date }: Props) {
  const temp = tempUnit === 'F' ? toF(current.temperature) : current.temperature
  const description = getWeatherDescription(current.weatherCode)
  const emoji = getWeatherEmoji(current.weatherCode)

  const dateStr = date.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className='relative overflow-hidden rounded-3xl bg-linear-to-br from-sky-500 via-blue-600 to-indigo-700 p-6 text-white shadow-xl dark:from-sky-800 dark:via-blue-900 dark:to-indigo-950'>
      <div className='pointer-events-none absolute -top-10 -right-10 h-52 w-52 rounded-full bg-white/10' />
      <div className='pointer-events-none absolute right-16 -bottom-12 h-36 w-36 rounded-full bg-white/5' />

      <div className='relative flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <p className='text-sm font-medium text-white/70'>{dateStr}</p>
          <h1 className='mt-1 text-3xl font-bold tracking-tight sm:text-4xl'>
            {cityName}
          </h1>
          <p className='mt-0.5 text-white/80'>{description}</p>
        </div>
        <div className='flex items-center gap-3 sm:flex-col sm:items-end'>
          <span className='text-6xl leading-none sm:text-7xl'>{emoji}</span>
          <span className='text-5xl font-extrabold tabular-nums sm:text-6xl'>
            {temp}°{tempUnit}
          </span>
        </div>
      </div>
    </div>
  )
}
