import { useState, useEffect } from "react"
import type { Coordinates } from "../types/weather"

interface GeoState {
  coords: Coordinates | null
  loading: boolean
  error: string | null
}

export function useGeolocation() {
  const [state, setState] = useState<GeoState>({
    coords: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({
        coords: null,
        loading: false,
        error: "Geolocation not supported",
      })
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          coords: { lat: pos.coords.latitude, lon: pos.coords.longitude },
          loading: false,
          error: null,
        })
      },
      (err) => {
        console.warn("GPS denied, using fallback:", err.message)
        setState({
          coords: { lat: 28.6139, lon: 77.209 },
          loading: false,
          error: null,
        })
      },
      { timeout: 8000, enableHighAccuracy: false }
    )
  }, [])

  return state
}
