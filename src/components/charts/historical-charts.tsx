import React from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { ScrollableChart } from './scrollable-chart'
import type { DailyHistoricalData } from '../../types/weather'

interface Props {
  data: DailyHistoricalData
}

const tooltipStyle = {
  backgroundColor: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  color: 'var(--foreground)',
  fontSize: '11px',
  maxWidth: '180px',
}

function ChartCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className='overflow-x-auto rounded-2xl border border-border bg-card p-4 shadow-sm'>
      <p className='mb-3 text-sm font-semibold tracking-wide text-muted-foreground uppercase'>
        {title}
      </p>
      {children}
    </div>
  )
}

function tickInterval(n: number) {
  if (n <= 30) return 2
  if (n <= 90) return 6
  if (n <= 180) return 14
  if (n <= 365) return 30
  return 60
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
}

function chartWidth(n: number) {
  return Math.max(900, n * 12)
}

export function HistoricalCharts({ data }: Props) {
  const n = data.time.length
  const interval = tickInterval(n)
  const cWidth = chartWidth(n)

  const tempData = data.time.map((t, i) => ({
    date: formatDate(t),
    max: data.temperatureMax[i],
    mean: data.temperatureMean[i],
    min: data.temperatureMin[i],
  }))

  const sunData = data.time.map((t, i) => ({
    date: formatDate(t),
    sunrise: data.sunrise[i],
    sunset: data.sunset[i],
  }))

  const precipData = data.time.map((t, i) => ({
    date: formatDate(t),
    precipitation: data.precipitation[i],
  }))

  const windData = data.time.map((t, i) => ({
    date: formatDate(t),
    windMax: data.windspeedMax[i],
    windDir: data.winddirectionDominant[i],
  }))

  const pmData = data.time.map((t, i) => ({
    date: formatDate(t),
    pm10: parseFloat((data.pm10[i] ?? 0).toFixed(1)),
    pm25: parseFloat((data.pm25[i] ?? 0).toFixed(1)),
  }))

  return (
    <div className='grid gap-5'>
      <ChartCard title='Temperature — Mean, Max & Min (°C)'>
        <ScrollableChart minWidth={cWidth} height={240}>
          <ResponsiveContainer width='100%' height='100%'>
            <LineChart
              data={tempData}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray='3 3' stroke='var(--border)' />
              <XAxis
                dataKey='date'
                tick={{ fontSize: 9 }}
                interval={interval}
              />
              <YAxis tick={{ fontSize: 10 }} unit='°' />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v, name) => [`${v}°C`, name]}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line
                type='monotone'
                dataKey='max'
                stroke='#ef4444'
                strokeWidth={1.5}
                dot={false}
                name='Max'
              />
              <Line
                type='monotone'
                dataKey='mean'
                stroke='#f59e0b'
                strokeWidth={1.5}
                dot={false}
                name='Mean'
              />
              <Line
                type='monotone'
                dataKey='min'
                stroke='#38bdf8'
                strokeWidth={1.5}
                dot={false}
                name='Min'
              />
            </LineChart>
          </ResponsiveContainer>
        </ScrollableChart>
      </ChartCard>

      <ChartCard title='Sunrise & Sunset (IST)'>
        <ScrollableChart minWidth={cWidth} height={200}>
          <ResponsiveContainer width='100%' height='100%'>
            <LineChart
              data={sunData}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray='3 3' stroke='var(--border)' />
              <XAxis
                dataKey='date'
                tick={{ fontSize: 9 }}
                interval={interval}
              />
              <YAxis hide />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line
                type='monotone'
                dataKey='sunrise'
                stroke='#fbbf24'
                strokeWidth={1.5}
                dot={false}
                name='Sunrise'
              />
              <Line
                type='monotone'
                dataKey='sunset'
                stroke='#f97316'
                strokeWidth={1.5}
                dot={false}
                name='Sunset'
              />
            </LineChart>
          </ResponsiveContainer>
        </ScrollableChart>
      </ChartCard>

      <ChartCard title='Precipitation — Daily Total (mm)'>
        <ScrollableChart minWidth={cWidth} height={220}>
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart
              data={precipData}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              barSize={4}
            >
              <CartesianGrid strokeDasharray='3 3' stroke='var(--border)' />
              <XAxis
                dataKey='date'
                tick={{ fontSize: 9 }}
                interval={interval}
              />
              <YAxis tick={{ fontSize: 10 }} unit=' mm' />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v) => [`${v} mm`, 'Precipitation']}
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

      <ChartCard title='Wind — Max Speed (km/h) & Dominant Direction (°)'>
        <ScrollableChart minWidth={cWidth} height={240}>
          <ResponsiveContainer width='100%' height='100%'>
            <ComposedChart
              data={windData}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray='3 3' stroke='var(--border)' />
              <XAxis
                dataKey='date'
                tick={{ fontSize: 9 }}
                interval={interval}
              />
              <YAxis yAxisId='left' tick={{ fontSize: 10 }} unit=' km/h' />
              <YAxis
                yAxisId='right'
                orientation='right'
                tick={{ fontSize: 10 }}
                unit='°'
                domain={[0, 360]}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar
                yAxisId='left'
                dataKey='windMax'
                fill='#10b981'
                opacity={0.7}
                radius={[2, 2, 0, 0]}
                name='Max Speed'
                barSize={4}
              />
              <Line
                yAxisId='right'
                type='monotone'
                dataKey='windDir'
                stroke='#a855f7'
                strokeWidth={1}
                dot={false}
                name='Direction'
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ScrollableChart>
      </ChartCard>

      <ChartCard title='Air Quality — PM10 & PM2.5 Daily Mean (μg/m³)'>
        <ScrollableChart minWidth={cWidth} height={240}>
          <ResponsiveContainer width='100%' height='100%'>
            <LineChart
              data={pmData}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray='3 3' stroke='var(--border)' />
              <XAxis
                dataKey='date'
                tick={{ fontSize: 9 }}
                interval={interval}
              />
              <YAxis tick={{ fontSize: 10 }} unit=' μg' />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line
                type='monotone'
                dataKey='pm10'
                stroke='#ef4444'
                strokeWidth={1.5}
                dot={false}
                name='PM10'
              />
              <Line
                type='monotone'
                dataKey='pm25'
                stroke='#f59e0b'
                strokeWidth={1.5}
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
