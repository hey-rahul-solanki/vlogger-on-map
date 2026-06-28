from app.models import (
    Creator,
    CreatorDetail,
    Destination,
    DestinationPlaces,
    Place,
    PlaceDetail,
    PlaceMention,
    PlaceSummary,
    Video,
)
from app.seed_data import CREATORS, DESTINATIONS, MENTIONS, PLACES, VIDEOS


class TravelRepository:
    def __init__(self) -> None:
        self.destinations = [Destination(**destination) for destination in DESTINATIONS]
        self.creators = [Creator(**creator) for creator in CREATORS]
        self.videos = [Video(**video) for video in VIDEOS]
        self.places = [Place(**place) for place in PLACES]
        self.mentions = [PlaceMention(**mention) for mention in MENTIONS]

    def list_destinations(self) -> list[Destination]:
        return [self._with_destination_counts(destination) for destination in self.destinations]

    def get_destination(self, slug: str) -> Destination | None:
        destination = next((item for item in self.destinations if item.slug == slug), None)
        return self._with_destination_counts(destination) if destination else None

    def get_destination_places(self, slug: str) -> DestinationPlaces | None:
        destination = self.get_destination(slug)
        if not destination:
            return None

        places = [self._place_summary(place) for place in self.places if place.destination_slug == slug]
        return DestinationPlaces(destination=destination, places=places)

    def get_place(self, place_id: str) -> PlaceDetail | None:
        place = next((item for item in self.places if item.id == place_id), None)
        return self._place_detail(place) if place else None

    def list_creators(self) -> list[Creator]:
        return self.creators

    def get_creator(self, creator_id: str) -> CreatorDetail | None:
        creator = next((item for item in self.creators if item.id == creator_id), None)
        if not creator:
            return None

        videos = [video for video in self.videos if video.creator_id == creator_id]
        place_ids = {mention.place_id for mention in self.mentions if mention.creator_id == creator_id}
        destination_slugs = {
            place.destination_slug for place in self.places if place.id in place_ids
        }
        destinations = [
            destination for destination in self.list_destinations() if destination.slug in destination_slugs
        ]

        return CreatorDetail(**creator.model_dump(), destinations=destinations, videos=videos)

    def search_destinations(self, query: str) -> list[Destination]:
        normalized = query.strip().lower()
        if not normalized:
            return self.list_destinations()

        return [
            destination
            for destination in self.list_destinations()
            if normalized in destination.name.lower()
            or normalized in destination.country.lower()
            or normalized in destination.description.lower()
        ]

    def _with_destination_counts(self, destination: Destination) -> Destination:
        place_ids = [place.id for place in self.places if place.destination_slug == destination.slug]
        video_ids = {
            mention.video_id for mention in self.mentions if mention.place_id in place_ids
        }
        return destination.model_copy(update={"total_places": len(place_ids), "total_videos": len(video_ids)})

    def _place_summary(self, place: Place) -> PlaceSummary:
        creator_ids = {mention.creator_id for mention in self.mentions if mention.place_id == place.id}
        creators = [creator for creator in self.creators if creator.id in creator_ids]
        return PlaceSummary(**place.model_dump(), creators=creators)

    def _place_detail(self, place: Place) -> PlaceDetail:
        mentions = [mention for mention in self.mentions if mention.place_id == place.id]
        video_ids = {mention.video_id for mention in mentions}
        videos = [video for video in self.videos if video.id in video_ids]
        creators = [creator for creator in self.creators if creator.id in {m.creator_id for m in mentions}]
        return PlaceDetail(**place.model_dump(), creators=creators, mentions=mentions, videos=videos)


repository = TravelRepository()

