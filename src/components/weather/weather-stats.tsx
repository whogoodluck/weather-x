import type { CurrentWeather, AirQuality } from '../../types/weather'
import { getAqiLabel } from '../../lib/api'

interface StatCardProps {
  icon: string
  label: string
  value: string | number
  sub?: string
  color?: string
}

function StatCard({ icon, label, value, sub, color }: StatCardProps) {
  return (
    <div className='flex flex-col gap-1 rounded-2xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md'>
      <div className='flex items-center gap-2'>
        <span className='text-xl'>{icon}</span>
        <span className='text-xs font-medium tracking-wide text-muted-foreground uppercase'>
          {label}
        </span>
      </div>
      <div
        className='mt-1 text-2xl font-bold tabular-nums'
        style={color ? { color } : {}}
      >
        {value}
      </div>
      {sub && <div className='text-xs text-muted-foreground'>{sub}</div>}
    </div>
  )
}

interface AqCardProps {
  label: string
  value: number | null
  unit: string
  icon?: string
}

function AqCard({ label, value, unit, icon = '🧪' }: AqCardProps) {
  return (
    <div className='flex flex-col gap-1 rounded-2xl border border-border bg-card p-3 shadow-sm'>
      <div className='flex items-center gap-1.5'>
        <span>{icon}</span>
        <span className='text-xs font-medium tracking-wide text-muted-foreground uppercase'>
          {label}
        </span>
      </div>
      <div className='text-xl font-bold tabular-nums'>
        {value != null ? value.toFixed(1) : '—'}
        <span className='ml-1 text-xs font-normal text-muted-foreground'>
          {unit}
        </span>
      </div>
    </div>
  )
}

interface Props {
  current: CurrentWeather
  airQuality: AirQuality | null
  tempUnit: 'C' | 'F'
  onToggleTempUnit: () => void
}

function toF(c: number) {
  return parseFloat(((c * 9) / 5 + 32).toFixed(1))
}

function tempStr(c: number, unit: 'C' | 'F') {
  return `${unit === 'F' ? toF(c) : c}°${unit}`
}

export function WeatherStats({
  current,
  airQuality,
  tempUnit,
  onToggleTempUnit,
}: Props) {
  const aqiInfo = airQuality ? getAqiLabel(airQuality.europeanAqi) : null

  return (
    <div className='space-y-5'>
      {/* Temperature toggle */}
      <div className='flex items-center justify-between'>
        <h2 className='text-base font-semibold text-foreground'>
          Current Conditions
        </h2>
        <button
          onClick={onToggleTempUnit}
          className='rounded-full border border-border bg-secondary px-3 py-1 text-xs font-semibold transition-colors hover:bg-accent'
        >
          Switch to °{tempUnit === 'C' ? 'F' : 'C'}
        </button>
      </div>

      {/* Main stats grid */}
      <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4'>
        <StatCard
          icon='🌡️'
          label='Temperature'
          value={tempStr(current.temperature, tempUnit)}
          sub={`↓ ${tempStr(current.temperatureMin, tempUnit)}  ↑ ${tempStr(current.temperatureMax, tempUnit)}`}
          color='#f97316'
        />
        <StatCard
          icon='🌧️'
          label='Precipitation'
          value={`${current.precipitation} mm`}
        />
        <StatCard icon='🌅' label='Sunrise' value={current.sunrise} />
        <StatCard icon='🌇' label='Sunset' value={current.sunset} />
        <StatCard
          icon='💨'
          label='Max Wind'
          value={`${current.windspeedMax} km/h`}
        />
        <StatCard
          icon='💧'
          label='Humidity'
          value={`${current.relativeHumidity}%`}
        />
        <StatCard
          icon='☀️'
          label='UV Index'
          value={current.uvIndex}
          sub={
            current.uvIndex >= 8
              ? 'Very High'
              : current.uvIndex >= 6
                ? 'High'
                : current.uvIndex >= 3
                  ? 'Moderate'
                  : 'Low'
          }
        />
        <StatCard
          icon='🌦️'
          label='Precip. Prob.'
          value={`${current.precipitationProbabilityMax}%`}
        />
      </div>

      {/* Air Quality */}
      <div>
        <div className='mb-3 flex items-center gap-3'>
          <h2 className='text-base font-semibold text-foreground'>
            Air Quality
          </h2>
          {aqiInfo && (
            <span
              className='rounded-full px-2.5 py-0.5 text-xs font-semibold text-white'
              style={{ backgroundColor: aqiInfo.color }}
            >
              AQI {airQuality?.europeanAqi} — {aqiInfo.label}
            </span>
          )}
        </div>
        <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6'>
          <AqCard
            label='PM10'
            value={airQuality?.pm10 ?? null}
            unit='μg/m³'
            icon='🌫️'
          />
          <AqCard
            label='PM2.5'
            value={airQuality?.pm25 ?? null}
            unit='μg/m³'
            icon='🌁'
          />
          <AqCard
            label='CO'
            value={airQuality?.carbonMonoxide ?? null}
            unit='μg/m³'
            icon='♻️'
          />
          <AqCard
            label='CO₂'
            value={airQuality!.carbonDioxide}
            unit='ppm'
            icon='🏭'
          />
          <AqCard
            label='NO₂'
            value={airQuality?.nitrogenDioxide ?? null}
            unit='μg/m³'
            icon='🚗'
          />
          <AqCard
            label='SO₂'
            value={airQuality?.sulphurDioxide ?? null}
            unit='μg/m³'
            icon='🏗️'
          />
        </div>
      </div>
    </div>
  )
}
