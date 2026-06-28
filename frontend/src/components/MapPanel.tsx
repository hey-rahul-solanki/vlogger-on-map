import { useEffect, useMemo, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Destination, PlaceSummary } from "../types";

type MapPanelProps = {
  destination: Destination;
  places: PlaceSummary[];
  selectedPlaceId?: string;
  onSelectPlace: (placeId: string) => void;
};

const style = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors",
    },
  },
  layers: [
    {
      id: "osm",
      type: "raster",
      source: "osm",
    },
  ],
} satisfies maplibregl.StyleSpecification;

export function MapPanel({ destination, places, selectedPlaceId, onSelectPlace }: MapPanelProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  const center = useMemo<[number, number]>(() => [destination.center[1], destination.center[0]], [destination.center]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapRef.current = new maplibregl.Map({
      container: containerRef.current,
      style,
      center,
      zoom: destination.zoom,
      attributionControl: false,
    });
    mapRef.current.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "bottom-right");
    mapRef.current.addControl(new maplibregl.AttributionControl({ compact: true }));

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [center, destination.zoom]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    map.flyTo({ center, zoom: destination.zoom, speed: 0.9, essential: true });
  }, [center, destination.slug, destination.zoom]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = places.map((place) => {
      const markerElement = document.createElement("button");
      markerElement.className = `map-pin ${selectedPlaceId === place.id ? "is-selected" : ""}`;
      markerElement.type = "button";
      markerElement.setAttribute("aria-label", `Open ${place.name}`);
      markerElement.innerHTML = `<span>${place.video_count}</span>`;
      markerElement.addEventListener("click", () => onSelectPlace(place.id));

      return new maplibregl.Marker({ element: markerElement, anchor: "bottom" })
        .setLngLat([place.longitude, place.latitude])
        .addTo(map);
    });

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
    };
  }, [onSelectPlace, places, selectedPlaceId]);

  return <div className="map-panel" ref={containerRef} aria-label={`${destination.name} vlog places map`} />;
}

