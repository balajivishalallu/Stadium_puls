export type Role = 'fan' | 'organizer'
export type RiskLevel = 'LOW' | 'MEDIUM' | 'CRITICAL'
export type ConciergeMode = 'STANDARD' | 'EMERGENCY' | 'BAGGAGE_CLAIM'
export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH'
export type IncidentStatus = 'Active' | 'Monitoring' | 'Resolved'
export type Language = 'EN' | 'ES' | 'FR' | 'AR' | 'PT'

export interface Gate {
  id: string; name: string; subGates: string[]; location: string; accessibleRoutes: string[]; capacity: number
}
export interface Level { name: string; sections: string; description: string }
export interface FirstAidStation { id: string; section: string; level: string; location: string; type: string }
export interface TransportOption { type: string; name: string; details: string; frequency: string; status: string }
export interface Concession { section: string; name: string; type: string; items: string; waitTime: string }
export interface FanZone { name: string; description: string; teams: string[] }

export interface Stadium {
  id: string; name: string; city: string; country: string; capacity: number; expandedCapacity?: number
  fieldType: string; roof: string; opened: number; coordinates: string; address: string
  gates: Gate[]; levels: Level[]; firstAid: FirstAidStation[]; transport: TransportOption[]
  concessions: Concession[]; vip?: string[]; fanZones?: FanZone[]; wifi: string
}

export interface GateMetric {
  gateId: string; currentCapacity: number; trend: 'rising' | 'stable' | 'falling'
  riskLevel: RiskLevel; lastUpdated: string
}
export interface GateStatusAnalysis { gateId: string; currentCapacityPercentage: number; riskLevel: RiskLevel }
export interface RecommendedDirective {
  actionRequired: boolean; targetZone: string; mitigationStrategy: string
  fanBroadcastMessage: string; reasoning: string
}
export interface XAIReport {
  gateStatusAnalysis: GateStatusAnalysis[]; recommendedDirective: RecommendedDirective
  critical: [string, GateMetric][]; medium: [string, GateMetric][]
}
export interface UiActionPayload {
  highlightMapElementId: string | null; triggerAccessibleRouting: boolean
  nearestFacilityCoordinates: string | null; sherlockMatchKeywords: string[]
}
export interface ConciergeResponse {
  detectedContext: ConciergeMode; userLanguage: string; urgencyLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  conversationalResponse: string; uiActionPayload: UiActionPayload; richCard?: 'EMERGENCY' | 'BAGGAGE' | null
}
export interface LostItem { id: string; item: string; location: string; timeFound: string; status: string; keywords: string[]; matchScore?: number }
export interface MerchandiseHub { name: string; icon: string; distance: string; section: string; desc: string; team: string }
export interface FanChatMessage { user: string; flag: string; msg: string; lang: string; type: 'normal' | 'flagged' | 'critical'; flag_reason?: string }
export interface PollOption { label: string; votes: number }
export interface Poll { question: string; options: PollOption[] }
export interface Incident { id: string; time: string; type: string; severity: IncidentSeverity; gate: string; desc: string; status: IncidentStatus }
export interface Team { flag: string; name: string; group: string; color: string }
export interface FanProfile { name: string; lang: Language; venue: string; gate: string; team: string; access: string }
export interface OrgProfile { name: string; staffId: string; venue: string; role: string; shift: string }
export interface AlertPayload { active: boolean; title: string; message: string; gateId: string; timestamp: string }
export interface MatchFixture { team1: { flag: string; name: string }; team2: { flag: string; name: string }; score: [number, number]; minute: number; venue: string }

export interface LiveMatch {
  id: string;
  homeTeam: { name: string; logo: string; score: string; favorite: boolean };
  awayTeam: { name: string; logo: string; score: string; favorite: boolean };
  status: 'PRE' | 'LIVE' | 'POST';
  clock: string;
  venue: string;
}

export interface StructuralScoreCard {
  id: string;
  teamHomeName: string;      // The clean display country name (e.g., "Argentina")
  teamAwayName: string;      // The clean display country name (e.g., "Egypt")
  scoreHome: string;         // Current numeric score string
  scoreAway: string;         // Current numeric score string
  stadiumName: string;       // Extracted from the structural data block (e.g., "Atlanta Stadium")
  isLive: boolean;           // Status flag check if game is actively running
}
