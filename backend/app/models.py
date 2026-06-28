from enum import StrEnum
from typing import Literal

from pydantic import BaseModel, Field, HttpUrl


class Confidence(StrEnum):
    confirmed = "confirmed"
    likely = "likely"
    needs_review = "needs_review"


class Destination(BaseModel):
    id: str
    slug: str
    name: str
    country: str
    description: str
    center: tuple[float, float]
    zoom: float
    hero_image_url: HttpUrl
    total_places: int = 0
    total_videos: int = 0


class Creator(BaseModel):
    id: str
    name: str
    handle: str
    channel_url: HttpUrl
    avatar_url: HttpUrl
    home_base: str
    specialty: str


class Video(BaseModel):
    id: str
    creator_id: str
    youtube_id: str
    title: str
    published_at: str
    thumbnail_url: HttpUrl
    url: HttpUrl
    duration: str


class PlaceMention(BaseModel):
    id: str
    place_id: str
    video_id: str
    creator_id: str
    evidence: str
    source_type: Literal["title", "description", "transcript", "curated"]
    sentiment: Literal["loved", "recommended", "visited", "mixed"]
    confidence: Confidence


class PlaceScore(BaseModel):
    popularity: int = Field(ge=0, le=100)
    hidden_gem: int = Field(ge=0, le=100)
    creator_coverage: int = Field(ge=0, le=100)
    confidence: Confidence


class Place(BaseModel):
    id: str
    destination_slug: str
    name: str
    category: Literal["cafe", "viewpoint", "nature", "culture", "food", "stay", "neighborhood"]
    latitude: float
    longitude: float
    summary: str
    why_go: str
    visit_hint: str
    scores: PlaceScore
    mention_count: int
    creator_count: int
    video_count: int
    tags: list[str]


class PlaceSummary(Place):
    creators: list[Creator]


class PlaceDetail(PlaceSummary):
    mentions: list[PlaceMention]
    videos: list[Video]


class DestinationPlaces(BaseModel):
    destination: Destination
    places: list[PlaceSummary]


class CreatorDetail(Creator):
    destinations: list[Destination]
    videos: list[Video]


class IngestRequest(BaseModel):
    destination_slug: str
    source_urls: list[HttpUrl]
    note: str | None = None


class IngestResponse(BaseModel):
    status: Literal["queued"]
    message: str
    accepted_sources: int

