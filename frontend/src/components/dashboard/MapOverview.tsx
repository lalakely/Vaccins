import { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Map as LeafletMap } from "leaflet";

// Fix pour les icônes Leaflet dans React
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Icônes personnalisées pour différencier fokotany et hameau
const fokotanyIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const hameauIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Types pour les données
interface Fokotany {
  id: number;
  Nom: string;
  px: number;
  py: number;
}

interface Hameau {
  id: number;
  Nom: string;
  px: number;
  py: number;
  fokotany_id: number;
  fokotany?: { Nom: string };
}

export default function MapOverview() {
  const [fokotanyList, setFokotanyList] = useState<Fokotany[]>([]);
  const [hameauList, setHameauList] = useState<Hameau[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Centre de la carte par défaut (Madagascar)
  const mapCenter: [number, number] = [-18.8792, 47.5079];
  const mapZoom = 6;
  
  // Référence pour la carte Leaflet
  const mapRef = useRef<LeafletMap | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  
  // Fonction pour charger les données
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupération des fokotany
        const fokotanyResponse = await fetch("http://localhost:3000/api/fokotany");
        if (!fokotanyResponse.ok) {
          throw new Error("Erreur lors de la récupération des fokotany");
        }
        const fokotanyData = await fokotanyResponse.json();
        setFokotanyList(fokotanyData);
        
        // Récupération des hameaux avec leurs fokotany associés
        const hameauResponse = await fetch("http://localhost:3000/api/hameau");
        if (!hameauResponse.ok) {
          throw new Error("Erreur lors de la récupération des hameaux");
        }
        const hameauData = await hameauResponse.json();
        setHameauList(hameauData);
        
        setLoading(false);
      } catch (error) {
        console.error("Erreur:", error);
        setError(error instanceof Error ? error.message : "Erreur inconnue");
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Initialisation et gestion de la carte
  useEffect(() => {
    // Si les données sont chargées et que la carte n'est pas encore initialisée
    if (!loading && !error && mapContainerRef.current && !mapRef.current) {
      // Initialisation de la carte
      const map = L.map(mapContainerRef.current).setView(mapCenter, mapZoom);
      
      // Ajout du fond de carte
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
      
      // Sauvegarde de la référence de la carte
      mapRef.current = map;
      
      // Ajout des markers pour les fokotany
      fokotanyList.forEach((fokotany) => {
        if (fokotany.px && fokotany.py) {
          // Conversion des coordonnées en nombres
          const lat = typeof fokotany.py === 'string' ? parseFloat(fokotany.py) : fokotany.py;
          const lng = typeof fokotany.px === 'string' ? parseFloat(fokotany.px) : fokotany.px;
          
          L.marker([lat, lng], { icon: fokotanyIcon })
            .addTo(map)
            .bindPopup(`
              <div>
                <strong>Fokotany:</strong> ${fokotany.Nom}<br/>
                <strong>Coordonnées:</strong><br/>
                Lat: ${typeof lat === 'number' ? lat.toFixed(6) : lat}<br/>
                Lng: ${typeof lng === 'number' ? lng.toFixed(6) : lng}
              </div>
            `);
        }
      });
      
      // Ajout des markers pour les hameaux
      hameauList.forEach((hameau) => {
        if (hameau.px && hameau.py) {
          const fokotanyName = fokotanyList.find(f => f.id === hameau.fokotany_id)?.Nom || "Inconnu";
          
          // Conversion des coordonnées en nombres
          const lat = typeof hameau.py === 'string' ? parseFloat(hameau.py) : hameau.py;
          const lng = typeof hameau.px === 'string' ? parseFloat(hameau.px) : hameau.px;
          
          L.marker([lat, lng], { icon: hameauIcon })
            .addTo(map)
            .bindPopup(`
              <div>
                <strong>Hameau:</strong> ${hameau.Nom}<br/>
                <strong>Fokotany:</strong> ${fokotanyName}<br/>
                <strong>Coordonnées:</strong><br/>
                Lat: ${typeof lat === 'number' ? lat.toFixed(6) : lat}<br/>
                Lng: ${typeof lng === 'number' ? lng.toFixed(6) : lng}
              </div>
            `);
        }
      });
      
      // Ajustement de la vue pour inclure tous les marqueurs
      if (fokotanyList.length > 0 || hameauList.length > 0) {
        const bounds: [number, number][] = [];
        
        fokotanyList.forEach((fokotany) => {
          if (fokotany.py && fokotany.px) {
            // Conversion en nombres
            const lat = typeof fokotany.py === 'string' ? parseFloat(fokotany.py) : fokotany.py;
            const lng = typeof fokotany.px === 'string' ? parseFloat(fokotany.px) : fokotany.px;
            bounds.push([lat, lng]);
          }
        });
        
        hameauList.forEach((hameau) => {
          if (hameau.py && hameau.px) {
            // Conversion en nombres
            const lat = typeof hameau.py === 'string' ? parseFloat(hameau.py) : hameau.py;
            const lng = typeof hameau.px === 'string' ? parseFloat(hameau.px) : hameau.px;
            bounds.push([lat, lng]);
          }
        });
        
        if (bounds.length > 0) {
          map.fitBounds(bounds as L.LatLngBoundsExpression);
        }
      }
    }
    
    // Nettoyage à la destruction du composant
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [fokotanyList, hameauList, loading, error]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-full">
        <p>Erreur: {error}</p>
      </div>
    );
  }
  
  return (
    <div className="w-full h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">Carte des Fokotany et Hameaux</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Fokotany ({fokotanyList.length})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Hameaux ({hameauList.length})</span>
          </div>
        </div>
      </div>
      <div 
        ref={mapContainerRef} 
        className="h-[500px] w-full border border-gray-200 rounded-xl overflow-hidden"
      />
    </div>
  );
}
