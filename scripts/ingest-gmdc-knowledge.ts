import { createClient } from "@supabase/supabase-js"
import OpenAI from "openai"
import { config } from "dotenv"
import { resolve } from "path"

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), ".env.local") })

// GMDC Knowledge Base Content
const GMDC_KNOWLEDGE = {
  title: "GMDC Comprehensive Knowledge Base",
  sections: [
    {
      title: "Digital and IT Initiatives Review (June 2024)",
      category: "digital_transformation",
      content: `
Digital Fleet Management System:
- 85%+ installation completed for mine fleet digitalization in BA and TA
- Key metrics: Idle Time, Utilization, Active %, Lead-Distance
- Cost savings: INR 144/ton total (INR 10/t diesel idle reduction, INR 49/t working capital, INR 85/t lead optimization)
- Annual savings: ~150 Cr (calculated at INR 144/Ton on FY25 projected volume)
- Total fleet: 183 equipment being digitalized
- BVN Progress: 92 equipment (100% GPS, 79% fuel sensors)
- TAD Progress: 91 equipment (100% GPS, 88% fuel sensors)

Customer Experience Improvements:
- Digitalized order booking process
- Fully digitalized registration (30% documentation reduction)
- Digital e-invoices with QR codes
- SMS/email alerts on order status
- E2E digital customer complaint desk via Zoho
- Customer satisfaction improvements: Support +16%, Communication +16%, Documentation +7%, Complaint registration +15%, Resolution +5%

Zoho Desk Statistics (30 days):
- 839 new tickets, 718 closed (85.6% closure rate)
- Channels: Email 52.6%, Phone 47.1%, Web 0.3%
- Average handling time: 6.19 hrs (GMDC Ltd.)

System-Based Allocation:
- Dynamic allocation on fortnightly/monthly basis
- CEI-based allocation system
- Total active customers: 1,982
- Customer quota: 11.32 Million Tonnes
- Zone distribution: North ~450,000 Mt, South/East/West ~150,000 Mt each
- Industry allocation: R&Z 30%, C-Power 25%, Other 15%, Cement 10%
- 8-stage allocation process

Integrated Digital Control Tower:
- Market share benchmarking vs GIPCL, GNFC, GSFC, GSPL, GUJGAS, GULALKALI
- Business financial tracking for Lignite and RE/Power segments

Mine Performance:
- 5 mines tracked: BA, MA, RA, TA, UA
- Calorific value range: 3,000-4,800 Kcal/Kg
- Best performing: BA and MA (4,600-4,800 Kcal/Kg)
- Booking efficiency: 80-85% of allotment
- Lifting efficiency: 75-80% of booking
      `,
    },
    {
      title: "Kadipani Fluorspar Asset Action Plan",
      category: "mining_operations",
      content: `
Project Overview:
- Reserves: 4.7 million tons (ML 63.2)
- Plant commissioned: 1973
- Input capacity: 500 TPD
- Ore grade: 21.7% CaF2
- Recovery: 60-70%
- Annual output: 21-23 KTPA
- Mine life: ~30 years

Swarnim JV Status:
- Entity: Swarnim Gujarat Fluorspar Pvt. Ltd. (June 2012)
- Equity: GMDC 50%, GFL 25%, NFIL 25%
- Decision: GMDC to dissolve SGFPL; move to standalone operations
- Reason: Unfavorable JV terms (pricing, supply, commitments, exit)

Financial Performance:
- Historical cash burn (FY12-FY24): INR 118 Cr
- Turnaround plan: -INR 24 Cr EBITDA expected FY25
- Product mix: 55% acid grade, 45% met grade
- Projected cash flow: Q2-Q4 FY25: 3.5, 9.8, 10.4 Cr; FY26-28: 34 Cr/year
- Recovery horizon: 4-5 years (FY25-FY29)

JV Model Impact:
- JV revenue loss: INR 1,765 Cr
- GMDC potential loss: INR 2,785 Cr (pricing 883 + ore 750 + REE 1,152)
- GFL/NFIL savings: INR 1,765 Cr

Market Positioning:
- India imports: ~300 KTPA (Acid 250, Met 50)
- Kadipani output: ~20 KTPA
- GMDC market share: Acid 5-6%, Met 25-30%
- Major customers: GFL (32%), NFIL (20%), SRF (36%), Tanfac (10%)

REE and Atomic Minerals:
- 0.5% potential REE in fluorspar tailings
- Niobium found up to 1200 ppm
- AMCR Rule 5: Above 100 ppm, only State/Central Govt entities can mine

Closure Timeline:
- 14.09.2023: GMDC reply to CMO
- 12.10.2023: ACS IMD meeting
- 20.10.2023: JS IMD action plan request
- 21.02.2024: Action plan submitted
- 13.03.2024: GFL/NFIL meeting
- 06.05.2024: Closure initiation letter
      `,
    },
    {
      title: "Environmental Sustainability and Governance",
      category: "compliance_legal",
      content: `
International Framework:
- 1972: UN Stockholm Conference (PM Indira Gandhi emphasis)
- 1987: Brundtland Report "Our Common Future"
- 1992: Rio Conference - Agenda 21, Rio Declaration, UNFCCC, CBD

Constitutional Provisions:
- Art. 48A: State to protect environment, forests, wildlife
- Art. 51A(g): Citizen duty to protect natural environment
- Art. 21: Right to life (includes healthy environment)

Key Environmental Acts:
- 1974: Water (Prevention and Control of Pollution) Act
- 1981: Air (Prevention and Control of Pollution) Act
- 1986: Environment (Protection) Act
- 2010: National Green Tribunal Act
- 2005: Right to Information Act

Implementation Machinery:
- State Pollution Control Boards (SPCBs)
- Central Pollution Control Board (CPCB)
- Ministry of Environment and Forests
- Coastal Zone Management Authorities

NGT Framework:
- Composition: Chairperson, 10-20 Judicial Members, 10-20 Expert Members
- Jurisdiction: Original (Section 14), Compensation (Section 15), Appellate (Section 16)
- Principles: Sustainable Development, Precautionary, Polluter Pays
- Penalties: Up to INR 10 Cr/25 Cr; imprisonment; INR 25,000/day for continuing violations
- Benches: Principal (Delhi); Circuits (Chennai, Kolkata, Pune, Bhopal)

Recent Mining Cases:
- Aravalli illegal mining (Sikar, Rajasthan) - NGT notice 24/05/2024
- Barakar River sand mining (Dhanbad, Jharkhand) - NGT notice 24/05/2024
- Meghalaya rat-hole mining ban (2014)
- SC 2018: Goa iron ore leases (Vedanta) cancelled

Policy Initiatives:
- EIA Notification 2006
- CREP (Corporate Responsibility for Environmental Protection)
- CETPs; ambient air quality standards
- Clean technology: 97% chlor-alkali conversion to membrane cell
- National Afforestation Programme
- River cleaning; wetlands/mangroves protection
- Waste minimization; zero discharge; recycling

Outcomes:
- Reduced industrial and vehicular pollution
- CNG adoption; clean fuel buses; metro rail
- Public participation in EIA
- Transparency in compliance
- Specialized environmental adjudication via NGT
      `,
    },
  ],
}

