import { NextResponse, NextRequest } from 'next/server'
import { StructuralScoreCard } from '@/types'
import { checkRateLimit } from '@/lib/rate-limit'

// Mock fallback matches using standard ESPN country names & stadiums
const MOCK_LIVE_MATCHES: StructuralScoreCard[] = [
  {
    id: 'mock-1',
    teamHomeName: 'Spain',
    teamAwayName: 'Belgium',
    scoreHome: '2',
    scoreAway: '1',
    stadiumName: 'MetLife Stadium (East Rutherford, NJ)',
    isLive: true,
  },
  {
    id: 'mock-2',
    teamHomeName: 'Argentina',
    teamAwayName: 'Egypt',
    scoreHome: '3',
    scoreAway: '2',
    stadiumName: 'Atlanta Stadium (Atlanta, GA)',
    isLive: true,
  },
  {
    id: 'mock-3',
    teamHomeName: 'USA',
    teamAwayName: 'Mexico',
    scoreHome: '0',
    scoreAway: '0',
    stadiumName: 'AT&T Stadium (Arlington, TX)',
    isLive: false,
  },
  {
    id: 'mock-4',
    teamHomeName: 'England',
    teamAwayName: 'Norway',
    scoreHome: '3',
    scoreAway: '1',
    stadiumName: 'Hard Rock Stadium (Miami, FL)',
    isLive: false,
  },
]

export async function GET(req: NextRequest) {
  // Rule 2: Rate Limiting - General API: 60 requests per minute
  const rateLimitResponse = checkRateLimit(req, 60)
  if (rateLimitResponse) return rateLimitResponse

  try {
    const res = await fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard', {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!res.ok) {
      throw new Error(`ESPN API status: ${res.status}`)
    }

    const data = await res.json()
    const events = data?.events || []

    if (events.length === 0) {
      return NextResponse.json(MOCK_LIVE_MATCHES)
    }

    // Map ESPN JSON content to client-side StructuralScoreCard schema
    const matches: StructuralScoreCard[] = events.map((event: any) => {
      const comp = event?.competitions?.[0]
      const statusState = comp?.status?.type?.state || 'pre'
      const isLive = statusState === 'in'

      const competitors = comp?.competitors || []
      const home = competitors.find((c: any) => c.homeAway === 'home')
      const away = competitors.find((c: any) => c.homeAway === 'away')

      return {
        id: event.id,
        teamHomeName: home?.team?.displayName || 'Home Team',
        teamAwayName: away?.team?.displayName || 'Away Team',
        scoreHome: home?.score || '0',
        scoreAway: away?.score || '0',
        stadiumName: comp?.venue?.fullName || 'FIFA World Cup Stadium',
        isLive,
      }
    })

    return NextResponse.json(matches)
  } catch (error) {
    console.error('ESPN Scoreboard Fetch Error') // Hide internal error structure
    return NextResponse.json(MOCK_LIVE_MATCHES)
  }
}
