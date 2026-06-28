export type Confidence = "confirmed" | "likely" | "needs_review";

export type Destination = {
  id: string;
  slug: string;
  name: string;
  country: string;
  description: string;
  center: [number, number];
  zoom: number;
  hero_image_url: string;
  total_places: number;
  total_videos: number;
};

export type Creator = {
  id: string;
  name: string;
  handle: string;
  channel_url: string;
  avatar_url: string;
  home_base: string;
  specialty: string;
};

export type Video = {
  id: string;
  creator_id: string;
  youtube_id: string;
  title: string;
  published_at: string;
  thumbnail_url: string;
  url: string;
  duration: string;
};

export type PlaceScore = {
  popularity: number;
  hidden_gem: number;
  creator_coverage: number;
  confidence: Confidence;
};

export type PlaceSummary = {
  id: string;
  destination_slug: string;
  name: string;
  category: "cafe" | "viewpoint" | "nature" | "culture" | "food" | "stay" | "neighborhood";
  latitude: number;
  longitude: number;
  summary: string;
  why_go: string;
  visit_hint: string;
  scores: PlaceScore;
  mention_count: number;
  creator_count: number;
  video_count: number;
  tags: string[];
  creators: Creator[];
};

export type PlaceMention = {
  id: string;
  place_id: string;
  video_id: string;
  creator_id: string;
  evidence: string;
  source_type: "title" | "description" | "transcript" | "curated";
  sentiment: "loved" | "recommended" | "visited" | "mixed";
  confidence: Confidence;
};

export type PlaceDetail = PlaceSummary & {
  mentions: PlaceMention[];
  videos: Video[];
};

export type DestinationPlaces = {
  destination: Destination;
  places: PlaceSummary[];
};

