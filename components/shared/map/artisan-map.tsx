'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

// Kenya county coordinates (approximate centers)
const KENYA_COUNTY_COORDS: Record<string, [number, number]> = {
  'Nairobi': [36.8219, -1.2921],
  'Mombasa': [39.6682, -4.0435],
  'Kisumu': [34.7617, -0.1022],
  'Nakuru': [36.0800, -0.3031],
  'Kiambu': [36.8260, -1.1714],
  'Machakos': [37.2634, -1.5177],
  'Kajiado': [36.7820, -1.8524],
  'Uasin Gishu': [35.2698, 0.5143],
  'Kilifi': [39.8500, -3.5107],
  'Nyeri': [36.9515, -0.4197],
  'Murang\'a': [37.1500, -0.7839],
  'Kakamega': [34.7519, 0.2827],
  'Bungoma': [34.5584, 0.5635],
  'Meru': [37.6500, 0.0500],
  'Kericho': [35.2863, -0.3689],
  'Nandi': [35.1269, 0.1836],
  'Trans Nzoia': [34.9506, 1.0167],
  'Laikipia': [36.7833, 0.3500],
  'Narok': [35.8667, -1.0833],
  'Bomet': [35.3428, -0.7813],
  'Kirinyaga': [37.3000, -0.5000],
  'Nyandarua': [36.4167, -0.1833],
  'Embu': [37.4500, -0.5333],
  'Tharaka Nithi': [37.8833, -0.3000],
  'Isiolo': [38.0000, 0.3500],
  'Marsabit': [37.9833, 2.3333],
  'Garissa': [39.6500, -0.4500],
  'Wajir': [40.0500, 1.7500],
  'Mandera': [40.9500, 3.9333],
  'Siaya': [34.2833, 0.0667],
  'Homa Bay': [34.4500, -0.5167],
  'Migori': [34.4667, -1.0667],
  'Kisii': [34.7667, -0.6833],
  'Nyamira': [34.9333, -0.5667],
  'Kwale': [39.4500, -4.1833],
  'Tana River': [39.5500, -1.5000],
  'Lamu': [40.9000, -2.2667],
  'Taita Taveta': [38.3500, -3.3167],
  'Kitui': [38.0167, -1.3667],
  'Makueni': [37.6167, -1.8000],
  'Baringo': [35.9667, 0.4667],
  'Samburu': [36.9333, 1.0000],
  'Turkana': [35.1167, 3.5167],
  'West Pokot': [35.1167, 1.6167],
  'Elgeyo Marakwet': [35.5000, 0.6833],
  'Vihiga': [34.7333, 0.0833],
  'Busia': [34.1167, 0.4500]
}

// Kenya center and bounds
const KENYA_CENTER: [number, number] = [37.9062, 0.0236]
const KENYA_BOUNDS: [[number, number], [number, number]] = [
  [33.9, -4.7], // Southwest
  [41.9, 4.6]   // Northeast
]

export interface CountyData {
  name: string
  artisanCount: number
  featured?: boolean
}

interface ArtisanMapProps {
  counties: CountyData[]
  height?: string
  onCountyClick?: (county: CountyData) => void
  showLegend?: boolean
  className?: string
}

