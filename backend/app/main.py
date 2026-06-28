import os
from typing import Annotated

from fastapi import Depends, FastAPI, Header, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware

from app.models import Creator, CreatorDetail, Destination, DestinationPlaces, IngestRequest, IngestResponse, PlaceDetail
from app.repository import repository


def build_app() -> FastAPI:
    app = FastAPI(
        title="Vlog-Powered Travel Discovery Map API",
        description="Destination-first API for places real travel creators filmed and recommended.",
        version="0.1.0",
    )

    allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[origin.strip() for origin in allowed_origins],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    @app.get("/destinations", response_model=list[Destination])
    def list_destinations(q: Annotated[str | None, Query()] = None) -> list[Destination]:
        if q:
            return repository.search_destinations(q)
        return repository.list_destinations()

    @app.get("/destinations/{slug}/places", response_model=DestinationPlaces)
    def get_destination_places(slug: str) -> DestinationPlaces:
        result = repository.get_destination_places(slug)
        if not result:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Destination not found")
        return result

    @app.get("/places/{place_id}", response_model=PlaceDetail)
    def get_place(place_id: str) -> PlaceDetail:
        place = repository.get_place(place_id)
        if not place:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Place not found")
        return place

    @app.get("/creators", response_model=list[Creator])
    def list_creators() -> list[Creator]:
        return repository.list_creators()

    @app.get("/creators/{creator_id}", response_model=CreatorDetail)
    def get_creator(creator_id: str) -> CreatorDetail:
        creator = repository.get_creator(creator_id)
        if not creator:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Creator not found")
        return creator

    def require_admin_token(x_admin_token: Annotated[str | None, Header()] = None) -> None:
        expected = os.getenv("ADMIN_INGEST_TOKEN", "dev-admin-token")
        if x_admin_token != expected:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid admin token")

    @app.post("/admin/ingest", response_model=IngestResponse, dependencies=[Depends(require_admin_token)])
    def queue_ingest(request: IngestRequest) -> IngestResponse:
        destination = repository.get_destination(request.destination_slug)
        if not destination:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Destination not found")

        return IngestResponse(
            status="queued",
            message=(
                "Ingestion accepted. Wire this boundary to YouTube metadata, Gemini extraction, "
                "geocoding, and Supabase persistence when API keys are available."
            ),
            accepted_sources=len(request.source_urls),
        )

    return app


app = build_app()

