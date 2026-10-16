import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'
import { NextResponse } from 'next/server'
import { generateConciergeResponse, getLocalFallbackRoute } from '@/lib/concierge'
import { z } from 'zod'
import { checkRateLimit } from '@/lib/rate-limit'

// Rule 3: Schema validation
const ChatRequestSchema = z.object({
  message: z.string().max(1000).optional().default(''),
  venueName: z.string().max(100).optional().default('metlife'),
  userGate: z.string().max(10).optional().default('A1'),
  userTeam: z.string().max(100).optional().default('Spain'),
  userAccess: z.string().max(100).optional().default('No Specific Needs'),
  userLanguage: z.string().max(10).optional().default('EN'),
  customApiKey: z.string().max(500).optional().default(''),
})

export async function POST(req: Request) {
  // Rule 2: Rate Limiting (10 requests per minute for AI endpoints)
  const rateLimitResponse = checkRateLimit(req, 10)
  if (rateLimitResponse) return rateLimitResponse

  let validatedData;
  try {
    const body = await req.json()
    validatedData = ChatRequestSchema.parse(body)
  } catch (err) {
    // Rule 9: Never return internal errors, but 400 for bad input is fine
    return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 })
  }

  const { message, venueName, userGate, userTeam, userAccess, userLanguage, customApiKey } = validatedData

  // 1. INPUT INSPECTION FIREWALL (Guardrails against Prompt Injection & Jailbreak attacks)
  const lowerMsg = message.toLowerCase()
  const injectionTriggers = [
    'system prompt', 'system instruction', 'ignore previous', 'jailbreak',
    'override instructions', 'developer mode', 'dan mode', 'bypass safety',
    'you are now', 'instead of'
  ]
  const isFlagged = injectionTriggers.some(trigger => lowerMsg.includes(trigger))
  if (isFlagged) {
    console.warn('🛡️ LLM Firewall Blocked Input:', message)
    return NextResponse.json({
      text: '🛡️ StadiaPulse AI Security Firewall: Message blocked. Potential prompt injection or system override instructions detected.',
      route: null
    })
  }

  // Common response utility
  const generateOfflineJSON = (msgText: string) => {
    const localRes = generateConciergeResponse(msgText, venueName || 'metlife', userGate, userTeam)
    const localRoute = getLocalFallbackRoute(msgText, userGate)
    return {
      text: localRes.conversationalResponse,
      route: localRoute
    }
  }

  try {
    // 2. Select API Key (Client Override settings vs Server Environment variables)
    const apiKey = customApiKey.trim() !== '' ? customApiKey : process.env.GEMINI_API_KEY
    if (!apiKey || apiKey.trim() === '') {
      console.warn('Gemini API key is not configured. Falling back to local offline smart engine.')
      return NextResponse.json(generateOfflineJSON(message))
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const systemInstruction = `
      You are ARIA, the intelligent AI Concierge and assistant for StadiaPulse AI at the FIFA World Cup 2026.
      You are assisting a fan at ${venueName}.
      
      Fan Info:
      - Current Entry Gate: ${userGate}
      - Supported Team: ${userTeam}
      - Accessibility Profile: ${userAccess}
      - Preferred Language: ${userLanguage || 'EN'}

      YOUR ROLE & GUIDELINES:
      1. Answer ALL questions asked by the user clearly, helpfully, and friendly in their preferred language (${userLanguage || 'EN'}).
      2. If the user asks about people, team leaders, captains, staff, stadium personnel, rules, match details, sports trivia, or team info: answer directly, warmly, and completely in your "text" field. (For example, if asked about team captains like Brazil captain, answer Danilo / Marquinhos).
      3. If the user asks about locations, directions, gates, concessions, restrooms, first aid, or transit: answer their question directly in "text" WITH exact location details, AND ALSO generate a structured "route" object if relevant.
      4. Always maintain an encouraging, helpful assistant persona for the FIFA World Cup 2026.

      RESPONSE FORMAT REQUIREMENTS:
      You MUST respond with a valid raw JSON object matching this schema:
      {
        "text": "Your conversational answer to the fan in ${userLanguage || 'EN'}. Keep it friendly, clear, and informative. Do not suppress information or defer location details.",
        "route": null | {
          "active": true,
          "title": "Short route title",
          "from": "Start location",
          "to": "Target destination name",
          "steps": ["Step 1...", "Step 2..."],
          "reasoning": "Explanation of path",
          "isAccessible": boolean
        }
      }

      Set "route" to an object ONLY if the user query is about directions, navigation, transit, concessions, exits, restrooms, or medical rooms. Otherwise, set "route" to null.
      Respond ENTIRELY in JSON. Do NOT wrap in markdown code blocks like \`\`\`json. Return raw JSON text only.
    `

    // Configure model safety parameters
    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ]

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction,
      safetySettings,
      generationConfig: {
        maxOutputTokens: 500,
      }
    })

    const result = await model.generateContent(message)
    let responseText = result.response.text()

    // Fall back to local smart response if model output is blank
    if (!responseText || responseText.trim() === '') {
      return NextResponse.json(generateOfflineJSON(message))
    }

    // 3. OUTPUT INSPECTION FIREWALL (Guardrails against PII Leakage)
    responseText = responseText
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[MASKED EMAIL]')
      .replace(/\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g, '[MASKED CARD]')

    // Extract JSON payload or use conversational text directly
    let parsedText = responseText.trim()
    let parsedRoute = null

    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try {
        const jsonObj = JSON.parse(jsonMatch[0])
        if (jsonObj && typeof jsonObj.text === 'string' && jsonObj.text.trim()) {
          parsedText = jsonObj.text.trim()
          parsedRoute = jsonObj.route || null
        }
      } catch (e) {
        // Fall back to plain responseText if JSON parsing fails
      }
    }

    const localRoute = parsedRoute || getLocalFallbackRoute(message, userGate)

    return NextResponse.json({
      text: parsedText,
      route: localRoute
    })
  } catch (error) {
    console.error('Gemini API Error, using local fallback')
    return NextResponse.json(generateOfflineJSON(message))
  }
}
