from __future__ import annotations

from typing import Any, Dict, List, Literal, Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel, field_validator
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AppException
from app.dependencies import get_chat_service, get_db, get_optional_current_user
from app.models.user import User
from app.services.chat_service import ChatService

router = APIRouter(prefix="/chat", tags=["AI Chat Assistant"])


class ChatRequest(BaseModel):
    message: Optional[str] = None
    query: Optional[str] = None
    conversation_id: Optional[str] = None
    persona: Optional[Literal["CONSUMER", "INDUSTRY"]] = "CONSUMER"

    @field_validator("persona", mode="before")
    @classmethod
    def normalize_persona(cls, v: Any) -> Any:
        if isinstance(v, str):
            clean = v.strip().upper()
            if clean in ("CONSUMER", "INDUSTRY"):
                return clean
        return v


class ChatResponse(BaseModel):
    conversation_id: str
    answer: str
    citations: List[Dict[str, Any]]


@router.post("", response_model=ChatResponse)
async def chat_endpoint(
    payload: ChatRequest,
    db: AsyncSession = Depends(get_db),
    chat_service: ChatService = Depends(get_chat_service),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    user_msg = payload.message or payload.query
    if not user_msg or not user_msg.strip():
        raise AppException("INVALID_INPUT", "Field 'message' is required", 400)

    result = await chat_service.process_message(
        db=db,
        conversation_id=payload.conversation_id,
        user_message=user_msg.strip(),
        user_id=current_user.id if current_user else None,
        persona=payload.persona or "CONSUMER",
    )

    return ChatResponse(
        conversation_id=result["conversation_id"],
        answer=result["answer"],
        citations=result["citations"],
    )


send_chat_message = chat_endpoint


@router.get("/conversations")
async def list_conversations(
    db: AsyncSession = Depends(get_db),
    chat_service: ChatService = Depends(get_chat_service),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    user_id = current_user.id if current_user else None
    convs = await chat_service.list_conversations(db=db, user_id=user_id)
    return [
        {
            "id": c.id,
            "title": c.title,
            "created_at": c.created_at.isoformat() if c.created_at else None,
            "updated_at": c.updated_at.isoformat() if c.updated_at else None,
        }
        for c in convs
    ]


@router.get("/conversations/{conversation_id}/messages")
async def get_conversation_messages(
    conversation_id: str,
    db: AsyncSession = Depends(get_db),
    chat_service: ChatService = Depends(get_chat_service),
):
    messages = await chat_service.get_conversation_messages(
        db=db, conversation_id=conversation_id
    )
    return [
        {
            "id": m.id,
            "role": m.role,
            "content": m.content,
            "citations": m.citations,
            "created_at": m.created_at.isoformat() if m.created_at else None,
        }
        for m in messages
    ]
