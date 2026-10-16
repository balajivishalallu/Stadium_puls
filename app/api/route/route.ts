import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'
import { NextResponse } from 'next/server'
import { getLocalFallbackRoute } from '@/lib/concierge'
import { z } from 'zod'
import { checkRateLimit } from '@/lib/rate-limit'

const RouteSchema = z.object({
  destination: z.string().max(200).optional().default(''),
  venueName: z.string().max(100).optional().default('MetLife Stadium'),
  userGate: z.string().max(10).optional().default('A'),
  userAccess: z.string().max(100).optional().default('No Specific Needs'),
  customApiKey: z.string().max(500).optional().default(''),
})

/**
 * Dedicated Pathfinding API — only called by DynamicRerouteAdvisory
 * Returns a structured navigation route object (never plain chat text)
 */
export async function POST(req: Request) {
  // Rule 2: Rate Limiting
  const rateLimitResponse = checkRateLimit(req, 10)
  if (rateLimitResponse) return rateLimitResponse

  let validatedData;
  try {
    const body = await req.json()
    validatedData = RouteSchema.parse(body)
  } catch (err) {
    return NextResponse.json({ route: null, error: 'Invalid request payload' }, { status: 400 })
  }

  const { destination, venueName, userGate, userAccess, customApiKey } = validatedData

  if (!destination.trim()) {
    return NextResponse.json({ route: null, error: 'No destination provided.' })
  }

  // Local offline fallback always available
  const localRoute = getLocalFallbackRoute(destination, userGate)

  try {
    const apiKey = customApiKey.trim() !== '' ? customApiKey : process.env.GEMINI_API_KEY
    if (!apiKey || apiKey.trim() === '') {
      return NextResponse.json({ route: localRoute })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const systemInstruction = `
      You are a stadium navigation system for FIFA World Cup 2026 at ${venueName}.
      The fan entered Gate ${userGate}. Accessibility: ${userAccess}.

      TASK: Generate a detailed navigation route to reach this destination: "${destination}"

      Common destinations at ${venueName}:
      - Gates: Gate A (North entrance), Gate B (East entrance), Gate C (South entrance), Gate D (West entrance)
      - Seating: Sections 100-130 (lower bowl), Sections 200-240 (upper bowl)
      - Concessions: Modelo Cantina (near Section 104), East Hall Food Court (Section 112), Pitch Side Grill (Section 120)
      - Medical: First Aid Plaza East (Section 110), First Aid Plaza West (Section 104)
      - Exit/Transit: Meadowlands Rail Station (Exit via Gate B), Rideshare Lot G (Exit via Gate C), Parking Lot A-F (Exit via Gate D)
      - Restrooms: Located every 10 sections on all levels
      - Outside Stadium: Exit via Gate B to rail, or Gate C to rideshare/parking

      You MUST respond with ONLY a valid JSON object (no markdown, no extra text):
      {
        "active": true,
        "title": "Short route title",
        "from": "Gate ${userGate}",
        "to": "Exact destination name",
        "steps": [
          "Step 1: Clear, specific walking instruction",
          "Step 2: ...",
          "Step 3: ...",
          "Step 4: ..."
        ],
        "reasoning": "1-2 sentences: why this path was chosen (crowd density, accessibility, efficiency)",
        "isAccessible": ${userAccess !== 'No Specific Needs' ? 'true' : 'false'}
      }

      Rules:
      - steps must be 3-5 concrete, actionable walking directions
      - If destination is unclear, route to the nearest reasonable stadium feature
      - Always return a valid route — never return null or an error
      - "outside stadium" or "exit" means route to the rail/transit station at Gate B
    `

    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ]

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction,
      safetySettings,
      generationConfig: {
        maxOutputTokens: 500, // Token budget
      }
    })

    const result = await model.generateContent(`Find the route to: ${destination}`)
    let responseText = result.response.text().trim()

    if (!responseText) {
      return NextResponse.json({ route: localRoute })
    }

    // Strip markdown code fences if present
    responseText = responseText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim()

    try {
      const parsed = JSON.parse(responseText)
      if (parsed && parsed.steps && Array.isArray(parsed.steps)) {
        return NextResponse.json({ route: parsed })
      }
      return NextResponse.json({ route: localRoute })
    } catch (parseErr) {
      console.warn('Pathfinding: Failed to parse Gemini JSON, using local fallback')
      return NextResponse.json({ route: localRoute })
    }
  } catch (error) {
    console.error('Pathfinding Gemini API error, using local fallback')
    return NextResponse.json({ route: localRoute })
  }
}
