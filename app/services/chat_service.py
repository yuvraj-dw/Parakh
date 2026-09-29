from __future__ import annotations

import uuid
from typing import Any, Dict, List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.integrations.llm.base import BaseLLMProvider, LLMResult
from app.integrations.rag.base import BaseRAGProvider
from app.models.chat import Conversation, Message
from app.models.standard import Standard

BASE_SYSTEM_PROMPT = "You are an official BIS Assistant. Answer accurately using provided context."


def get_persona_system_prompt(persona: str = "CONSUMER") -> str:
    clean = (persona or "CONSUMER").strip().upper()
    if clean == "INDUSTRY":
        return (
            "You are an expert technical regulatory advisor for Indian manufacturers and MSMEs. "
            "Cite exact Indian Standard clause numbers, quality control order statutory notifications, "
            "testing sample sizes, factory audit requirements, and MSME concessions (e.g. 20% discount on marking fees). "
            "Maintain a precise, professional tone."
        )
    return (
        "You are an approachable consumer guide for the Bureau of Indian Standards. "
        "Explain concepts in clear, non-technical everyday language. Focus on product safety, "
        "consumer rights under the Consumer Protection Act, hallmark verification steps, "
        "and how to spot counterfeit marks. Avoid obscure clause jargon."
    )


class ChatService:
    def __init__(self, rag_provider: BaseRAGProvider, llm_provider: BaseLLMProvider):
        self.rag = rag_provider
        self.llm = llm_provider

    async def process_message(
        self,
        db: AsyncSession,
        conversation_id: Optional[str],
        user_message: str,
        user_id: Optional[str] = None,
        persona: str = "CONSUMER",
    ) -> Dict[str, Any]:
        # 1. Retrieve or create conversation
        conv: Optional[Conversation] = None
        if conversation_id:
            stmt = select(Conversation).where(Conversation.id == conversation_id)
            result = await db.execute(stmt)
            conv = result.scalar_one_or_none()

        if not conv:
            conv = Conversation(
                id=conversation_id if conversation_id else str(uuid.uuid4()),
                user_id=user_id,
                title=user_message[:50].strip() or "New Conversation",
            )
            db.add(conv)
            await db.flush()

        conv_id = conv.id

        # 2. Record user message
        user_msg_record = Message(
            conversation_id=conv_id,
            role="user",
            content=user_message,
        )
        db.add(user_msg_record)
        await db.flush()

        # 3. Retrieve conversation history for context
        stmt_history = (
            select(Message)
            .where(Message.conversation_id == conv_id)
            .order_by(Message.created_at.asc())
        )
        history_res = await db.execute(stmt_history)
        history_records = history_res.scalars().all()
        messages_payload = [
            {"role": m.role, "content": m.content}
            for m in history_records
        ]

        # 4. Retrieve relevant RAG evidence
        chunks = await self.rag.retrieve(query=user_message, top_k=4)

        # 5. Synthesize with LLM
        persona_prompt = get_persona_system_prompt(persona)
        system_instruction = f"{BASE_SYSTEM_PROMPT}\n\n{persona_prompt}".strip()
        llm_res: LLMResult = await self.llm.generate_response(
            messages=messages_payload,
            context_chunks=chunks,
            system_instruction=system_instruction,
        )

        # 6. Validate citations against standards table in DB
        citations_data: List[Dict[str, Any]] = []
        for cite in llm_res.citations:
            cite_dict = cite.model_dump()
            if cite.standard_number:
                std_stmt = select(Standard).where(Standard.is_number == cite.standard_number)
                std_res = await db.execute(std_stmt)
                std_found = std_res.scalar_one_or_none()
                cite_dict["verified_in_db"] = std_found is not None
            else:
                cite_dict["verified_in_db"] = False
            citations_data.append(cite_dict)

        # 7. Record assistant response
        assistant_msg_record = Message(
            conversation_id=conv_id,
            role="assistant",
            content=llm_res.answer,
            citations=citations_data,
        )
        db.add(assistant_msg_record)
        await db.commit()

        return {
            "conversation_id": conv_id,
            "answer": llm_res.answer,
            "citations": citations_data,
        }

    async def handle_message(
        self,
        db: AsyncSession,
        conversation_id: Optional[str],
        user_message: str,
        user_id: Optional[str] = None,
        persona: str = "CONSUMER",
    ) -> Dict[str, Any]:
        return await self.process_message(
            db=db,
            conversation_id=conversation_id,
            user_message=user_message,
            user_id=user_id,
            persona=persona,
        )

    async def get_conversation(
        self, db: AsyncSession, conversation_id: str
    ) -> Optional[Conversation]:
        stmt = select(Conversation).where(Conversation.id == conversation_id)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_conversation_messages(
        self, db: AsyncSession, conversation_id: str
    ) -> List[Message]:
        stmt = (
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.created_at.asc())
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def list_conversations(
        self, db: AsyncSession, user_id: Optional[str] = None
    ) -> List[Conversation]:
        stmt = select(Conversation)
        if user_id:
            stmt = stmt.where(Conversation.user_id == user_id)
        stmt = stmt.order_by(Conversation.updated_at.desc())
        result = await db.execute(stmt)
        return list(result.scalars().all())