export default function ArtisanMap({ 
  counties, 
  height = '400px',
  onCountyClick,
  showLegend = true,
  className = ''
}: ArtisanMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)

  // Get color based on artisan count
  const getMarkerColor = useCallback((count: number): string => {
    if (count === 0) return '#9CA3AF' // gray-400
    if (count < 10) return '#60A5FA' // blue-400
    if (count < 50) return '#34D399' // green-400
    if (count < 100) return '#FBBF24' // yellow-400
    return '#F87171' // red-400
  }, [])

  // Get marker size based on artisan count
  const getMarkerSize = useCallback((count: number): number => {
    if (count === 0) return 15
    if (count < 10) return 20
    if (count < 50) return 28
    if (count < 100) return 36
    return 44
  }, [])

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return

    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

    if (!token) {
      setMapError('Mapbox access token not configured. Add NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN to your environment.')
      return
    }

    try {
      mapboxgl.accessToken = token

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: KENYA_CENTER,
        zoom: 5.5,
        maxBounds: KENYA_BOUNDS,
        attributionControl: false
      })

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')
      map.current.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-right')

      map.current.on('load', () => {
        setMapLoaded(true)
      })

      map.current.on('error', (e) => {
        console.error('Mapbox error:', e)
        setMapError('Failed to load map. Please check your Mapbox configuration.')
      })
    } catch (error) {
      console.error('Map initialization error:', error)
      setMapError('Failed to initialize map.')
    }

    return () => {
      markersRef.current.forEach(marker => marker.remove())
      markersRef.current = []
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [])

  // Add markers when map is loaded and counties data changes
  useEffect(() => {
    if (!mapLoaded || !map.current) return

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    // Add new markers
    counties.forEach(county => {
      const coords = KENYA_COUNTY_COORDS[county.name]
      if (!coords) return

      const size = getMarkerSize(county.artisanCount)
      const color = getMarkerColor(county.artisanCount)

      // Create custom marker element
      const el = document.createElement('div')
      el.className = 'artisan-marker'
      el.style.width = `${size}px`
      el.style.height = `${size}px`
      el.style.borderRadius = '50%'
      el.style.backgroundColor = color
      el.style.border = '2px solid white'
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)'
      el.style.cursor = 'pointer'
      el.style.display = 'flex'
      el.style.alignItems = 'center'
      el.style.justifyContent = 'center'
      el.style.fontSize = size > 25 ? '11px' : '9px'
      el.style.fontWeight = 'bold'
      el.style.color = county.artisanCount > 0 ? 'white' : '#6B7280'
      el.style.transition = 'transform 0.2s ease'
      
      if (county.artisanCount > 0) {
        el.textContent = county.artisanCount.toString()
      }

      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.2)'
      })
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)'
      })

      // Create popup
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
        closeOnClick: false
      }).setHTML(`
        <div style="padding: 8px;">
          <strong style="font-size: 14px;">${county.name} County</strong>
          <div style="margin-top: 4px; color: #666;">
            ${county.artisanCount} artisan${county.artisanCount !== 1 ? 's' : ''}
          </div>
          ${county.featured ? '<div style="margin-top: 4px; color: #F59E0B; font-size: 12px;">Featured</div>' : ''}
        </div>
      `)

      // Create marker
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([coords[0], coords[1]])
        .setPopup(popup)
        .addTo(map.current!)

      // Show popup on hover
      el.addEventListener('mouseenter', () => {
        marker.togglePopup()
      })
      el.addEventListener('mouseleave', () => {
        marker.togglePopup()
      })

      // Handle click
      if (onCountyClick) {
        el.addEventListener('click', () => {
          onCountyClick(county)
        })
      }

      markersRef.current.push(marker)
    })
  }, [mapLoaded, counties, getMarkerColor, getMarkerSize, onCountyClick])

  // Error state
  if (mapError) {
    return (
      <div 
        className={`bg-muted rounded-lg flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <div className="text-center p-6">
          <div className="text-muted-foreground mb-2">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <p className="text-muted-foreground text-sm">{mapError}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <div 
        ref={mapContainer} 
        style={{ height }} 
        className="rounded-lg overflow-hidden"
      />
      
      {/* Loading state */}
      {!mapLoaded && (
        <div 
          className="absolute inset-0 bg-muted rounded-lg flex items-center justify-center"
        >
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-muted-foreground text-sm">Loading map...</p>
          </div>
        </div>
      )}

      {/* Legend */}
      {showLegend && mapLoaded && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 text-xs">
          <div className="font-medium mb-2">Artisan Count</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-400"></div>
              <span>0</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-400"></div>
              <span>1-9</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
              <span>10-49</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <span>50-99</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <span>100+</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
