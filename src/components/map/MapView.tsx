'use client'

import { useEffect, useRef, useCallback } from 'react'
import maplibregl from 'maplibre-gl'
import type { PinDetail, ContentType } from '@/types/database'

const TYPE_COLORS: Record<string, string> = {
  observation: '#e8643a',
  story: '#8b5cf6',
  photo: '#06b6d4',
  question: '#f59e0b',
  conversation: '#22a55b',
}

interface MapViewProps {
  pins: PinDetail[]
  activeFilter: string
  onPinClick: (pinId: string) => void
  onCoordsChange: (coords: string) => void
  onMapReady: (map: maplibregl.Map) => void
}

export default function MapView({
  pins,
  activeFilter,
  onPinClick,
  onCoordsChange,
  onMapReady,
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const pinsLoadedRef = useRef(false)

  const updateCoords = useCallback((map: maplibregl.Map) => {
    const center = map.getCenter()
    const lat = Math.abs(center.lat).toFixed(4)
    const lng = Math.abs(center.lng).toFixed(4)
    const ns = center.lat >= 0 ? 'N' : 'S'
    const ew = center.lng >= 0 ? 'E' : 'W'
    onCoordsChange(`${lat}°${ns} ${lng}°${ew}`)
  }, [onCoordsChange])

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: process.env.NEXT_PUBLIC_MAP_STYLE || 'https://tiles.openfreemap.org/styles/positron',
      center: [-0.5700, 44.8420],
      zoom: 15.8,
      pitch: 55,
      bearing: -12,
      maxPitch: 70,
      minZoom: 11,
      maxZoom: 19,
    })

    map.on('load', () => {
      // Wireframe aesthetic: mute map layers
      const layers = map.getStyle().layers
      layers.forEach((layer) => {
        try {
          if (layer.type === 'fill') {
            if (layer.id.includes('water')) {
              map.setPaintProperty(layer.id, 'fill-color', '#e8e4de')
              map.setPaintProperty(layer.id, 'fill-opacity', 0.4)
            } else if (layer.id.includes('building')) {
              map.setPaintProperty(layer.id, 'fill-opacity', 0)
            } else if (layer.id.includes('land') || layer.id.includes('park') || layer.id.includes('green')) {
              map.setPaintProperty(layer.id, 'fill-color', '#f0ede6')
              map.setPaintProperty(layer.id, 'fill-opacity', 0.5)
            } else {
              map.setPaintProperty(layer.id, 'fill-color', '#f6f4f0')
              map.setPaintProperty(layer.id, 'fill-opacity', 0.6)
            }
          }
          if (layer.type === 'line') {
            if (layer.id.includes('road') || layer.id.includes('highway') || layer.id.includes('street') || layer.id.includes('path') || layer.id.includes('trunk') || layer.id.includes('motorway')) {
              map.setPaintProperty(layer.id, 'line-color', '#c8c2b8')
              map.setPaintProperty(layer.id, 'line-opacity', 0.7)
            } else if (layer.id.includes('rail') || layer.id.includes('transit')) {
              map.setPaintProperty(layer.id, 'line-color', '#b5aea1')
              map.setPaintProperty(layer.id, 'line-opacity', 0.4)
            } else if (layer.id.includes('water') || layer.id.includes('river')) {
              map.setPaintProperty(layer.id, 'line-color', '#d4cfc6')
            } else if (layer.id.includes('boundary') || layer.id.includes('admin')) {
              map.setPaintProperty(layer.id, 'line-opacity', 0.15)
            } else {
              map.setPaintProperty(layer.id, 'line-color', '#d4cfc6')
              map.setPaintProperty(layer.id, 'line-opacity', 0.5)
            }
          }
          if (layer.type === 'symbol') {
            if (layer.id.includes('place') || layer.id.includes('label')) {
              map.setPaintProperty(layer.id, 'text-color', '#9e9590')
              map.setPaintProperty(layer.id, 'text-opacity', 0.6)
              map.setPaintProperty(layer.id, 'text-halo-color', '#f6f4f0')
              map.setPaintProperty(layer.id, 'text-halo-width', 1.5)
            }
          }
        } catch {
          // skip layers that don't support these properties
        }
      })

      // 3D building extrusions
      let firstSymbolId: string | undefined
      for (const layer of layers) {
        if (layer.type === 'symbol') { firstSymbolId = layer.id; break }
      }

      map.addLayer({
        id: '3d-buildings',
        source: 'openmaptiles',
        'source-layer': 'building',
        type: 'fill-extrusion',
        minzoom: 13,
        paint: {
          'fill-extrusion-color': '#edeae4',
          'fill-extrusion-height': [
            'interpolate', ['linear'], ['zoom'],
            13, 0,
            14, ['*', ['get', 'render_height'], 0.3],
            16, ['get', 'render_height'],
          ],
          'fill-extrusion-base': [
            'interpolate', ['linear'], ['zoom'],
            13, 0,
            16, ['get', 'render_min_height'],
          ],
          'fill-extrusion-opacity': 0.85,
        },
      }, firstSymbolId)

      map.setLight({
        anchor: 'viewport',
        color: '#ffffff',
        intensity: 0.35,
        position: [1.5, 210, 30],
      })

      pinsLoadedRef.current = false
      onMapReady(map)
    })

    map.on('moveend', () => updateCoords(map))

    mapRef.current = map
    updateCoords(map)

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Update pins on the map when data or filter changes
  useEffect(() => {
    const map = mapRef.current
    if (!map || !map.isStyleLoaded()) return

    const filteredPins = activeFilter === 'all'
      ? pins
      : pins.filter((p) => p.content_type === activeFilter)

    const geojson: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: filteredPins.map((p) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [p.longitude, p.latitude] },
        properties: { id: p.id, type: p.content_type, title: p.title },
      })),
    }

    // Remove old layers and source
    ;['pin-clusters', 'cluster-count', 'pin-dots'].forEach((id) => {
      if (map.getLayer(id)) map.removeLayer(id)
    })
    if (map.getSource('pins')) map.removeSource('pins')

    map.addSource('pins', {
      type: 'geojson',
      data: geojson,
      cluster: true,
      clusterMaxZoom: 13,
      clusterRadius: 50,
    })

    // Cluster circles
    map.addLayer({
      id: 'pin-clusters',
      type: 'circle',
      source: 'pins',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': '#e8643a',
        'circle-radius': ['step', ['get', 'point_count'], 16, 5, 20, 10, 26],
        'circle-opacity': 0.9,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff',
      },
    })

    // Cluster count
    map.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'pins',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['Open Sans Bold'],
        'text-size': 11,
      },
      paint: {
        'text-color': '#ffffff',
      },
    })

    // Individual pin dots
    map.addLayer({
      id: 'pin-dots',
      type: 'circle',
      source: 'pins',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': [
          'match', ['get', 'type'],
          'observation', '#e8643a',
          'story', '#8b5cf6',
          'photo', '#06b6d4',
          'question', '#f59e0b',
          'conversation', '#22a55b',
          '#e8643a',
        ],
        'circle-radius': [
          'interpolate', ['linear'], ['zoom'],
          12, 4,
          15, 7,
          18, 10,
        ],
        'circle-opacity': 0.92,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff',
      },
    })

    // Click handlers
    const handlePinClick = (e: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] }) => {
      if (e.features?.[0]) {
        const pinId = e.features[0].properties?.id
        if (pinId) onPinClick(pinId)
      }
    }

    const handleClusterClick = (e: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] }) => {
      if (e.features?.[0]) {
        const clusterId = e.features[0].properties?.cluster_id
        const source = map.getSource('pins') as maplibregl.GeoJSONSource
        source.getClusterExpansionZoom(clusterId).then((zoom) => {
          map.flyTo({
            center: (e.features![0].geometry as GeoJSON.Point).coordinates as [number, number],
            zoom: zoom + 1,
            duration: 600,
          })
        })
      }
    }

    map.on('click', 'pin-dots', handlePinClick)
    map.on('click', 'pin-clusters', handleClusterClick)

    map.on('mouseenter', 'pin-dots', () => { map.getCanvas().style.cursor = 'pointer' })
    map.on('mouseleave', 'pin-dots', () => { map.getCanvas().style.cursor = '' })
    map.on('mouseenter', 'pin-clusters', () => { map.getCanvas().style.cursor = 'pointer' })
    map.on('mouseleave', 'pin-clusters', () => { map.getCanvas().style.cursor = '' })

    return () => {
      map.off('click', 'pin-dots', handlePinClick)
      map.off('click', 'pin-clusters', handleClusterClick)
    }
  }, [pins, activeFilter, onPinClick])

  return <div ref={mapContainer} id="map" />
}
