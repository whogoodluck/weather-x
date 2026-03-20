import React from 'react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { ScrollableChart } from './scrollable-chart'
import type { HourlyData } from '../../types/weather'

interface Props {
  hourly: HourlyData
  tempUnit: 'C' | 'F'
}

function toF(c: number) {
  return (c * 9) / 5 + 32
}

function buildHourlyPoints(
  times: string[],
  values: (number | null)[],
  label: string
) {
  return times.map((t, i) => ({
    time: t.slice(11, 16), // "HH:mm"
    [label]: values[i] ?? null,
  }))
}

const CHART_HEIGHT = 220
const MIN_WIDTH = 900

const tooltipStyle = {
  backgroundColor: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  color: 'var(--foreground)',
  fontSize: '12px',
}

function ChartCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className='overflow-y-auto rounded-2xl border border-border bg-card p-4 shadow-sm'>
      <p className='mb-3 text-sm font-semibold tracking-wide text-muted-foreground uppercase'>
        {title}
      </p>
      {children}
    </div>
  )
}

export function HourlyCharts({ hourly, tempUnit }: Props) {
  const temps = hourly.temperature2m.map((v) =>
    tempUnit === 'F' ? parseFloat(toF(v).toFixed(1)) : v
  )
  const tempData = buildHourlyPoints(hourly.time, temps, 'temp')
  const humData = buildHourlyPoints(
    hourly.time,
    hourly.relativeHumidity2m,
    'humidity'
  )
  const precData = buildHourlyPoints(
    hourly.time,
    hourly.precipitation,
    'precipitation'
  )
  const visData = buildHourlyPoints(
    hourly.time,
    hourly.visibility.map((v) => Math.round(v / 1000)),
    'visibility'
  )
  const windData = buildHourlyPoints(
    hourly.time,
    hourly.windspeed10m,
    'windspeed'
  )

  const pm10 = hourly.pm10.length
    ? hourly.pm10
    : new Array(hourly.time.length).fill(null)
  const pm25 = hourly.pm25.length
    ? hourly.pm25
    : new Array(hourly.time.length).fill(null)
  const pmData = hourly.time.map((t, i) => ({
    time: t.slice(11, 16),
    pm10: pm10[i] ?? null,
    pm25: pm25[i] ?? null,
  }))

  return (
    <div className='grid max-w-full gap-4 md:grid-cols-2'>
      <ChartCard title={`Temperature (°${tempUnit})`}>
        <ScrollableChart minWidth={MIN_WIDTH} height={CHART_HEIGHT}>
          <ResponsiveContainer width='100%' height='100%'>
            <AreaChart
              data={tempData}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <defs>
                <linearGradient id='tempGrad' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='#f97316' stopOpacity={0.4} />
                  <stop offset='95%' stopColor='#f97316' stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray='3 3' stroke='var(--border)' />
              <XAxis dataKey='time' tick={{ fontSize: 10 }} interval={2} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v) => [`${v}°${tempUnit}`, 'Temp']}
              />
              <Area
                type='monotone'
                dataKey='temp'
                stroke='#f97316'
                fill='url(#tempGrad)'
                strokeWidth={2}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ScrollableChart>
      </ChartCard>

      <ChartCard title='Relative Humidity (%)'>
        <ScrollableChart minWidth={MIN_WIDTH} height={CHART_HEIGHT}>
          <ResponsiveContainer width='100%' height='100%'>
            <AreaChart
              data={humData}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <defs>
                <linearGradient id='humGrad' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='#38bdf8' stopOpacity={0.4} />
                  <stop offset='95%' stopColor='#38bdf8' stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray='3 3' stroke='var(--border)' />
              <XAxis dataKey='time' tick={{ fontSize: 10 }} interval={2} />
              <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v) => [`${v}%`, 'Humidity']}
              />
              <Area
                type='monotone'
                dataKey='humidity'
                stroke='#38bdf8'
                fill='url(#humGrad)'
                strokeWidth={2}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ScrollableChart>
      </ChartCard>

      <ChartCard title='Precipitation (mm)'>
        <ScrollableChart minWidth={MIN_WIDTH} height={CHART_HEIGHT}>
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart
              data={precData}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray='3 3' stroke='var(--border)' />
              <XAxis dataKey='time' tick={{ fontSize: 10 }} interval={2} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v) => [`${v} mm`, 'Rain']}
              />
              <Bar
                dataKey='precipitation'
                fill='#6366f1'
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ScrollableChart>
      </ChartCard>

      <ChartCard title='Visibility (km)'>
        <ScrollableChart minWidth={MIN_WIDTH} height={CHART_HEIGHT}>
          <ResponsiveContainer width='100%' height='100%'>
            <LineChart
              data={visData}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray='3 3' stroke='var(--border)' />
              <XAxis dataKey='time' tick={{ fontSize: 10 }} interval={2} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v) => [`${v} km`, 'Visibility']}
              />
              <Line
                type='monotone'
                dataKey='visibility'
                stroke='#a855f7'
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ScrollableChart>
      </ChartCard>

      <ChartCard title='Wind Speed 10m (km/h)'>
        <ScrollableChart minWidth={MIN_WIDTH} height={CHART_HEIGHT}>
          <ResponsiveContainer width='100%' height='100%'>
            <AreaChart
              data={windData}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <defs>
                <linearGradient id='windGrad' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='#10b981' stopOpacity={0.35} />
                  <stop offset='95%' stopColor='#10b981' stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray='3 3' stroke='var(--border)' />
              <XAxis dataKey='time' tick={{ fontSize: 10 }} interval={2} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v) => [`${v} km/h`, 'Wind']}
              />
              <Area
                type='monotone'
                dataKey='windspeed'
                stroke='#10b981'
                fill='url(#windGrad)'
                strokeWidth={2}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ScrollableChart>
      </ChartCard>

      <ChartCard title='Air Quality — PM10 & PM2.5 (μg/m³)'>
        <ScrollableChart minWidth={MIN_WIDTH} height={CHART_HEIGHT}>
          <ResponsiveContainer width='100%' height='100%'>
            <LineChart
              data={pmData}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray='3 3' stroke='var(--border)' />
              <XAxis dataKey='time' tick={{ fontSize: 10 }} interval={2} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line
                type='monotone'
                dataKey='pm10'
                stroke='#ef4444'
                strokeWidth={2}
                dot={false}
                name='PM10'
              />
              <Line
                type='monotone'
                dataKey='pm25'
                stroke='#f59e0b'
                strokeWidth={2}
                dot={false}
                name='PM2.5'
              />
            </LineChart>
          </ResponsiveContainer>
        </ScrollableChart>
      </ChartCard>
    </div>
  )
}
