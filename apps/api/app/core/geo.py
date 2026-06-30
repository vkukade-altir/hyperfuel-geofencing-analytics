"""Haversine distance helpers — Section 6.2 of the platform spec."""

import math

_EARTH_RADIUS_M = 6371000.0


def haversine_distance_meters(
    lat1: float,
    lon1: float,
    lat2: float,
    lon2: float,
) -> float:
    """Great-circle distance between two WGS84 points in meters."""
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lon2 - lon1)
    a = (
        math.sin(d_phi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return _EARTH_RADIUS_M * c


def is_inside_circle(
    ping_lat: float,
    ping_lon: float,
    center_lat: float,
    center_lon: float,
    radius_m: float,
) -> bool:
    """Point-in-circle test for v1 circle geometry (Section 6.2)."""
    return haversine_distance_meters(ping_lat, ping_lon, center_lat, center_lon) <= radius_m
