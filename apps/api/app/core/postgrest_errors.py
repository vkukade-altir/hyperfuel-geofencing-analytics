"""PostgREST / Postgres error helpers."""

from postgrest.exceptions import APIError

UNIQUE_VIOLATION_CODE = "23505"


def is_unique_violation(exc: APIError) -> bool:
    """True when insert conflicted with a unique constraint (idempotent duplicate)."""
    return exc.code == UNIQUE_VIOLATION_CODE
