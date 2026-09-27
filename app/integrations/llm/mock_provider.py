from __future__ import annotations

from typing import Any, Dict, List, Optional
from app.integrations.llm.base import BaseLLMProvider, Citation, LLMResult
from app.integrations.rag.base import RAGChunk


class MockLLMProvider(BaseLLMProvider):
    async def generate_response(
        self,
        messages: List[Dict[str, str]],
        context_chunks: List[RAGChunk],
        system_instruction: str = "",
    ) -> LLMResult:
        citations = [
            Citation(
                document_title=chunk.document_title,
                standard_number=chunk.standard_number,
                clause=chunk.clause,
                page=chunk.page,
                source_url=chunk.source_url,
            )
            for chunk in context_chunks
        ]

        if context_chunks:
            primary_chunk = context_chunks[0]
            std_ref = primary_chunk.standard_number or primary_chunk.document_title
            answer = (
                f"According to {std_ref}, stainless steel vacuum insulated bottles must comply "
                f"with BIS certification standards. Details: {primary_chunk.text}"
            )
        else:
            answer = "I could not find specific BIS standards for your query. Please provide more product details."

        return LLMResult(
            answer=answer,
            citations=citations,
            tokens_used=120,
        )

    async def extract_product_attributes(self, text: str) -> Dict[str, Any]:
        return {
            "product_type": "water bottle",
            "material": "stainless steel",
            "intended_use": "domestic",
            "raw_input": text,
        }
