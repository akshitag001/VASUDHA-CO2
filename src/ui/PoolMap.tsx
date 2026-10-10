import { useEffect, useRef, useState } from 'react'
import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { Neighbour } from '../model/village'

interface Props {
  center: { lat: number; lon: number; name: string }
  neighbours: Neighbour[]
  selected: string[]
  radiusKm: number
  onToggle: (id: string) => void
  label: string
}

function circle(lat: number, lon: number, km: number) {
  const pts: [number, number][] = []
  for (let i = 0; i <= 64; i++) {
    const a = (i / 64) * 2 * Math.PI
    pts.push([lon + (km * Math.cos(a)) / (111.32 * Math.cos((lat * Math.PI) / 180)), lat + (km * Math.sin(a)) / 110.574])
  }
  return { type: 'Feature' as const, properties: {}, geometry: { type: 'Polygon' as const, coordinates: [pts] } }
}

// Map of the selected village and nearby Panchayats. Each dot is a real <button>
// (focusable, aria-pressed), so the map works from the keyboard as well as by touch.
export default function PoolMap({ center, neighbours, selected, radiusKm, onToggle, label }: Props) {
  const box = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const markers = useRef<maplibregl.Marker[]>([])
  const [loaded, setLoaded] = useState(false)
  const toggle = useRef(onToggle)
  useEffect(() => {
    toggle.current = onToggle
  }, [onToggle])

  useEffect(() => {
    if (!box.current) return
    const m = new maplibregl.Map({
      container: box.current,
      style: {
        version: 8,
        sources: {
          osm: { type: 'raster', tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'], tileSize: 256, attribution: '© OpenStreetMap contributors' },
        },
        layers: [{ id: 'osm', type: 'raster', source: 'osm', paint: { 'raster-saturation': -0.6 } }],
      },
      center: [center.lon, center.lat],
      zoom: 9.5,
      cooperativeGestures: true,
    })
    m.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')
    m.on('load', () => {
      m.addSource('radius', { type: 'geojson', data: circle(center.lat, center.lon, radiusKm) })
      m.addLayer({ id: 'radius', type: 'line', source: 'radius', paint: { 'line-color': '#1a3300', 'line-width': 1.2, 'line-dasharray': [3, 3] } })
      m.addSource('links', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
      m.addLayer({ id: 'links', type: 'line', source: 'links', paint: { 'line-color': '#1d5c58', 'line-width': 2.5 } })
      setLoaded(true)
    })
    map.current = m
    return () => {
      m.remove()
      map.current = null
      setLoaded(false)
    }
  }, [center.lat, center.lon, radiusKm])

  useEffect(() => {
    const m = map.current
    if (!m || !loaded) return
    {
      markers.current.forEach((mk) => mk.remove())
      markers.current = []
      const hub = document.createElement('div')
      hub.setAttribute('aria-hidden', 'true')
      hub.style.cssText = 'width:20px;height:20px;background:#1a3300;border:3px solid #fffefa;transform:rotate(45deg)'
      markers.current.push(new maplibregl.Marker({ element: hub }).setLngLat([center.lon, center.lat]).addTo(m))
      for (const n of neighbours) {
        const on = selected.includes(n.lgdCode)
        const b = document.createElement('button')
        b.type = 'button'
        b.setAttribute('aria-pressed', String(on))
        b.setAttribute('aria-label', `${n.name}, ${n.distanceKm.toFixed(1)} km`)
        b.title = `${n.name} · ${n.distanceKm.toFixed(1)} km`
        b.style.cssText = `width:22px;height:22px;border-radius:50%;cursor:pointer;border:2.5px solid #1a3300;background:${on ? '#1d5c58' : '#fffefa'};box-shadow:0 0 0 2px #fffefa`
        b.addEventListener('click', (e) => {
          e.stopPropagation()
          toggle.current(n.lgdCode)
        })
        markers.current.push(new maplibregl.Marker({ element: b }).setLngLat([n.lon, n.lat]).addTo(m))
      }
      const src = m.getSource('links') as maplibregl.GeoJSONSource | undefined
      src?.setData({
        type: 'FeatureCollection',
        features: neighbours
          .filter((n) => selected.includes(n.lgdCode))
          .map((n) => ({ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [[center.lon, center.lat], [n.lon, n.lat]] } })),
      })
    }
  }, [neighbours, selected, center.lat, center.lon, loaded])

  return <div ref={box} role="region" aria-label={label} className="w-full h-[22rem] border border-ink bg-paper-2" />
}
