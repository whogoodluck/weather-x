import { useState, useEffect } from 'react'
import type { Coordinates } from '../types/weather'

export function useCityName(coords: Coordinates | null): string {
  const [city, setCity] = useState('Your Location')

  useEffect(() => {
    if (!coords) return
    fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${coords.lat}&lon=${coords.lon}&format=json`
    )
      .then((r) => r.json())
      .then((d) => {
        const addr = d.address ?? {}
        const name =
          addr.city ||
          addr.town ||
          addr.village ||
          addr.county ||
          addr.state ||
          'Your Location'
        setCity(name)
      })
      .catch(() => setCity('Your Location'))
  }, [coords])

  return city
}
