import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Card } from '@/components/ui/card';

// Fix for default markers in Leaflet with Webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface Location {
  id: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  accuracy?: number;
  battery_level?: number;
}

interface LocationMapProps {
  deviceCode: string;
  locations: Location[];
}

export const LocationMap = ({ deviceCode, locations }: LocationMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const marker = useRef<L.Marker | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Initialize map
    map.current = L.map(mapContainer.current, {
      center: [40.7128, -74.0060], // Default to NYC
      zoom: 13,
      zoomControl: true
    });

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map.current);

    setIsMapReady(true);

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!map.current || !isMapReady || locations.length === 0) return;

    const latestLocation = locations[locations.length - 1];
    const position: [number, number] = [latestLocation.latitude, latestLocation.longitude];

    // Remove existing marker
    if (marker.current) {
      map.current.removeLayer(marker.current);
    }

    // Create custom marker with device info
    const customIcon = L.divIcon({
      html: `
        <div class="flex flex-col items-center">
          <div class="w-8 h-8 bg-blue-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center animate-pulse">
            <div class="w-2 h-2 bg-white rounded-full"></div>
          </div>
          <div class="bg-black/75 text-white px-2 py-1 rounded text-xs mt-1 whitespace-nowrap">
            ${deviceCode}
          </div>
        </div>
      `,
      className: 'custom-marker',
      iconSize: [60, 60],
      iconAnchor: [30, 30]
    });

    // Add new marker
    marker.current = L.marker(position, { icon: customIcon })
      .addTo(map.current)
      .bindPopup(`
        <div class="text-sm">
          <strong>Device: ${deviceCode}</strong><br/>
          <strong>Last Update:</strong> ${new Date(latestLocation.timestamp).toLocaleString()}<br/>
          <strong>Accuracy:</strong> ${latestLocation.accuracy ? `${latestLocation.accuracy.toFixed(0)}m` : 'Unknown'}<br/>
          ${latestLocation.battery_level ? `<strong>Battery:</strong> ${latestLocation.battery_level}%<br/>` : ''}
          <strong>Coordinates:</strong><br/>
          ${latestLocation.latitude.toFixed(6)}, ${latestLocation.longitude.toFixed(6)}
        </div>
      `);

    // Center map on latest location
    map.current.setView(position, map.current.getZoom());

    // If there are multiple locations, draw a path
    if (locations.length > 1) {
      const path = locations.map(loc => [loc.latitude, loc.longitude] as [number, number]);
      L.polyline(path, {
        color: '#3b82f6',
        weight: 3,
        opacity: 0.7
      }).addTo(map.current);
    }

  }, [locations, deviceCode, isMapReady]);

  return (
    <Card className="h-80 sm:h-96 overflow-hidden glass-effect shadow-elegant">
      <div ref={mapContainer} className="w-full h-full rounded-lg" />
    </Card>
  );
};