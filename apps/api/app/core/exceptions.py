class AppException(Exception):
    def __init__(
        self,
        *,
        code: str,
        message: str,
        status_code: int,
        details: str | None = None,
    ) -> None:
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details
        super().__init__(message)


class ValidationAppError(AppException):
    def __init__(self, message: str, *, details: str | None = None) -> None:
        super().__init__(
            code="VALIDATION_ERROR",
            message=message,
            status_code=400,
            details=details,
        )


class StorageUnavailableError(AppException):
    """Supabase unreachable after retries — client should show a friendly message."""

    def __init__(self, message: str, *, details: str | None = None) -> None:
        super().__init__(
            code="STORAGE_UNAVAILABLE",
            message=message,
            status_code=503,
            details=details,
        )
