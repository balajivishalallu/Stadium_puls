# StadiaPulse AI — Frontend UI/UX Overhaul Tasks

## Foundation
- [x] Update `globals.css` — unified design system, new animations, utility classes
- [x] Update `app/layout.tsx` — unified background (#06060f)
- [x] Create `components/shared/FooterBar.tsx` — shared rich footer
- [x] Remove Google Fonts dependencies to allow fast offline compilation

## New Feature Components
- [x] Create `components/fan/DirectionCards.tsx` — transport direction cards
- [x] Create `components/organizer/StadiumMap.tsx` — interactive SVG stadium map with Gates, Seating Sections, and Concessions layers
- [x] Create `components/fan/DynamicRerouteAdvisory.tsx` — dynamic blueprint SVG routing map
- [x] Create `components/fan/FanEngagement.tsx` — live poll voting card and alert chat board

## Fan Page Updates
- [x] Update `FanHeader.tsx` — 72px, logo italic styling, theme toggle, and notification bell button dropdown card
- [x] Update `FanPortal.tsx` — welcome banner, section labels, DirectionCards, FooterBar, and FanEngagement card widget
- [x] Update `GateGrid.tsx` — bigger cards, responsive grid, theme-aware
- [x] Update `AllegianceMapper.tsx` — theme-aware, better hover, bigger icons
- [x] Update `ConcessionHub.tsx` — theme-aware, wait-time badges
- [x] Remove `LiveScoreWidget` scoreboard from Fan page

## Smart Concierge & Routing Fixes
- [x] Fix chat bot stream duplicate-read bug in `/api/chat/route.ts`
- [x] Fix SpeechRecognition lifecycle triggers and mock simulation fallback
- [x] Make route triggers inclusive for all concession, medical, seat, and transit keywords
- [x] Add multilingual keywords (ES, FR, PT, AR) for directional trigger and routing categories
- [x] Add dynamic SVG pathing to DynamicRerouteAdvisory
- [x] Overhaul Dynamic Reroute Advisory 2D blueprint map visuals
- [x] Integrate structured Gemini JSON chat route responses with direct route updates

## Organizer Page Updates
- [x] Update `OrgHeader.tsx` — 72px, gradient logo, glassmorphism, theme toggle
- [x] Update `OrgPortal.tsx` — BulkUpload at top, StadiumMap, FooterBar, section labels
- [x] Update `StatsRow.tsx` — bigger values, gradient accents, theme-aware
- [x] Update `XAIPanel.tsx` — theme-aware, improved reasoning section
- [x] Remove `LiveScoreWidget` scoreboard from Organizer page
- [x] Fix layout height stretching of bottom widgets (Log, Chat, Poll) to a uniform `h-[380px]`
- [x] Wire up `BroadcastChannel` in global state to sync emergency alerts and metrics across tabs
- [x] Update `PollManager.tsx` options container with max-height scroll and nextPoll sync push triggers
- [x] Update `ChatMonitor.tsx` to read dynamic store chatMessages

## Home Page Updates
- [x] Clean up header by removing non-functional links (`SCHEDULE`, `NEWS`, `VENUE DATA`) and divider

## Key Override & Security Firewalls
- [x] Create settings settings drawer button in headers (`⚙️`)
- [x] Store custom API key in Zustand and local storage
- [x] Configure safety firewall filtering prompt injections, toxicity levels, and output PII leaks

## Firestore Real-Time Sync & Safety
- [x] Bind sendFanChatMessage, votePollOption, addCustomPoll, and nextPoll to write to Firestore
- [x] Hook up onSnapshot listeners to subscribe to chats, alerts, and polls automatically
- [x] Add optimistic state updates and BroadcastChannel local sync backups for interface resilience
- [x] Attach error callback functions to all Firestore subscriptions to catch permissions/index errors

## Verification
- [x] Run `npm install`
- [x] Build and Lint check (completed successfully)
