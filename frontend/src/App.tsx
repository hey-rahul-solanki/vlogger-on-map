import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Compass, Filter, Search, Sparkles, Video } from "lucide-react";
import { getDestinationPlaces, getDestinations } from "./lib/api";
import { confidenceLabel } from "./lib/format";
import { MapPanel } from "./components/MapPanel";
import { Metric } from "./components/Metric";
import { PlaceDrawer } from "./components/PlaceDrawer";
import type { Destination, PlaceSummary } from "./types";

const categories = ["all", "nature", "viewpoint", "cafe", "food", "culture"] as const;
type CategoryFilter = (typeof categories)[number];

function sortPlaces(places: PlaceSummary[], hiddenOnly: boolean, category: CategoryFilter) {
  return places
    .filter((place) => (category === "all" ? true : place.category === category))
    .filter((place) => (hiddenOnly ? place.scores.hidden_gem >= 75 : true))
    .sort((a, b) => b.scores.hidden_gem + b.scores.popularity - (a.scores.hidden_gem + a.scores.popularity));
}

export default function App() {
  const [query, setQuery] = useState("");
  const [selectedSlug, setSelectedSlug] = useState("himachal");
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | undefined>();
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [hiddenOnly, setHiddenOnly] = useState(false);
  const [savedPlaces, setSavedPlaces] = useState<string[]>([]);

  const { data: destinations = [] } = useQuery({
    queryKey: ["destinations", query],
    queryFn: () => getDestinations(query),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["destination-places", selectedSlug],
    queryFn: () => getDestinationPlaces(selectedSlug),
  });

  const destination = data?.destination ?? destinations.find((item) => item.slug === selectedSlug);
  const filteredPlaces = useMemo(
    () => sortPlaces(data?.places ?? [], hiddenOnly, category),
    [category, data?.places, hiddenOnly],
  );
  const selectedPlace = filteredPlaces.find((place) => place.id === selectedPlaceId);

  function selectDestination(nextDestination: Destination) {
    setSelectedSlug(nextDestination.slug);
    setSelectedPlaceId(undefined);
    setCategory("all");
    setHiddenOnly(false);
  }

  function toggleSaved(placeId: string) {
    setSavedPlaces((current) =>
      current.includes(placeId) ? current.filter((id) => id !== placeId) : [...current, placeId],
    );
  }

  if (!destination) {
    return <main className="app-shell">Loading destination map...</main>;
  }

  return (
    <main className="app-shell">
      <section className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <Compass size={24} />
          </div>
          <div>
            <span>Vlog Map</span>
            <strong>Places from travel vlogs</strong>
          </div>
        </div>

        <div className="search-panel">
          <label htmlFor="destination-search">Destination</label>
          <div className="search-box">
            <Search size={18} />
            <input
              id="destination-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search Himachal, Japan, Bali..."
            />
          </div>
          <div className="destination-list">
            {destinations.map((item) => (
              <button
                className={item.slug === selectedSlug ? "is-active" : ""}
                key={item.id}
                type="button"
                onClick={() => selectDestination(item)}
              >
                <span>{item.name}</span>
                <small>{item.total_places} places · {item.total_videos} videos</small>
              </button>
            ))}
          </div>
        </div>

        <div className="destination-card" style={{ backgroundImage: `linear-gradient(180deg, rgba(7, 12, 18, .18), rgba(7, 12, 18, .76)), url(${destination.hero_image_url})` }}>
          <span>{destination.country}</span>
          <h1>{destination.name}</h1>
          <p>{destination.description}</p>
        </div>

        <div className="metrics-grid">
          <Metric label="vlog places" value={destination.total_places} />
          <Metric label="source videos" value={destination.total_videos} />
          <Metric label="saved" value={savedPlaces.length} />
        </div>

        <div className="filter-card">
          <div className="section-title">
            <Filter size={17} />
            <h2>Signals</h2>
          </div>
          <div className="category-row" aria-label="Filter places by category">
            {categories.map((item) => (
              <button
                className={category === item ? "is-active" : ""}
                type="button"
                key={item}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <label className="toggle-row">
            <input type="checkbox" checked={hiddenOnly} onChange={(event) => setHiddenOnly(event.target.checked)} />
            <span>Show hidden-gem signals only</span>
          </label>
        </div>

        <div className="place-list">
          {isLoading ? (
            <p>Loading creator-backed places...</p>
          ) : (
            filteredPlaces.map((place) => (
              <button
                type="button"
                key={place.id}
                className={`place-row ${selectedPlaceId === place.id ? "is-active" : ""}`}
                onClick={() => setSelectedPlaceId(place.id)}
              >
                <span>
                  <strong>{place.name}</strong>
                  <small>{place.creators.map((creator) => creator.name).join(", ")}</small>
                </span>
                <em>{place.video_count} videos</em>
              </button>
            ))
          )}
        </div>
      </section>

      <section className="map-stage">
        <div className="map-overlay">
          <span className="pill">
            <Video size={16} />
            {filteredPlaces.length} vlog-backed places
          </span>
          {selectedPlace ? (
            <span className={`pill confidence-${selectedPlace.scores.confidence}`}>
              {confidenceLabel(selectedPlace.scores.confidence)}
            </span>
          ) : (
            <span className="pill">
              <Sparkles size={16} />
              Social-proof map
            </span>
          )}
        </div>
        <MapPanel
          destination={destination}
          places={filteredPlaces}
          selectedPlaceId={selectedPlaceId}
          onSelectPlace={setSelectedPlaceId}
        />
      </section>

      <PlaceDrawer
        placeId={selectedPlaceId}
        saved={selectedPlaceId ? savedPlaces.includes(selectedPlaceId) : false}
        onClose={() => setSelectedPlaceId(undefined)}
        onToggleSaved={toggleSaved}
      />
    </main>
  );
}

