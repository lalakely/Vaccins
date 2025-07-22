import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import type { Map as LeafletMap, LeafletMouseEvent } from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix pour les icônes Leaflet dans React
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface LocationMapProps {
  initialPosition?: [number, number];
  height?: string;
  onPositionChange?: (lat: number, lng: number) => void;
  readOnly?: boolean;
}

const LocationMap = ({
  initialPosition = [-18.8792, 47.5079], // Default to Madagascar center
  height = "400px",
  onPositionChange,
  readOnly = false
}: LocationMapProps) => {
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  
  // Déterminer le zoom initial en fonction de si nous avons une position initiale précise
  const isDefaultPosition = initialPosition[0] === -18.8792 && initialPosition[1] === 47.5079;
  const initialZoom = isDefaultPosition ? 6 : 12;

  useEffect(() => {
    if (!mapContainerRef.current || mapInitialized) return;
    
    // Petite temporisation pour s'assurer que le DOM est prêt
    const timer = setTimeout(() => {
      // Initialisation de la carte
      const map = L.map(mapContainerRef.current!).setView(initialPosition, initialZoom);
      
      // Ajout du fond de carte
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
      
      // Ajouter un marqueur à la position initiale
      markerRef.current = L.marker(initialPosition)
        .addTo(map)
        .bindPopup(`
          <div>
            <strong>Coordonnées:</strong><br/>
            Lat: ${initialPosition[0].toFixed(6)}<br/>
            Lng: ${initialPosition[1].toFixed(6)}
          </div>
        `)
        .openPopup();
      
      // Gestion du clic sur la carte si non read-only
      if (!readOnly) {
        map.on('click', (e: LeafletMouseEvent) => {
          const { lat, lng } = e.latlng;
          
          // Mise à jour du marqueur
          if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng])
              .bindPopup(`
                <div>
                  <strong>Coordonnées:</strong><br/>
                  Lat: ${lat.toFixed(6)}<br/>
                  Lng: ${lng.toFixed(6)}
                </div>
              `)
              .openPopup();
          }
          
          // Appel du callback
          if (onPositionChange) {
            onPositionChange(lat, lng);
          }
        });
      }
      
      // Sauvegarde de la référence de la carte
      mapRef.current = map;
      setMapInitialized(true);
      
      // Force refresh de la carte après un court délai
      setTimeout(() => {
        map.invalidateSize();
      }, 100);
    }, 100);
    
    return () => {
      clearTimeout(timer);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, [initialPosition, initialZoom, onPositionChange, readOnly]);
  
  // Si la position initiale change après le premier rendu, mettre à jour le marqueur
  useEffect(() => {
    if (mapInitialized && mapRef.current && markerRef.current) {
      markerRef.current.setLatLng(initialPosition);
      mapRef.current.setView(initialPosition, mapRef.current.getZoom());
    }
  }, [initialPosition, mapInitialized]);

  return (
    <div
      ref={mapContainerRef}
      className="border border-gray-200 rounded-lg overflow-hidden"
      style={{ height }}
    />
  );
};

export default LocationMap;
