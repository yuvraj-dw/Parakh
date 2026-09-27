from __future__ import annotations

from typing import Any, Dict, List, Optional
from app.integrations.rag.base import BaseRAGProvider, RAGChunk


class MockRAGProvider(BaseRAGProvider):
    def __init__(self, sample_chunks: Optional[List[RAGChunk]] = None):
        self.sample_chunks = sample_chunks or [
            RAGChunk(
                text="IS 17803:2022 specifies requirements for stainless steel vacuum insulated flasks and water bottles used for domestic and commercial purposes.",
                document_id="DOC-IS-17803",
                document_title="Indian Standard IS 17803:2022",
                standard_number="IS 17803:2022",
                clause="Clause 4.1",
                page=5,
                source_url="https://standardsbis.bsbedge.com/IS17803",
                retrieval_score=0.96,
            ),
            RAGChunk(
                text="IS 1293:2019 stipulates safety requirements for plugs and socket-outlets of rated voltage up to and including 250 V and rated current up to and including 16 A.",
                document_id="DOC-IS-1293",
                document_title="Indian Standard IS 1293:2019",
                standard_number="IS 1293:2019",
                clause="Clause 3.2",
                page=12,
                source_url="https://standardsbis.bsbedge.com/IS1293",
                retrieval_score=0.88,
            ),
            RAGChunk(
                text="IS 1417:2016 prescribes the requirements for grades and fineness of gold and gold alloys in jewellery, artefacts, and bullion.",
                document_id="DOC-IS-1417",
                document_title="Indian Standard IS 1417:2016",
                standard_number="IS 1417:2016",
                clause="Clause 5.1",
                page=4,
                source_url="https://standardsbis.bsbedge.com/IS1417",
                retrieval_score=0.92,
            ),
        ]

    async def retrieve(
        self,
        query: str,
        filters: Optional[Dict[str, Any]] = None,
        top_k: int = 5,
    ) -> List[RAGChunk]:
        q_terms = [t for t in query.lower().split() if len(t) > 2]
        matched: List[RAGChunk] = []

        if q_terms:
            for chunk in self.sample_chunks:
                searchable = (
                    f"{chunk.text} {chunk.document_title} {chunk.standard_number or ''} {chunk.clause or ''}".lower()
                )
                if any(term in searchable for term in q_terms):
                    matched.append(chunk)

        if not matched and self.sample_chunks:
            matched = list(self.sample_chunks)

        if filters:
            if "standard_number" in filters:
                matched = [c for c in matched if c.standard_number == filters["standard_number"]]

        return matched[:top_k]
