import { fallbackDestinations, fallbackPlaceDetails, fallbackPlacesByDestination } from "../data/fallbackData";
import type { Destination, DestinationPlaces, PlaceDetail } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

async function request<T>(path: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`);
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }
    return (await response.json()) as T;
  } catch {
    return fallback;
  }
}

export function getDestinations(query?: string): Promise<Destination[]> {
  const fallback = query
    ? fallbackDestinations.filter((destination) =>
        `${destination.name} ${destination.country} ${destination.description}`.toLowerCase().includes(query.toLowerCase()),
      )
    : fallbackDestinations;

  const params = query ? `?q=${encodeURIComponent(query)}` : "";
  return request<Destination[]>(`/destinations${params}`, fallback);
}

export function getDestinationPlaces(slug: string): Promise<DestinationPlaces> {
  return request<DestinationPlaces>(`/destinations/${slug}/places`, fallbackPlacesByDestination[slug]);
}

export function getPlace(placeId: string): Promise<PlaceDetail> {
  return request<PlaceDetail>(`/places/${placeId}`, fallbackPlaceDetails[placeId]);
}

