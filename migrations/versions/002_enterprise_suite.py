"""Enterprise compliance suite migration (laboratories coordinates, grievances, knowledge_gaps)

Revision ID: 002_enterprise_suite
Revises: 001_initial_schema
Create Date: 2026-09-29 00:00:00.000000
"""
from __future__ import annotations

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = "002_enterprise_suite"
down_revision: Union[str, None] = "001_initial_schema"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Add coordinates to laboratories
    op.add_column("laboratories", sa.Column("latitude", sa.Float(), nullable=True))
    op.add_column("laboratories", sa.Column("longitude", sa.Float(), nullable=True))

    # 2. grievances table
    op.create_table(
        "grievances",
        sa.Column("id", sa.String(length=36), primary_key=True, nullable=False),
        sa.Column("tracking_code", sa.String(length=32), nullable=False),
        sa.Column("incident_type", sa.String(length=50), nullable=False),
        sa.Column("suspect_entity", sa.String(length=255), nullable=False),
        sa.Column("location", sa.String(length=255), nullable=False),
        sa.Column("evidence_text", sa.Text(), nullable=False),
        sa.Column("image_url", sa.String(length=500), nullable=True),
        sa.Column("status", sa.String(length=20), server_default="LOGGED", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index(op.f("ix_grievances_tracking_code"), "grievances", ["tracking_code"], unique=True)

    # 3. knowledge_gaps table
    op.create_table(
        "knowledge_gaps",
        sa.Column("id", sa.String(length=36), primary_key=True, nullable=False),
        sa.Column("query_text", sa.String(length=500), nullable=False),
        sa.Column("retrieval_score", sa.Float(), server_default="0.0", nullable=False),
        sa.Column("category", sa.String(length=100), server_default="UNMATCHED_QUERY", nullable=False),
        sa.Column("frequency", sa.Integer(), server_default="1", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index(op.f("ix_knowledge_gaps_query_text"), "knowledge_gaps", ["query_text"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_knowledge_gaps_query_text"), table_name="knowledge_gaps")
    op.drop_table("knowledge_gaps")

    op.drop_index(op.f("ix_grievances_tracking_code"), table_name="grievances")
    op.drop_table("grievances")

    op.drop_column("laboratories", "longitude")
    op.drop_column("laboratories", "latitude")
