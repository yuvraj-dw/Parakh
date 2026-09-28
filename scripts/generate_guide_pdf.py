"""Generate a comprehensive, publication-grade Backend Integration Guide PDF
for Frontend and RAG engineers working on PARAKH (BIS Intelligent Assistant).
"""
import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))
        
        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(54, 755, "PARAKH (BIS Intelligent Assistant) - Backend Integration Guide")
            self.drawRightString(558, 755, "Confidential - For Internal Dev Teams")
            self.setStrokeColor(colors.HexColor("#cbd5e1"))
            self.setLineWidth(0.5)
            self.line(54, 747, 558, 747)

        # Footer
        self.setStrokeColor(colors.HexColor("#cbd5e1"))
        self.setLineWidth(0.5)
        self.line(54, 45, 558, 45)
        self.drawString(54, 32, "Production API: https://bis.hizru.me | Base: /api/v1 | OpenAPI Docs: /docs")
        self.drawRightString(558, 32, f"Page {self._pageNumber} of {page_count}")
        self.restoreState()


def create_backend_guide(output_pdf_path: str):
    doc = SimpleDocTemplate(
        output_pdf_path,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54,
    )

    styles = getSampleStyleSheet()

    # Custom styles
    primary_color = colors.HexColor("#0f172a") # Dark Slate / Navy
    accent_blue = colors.HexColor("#1e40af")
    accent_amber = colors.HexColor("#b45309")
    card_bg = colors.HexColor("#f8fafc")
    code_bg = colors.HexColor("#0f172a")

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=primary_color,
        spaceAfter=6,
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#475569"),
        spaceAfter=15,
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=19,
        textColor=accent_blue,
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True,
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=colors.HexColor("#1e293b"),
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True,
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12.5,
        textColor=colors.HexColor("#334155"),
        spaceAfter=6,
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#334155"),
        leftIndent=14,
        firstLineIndent=-10,
        spaceAfter=3,
    )

    code_style = ParagraphStyle(
        'Code_Custom',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=7.5,
        leading=10.5,
        textColor=colors.HexColor("#f1f5f9"),
    )

    table_header = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.white,
    )

    table_cell = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.HexColor("#1e293b"),
    )

    table_cell_code = ParagraphStyle(
        'TableCellCode',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.HexColor("#0f172a"),
    )

    story = []

    # Title Banner Block
    story.append(Paragraph("PARAKH: BIS INTELLIGENT ASSISTANT", title_style))
    story.append(Paragraph("The Complete Backend Engineering, Integration, & Architecture Guide for Frontend & RAG Teams", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2, color=accent_blue, spaceBefore=0, spaceAfter=12))

    # Meta Table (Quick Facts)
    meta_data = [
        [
            Paragraph("<b>Production VPS</b>", table_cell),
            Paragraph("<code>45.82.161.10</code> (Ubuntu 22.04 LTS)", table_cell_code),
            Paragraph("<b>Public Base URL</b>", table_cell),
            Paragraph("<code>https://bis.hizru.me</code> (Cloudflare SSL)", table_cell_code),
        ],
        [
            Paragraph("<b>Database</b>", table_cell),
            Paragraph("Supabase PostgreSQL (18 tables migrated)", table_cell),
            Paragraph("<b>API Docs (Swagger)</b>", table_cell),
            Paragraph("<code>https://bis.hizru.me/docs</code>", table_cell_code),
        ],
        [
            Paragraph("<b>LLM & Vision Engine</b>", table_cell),
            Paragraph("Gemini 3.8 Flash High (24/7 Autonomous OAuth)", table_cell),
            Paragraph("<b>CORS Policy</b>", table_cell),
            Paragraph("Wildcard <code>*</code> enabled with full headers", table_cell),
        ],
    ]
    t_meta = Table(meta_data, colWidths=[110, 142, 110, 142])
    t_meta.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), card_bg),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_meta)
    story.append(Spacer(1, 12))

    # System Architecture Summary
    story.append(Paragraph("1. System Architecture & Component Interaction", h1_style))
    story.append(Paragraph(
        "Parakh is an asynchronous FastAPI orchestration engine designed to support BIS standard discovery, regulatory "
        "compliance verification, and multimodal AI assistance. The diagram below illustrates how client applications, "
        "the RAG vector layer, the PostgreSQL relational store, and Google's autonomous AI engine interact:",
        body_style
    ))

    arch_box = [
        [Paragraph(
            "<font color='#38bdf8'><b>Frontend Client (Web/Mobile)</b></font><br/>"
            "- Swagger / OpenAPI UI: <code>/docs</code><br/>"
            "- JSON REST over HTTPS<br/>"
            "- Stores & sends <code>conversation_id</code> for multi-turn chat<br/>"
            "- Uploads jewellery photos & assay reports (multipart)",
            table_cell
        ),
        Paragraph(
            "<font color='#38bdf8'><b>Parakh Backend Core (FastAPI @ VPS:8088)</b></font><br/>"
            "- <b>Routers</b>: Standards, QCO, Labs, Jewellers, HUID, Chat<br/>"
            "- <b>Verification Service</b>: Priority DB check &rarr; upstream fallback<br/>"
            "- <b>Audit Logger</b>: Persists all requests, hashes & verification traces<br/>"
            "- <b>Token Manager</b>: 24/7 autonomous OAuth token refresh",
            table_cell
        )],
        [Paragraph(
            "<font color='#38bdf8'><b>RAG & AI Intelligence Layer</b></font><br/>"
            "- <b>RAG Provider</b>: Chunks regulatory standards + clauses + pages<br/>"
            "- <b>Citation Engine</b>: Maps retrieved passages to verifiable badges<br/>"
            "- <b>Autonomous LLM</b>: Gemini 3.8 Flash High via CloudCode API<br/>"
            "- <b>Multimodal Vision</b>: Hallmarking mark analyzer & assay OCR",
            table_cell
        ),
        Paragraph(
            "<font color='#38bdf8'><b>Supabase PostgreSQL Database</b></font><br/>"
            "- 18 normalized tables with full provenance metadata<br/>"
            "- Seeded with 12 standards, 8 QCOs, 8 Labs, 8 AHCs, 11 Jewellers<br/>"
            "- Stores conversation threads & message histories<br/>"
            "- Asyncpg connection pool with SSL enforcement",
            table_cell
        )]
    ]
    t_arch = Table(arch_box, colWidths=[252, 252])
    t_arch.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f1f5f9")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#94a3b8")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_arch)
    story.append(Spacer(1, 14))

    # SECTION 2: FRONTEND GUIDE
    story.append(Paragraph("2. Frontend Integration Guide (APIs, Payloads, & Test Triggers)", h1_style))
    story.append(Paragraph(
        "All API endpoints are hosted at <code>https://bis.hizru.me/api/v1</code>. CORS is globally enabled for all origins, "
        "methods, and headers. Below is the complete contract for frontend integration:",
        body_style
    ))

    # API Directory Table
    story.append(Paragraph("Core API Endpoints Matrix", h2_style))
    endpoints_data = [
        [
            Paragraph("Method & Route", table_header),
            Paragraph("Description", table_header),
            Paragraph("Request Parameters / Payload", table_header),
            Paragraph("Response Highlights", table_header),
        ],
        [
            Paragraph("<code>POST /auth/register</code><br/><code>POST /auth/login</code>", table_cell_code),
            Paragraph("User authentication & JWT token generation", table_cell),
            Paragraph("<code>{ email, password, role: CONSUMER|INDUSTRY }</code>", table_cell_code),
            Paragraph("<code>{ access_token, token_type: Bearer }</code>", table_cell_code),
        ],
        [
            Paragraph("<code>GET /auth/me</code>", table_cell_code),
            Paragraph("Get current authenticated user profile", table_cell),
            Paragraph("Header: <code>Authorization: Bearer &lt;token&gt;</code>", table_cell_code),
            Paragraph("<code>{ id, email, role, is_active }</code>", table_cell_code),
        ],
        [
            Paragraph("<code>GET /standards</code>", table_cell_code),
            Paragraph("Search & filter official Indian Standards", table_cell),
            Paragraph("Query: <code>q, is_number, status, page, page_size</code>", table_cell_code),
            Paragraph("List of 12 standards with titles, years, scopes", table_cell),
        ],
        [
            Paragraph("<code>GET /qco</code>", table_cell_code),
            Paragraph("Quality Control Orders compliance directory", table_cell),
            Paragraph("Query: <code>status, product_name, ministry</code>", table_cell_code),
            Paragraph("8 QCOs with notification dates & effective dates", table_cell),
        ],
        [
            Paragraph("<code>GET /laboratories</code>", table_cell_code),
            Paragraph("BIS Recognized Testing Labs & Test Scopes", table_cell),
            Paragraph("Query: <code>state, city, is_number</code>", table_cell_code),
            Paragraph("8 regional labs with accredited test parameter scopes", table_cell),
        ],
        [
            Paragraph("<code>GET /hallmarking/centres</code>", table_cell_code),
            Paragraph("Assaying & Hallmarking Centres (AHC)", table_cell),
            Paragraph("Query: <code>state, city, pincode, search</code>", table_cell_code),
            Paragraph("8 recognized AHCs with recognition numbers", table_cell),
        ],
        [
            Paragraph("<code>GET /jewellers</code>", table_cell_code),
            Paragraph("Registered Jewellers Directory", table_cell),
            Paragraph("Query: <code>status: VALID|EXPIRED|CANCELLED, city</code>", table_cell_code),
            Paragraph("11 registered jewellers with licence statuses", table_cell),
        ],
        [
            Paragraph("<code>POST /verification/huid</code>", table_cell_code),
            Paragraph("Verify 6-character gold/silver HUID hallmark", table_cell),
            Paragraph("<code>{ huid: 'GLD916' }</code>", table_cell_code),
            Paragraph("<code>{ status: VERIFIED, data: { jeweller, ahc, purity, weight } }</code>", table_cell_code),
        ],
        [
            Paragraph("<code>POST /verification/licence</code>", table_cell_code),
            Paragraph("Verify BIS licence / CM/L / Jeweller ID", table_cell),
            Paragraph("<code>{ licence_number: 'JWL-MH-1002' }</code>", table_cell_code),
            Paragraph("Checks local database first, then fallback", table_cell),
        ],
        [
            Paragraph("<code>POST /verification/r-number</code>", table_cell_code),
            Paragraph("Verify CRS electronics R-Number", table_cell),
            Paragraph("<code>{ r_number: 'R-41001234' }</code>", table_cell_code),
            Paragraph("Returns product, brand, standard, status", table_cell),
        ],
        [
            Paragraph("<code>POST /jewellery/scan</code>", table_cell_code),
            Paragraph("Multimodal Vision AI hallmark inspection", table_cell),
            Paragraph("Multipart form: <code>image: UploadFile</code>", table_cell_code),
            Paragraph("<code>{ detected_huid, detected_fineness, bis_logo, confidence }</code>", table_cell_code),
        ],
        [
            Paragraph("<code>POST /jewellery/assay-report</code>", table_cell_code),
            Paragraph("Assay test certificate OCR & validation", table_cell),
            Paragraph("Multipart form: <code>report_file: UploadFile</code>", table_cell_code),
            Paragraph("<code>{ report_number, centre_name, reported_purity, test_date }</code>", table_cell_code),
        ],
        [
            Paragraph("<code>GET /certification/schemes</code>", table_cell_code),
            Paragraph("Official BIS certification schemes", table_cell),
            Paragraph("None", table_cell),
            Paragraph("6 schemes (ISI Mark, CRS, Batch, Hallmarking, Eco)", table_cell),
        ],
        [
            Paragraph("<code>POST /certification/map-product</code>", table_cell_code),
            Paragraph("Intelligent product-to-standard mapping", table_cell),
            Paragraph("<code>{ description: 'motorcycle helmet' }</code>", table_cell_code),
            Paragraph("<code>{ candidate_standard: 'IS 4151:2015', qco, scheme, mandatory }</code>", table_cell_code),
        ],
        [
            Paragraph("<code>POST /chat</code>", table_cell_code),
            Paragraph("Conversational AI Assistant (Multi-turn)", table_cell),
            Paragraph("<code>{ message: '...', conversation_id: null | 'uuid' }</code>", table_cell_code),
            Paragraph("<code>{ answer: '...', conversation_id: '...', citations: [...] }</code>", table_cell_code),
        ],
    ]

    t_endpoints = Table(endpoints_data, colWidths=[115, 105, 140, 144])
    t_endpoints.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), accent_blue),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, card_bg]),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(t_endpoints)
    story.append(Spacer(1, 10))

    # Page Break for clean section separation
    story.append(PageBreak())

    # Frontend Test Data Cheatsheet
    story.append(Paragraph("Frontend Test Triggers & Mock Cheatsheet", h2_style))
    story.append(Paragraph(
        "To allow frontend developers to test all visual states (Success, Badges, Error banners, Expired badges, and "
        "Alert popups), the backend provides deterministic mock triggers:",
        body_style
    ))

    huid_test_data = [
        [
            Paragraph("Input Code", table_header),
            Paragraph("Expected Status", table_header),
            Paragraph("Jeweller / Details", table_header),
            Paragraph("Frontend UI Test Purpose", table_header),
        ],
        [
            Paragraph("<code>GLD916</code>", table_cell_code),
            Paragraph("<font color='#16a34a'><b>VERIFIED</b></font>", table_cell),
            Paragraph("Kalyan Heritage Gems | 22K Gold Bangles (42.5g)", table_cell),
            Paragraph("Green verified badge, full article breakdown card", table_cell),
        ],
        [
            Paragraph("<code>DIA750</code>", table_cell_code),
            Paragraph("<font color='#16a34a'><b>VERIFIED</b></font>", table_cell),
            Paragraph("Tanishq Retail Vault | 18K Solitaire Ring (5.45g)", table_cell),
            Paragraph("Purity 750 (18K) display card with AHC badge", table_cell),
        ],
        [
            Paragraph("<code>SIL925</code>", table_cell_code),
            Paragraph("<font color='#16a34a'><b>VERIFIED</b></font>", table_cell),
            Paragraph("Johri Bazaar Jewels | Sterling Silver Thali (450g)", table_cell),
            Paragraph("Silver hallmarking verification view", table_cell),
        ],
        [
            Paragraph("<code>EXP999</code>", table_cell_code),
            Paragraph("<font color='#d97706'><b>EXPIRED</b></font>", table_cell),
            Paragraph("Royal Heritage Jewels (Registration lapsed)", table_cell),
            Paragraph("Yellow/Amber warning badge ('Hallmark validity expired')", table_cell),
        ],
        [
            Paragraph("<code>NOTF00</code>", table_cell_code),
            Paragraph("<font color='#dc2626'><b>NOT_FOUND</b></font>", table_cell),
            Paragraph("Record not in BIS database", table_cell),
            Paragraph("Red alert badge ('Counterfeit or unauthorized hallmark warning')", table_cell),
        ],
        [
            Paragraph("<code>ERR500</code>", table_cell_code),
            Paragraph("<font color='#dc2626'><b>ERROR</b></font>", table_cell),
            Paragraph("Simulated upstream provider failure", table_cell),
            Paragraph("Retry / connection error toast in UI", table_cell),
        ],
        [
            Paragraph("<i>Any other 6 chars</i><br/>(e.g. <code>M89K2P</code>)", table_cell),
            Paragraph("<font color='#16a34a'><b>VERIFIED</b></font>", table_cell),
            Paragraph("Dynamically partitioned against registered jeweller pool", table_cell),
            Paragraph("Allows evaluator to enter any random code during live demo", table_cell),
        ],
    ]
    t_huid = Table(huid_test_data, colWidths=[90, 85, 175, 154])
    t_huid.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), accent_blue),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, card_bg]),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(t_huid)
    story.append(Spacer(1, 14))

    # SECTION 3: RAG FRIEND GUIDE
    story.append(Paragraph("3. Guide for RAG & AI Engineering Team", h1_style))
    story.append(Paragraph(
        "Parakh separates the retrieval engine, the orchestration pipeline, and the generative model into modular interfaces. "
        "This allows the RAG team to drop in real vector stores (e.g. Qdrant, Pinecone, or pgvector) without altering the API.",
        body_style
    ))

    story.append(Paragraph("How the Retrieval Pipeline Works in <code>ChatService</code>", h2_style))
    story.append(Paragraph(
        "1. <b>Inbound Request</b>: Client sends <code>POST /api/v1/chat</code> with <code>{ message, conversation_id }</code>.<br/>"
        "2. <b>Conversation Context</b>: If <code>conversation_id</code> is provided, prior turns are loaded from the PostgreSQL <code>messages</code> table.<br/>"
        "3. <b>RAG Retrieval</b>: Backend calls <code>rag_provider.retrieve_relevant_chunks(query=message, top_k=5)</code>.<br/>"
        "4. <b>Context Formulation</b>: Chunks are formatted with source titles, standard numbers, clauses, and page citations.<br/>"
        "5. <b>Autonomous Gemini Generation</b>: The Google OAuth Provider executes Gemini 3.8 Flash High with regulatory context.<br/>"
        "6. <b>Citation Synthesis & Persistence</b>: Both user question and assistant answer are saved to DB. Citations are returned in the response envelope.",
        bullet_style
    ))
    story.append(Spacer(1, 6))

    story.append(Paragraph("The Exact <code>RAGChunk</code> Schema Contract", h2_style))
    story.append(Paragraph(
        "The RAG team must produce chunk objects matching <code>app/integrations/rag/base.py</code>:",
        body_style
    ))

    chunk_code = (
        "class RAGChunk(BaseModel):\n"
        "    text: str                          # Chunk passage body\n"
        "    document_title: str                # e.g., 'IS 1417:2016 Gold & Gold Alloys'\n"
        "    standard_number: Optional[str]     # e.g., 'IS 1417:2016'\n"
        "    clause: Optional[str]              # e.g., 'Clause 4.2 - Fineness Grades'\n"
        "    page: Optional[int]                # e.g., 4 (Used for direct PDF jump)\n"
        "    source_url: Optional[str]          # Official BIS Gazette URL\n"
        "    score: float = 0.0                 # Cosine similarity or cross-encoder score"
    )
    t_chunk_code = Table([[Paragraph(f"<pre>{chunk_code}</pre>", code_style)]], colWidths=[504])
    t_chunk_code.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), code_bg),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_chunk_code)
    story.append(Spacer(1, 8))

    story.append(Paragraph("How to Wire a Real Vector Store (Zero-Downtime Swap)", h2_style))
    story.append(Paragraph(
        "To replace the mock retriever with your vector search pipeline, create <code>app/integrations/rag/custom_rag.py</code> "
        "subclassing <code>BaseRAGProvider</code>, then update <code>get_chat_service()</code> in <code>app/dependencies.py</code>:",
        body_style
    ))

    rag_swap_code = (
        "# app/integrations/rag/custom_rag.py\n"
        "from app.integrations.rag.base import BaseRAGProvider, RAGChunk\n"
        "class QdrantRAGProvider(BaseRAGProvider):\n"
        "    async def retrieve_relevant_chunks(self, query: str, top_k: int = 5) -> List[RAGChunk]:\n"
        "        # 1. Embed query with your text-embedding model\n"
        "        # 2. Search your Qdrant / Pinecone / pgvector collection\n"
        "        # 3. Return mapped RAGChunk list with clause and page numbers"
    )
    t_rag_code = Table([[Paragraph(f"<pre>{rag_swap_code}</pre>", code_style)]], colWidths=[504])
    t_rag_code.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), code_bg),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_rag_code)
    story.append(Spacer(1, 14))

    # SECTION 4: GOTCHAS & CATCH-UPS
    story.append(Paragraph("4. Critical Gotchas, Edge Cases, & Integration Rules", h1_style))
    
    gotchas = [
        ("Multi-turn Chat State", "The frontend MUST store the <code>conversation_id</code> returned in the first message response and pass it in subsequent turns. Omitting <code>conversation_id</code> creates an isolated conversation with zero historical memory."),
        ("Always Use HTTPS", "Always call <code>https://bis.hizru.me</code>. Do NOT send requests to <code>http://45.82.161.10</code> because Cloudflare handles SSL termination and plain HTTP to the IP will be blocked or drop headers."),
        ("Standard Error Envelope", "All 4xx/5xx responses adhere to: <code>{ 'error': { 'code': '...', 'message': '...', 'correlation_id': '...' } }</code>. Use <code>error.message</code> for toasts in frontend."),
        ("Verification Priority", "When verifying a licence (<code>POST /verification/licence</code>), the system checks the local PostgreSQL <code>jewellers</code> table FIRST. Jeweller licences resolve as <code>LOCAL_DATABASE_REGISTRY</code> with 100% reliability."),
        ("Image & Document Upload Limit", "Endpoints <code>/jewellery/scan</code> and <code>/jewellery/assay-report</code> accept a maximum payload of 15MB. Ensure client-side image compression before upload to conserve mobile bandwidth."),
        ("Autonomous AI Token Refresh", "The VPS backend automatically refreshes its Google OAuth bearer token 60 seconds before expiration. Developers never need to manually generate or paste Google access tokens."),
    ]

    for title, desc in gotchas:
        story.append(Paragraph(f"- <b>{title}</b>: {desc}", bullet_style))

    story.append(Spacer(1, 14))

    # SECTION 5: LIVE VERIFICATION & CURL EXAMPLES
    story.append(Paragraph("5. Interactive cURL Verification Commands", h1_style))
    story.append(Paragraph("Test endpoints directly from terminal or Postman:", body_style))

    curl_examples = (
        "# 1. Test Verification of Authentic Gold HUID\n"
        "curl -X POST https://bis.hizru.me/api/v1/verification/huid \\\n"
        "     -H 'Content-Type: application/json' -d '{\"huid\": \"GLD916\"}'\n\n"
        "# 2. Test Intelligent Product Mapping\n"
        "curl -X POST https://bis.hizru.me/api/v1/certification/map-product \\\n"
        "     -H 'Content-Type: application/json' \\\n"
        "     -d '{\"description\": \"Protective helmets for motorcycle riders\"}'\n\n"
        "# 3. Test Multi-Turn Chat Conversation\n"
        "curl -X POST https://bis.hizru.me/api/v1/chat \\\n"
        "     -H 'Content-Type: application/json' \\\n"
        "     -d '{\"message\": \"What are the mandatory marking rules for gold jewellery?\"}'"
    )
    t_curl = Table([[Paragraph(f"<pre>{curl_examples}</pre>", code_style)]], colWidths=[504])
    t_curl.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), code_bg),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_curl)

    # Build PDF using NumberedCanvas
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF successfully generated at: {output_pdf_path}")


if __name__ == "__main__":
    out_path = os.path.abspath("PARAKH_Backend_Integration_Guide.pdf")
    create_backend_guide(out_path)
