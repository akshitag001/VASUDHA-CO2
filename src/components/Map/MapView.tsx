import { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapPin } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { findRealNeighbours, CLUSTERING } from '../../lib/neighbours';

// Builds a GeoJSON circle polygon (in degrees) approximating a radius in km —
// used to draw the search-radius ring around the selected village.
function circlePolygon(lat: number, lon: number, radiusKm: number, points = 64) {
  const coords: [number, number][] = [];
  const kmPerDegLat = 110.574;
  const kmPerDegLon = 111.320 * Math.cos((lat * Math.PI) / 180);
  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * 2 * Math.PI;
    const dLat = (radiusKm * Math.sin(angle)) / kmPerDegLat;
    const dLon = (radiusKm * Math.cos(angle)) / kmPerDegLon;
    coords.push([lon + dLon, lat + dLat]);
  }
  return {
    type: 'Feature' as const,
    properties: {},
    geometry: { type: 'Polygon' as const, coordinates: [coords] },
  };
}

export default function MapView() {
  const { panchayat, selectedNeighbours } = useApp();
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const [styleLoaded, setStyleLoaded] = useState(false);

  const hasCoords = panchayat?.lat != null && panchayat?.lon != null;
  const neighbours = hasCoords
    ? findRealNeighbours(panchayat!.id, panchayat!.lat!, panchayat!.lon!, CLUSTERING.maxSearchRadiusKm, CLUSTERING.maxClusterSize)
    : [];

  // Init map once.
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors',
          },
        },
        layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
      },
      center: [80.78, 22.44],
      zoom: 9,
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-right');
    map.on('load', () => setStyleLoaded(true));
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Re-render hub, radius circle, connecting lines and neighbour pins whenever
  // the selected village, its pooled selection, or the style-ready state changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !styleLoaded || !hasCoords) return;

    const lat = panchayat!.lat!;
    const lon = panchayat!.lon!;

    map.flyTo({ center: [lon, lat], zoom: 10, duration: 800 });

    // Radius circle
    const circleData = circlePolygon(lat, lon, CLUSTERING.maxSearchRadiusKm);
    if (map.getSource('radius')) {
      (map.getSource('radius') as maplibregl.GeoJSONSource).setData(circleData);
    } else {
      map.addSource('radius', { type: 'geojson', data: circleData });
      map.addLayer({ id: 'radius-fill', type: 'fill', source: 'radius', paint: { 'fill-color': '#276749', 'fill-opacity': 0.05 } });
      map.addLayer({ id: 'radius-line', type: 'line', source: 'radius', paint: { 'line-color': '#276749', 'line-width': 1.5, 'line-dasharray': [4, 3] } });
    }

    // Connecting lines from hub to selected pooled neighbours
    const selectedCoords = selectedNeighbours
      .map((n) => neighbours.find((rn) => rn.name === n.name))
      .filter((rn): rn is NonNullable<typeof rn> => Boolean(rn));

    const lineData = {
      type: 'FeatureCollection' as const,
      features: selectedCoords.map((n) => ({
        type: 'Feature' as const,
        properties: {},
        geometry: { type: 'LineString' as const, coordinates: [[lon, lat], [n.lon, n.lat]] },
      })),
    };
    if (map.getSource('cluster-lines')) {
      (map.getSource('cluster-lines') as maplibregl.GeoJSONSource).setData(lineData);
    } else {
      map.addSource('cluster-lines', { type: 'geojson', data: lineData });
      map.addLayer({ id: 'cluster-lines-layer', type: 'line', source: 'cluster-lines', paint: { 'line-color': '#276749', 'line-width': 2.5 } });
    }

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Hub marker (selected village)
    const hubEl = document.createElement('div');
    hubEl.style.cssText = 'width:18px;height:18px;border-radius:50%;background:#276749;border:3px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4);';
    const hubMarker = new maplibregl.Marker({ element: hubEl })
      .setLngLat([lon, lat])
      .setPopup(new maplibregl.Popup({ offset: 14 }).setHTML(`<strong>${panchayat!.name}</strong><br/>Selected Panchayat`))
      .addTo(map);
    markersRef.current.push(hubMarker);

    // Neighbour pins
    neighbours.forEach((n) => {
      const isPooled = selectedNeighbours.some((sn) => sn.name === n.name);
      const el = document.createElement('div');
      el.style.cssText = `width:13px;height:13px;border-radius:50%;background:${isPooled ? '#38a169' : '#a0aec0'};border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.35);`;
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([n.lon, n.lat])
        .setPopup(new maplibregl.Popup({ offset: 12 }).setHTML(
          `<strong>${n.name}</strong><br/>${n.distance} km away<br/>${n.households} households${isPooled ? '<br/><span style="color:#276749">✓ In pool</span>' : ''}`,
        ))
        .addTo(map);
      markersRef.current.push(marker);
    });
  }, [panchayat?.id, panchayat?.lat, panchayat?.lon, selectedNeighbours, styleLoaded, hasCoords]);

  return (
    <div className="card p-0 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-sage-200">
        <h3 className="font-semibold text-sm text-charcoal-900">Panchayat Map</h3>
        {hasCoords && (
          <span className="text-xs text-charcoal-600">{neighbours.length} within {CLUSTERING.maxSearchRadiusKm} km</span>
        )}
      </div>

      {!hasCoords ? (
        <div className="h-80 flex items-center justify-center text-sm text-charcoal-500 bg-earth-50">
          No coordinates on file for this Panchayat — map unavailable rather than showing a placeholder location.
        </div>
      ) : (
        <div ref={mapContainer} className="w-full h-80" />
      )}

      <div className="px-4 py-2 text-xs text-charcoal-500 border-t border-sage-100 flex items-center gap-1.5">
        <MapPin size={11} />
        Centred on the selected Panchayat's real coordinates. Green pins are pooled neighbours; grey pins are
        in-radius but not selected. Adjust the pool on the Aggregation page.
      </div>
    </div>
  );
}
