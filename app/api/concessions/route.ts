import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { checkRateLimit } from '@/lib/rate-limit'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

const ConcessionsSchema = z.object({
  userGate: z.string().max(10).optional().default('A'),
  userTeam: z.string().max(100).optional().default('Any'),
  userAccess: z.string().max(100).optional().default('None'),
  concessions: z.array(z.any()).optional().default([]), // More specific type validation is better, but this suffices for the mock data
})

export async function POST(req: Request) {
  // Rule 2: Rate Limiting
  const rateLimitResponse = checkRateLimit(req, 10)
  if (rateLimitResponse) return rateLimitResponse

  let validatedData;
  try {
    const body = await req.json()
    validatedData = ConcessionsSchema.parse(body)
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 })
  }

  const { userGate, userTeam, userAccess, concessions } = validatedData

  try {
    const systemInstruction = `
      You are the AI Food & Concession Navigator for StadiaPulse AI at the FIFA World Cup 2026.
      Your task is to write a highly personalized, creative, and sports-centric food recommendation tip for a fan.
      Fan Context:
      - Entry Gate: ${userGate}
      - Supported Team: ${userTeam}
      - Accessibility Needs: ${userAccess}

      Available Concession Stands Nearby:
      ${JSON.stringify(concessions, null, 2)}

      Guidelines:
      1. Write a single, energetic, concise sentence (maximum 25 words).
      2. Recommend the absolute best option for them based on proximity (gate matches) and short wait times.
      3. Reference their supported team's vibes or a food item matching their team where appropriate (e.g. Tacos for Mexico, Waffles for Belgium, Tapas/Chorizo for Spain, Falafel/Koshary for Egypt, Asado for Argentina).
      4. If the user has accessibility needs, recommend stands that are on level ground or have elevator access.
      5. Do not include markdown formatting like bold asterisks — return plain text.
    `

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction,
      generationConfig: {
        maxOutputTokens: 100, // Token budget
      }
    })

    const prompt = 'Generate my custom food recommendation tip.'
    const result = await model.generateContent(prompt)
    const responseText = result.response.text().trim()

    return NextResponse.json({ text: responseText })
  } catch (error) {
    console.error('Gemini Concessions API Error')
    return NextResponse.json({ text: 'Grab a hot snack near your section before the second half kicks off!' })
  }
}
