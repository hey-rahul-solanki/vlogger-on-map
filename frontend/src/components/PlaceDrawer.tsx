import { Bookmark, ExternalLink, MapPin, ShieldCheck, Sparkles, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getPlace } from "../lib/api";
import { confidenceLabel, scoreLabel } from "../lib/format";

type PlaceDrawerProps = {
  placeId?: string;
  saved: boolean;
  onClose: () => void;
  onToggleSaved: (placeId: string) => void;
};

export function PlaceDrawer({ placeId, saved, onClose, onToggleSaved }: PlaceDrawerProps) {
  const { data: place, isLoading } = useQuery({
    queryKey: ["place", placeId],
    queryFn: () => getPlace(placeId ?? ""),
    enabled: Boolean(placeId),
  });

  if (!placeId) {
    return (
      <aside className="place-drawer is-empty">
        <Sparkles size={22} />
        <h2>Pick a pin to see why creators stopped there.</h2>
        <p>Every place on this map is backed by vlog evidence, creator mentions, and a visible confidence label.</p>
      </aside>
    );
  }

  if (isLoading || !place) {
    return (
      <aside className="place-drawer">
        <button className="icon-button drawer-close" type="button" onClick={onClose} aria-label="Close place details">
          <X size={18} />
        </button>
        <p>Loading place evidence...</p>
      </aside>
    );
  }

  return (
    <aside className="place-drawer">
      <button className="icon-button drawer-close" type="button" onClick={onClose} aria-label="Close place details">
        <X size={18} />
      </button>

      <div className="drawer-kicker">
        <MapPin size={16} />
        <span>{place.category}</span>
      </div>
      <h2>{place.name}</h2>
      <p className="drawer-summary">{place.summary}</p>

      <div className="confidence-row">
        <span className={`confidence confidence-${place.scores.confidence}`}>
          <ShieldCheck size={15} />
          {confidenceLabel(place.scores.confidence)}
        </span>
        <span>{scoreLabel(place.scores.hidden_gem)} hidden-gem signal</span>
      </div>

      <button className={`save-button ${saved ? "is-saved" : ""}`} type="button" onClick={() => onToggleSaved(place.id)}>
        <Bookmark size={18} />
        {saved ? "Saved for later" : "Save place"}
      </button>

      <section>
        <h3>Why it shows up</h3>
        <p>{place.why_go}</p>
        <p className="visit-hint">{place.visit_hint}</p>
      </section>

      <section>
        <h3>Creator evidence</h3>
        <div className="mentions">
          {place.mentions.map((mention) => (
            <article className="mention" key={mention.id}>
              <strong>{mention.sentiment}</strong>
              <p>{mention.evidence}</p>
              <span>{confidenceLabel(mention.confidence)} from {mention.source_type}</span>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h3>Videos</h3>
        <div className="video-list">
          {place.videos.map((video) => (
            <a className="video-card" href={video.url} target="_blank" rel="noreferrer" key={video.id}>
              <img src={video.thumbnail_url} alt="" />
              <span>
                <strong>{video.title}</strong>
                <small>{video.duration}</small>
              </span>
              <ExternalLink size={16} />
            </a>
          ))}
        </div>
      </section>
    </aside>
  );
}

