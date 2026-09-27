from __future__ import annotations

from typing import Any, Optional


class AppException(Exception):
    def __init__(
        self,
        code: str,
        message: str,
        status_code: int = 400,
        details: Optional[Any] = None,
    ) -> None:
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details
        super().__init__(message)


class ResourceNotFoundException(AppException):
    def __init__(self, resource: str, identifier: Any) -> None:
        super().__init__(
            code="RESOURCE_NOT_FOUND",
            message=f"{resource} with identifier '{identifier}' was not found",
            status_code=404,
        )


class UnauthorizedException(AppException):
    def __init__(
        self,
        message: str = "Authentication credentials were not provided or are invalid",
    ) -> None:
        super().__init__(code="UNAUTHORIZED", message=message, status_code=401)


class ForbiddenException(AppException):
    def __init__(
        self,
        message: str = "You do not have permission to perform this action",
    ) -> None:
        super().__init__(code="FORBIDDEN", message=message, status_code=403)
