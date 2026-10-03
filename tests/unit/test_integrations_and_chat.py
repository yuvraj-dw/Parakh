from __future__ import annotations

import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

import app.models as models
from app.integrations.llm.base import BaseLLMProvider, Citation, LLMResult
from app.integrations.llm.mock_provider import MockLLMProvider
from app.integrations.rag.base import BaseRAGProvider, RAGChunk
from app.integrations.rag.mock_provider import MockRAGProvider
from app.integrations.vision.base import (
    AssayReportData,
    BaseVisionProvider,
    JewelleryScanDetection,
)
from app.integrations.vision.mock_provider import MockVisionProvider
from app.models.base import Base
from app.models.chat import Conversation, Message
from app.models.standard import Standard, StandardStatus
from app.models.user import User, UserRole
from app.services.chat_service import ChatService


# =====================================================================
# RAG Provider Unit Tests
# =====================================================================

@pytest.mark.asyncio
async def test_mock_rag_retrieval_returns_chunks():
    rag: BaseRAGProvider = MockRAGProvider()
    chunks = await rag.retrieve("water bottle standard")
    assert len(chunks) > 0
    first = chunks[0]
    assert isinstance(first, RAGChunk)
    assert first.standard_number == "IS 17803:2022"
    assert "stainless steel" in first.text.lower()
    assert first.document_id == "DOC-IS-17803"
    assert first.clause == "Clause 4.1"
    assert first.page == 5
    assert first.source_url is not None
    assert 0.0 <= first.retrieval_score <= 1.0


@pytest.mark.asyncio
async def test_mock_rag_top_k_limit():
    rag = MockRAGProvider()
    chunks = await rag.retrieve("standard", top_k=1)
    assert len(chunks) == 1


# =====================================================================
# LLM Provider Unit Tests
# =====================================================================

@pytest.mark.asyncio
async def test_mock_llm_generation_with_citations():
    rag = MockRAGProvider()
    llm: BaseLLMProvider = MockLLMProvider()

    chunks = await rag.retrieve("water bottle")
    messages = [{"role": "user", "content": "What is the BIS standard for water bottles?"}]
    result: LLMResult = await llm.generate_response(messages=messages, context_chunks=chunks)

    assert isinstance(result, LLMResult)
    assert "IS 17803:2022" in result.answer
    assert len(result.citations) > 0
    assert result.citations[0].standard_number == "IS 17803:2022"
    assert result.citations[0].document_title == "Indian Standard IS 17803:2022"
    assert result.tokens_used > 0


@pytest.mark.asyncio
async def test_mock_llm_product_attributes_extraction():
    llm = MockLLMProvider()
    attrs = await llm.extract_product_attributes("Stainless steel vacuum flask 1000ml for domestic use")
    assert isinstance(attrs, dict)
    assert "product_type" in attrs
    assert attrs["product_type"] == "water bottle"
    assert attrs["material"] == "stainless steel"


# =====================================================================
# Vision Provider Unit Tests
# =====================================================================

@pytest.mark.asyncio
async def test_mock_vision_jewellery_scan():
    vision: BaseVisionProvider = MockVisionProvider()
    result: JewelleryScanDetection = await vision.scan_jewellery_marks(b"dummy_jewellery_image_bytes")

    assert isinstance(result, JewelleryScanDetection)
    assert result.detected_huid == "ABC123"
    assert result.detected_fineness == "916"
    assert result.detected_bis_logo is True
    assert result.confidence_score >= 0.9
    assert result.hallmark_present is True
    assert result.hallmark_standard == "INDIAN_BIS"
    assert len(result.detected_marks) > 0
    assert result.explanation is not None


@pytest.mark.asyncio
async def test_mock_vision_jewellery_scan_empty():
    vision = MockVisionProvider()
    result = await vision.scan_jewellery_marks(b"")
    assert result.detected_huid is None
    assert result.detected_bis_logo is False
    assert result.confidence_score == 0.0
    assert result.hallmark_present is False
    assert result.hallmark_standard is None


@pytest.mark.asyncio
async def test_mock_vision_assay_report_parsing():
    vision = MockVisionProvider()
    result: AssayReportData = await vision.parse_assay_report(
        b"%PDF-1.4 dummy assay pdf report", mime_type="application/pdf"
    )

    assert isinstance(result, AssayReportData)
    assert result.report_number == "AR-2026-9081"
    assert "Apex" in (result.centre_name or "")
    assert result.metal == "Gold"
    assert "91.67%" in (result.reported_purity or "")
    assert result.test_date == "2026-08-15"
    assert result.sample_description is not None


