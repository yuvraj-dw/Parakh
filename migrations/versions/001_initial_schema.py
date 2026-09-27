"""Initial schema migration for BIS Assistant Backend

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-09-28 00:00:00.000000
"""
from __future__ import annotations

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = "001_initial_schema"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. users
    op.create_table(
        "users",
        sa.Column("id", sa.String(length=36), primary_key=True, nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column(
            "role",
            sa.Enum("user", "admin", name="userrole"),
            server_default="user",
            nullable=False,
        ),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)

    # 2. standards
    op.create_table(
        "standards",
        sa.Column("id", sa.String(length=36), primary_key=True, nullable=False),
        sa.Column("is_number", sa.String(length=50), nullable=False),
        sa.Column("title", sa.String(length=500), nullable=False),
        sa.Column("year", sa.Integer(), nullable=True),
        sa.Column(
            "status",
            sa.Enum("ACTIVE", "WITHDRAWN", "SUPERSEDED", "UNDER_REVIEW", name="standardstatus"),
            server_default="ACTIVE",
            nullable=False,
        ),
        sa.Column("scope", sa.Text(), nullable=True),
        sa.Column("source_name", sa.String(length=100), server_default="MANUAL", nullable=False),
        sa.Column("source_url", sa.String(length=500), nullable=True),
        sa.Column("source_type", sa.String(length=50), server_default="PUBLIC_RECORD", nullable=False),
        sa.Column("source_identifier", sa.String(length=100), nullable=True),
        sa.Column("retrieved_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("last_verified_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index(op.f("ix_standards_is_number"), "standards", ["is_number"], unique=True)

    # 3. standard_versions
    op.create_table(
        "standard_versions",
        sa.Column("id", sa.String(length=36), primary_key=True, nullable=False),
        sa.Column("standard_id", sa.String(length=36), sa.ForeignKey("standards.id", ondelete="CASCADE"), nullable=False),
        sa.Column("version_number", sa.String(length=50), nullable=False),
        sa.Column("revision_year", sa.Integer(), nullable=True),
        sa.Column("amendment_number", sa.String(length=50), nullable=True),
        sa.Column("status", sa.String(length=50), server_default="ACTIVE", nullable=False),
        sa.Column("publication_date", sa.String(length=20), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )

    # 4. standard_relationships
    op.create_table(
        "standard_relationships",
        sa.Column("id", sa.String(length=36), primary_key=True, nullable=False),
        sa.Column("source_standard_id", sa.String(length=36), sa.ForeignKey("standards.id", ondelete="CASCADE"), nullable=False),
        sa.Column("target_standard_id", sa.String(length=36), sa.ForeignKey("standards.id", ondelete="CASCADE"), nullable=False),
        sa.Column(
            "relationship_type",
            sa.Enum("SUPERSEDES", "AMENDS", "REFERENCES", "EQUIVALENT_TO", name="standardrelationshiptype"),
            nullable=False,
        ),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )

    # 5. qcos
    op.create_table(
        "qcos",
        sa.Column("id", sa.String(length=36), primary_key=True, nullable=False),
        sa.Column("qco_number", sa.String(length=100), nullable=True),
        sa.Column("title", sa.String(length=500), nullable=False),
        sa.Column("product_name", sa.String(length=255), nullable=False),
        sa.Column("is_number", sa.String(length=50), nullable=False),
        sa.Column("ministry", sa.String(length=255), nullable=False),
        sa.Column("notification_number", sa.String(length=100), nullable=True),
        sa.Column("notification_date", sa.Date(), nullable=True),
        sa.Column("effective_date", sa.Date(), nullable=True),
        sa.Column(
            "status",
            sa.Enum("UPCOMING", "ACTIVE", "EXPIRED", "SUPERSEDED", "UNKNOWN", name="qcostatus"),
            server_default="UNKNOWN",
            nullable=False,
        ),
        sa.Column("is_superseded", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("is_withdrawn", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("source_name", sa.String(length=100), server_default="MANUAL", nullable=False),
        sa.Column("source_url", sa.String(length=500), nullable=True),
        sa.Column("source_type", sa.String(length=50), server_default="PUBLIC_RECORD", nullable=False),
        sa.Column("source_identifier", sa.String(length=100), nullable=True),
        sa.Column("retrieved_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("last_verified_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index(op.f("ix_qcos_is_number"), "qcos", ["is_number"], unique=False)
    op.create_index(op.f("ix_qcos_product_name"), "qcos", ["product_name"], unique=False)

    # 6. certification_schemes
    op.create_table(
        "certification_schemes",
        sa.Column("id", sa.String(length=36), primary_key=True, nullable=False),
        sa.Column("scheme_code", sa.String(length=50), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("application_procedure", sa.Text(), nullable=True),
        sa.Column("source_name", sa.String(length=100), server_default="MANUAL", nullable=False),
        sa.Column("source_url", sa.String(length=500), nullable=True),
        sa.Column("source_type", sa.String(length=50), server_default="PUBLIC_RECORD", nullable=False),
        sa.Column("source_identifier", sa.String(length=100), nullable=True),
        sa.Column("retrieved_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("last_verified_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index(op.f("ix_certification_schemes_scheme_code"), "certification_schemes", ["scheme_code"], unique=True)

    # 7. products
    op.create_table(
        "products",
        sa.Column("id", sa.String(length=36), primary_key=True, nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("category", sa.String(length=100), nullable=True),
        sa.Column("industry", sa.String(length=100), nullable=True),
        sa.Column("hs_code", sa.String(length=50), nullable=True),
        sa.Column("source_name", sa.String(length=100), server_default="MANUAL", nullable=False),
        sa.Column("source_url", sa.String(length=500), nullable=True),
        sa.Column("source_type", sa.String(length=50), server_default="PUBLIC_RECORD", nullable=False),
        sa.Column("source_identifier", sa.String(length=100), nullable=True),
        sa.Column("retrieved_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("last_verified_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index(op.f("ix_products_name"), "products", ["name"], unique=True)

    # 8. product_standard_mappings
    op.create_table(
        "product_standard_mappings",
        sa.Column("id", sa.String(length=36), primary_key=True, nullable=False),
        sa.Column("product_id", sa.String(length=36), sa.ForeignKey("products.id", ondelete="CASCADE"), nullable=False),
        sa.Column("standard_id", sa.String(length=36), sa.ForeignKey("standards.id", ondelete="CASCADE"), nullable=False),
        sa.Column("qco_id", sa.String(length=36), sa.ForeignKey("qcos.id", ondelete="SET NULL"), nullable=True),
        sa.Column("is_mandatory", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )

    # 9. laboratories
    op.create_table(
        "laboratories",
        sa.Column("id", sa.String(length=36), primary_key=True, nullable=False),
        sa.Column("recognition_code", sa.String(length=100), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("address", sa.Text(), nullable=True),
        sa.Column("city", sa.String(length=100), nullable=False),
        sa.Column("district", sa.String(length=100), nullable=True),
        sa.Column("state", sa.String(length=100), nullable=False),
        sa.Column("pincode", sa.String(length=20), nullable=True),
        sa.Column("contact_details", sa.JSON(), nullable=True),
        sa.Column(
            "status",
            sa.Enum("RECOGNIZED", "SUSPENDED", "EXPIRED", name="labstatus"),
            server_default="RECOGNIZED",
            nullable=False,
        ),
        sa.Column("valid_from", sa.Date(), nullable=True),
        sa.Column("valid_until", sa.Date(), nullable=True),
        sa.Column("source_name", sa.String(length=100), server_default="MANUAL", nullable=False),
        sa.Column("source_url", sa.String(length=500), nullable=True),
        sa.Column("source_type", sa.String(length=50), server_default="PUBLIC_RECORD", nullable=False),
        sa.Column("source_identifier", sa.String(length=100), nullable=True),
        sa.Column("retrieved_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("last_verified_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index(op.f("ix_laboratories_recognition_code"), "laboratories", ["recognition_code"], unique=True)
    op.create_index(op.f("ix_laboratories_city"), "laboratories", ["city"], unique=False)
    op.create_index(op.f("ix_laboratories_district"), "laboratories", ["district"], unique=False)
    op.create_index(op.f("ix_laboratories_state"), "laboratories", ["state"], unique=False)

    # 10. laboratory_scopes
    op.create_table(
        "laboratory_scopes",
        sa.Column("id", sa.String(length=36), primary_key=True, nullable=False),
        sa.Column("laboratory_id", sa.String(length=36), sa.ForeignKey("laboratories.id", ondelete="CASCADE"), nullable=False),
        sa.Column("is_number", sa.String(length=50), nullable=False),
        sa.Column("product_name", sa.String(length=255), nullable=True),
        sa.Column("test_name", sa.String(length=255), nullable=True),
        sa.Column("parameter", sa.String(length=255), nullable=True),
        sa.Column("capability_details", sa.Text(), nullable=True),
        sa.Column("limit_of_detection", sa.String(length=100), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index(op.f("ix_laboratory_scopes_is_number"), "laboratory_scopes", ["is_number"], unique=False)

    # 11. ahc_centres
    op.create_table(
        "ahc_centres",
        sa.Column("id", sa.String(length=36), primary_key=True, nullable=False),
        sa.Column("recognition_number", sa.String(length=100), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("address", sa.Text(), nullable=True),
        sa.Column("city", sa.String(length=100), nullable=False),
        sa.Column("district", sa.String(length=100), nullable=True),
        sa.Column("state", sa.String(length=100), nullable=False),
        sa.Column("pincode", sa.String(length=20), nullable=True),
        sa.Column(
            "status",
            sa.Enum("ACTIVE", "SUSPENDED", "SURRENDERED", name="centrestatus"),
            server_default="ACTIVE",
            nullable=False,
        ),
        sa.Column("valid_from", sa.Date(), nullable=True),
        sa.Column("valid_until", sa.Date(), nullable=True),
        sa.Column("metal_capabilities", sa.JSON(), nullable=True),
        sa.Column("source_name", sa.String(length=100), server_default="MANUAL", nullable=False),
        sa.Column("source_url", sa.String(length=500), nullable=True),
        sa.Column("source_type", sa.String(length=50), server_default="PUBLIC_RECORD", nullable=False),
        sa.Column("source_identifier", sa.String(length=100), nullable=True),
        sa.Column("retrieved_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("last_verified_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index(op.f("ix_ahc_centres_recognition_number"), "ahc_centres", ["recognition_number"], unique=True)
    op.create_index(op.f("ix_ahc_centres_city"), "ahc_centres", ["city"], unique=False)
    op.create_index(op.f("ix_ahc_centres_district"), "ahc_centres", ["district"], unique=False)
    op.create_index(op.f("ix_ahc_centres_state"), "ahc_centres", ["state"], unique=False)

    # 12. jewellers
    op.create_table(
        "jewellers",
        sa.Column("id", sa.String(length=36), primary_key=True, nullable=False),
        sa.Column("registration_number", sa.String(length=100), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("address", sa.Text(), nullable=True),
        sa.Column("city", sa.String(length=100), nullable=False),
        sa.Column("district", sa.String(length=100), nullable=True),
        sa.Column("state", sa.String(length=100), nullable=False),
        sa.Column("pincode", sa.String(length=20), nullable=True),
        sa.Column("metal_category", sa.String(length=100), nullable=True),
        sa.Column(
            "status",
            sa.Enum("VALID", "CANCELLED", "EXPIRED", name="jewellerstatus"),
            server_default="VALID",
            nullable=False,
        ),
        sa.Column("valid_from", sa.Date(), nullable=True),
        sa.Column("valid_until", sa.Date(), nullable=True),
        sa.Column("source_name", sa.String(length=100), server_default="MANUAL", nullable=False),
        sa.Column("source_url", sa.String(length=500), nullable=True),
        sa.Column("source_type", sa.String(length=50), server_default="PUBLIC_RECORD", nullable=False),
        sa.Column("source_identifier", sa.String(length=100), nullable=True),
        sa.Column("retrieved_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("last_verified_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index(op.f("ix_jewellers_registration_number"), "jewellers", ["registration_number"], unique=True)
    op.create_index(op.f("ix_jewellers_city"), "jewellers", ["city"], unique=False)
    op.create_index(op.f("ix_jewellers_district"), "jewellers", ["district"], unique=False)
    op.create_index(op.f("ix_jewellers_state"), "jewellers", ["state"], unique=False)

    # 13. verification_requests
    op.create_table(
        "verification_requests",
        sa.Column("id", sa.String(length=36), primary_key=True, nullable=False),
        sa.Column(
            "request_type",
            sa.Enum("HUID", "LICENCE", "CRS_R_NUMBER", name="verificationtype"),
            nullable=False,
        ),
        sa.Column("identifier", sa.String(length=100), nullable=False),
        sa.Column("user_id", sa.String(length=36), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column(
            "status",
            sa.Enum("UNKNOWN", "PENDING", "VERIFIED", "NOT_VERIFIED", "NOT_FOUND", "EXPIRED", "ERROR", name="verificationstatus"),
            server_default="PENDING",
            nullable=False,
        ),
        sa.Column("provider_name", sa.String(length=100), server_default="MOCK", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index(op.f("ix_verification_requests_identifier"), "verification_requests", ["identifier"], unique=False)

    # 14. verification_results
    op.create_table(
        "verification_results",
        sa.Column("id", sa.String(length=36), primary_key=True, nullable=False),
        sa.Column("request_id", sa.String(length=36), sa.ForeignKey("verification_requests.id", ondelete="CASCADE"), nullable=False, unique=True),
        sa.Column("raw_response", sa.JSON(), nullable=True),
        sa.Column("normalized_data", sa.JSON(), nullable=True),
        sa.Column("verified_at", sa.String(length=50), nullable=True),
        sa.Column("source_url", sa.String(length=500), nullable=True),
        sa.Column("notes", sa.String(length=500), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )

    # 15. sync_runs
    op.create_table(
        "sync_runs",
        sa.Column("id", sa.String(length=36), primary_key=True, nullable=False),
        sa.Column("dataset", sa.String(length=100), nullable=False),
        sa.Column(
            "status",
            sa.Enum("RUNNING", "SUCCESS", "PARTIAL", "FAILED", name="syncstatus"),
            server_default="RUNNING",
            nullable=False,
        ),
        sa.Column("records_seen", sa.Integer(), server_default="0", nullable=False),
        sa.Column("records_created", sa.Integer(), server_default="0", nullable=False),
        sa.Column("records_updated", sa.Integer(), server_default="0", nullable=False),
        sa.Column("records_deactivated", sa.Integer(), server_default="0", nullable=False),
        sa.Column("source", sa.String(length=100), server_default="MOCK_FEED", nullable=False),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index(op.f("ix_sync_runs_dataset"), "sync_runs", ["dataset"], unique=False)

    # 16. sync_errors
    op.create_table(
        "sync_errors",
        sa.Column("id", sa.String(length=36), primary_key=True, nullable=False),
        sa.Column("sync_run_id", sa.String(length=36), sa.ForeignKey("sync_runs.id", ondelete="CASCADE"), nullable=False),
        sa.Column("item_identifier", sa.String(length=100), nullable=True),
        sa.Column("error_type", sa.String(length=100), nullable=False),
        sa.Column("message", sa.String(length=500), nullable=False),
        sa.Column("raw_payload", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )

    # 17. conversations
    op.create_table(
        "conversations",
        sa.Column("id", sa.String(length=36), primary_key=True, nullable=False),
        sa.Column("user_id", sa.String(length=36), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("title", sa.String(length=255), server_default="New Conversation", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )

    # 18. messages
    op.create_table(
        "messages",
        sa.Column("id", sa.String(length=36), primary_key=True, nullable=False),
        sa.Column("conversation_id", sa.String(length=36), sa.ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False),
        sa.Column("role", sa.String(length=20), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("citations", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )


def downgrade() -> None:
    # Drop in reverse order
    op.drop_table("messages")
    op.drop_table("conversations")
    op.drop_table("sync_errors")
    op.drop_table("sync_runs")
    op.drop_table("verification_results")
    op.drop_table("verification_requests")
    op.drop_table("jewellers")
    op.drop_table("ahc_centres")
    op.drop_table("laboratory_scopes")
    op.drop_table("laboratories")
    op.drop_table("product_standard_mappings")
    op.drop_table("products")
    op.drop_table("certification_schemes")
    op.drop_table("qcos")
    op.drop_table("standard_relationships")
    op.drop_table("standard_versions")
    op.drop_table("standards")
    op.drop_table("users")

    # Drop enum types if supported
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        sa.Enum(name="syncstatus").drop(bind, checkfirst=True)
        sa.Enum(name="verificationstatus").drop(bind, checkfirst=True)
        sa.Enum(name="verificationtype").drop(bind, checkfirst=True)
        sa.Enum(name="jewellerstatus").drop(bind, checkfirst=True)
        sa.Enum(name="centrestatus").drop(bind, checkfirst=True)
        sa.Enum(name="labstatus").drop(bind, checkfirst=True)
        sa.Enum(name="qcostatus").drop(bind, checkfirst=True)
        sa.Enum(name="standardrelationshiptype").drop(bind, checkfirst=True)
        sa.Enum(name="standardstatus").drop(bind, checkfirst=True)
        sa.Enum(name="userrole").drop(bind, checkfirst=True)
