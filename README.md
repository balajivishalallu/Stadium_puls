# 🏟️ StadiaPulse AI — FIFA World Cup 2026 Operations Platform

> **Next-Generation Stadium Intelligence & Tactical Fan Rerouting Engine**

[![Next.js](https://img.shields.io/badge/Next.js-16.2_Turbopack-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-12.16_Realtime-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Gemini API](https://img.shields.io/badge/Gemini_API-1.5_Flash-8E7CC3?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0_Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

---

## 1. Project Overview

StadiaPulse AI is a real-time, GenAI-driven stadium operations and tournament experience platform built specifically for the extreme high-density logistical demands of the **FIFA World Cup 2026**.

The system features a **Dual-Persona Architecture**:
- **Fan Portal (Tactical Command)**: Provides fans with real-time concourse congestion telemetry, accessible step-free route advisories, AI-driven concession queue estimation, and ARIA (multilingual AI concierge).
- **Organizer Portal (Command Cockpit)**: Empowers matchday directors with AI-generated Explainable AI (XAI) operational directives, real-time gate density telemetry charts, incident management logs, and stadium-wide emergency broadcast controls.

### 1.1 Tool Choices & Justification
- **Next.js 16 (App Router + Turbopack)**: Chosen for sub-second UI responsiveness, instant client-side transitions, native serverless API route capabilities (`/api/chat`, `/api/concessions`, `/api/route`), and automatic SSR hydration security.
- **Firebase (Auth & Realtime Firestore)**: Selected to enable low-latency multi-device state synchronization across thousands of simultaneous fan and organizer devices without maintaining complex WebSocket server infrastructure.
- **Google Gemini API (`gemini-1.5-flash`)**: Selected as the reasoning engine for complex incident triage, structured pathfinding, multi-language conversational concierge support, and Explainable AI (XAI) directive generation.

### 1.2 The Prompt Evolution Story
Engineering GenAI for high-stakes stadium operations required moving away from unconstrained text outputs:
1. **Phase 1 — Unstructured Text**: Early prompts returned raw conversational strings. While friendly, they were impossible to parse into actionable UI components (such as interactive map coordinates or structured route steps).
2. **Phase 2 — Markdown Fences**: Adding JSON instructions led to LLM output wrapped in ```json fences, which frequently broke client-side JSON parsing during network drops or partial token streaming.
3. **Phase 3 — Strictly Typed JSON Payloads & Robust Parsing**: We engineered system instructions enforcing strict JSON output schemas (`{ "text": string, "route": RouteObject | null }`) combined with a robust regex extraction firewall (`/\{[\s\S]*\}/`). This guarantees crash-proof, high-fidelity operational outputs that seamlessly drive both text chat and graphical HUD components.

### 1.3 Division of Labor (AI vs. Frontend HUD)
- **GenAI Reasoning Layer**: Handles high-level cognitive tasks — calculating crowd density risk scores, generating XAI operational directives, triaging incident severity, and translating natural language in 15+ languages.
- **Frontend HUD & State Engine (Zustand + React)**: Handles real-time telemetry rendering, zero-lag UI component updates, offline localStorage fallback state synchronization, interactive gate density heatmaps, and gaming-HUD tactical radar maps.

### 1.4 The "Before & After" Operational Shift

| Operational Scenario | Traditional Stadium Reality (Before) | StadiaPulse AI Environment (After) |
|---|---|---|
| **Concourse Bottlenecks** | 45-minute congestion queues at main gates with static signage. | Dynamic, real-time AI rerouting diverting fans to underutilized gates. |
| **Emergency Incidents** | Delayed radio calls between stewards; panic near affected sectors. | Instant XAI incident triage + one-click targeted broadcast directives. |
| **Fan Assistance** | Long lines at information desks with language barriers. | Multilingual ARIA AI concierge providing instant 15+ language support. |
| **Accessibility Routing** | Wheelchair users stranded at unexpected stairwells. | Step-free route computation automatically bypassing bottlenecks. |

---

## 2. The Engineering Problem

During mega-sporting events like the FIFA World Cup 2026, stadiums like MetLife Stadium host over 80,000 fans simultaneously. This creates massive operational hazards:
1. **Critical Gate Bottlenecking**: Sudden surges of 10,000+ fans arriving at a single entry gate (e.g. Gate B) create severe safety crushes.
2. **Emergency Path Obstruction**: Medical or security incidents require immediate steward response, but crowded main concourses block traditional routes.
3. **Information Asymmetry**: Fans lack real-time visibility into queue wait times, accessible lifts, and food availability, leading to uniform crowd clustering.

StadiaPulse AI solves these problems by turning raw stadium telemetry into dynamic rerouting advisories for fans and actionable XAI directives for venue directors.

---

## 3. Technical Stack

- **Core Framework**: Next.js 16.2.10 (App Router, Turbopack)
- **Language**: TypeScript 5.0 (Strict mode)
- **Styling & HUD Aesthetics**: Vanilla CSS & Tailwind CSS 4.0 (Dark Mode, Glassmorphism)
- **Real-Time State & Sync**: Firebase 12.16.0 (Anonymous Auth + Firestore Realtime Listeners), Zustand 5.0
- **GenAI Engine**: Google Gemini API (`gemini-1.5-flash` via `@google/generative-ai`)
- **Data Visualization & Animations**: Framer Motion 12.0, Recharts 3.9

---

## 4. Key GenAI Features

### 🛡️ 1. Explainable AI (XAI) Directive Panel
The Organizer Command Cockpit features an AI reasoning engine that analyzes stadium gate density, wait times, and incident logs to generate actionable directives. Each recommendation includes an explicit "Why" reasoning breakdown, confidence rating, and one-click broadcast deployment.

### 🎯 2. Gaming-HUD Tactical Radar Map
A high-tech stadium tactical radar component featuring live gate metrics, density status indicators (LOW, MODERATE, HIGH, BOTTLE-NECK), interactive gate selection, and real-time path guidance designed like a modern gaming heads-up display.

### 🤖 3. ARIA — Multilingual AI Stadium Concierge
Powered by Gemini 1.5 Flash, ARIA provides real-time conversational assistance in 15+ languages (English, Spanish, French, Arabic, Portuguese, German, Japanese, Korean, etc.). ARIA handles food queries, WiFi info, lost & found claims, team trivia (e.g. team captains, rosters), and match details without crashing or suppressing location information.

---

## 5. How to Run & Setup

### Prerequisites
- Node.js 18.x or 20.x installed
- npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/Mani-kanta-0539/stadiapulse.git
cd stadiapulse
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the project root:
```env
GEMINI_API_KEY=your_gemini_api_key_here

NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production Build
```bash
npm run build
npm run start
```

---

## 6. Innovation Breakdown: Zero Hard-Coded Pages

StadiaPulse AI is built as a **100% dynamic, live-state application**:
- **Zero Hard-Coded Views**: All fan routes, concession queue wait times, incident alerts, and gate metrics are dynamically calculated from live telemetry and Gemini AI outputs.
- **Hybrid Offline Resilience**: If network connection drops or Firebase is restricted, the app automatically switches to an internal smart offline fallback engine stored in LocalStorage, ensuring zero white-screen crashes or interrupted fan experiences.