@pytest.mark.asyncio
async def test_mock_vision_assay_report_empty():
    vision = MockVisionProvider()
    result = await vision.parse_assay_report(b"", mime_type="application/pdf")
    assert result.report_number is None


# =====================================================================
# Database Models & ChatService Orchestration Tests
# =====================================================================

@pytest.mark.asyncio
async def test_chat_service_and_models_lifecycle():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with session_factory() as session:
        # Seed user
        user = User(
            email="citizen@example.gov.in",
            hashed_password="hashedpassword123",
            role=UserRole.USER,
        )
        session.add(user)

        # Seed a Standard to test citation DB verification
        std = Standard(
            is_number="IS 17803:2022",
            title="Stainless steel vacuum insulated flasks and water bottles",
            year=2022,
            status=StandardStatus.ACTIVE,
        )
        session.add(std)
        await session.commit()

        # Initialize ChatService with mock providers
        rag = MockRAGProvider()
        llm = MockLLMProvider()
        chat_service = ChatService(rag_provider=rag, llm_provider=llm)

        # 1. First message without conversation_id -> creates new Conversation
        res1 = await chat_service.handle_message(
            db=session,
            conversation_id=None,
            user_message="What standard applies to stainless steel water bottles?",
            user_id=user.id,
        )

        assert "conversation_id" in res1
        conv_id = res1["conversation_id"]
        assert "IS 17803:2022" in res1["answer"]
        assert len(res1["citations"]) > 0
        # Citation standard exists in DB -> verified_in_db should be True
        assert res1["citations"][0]["standard_number"] == "IS 17803:2022"
        assert res1["citations"][0]["verified_in_db"] is True

        # Verify DB records
        conv_stmt = select(Conversation).where(Conversation.id == conv_id)
        conv_record = (await session.execute(conv_stmt)).scalar_one()
        assert conv_record.user_id == user.id
        assert "What standard applies" in conv_record.title

        messages = await chat_service.get_conversation_messages(db=session, conversation_id=conv_id)
        assert len(messages) == 2
        assert messages[0].role == "user"
        assert messages[0].content == "What standard applies to stainless steel water bottles?"
        assert messages[1].role == "assistant"
        assert messages[1].citations is not None
        assert len(messages[1].citations) > 0

        # 2. Second message in same conversation -> appends messages
        res2 = await chat_service.handle_message(
            db=session,
            conversation_id=conv_id,
            user_message="What are the test requirements?",
            user_id=user.id,
        )
        assert res2["conversation_id"] == conv_id

        messages_after = await chat_service.get_conversation_messages(db=session, conversation_id=conv_id)
        assert len(messages_after) == 4
        assert messages_after[2].role == "user"
        assert messages_after[3].role == "assistant"

        # 3. Test list_conversations
        conv_list = await chat_service.list_conversations(db=session, user_id=user.id)
        assert len(conv_list) == 1
        assert conv_list[0].id == conv_id

        # 4. Cascade delete: deleting conversation deletes messages
        await session.delete(conv_record)
        await session.commit()

        msgs_stmt = select(Message).where(Message.conversation_id == conv_id)
        remaining_msgs = (await session.execute(msgs_stmt)).scalars().all()
        assert len(remaining_msgs) == 0

    await engine.dispose()


# =====================================================================
# Model and Module Exports Verification
# =====================================================================

def test_models_reexport_chat():
    assert hasattr(models, "Conversation")
    assert hasattr(models, "Message")
    assert "Conversation" in models.__all__
    assert "Message" in models.__all__


def test_package_exports():
    import app.integrations.llm as llm_mod
    import app.integrations.rag as rag_mod
    import app.integrations.vision as vision_mod

    assert hasattr(rag_mod, "BaseRAGProvider")
    assert hasattr(rag_mod, "RAGChunk")
    assert hasattr(rag_mod, "MockRAGProvider")

    assert hasattr(llm_mod, "BaseLLMProvider")
    assert hasattr(llm_mod, "Citation")
    assert hasattr(llm_mod, "LLMResult")
    assert hasattr(llm_mod, "MockLLMProvider")

    assert hasattr(vision_mod, "BaseVisionProvider")
    assert hasattr(vision_mod, "JewelleryScanDetection")
    assert hasattr(vision_mod, "AssayReportData")
    assert hasattr(vision_mod, "MockVisionProvider")
