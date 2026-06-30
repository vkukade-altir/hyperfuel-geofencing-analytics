from app.schemas.responses.api_response import ApiResponse, ErrorDetail, T


def success(message: str, data: T) -> ApiResponse[T]:
    return ApiResponse(success=True, message=message, data=data, error=None)


def error(
    message: str,
    *,
    code: str,
    details: str | None = None,
) -> ApiResponse[None]:
    return ApiResponse(
        success=False,
        message=message,
        data=None,
        error=ErrorDetail(code=code, details=details),
    )
