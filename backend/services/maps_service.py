from __future__ import annotations

from math import asin, cos, radians, sin, sqrt
from typing import Any

import requests
from django.conf import settings

PLACES_URL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
DETAILS_URL = "https://maps.googleapis.com/maps/api/place/details/json"


def _haversine_distance_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    earth_radius_km = 6371.0
    d_lat = radians(lat2 - lat1)
    d_lng = radians(lng2 - lng1)
    origin_lat = radians(lat1)
    destination_lat = radians(lat2)

    haversine = sin(d_lat / 2) ** 2 + cos(origin_lat) * cos(destination_lat) * sin(d_lng / 2) ** 2
    return 2 * earth_radius_km * asin(sqrt(haversine))



def _raise_for_google_places_error(payload: dict[str, Any]) -> None:
    status = payload.get("status", "")
    if status in {"OK", "ZERO_RESULTS"}:
        return
    error_message = payload.get("error_message") or f"Google Places returned status {status or 'UNKNOWN_ERROR'}"
    raise ValueError(error_message)



def get_nearby_hospitals(latitude: float, longitude: float, radius_meters: int = 5000, limit: int = 5) -> list[dict[str, Any]]:
    if not settings.GOOGLE_MAPS_API_KEY:
        raise ValueError("GOOGLE_MAPS_API_KEY is not configured in backend/.env")

    params = {
        "key": settings.GOOGLE_MAPS_API_KEY,
        "location": f"{latitude},{longitude}",
        "radius": max(1000, min(radius_meters, 50000)),
        "keyword": "hospital",
        "type": "hospital",
    }

    response = requests.get(PLACES_URL, params=params, timeout=15)
    response.raise_for_status()
    payload = response.json()
    _raise_for_google_places_error(payload)

    hospitals: list[dict[str, Any]] = []
    for item in payload.get("results", [])[: max(limit, 5)]:
        geometry = item.get("geometry", {}).get("location", {})
        lat = geometry.get("lat")
        lng = geometry.get("lng")
        if lat is None or lng is None:
            continue

        distance_km = _haversine_distance_km(latitude, longitude, float(lat), float(lng))
        hospitals.append(
            {
                "name": item.get("name", "Unknown hospital"),
                "address": item.get("vicinity") or item.get("formatted_address") or "Address unavailable",
                "distance_km": round(distance_km, 2),
                "rating": item.get("rating"),
                "place_id": item.get("place_id"),
                "location": {"lat": lat, "lng": lng},
            }
        )

    return hospitals[: max(limit, 5)]



def get_place_details(place_id: str) -> dict[str, Any]:
    if not settings.GOOGLE_MAPS_API_KEY or not place_id:
        return {}

    params = {
        "key": settings.GOOGLE_MAPS_API_KEY,
        "place_id": place_id,
        "fields": "name,formatted_address,formatted_phone_number,website,opening_hours,geometry,rating",
    }
    response = requests.get(DETAILS_URL, params=params, timeout=15)
    response.raise_for_status()
    payload = response.json()
    _raise_for_google_places_error(payload)
    return payload.get("result", {})
