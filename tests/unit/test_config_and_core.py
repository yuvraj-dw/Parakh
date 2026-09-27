from __future__ import annotations

import logging
import pytest
from app.config import Settings, get_settings
from app.core.exceptions import (
    AppException,
    ResourceNotFoundException,
    UnauthorizedException,
    ForbiddenException,
)
from app.core.logging import configure_logging


def test_settings_load_defaults():
    settings = Settings(DATABASE_URL="postgresql+asyncpg://user:pass@localhost:5432/testdb")
    assert settings.APP_NAME == "BIS Intelligent Assistant"
    assert settings.API_V1_STR == "/api/v1"
    assert settings.DEFAULT_PAGE_SIZE == 20
    assert settings.MAX_PAGE_SIZE == 100


def test_get_settings_cached():
    s1 = get_settings()
    s2 = get_settings()
    assert s1 is s2


def test_resource_not_found_exception():
    exc = ResourceNotFoundException(resource="Laboratory", identifier="LAB-001")
    assert exc.code == "RESOURCE_NOT_FOUND"
    assert "LAB-001" in exc.message
    assert exc.status_code == 404
    assert isinstance(exc, AppException)


def test_unauthorized_and_forbidden_exceptions():
    unauth = UnauthorizedException()
    assert unauth.code == "UNAUTHORIZED"
    assert unauth.status_code == 401
    assert isinstance(unauth, AppException)

    forbid = ForbiddenException()
    assert forbid.code == "FORBIDDEN"
    assert forbid.status_code == 403
    assert isinstance(forbid, AppException)


def test_configure_logging():
    configure_logging(level="DEBUG")
    assert logging.getLogger().level == logging.DEBUG
