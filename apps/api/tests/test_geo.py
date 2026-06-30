from app.core.geo import haversine_distance_meters, is_inside_circle


def test_haversine_zero_distance() -> None:
    assert haversine_distance_meters(17.4474, 78.381, 17.4474, 78.381) == 0.0


def test_is_inside_circle_at_center() -> None:
    assert is_inside_circle(17.4474, 78.381, 17.4474, 78.381, 70)


def test_is_outside_circle_far_point() -> None:
    assert not is_inside_circle(17.44, 78.38, 17.4474, 78.381, 70)