async function ingestKnowledge() {
  console.log("🚀 Starting GMDC Knowledge Base ingestion...")

  // Initialize clients
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
  })

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set in .env.local")
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set in .env.local")
  }
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set in .env.local")
  }

  console.log("✓ Environment variables loaded successfully")

  try {
    // Create knowledge base document
    const { data: kbDoc, error: kbError } = await supabase
      .from("knowledge_base_documents")
      .insert({
        title: GMDC_KNOWLEDGE.title,
        source_type: "manual",
        metadata: {
          ingestion_date: new Date().toISOString(),
          sections: GMDC_KNOWLEDGE.sections.length,
        },
      })
      .select()
      .single()

    if (kbError) throw kbError

    console.log(`✅ Created knowledge base document: ${kbDoc.id}`)

    // Process each section
    for (const section of GMDC_KNOWLEDGE.sections) {
      console.log(`\n📄 Processing section: ${section.title}`)

      // Split content into chunks (max 1000 chars per chunk)
      const chunks = splitIntoChunks(section.content, 1000)
      console.log(`   Split into ${chunks.length} chunks`)

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i]

        // Generate embedding
        const embeddingResponse = await openai.embeddings.create({
          model: "text-embedding-3-small",
          input: chunk,
        })

        const embedding = embeddingResponse.data[0].embedding

        // Store chunk
        const { error: chunkError } = await supabase.from("knowledge_base_chunks").insert({
          document_id: kbDoc.id,
          content: chunk,
          embedding: embedding,
          metadata: {
            section_title: section.title,
            category: section.category,
            chunk_index: i,
            total_chunks: chunks.length,
          },
        })

        if (chunkError) throw chunkError

        console.log(`   ✓ Chunk ${i + 1}/${chunks.length} ingested`)
      }
    }

    console.log("\n✅ Knowledge base ingestion completed successfully!")
    console.log(`📊 Total sections: ${GMDC_KNOWLEDGE.sections.length}`)
  } catch (error) {
    console.error("❌ Error during ingestion:", error)
    throw error
  }
}

function splitIntoChunks(text: string, maxChunkSize: number): string[] {
  const chunks: string[] = []
  const paragraphs = text.split("\n\n").filter((p) => p.trim())

  let currentChunk = ""

  for (const paragraph of paragraphs) {
    if ((currentChunk + paragraph).length > maxChunkSize && currentChunk) {
      chunks.push(currentChunk.trim())
      currentChunk = paragraph
    } else {
      currentChunk += (currentChunk ? "\n\n" : "") + paragraph
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim())
  }

  return chunks
}

// Run ingestion
ingestKnowledge()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
