'use client'
import { create } from 'zustand'
import { FanProfile, OrgProfile, GateMetric, AlertPayload, FanChatMessage, Poll } from '@/types'
import { auth, db, saveUserProfile } from '@/lib/firebase'
import { signOut } from 'firebase/auth'
import { FAN_CHAT_MESSAGES, POLLS } from '@/data/gameData'
import { collection, doc, setDoc, addDoc, onSnapshot, query, limit } from 'firebase/firestore'

export interface RouteAdvisory {
  active: boolean
  title: string
  from: string
  to: string
  steps: string[]
  reasoning: string
  isAccessible: boolean
}

interface GlobalState {
  // Auth
  role: 'fan' | 'organizer' | null
  fanProfile: FanProfile | null
  orgProfile: OrgProfile | null
  activeVenue: string
  authLoading: boolean
  theme: 'dark' | 'light'

  // Live metrics
  gateMetrics: Record<string, GateMetric>
  broadcastAlert: AlertPayload
  alertsList: AlertPayload[]
  routeAdvisory: RouteAdvisory | null

  // Match
  matchMinute: number
  matchScore: [number, number]

  // Concierge & API Key settings
  conciergeMode: 'STANDARD' | 'EMERGENCY' | 'BAGGAGE_CLAIM'
  customApiKey: string
  firestoreSynced: boolean

  // Poll & Chat
  pollsList: Poll[]
  pollIndex: number
  pollVotes: Record<number, Record<number, number>>
  chatMessages: FanChatMessage[]

  // Actions
  setRole: (role: 'fan' | 'organizer' | null) => void
  setFanProfile: (p: FanProfile) => void
  setOrgProfile: (p: OrgProfile) => void
  setAuthLoading: (loading: boolean) => void
  setActiveVenue: (v: string) => void
  setGateMetrics: (m: Record<string, GateMetric>) => void
  updateGateMetric: (id: string, m: Partial<GateMetric>) => void
  broadcastDirective: (payload: AlertPayload) => void
  cancelBroadcast: () => void
  tickMatchMinute: () => void
  goalScored: (team: 1 | 2) => void
  setConciergeMode: (m: 'STANDARD' | 'EMERGENCY' | 'BAGGAGE_CLAIM') => void
  setCustomApiKey: (key: string) => void
  nextPoll: () => void
  addCustomPoll: (poll: Poll) => void
  votePollOption: (pollIdx: number, optionIdx: number) => void
  sendFanChatMessage: (msg: FanChatMessage) => void
  toggleTheme: () => void
  setRouteAdvisory: (advisory: RouteAdvisory | null) => void
  initFirestoreSync: (force?: boolean) => void
  logout: () => void
}

// BroadcastChannel for cross-tab theme & settings sync fallback
const syncChannel = typeof window !== 'undefined' ? new BroadcastChannel('stadiapulse_sync') : null

let unsubAlerts: (() => void) | null = null
let unsubChats: (() => void) | null = null
let unsubPolls: (() => void) | null = null

export const useGlobalStore = create<GlobalState>((set, get) => ({
  role: null,
  fanProfile: null,
  orgProfile: null,
  activeVenue: 'metlife',
  authLoading: true,
  theme: 'dark',
  gateMetrics: {},
  broadcastAlert: { active: false, title: '', message: '', gateId: '', timestamp: '' },
  alertsList: [
    {
      active: true,
      title: '🏟️ WELCOME TO METLIFE STADIUM',
      message: 'StadiaPulse AI concierge services are online. Accessible routes are operational at HCLTech Gate and Moody\'s Gate. Stewards are on standby to assist you.',
      gateId: 'ALL',
      timestamp: '14:00'
    }
  ],
  routeAdvisory: {
    active: true,
    title: 'Optimal Accessible Path',
    from: 'Gate B',
    to: 'Medical Alpha',
    steps: [
      'Proceed past security checkpoint 4',
      'Bypass Plaza C to avoid bottleneck',
      'Access Lift B to Concourse Level 3'
    ],
    reasoning: 'Path adjusted dynamically to avoid the 30-minute crowd bottleneck currently building at the Main Concourse while ensuring complete step-free elevator access based on your accessibility profile.',
    isAccessible: true
  },
  matchMinute: 67,
  matchScore: [2, 1],
  conciergeMode: 'STANDARD',
  customApiKey: typeof window !== 'undefined' ? localStorage.getItem('stadiapulse_custom_api_key') || '' : '',
  firestoreSynced: false,
  pollsList: POLLS,
  pollIndex: 0,
  pollVotes: {},
  chatMessages: FAN_CHAT_MESSAGES,

  setRole: (role) => {
    set({ role })
    if (role) {
      setTimeout(() => get().initFirestoreSync(true), 50)
    }
  },
  setFanProfile: (fanProfile) => {
    set({ fanProfile, activeVenue: fanProfile.venue })
    const currentUser = auth.currentUser
    if (currentUser) {
      saveUserProfile(currentUser.uid, 'fan', fanProfile)
    }
  },
  setOrgProfile: (orgProfile) => {
    set({ orgProfile, activeVenue: orgProfile.venue })
    const currentUser = auth.currentUser
    if (currentUser) {
      saveUserProfile(currentUser.uid, 'organizer', orgProfile)
    }
  },
  setAuthLoading: (authLoading) => set({ authLoading }),
  setActiveVenue: (activeVenue) => set({ activeVenue }),
  setGateMetrics: (gateMetrics) => {
    set({ gateMetrics })
    syncChannel?.postMessage({ type: 'SET_GATE_METRICS', payload: gateMetrics })
  },
  updateGateMetric: (id, m) => {
    set((state) => ({
      gateMetrics: {
        ...state.gateMetrics,
        [id]: { ...state.gateMetrics[id], ...m },
      },
    }))
    syncChannel?.postMessage({ type: 'UPDATE_GATE_METRIC', payload: { id, m } })
  },

  broadcastDirective: async (payload) => {
    // 1. Optimistic update
    set((state) => ({
      broadcastAlert: payload,
      alertsList: [payload, ...state.alertsList]
    }))
    syncChannel?.postMessage({ type: 'BROADCAST_ALERT', payload })

    // 2. Background Firestore write
    try {
      await addDoc(collection(db, 'alerts'), {
        active: payload.active,
        title: payload.title,
        message: payload.message,
        gateId: payload.gateId,
        createdAt: new Date().toISOString(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })
    } catch (e) {
      console.warn('Firestore alerts write failed. Using local sync fallback.')
    }
  },
  cancelBroadcast: async () => {
    // 1. Optimistic update
    set({ broadcastAlert: { active: false, title: '', message: '', gateId: '', timestamp: '' } })
    syncChannel?.postMessage({ type: 'CANCEL_ALERT' })

    // 2. Background Firestore write
    try {
      await addDoc(collection(db, 'alerts'), {
        active: false,
        title: 'Directive Resolved',
        message: 'Active emergency alerts have been cleared by operations control.',
        gateId: 'ALL',
        createdAt: new Date().toISOString(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })
    } catch (e) {
      console.warn('Firestore alerts cancel failed. Using local sync fallback.')
    }
  },

  tickMatchMinute: () => {
    set((state) => ({ matchMinute: state.matchMinute >= 90 ? 45 : state.matchMinute + 1 }))
    syncChannel?.postMessage({ type: 'SET_MATCH_STATE', payload: { matchMinute: get().matchMinute, matchScore: get().matchScore } })
  },

  goalScored: (team) => {
    set((state) => ({
      matchScore: team === 1
        ? [state.matchScore[0] + 1, state.matchScore[1]]
        : [state.matchScore[0], state.matchScore[1] + 1],
    }))
    syncChannel?.postMessage({ type: 'SET_MATCH_STATE', payload: { matchMinute: get().matchMinute, matchScore: get().matchScore } })
  },

  setConciergeMode: (conciergeMode) => set({ conciergeMode }),
  setCustomApiKey: (customApiKey) => {
    set({ customApiKey })
    if (typeof window !== 'undefined') {
      localStorage.setItem('stadiapulse_custom_api_key', customApiKey)
    }
    syncChannel?.postMessage({ type: 'SET_CUSTOM_API_KEY', payload: customApiKey })
  },

  nextPoll: async () => {
    // 1. Optimistic update
    set((state) => ({ pollIndex: (state.pollIndex + 1) % state.pollsList.length }))
    syncChannel?.postMessage({ type: 'SET_POLL_INDEX', payload: get().pollIndex })

    // 2. Background Firestore write
    try {
      const nextIdx = (get().pollIndex + 1) % get().pollsList.length
      await setDoc(doc(db, 'pollState', 'current'), {
        pollIndex: nextIdx
      }, { merge: true })
    } catch (e) {
      console.warn('Firestore nextPoll write failed. Using local sync fallback.')
    }
  },
  addCustomPoll: async (poll) => {
    // 1. Optimistic update
    set((state) => {
      const updated = [...state.pollsList, poll]
      return {
        pollsList: updated,
        pollIndex: updated.length - 1
      }
    })
    syncChannel?.postMessage({ type: 'ADD_CUSTOM_POLL', payload: poll })

    // 2. Background Firestore write
    try {
      const updatedList = [...get().pollsList, poll]
      await setDoc(doc(db, 'pollState', 'current'), {
        pollsList: updatedList,
        pollIndex: updatedList.length - 1
      }, { merge: true })
    } catch (e) {
      console.warn('Firestore addCustomPoll write failed. Using local sync fallback.')
    }
  },
  votePollOption: async (pollIdx, optionIdx) => {
    // 1. Optimistic update
    set((state) => {
      const currentPollVotes = state.pollVotes[pollIdx] || {}
      const updatedPollVotes = {
        ...state.pollVotes,
        [pollIdx]: {
          ...currentPollVotes,
          [optionIdx]: (currentPollVotes[optionIdx] || 0) + 100
        }
      }
      return { pollVotes: updatedPollVotes }
    })
    syncChannel?.postMessage({ type: 'VOTE_POLL_OPTION', payload: { pollIdx, optionIdx } })

    // 2. Background Firestore write
    try {
      const currentVotes = get().pollVotes
      const currentPollVotes = currentVotes[pollIdx] || {}
      const updatedPollVotes = {
        ...currentVotes,
        [pollIdx]: {
          ...currentPollVotes,
          [optionIdx]: (currentPollVotes[optionIdx] || 0) + 100
        }
      }
      await setDoc(doc(db, 'pollState', 'current'), {
        pollIndex: get().pollIndex,
        pollVotes: updatedPollVotes,
        pollsList: get().pollsList
      }, { merge: true })
    } catch (e) {
      console.warn('Firestore votePollOption write failed. Using local sync fallback.')
    }
  },
  sendFanChatMessage: async (msg) => {
    // 1. Optimistic local update
    const timestamp = new Date().toISOString()
    const timedMsg = { ...msg, timestamp }
    set((state) => ({ chatMessages: [timedMsg, ...state.chatMessages] }))
    syncChannel?.postMessage({ type: 'SEND_FAN_CHAT_MESSAGE', payload: timedMsg })

    // 2. Clean data object to prevent Firestore "invalid data / undefined field" error crashes
    const cleanPayload: Record<string, any> = {
      user: msg.user,
      flag: msg.flag,
      msg: msg.msg,
      lang: msg.lang,
      type: msg.type,
      timestamp
    }
    if (msg.flag_reason) {
      cleanPayload.flag_reason = msg.flag_reason
    }

    // 3. Background Firestore write
    try {
      await addDoc(collection(db, 'chatMessages'), cleanPayload)
    } catch (e) {
      console.warn('Firestore sendFanChatMessage write failed. Using local sync fallback:', e)
    }
  },

  toggleTheme: () => {
    set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' }))
    syncChannel?.postMessage({ type: 'SET_THEME', payload: get().theme })
  },
  setRouteAdvisory: (routeAdvisory) => {
    set({ routeAdvisory })
    syncChannel?.postMessage({ type: 'SET_ROUTE_ADVISORY', payload: routeAdvisory })
  },

  initFirestoreSync: (force = false) => {
    if (get().firestoreSynced && !force) return

    // Clean up any existing listeners before attaching new ones
    unsubAlerts?.()
    unsubChats?.()
    unsubPolls?.()

    set({ firestoreSynced: true })

    // 1. Listen for dynamic dispatcher alerts
    unsubAlerts = onSnapshot(
      query(collection(db, 'alerts'), limit(30)), 
      (snap) => {
        const list: any[] = []
        snap.forEach(doc => {
          list.push(doc.data())
        })
        
        list.sort((a, b) => {
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0
          return timeB - timeA
        })
        
        const defaultAlert = {
          active: true,
          title: '🏟️ WELCOME TO METLIFE STADIUM',
          message: 'StadiaPulse AI concierge services are online. Accessible routes are operational at HCLTech Gate and Moody\'s Gate. Stewards are on standby to assist you.',
          gateId: 'ALL',
          timestamp: '14:00'
        }
        
        const mergedAlerts = [...list]
        if (!mergedAlerts.some(a => a.title === defaultAlert.title)) {
          mergedAlerts.push(defaultAlert)
        }
        
        set({
          alertsList: mergedAlerts,
          broadcastAlert: mergedAlerts[0]
        })
      },
      (error) => {
        console.warn('Firestore alerts listener error:', error)
        set({ firestoreSynced: false })
      }
    )

    // 2. Listen for live fan chat messages
    unsubChats = onSnapshot(
      query(collection(db, 'chatMessages'), limit(30)), 
      (snap) => {
        const msgs: FanChatMessage[] = []
        snap.forEach(doc => {
          msgs.push(doc.data() as FanChatMessage)
        })
        
        msgs.sort((a: any, b: any) => {
          const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0
          const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0
          return timeB - timeA
        })
        
        const merged = [...msgs]
        FAN_CHAT_MESSAGES.forEach(defMsg => {
          if (!merged.some(m => m.msg === defMsg.msg && m.user === defMsg.user)) {
            merged.push(defMsg)
          }
        })
        set({ chatMessages: merged })
      },
      (error) => {
        console.warn('Firestore chats listener error:', error)
        set({ firestoreSynced: false })
      }
    )

    // 3. Listen for live poll synchronization
    unsubPolls = onSnapshot(
      doc(db, 'pollState', 'current'), 
      (snap) => {
        if (snap.exists()) {
          const data = snap.data()
          set({
            pollIndex: data.pollIndex ?? 0,
            pollVotes: data.pollVotes ?? {},
            pollsList: data.pollsList ?? POLLS
          })
        }
      },
      (error) => {
        console.warn('Firestore pollState listener error:', error)
        set({ firestoreSynced: false })
      }
    )
  },

  logout: async () => {
    try {
      await signOut(auth)
    } catch (e) {
      console.error(e)
    }
    localStorage.removeItem('stadiapulse_local_user')
    set({
      role: null,
      fanProfile: null,
      orgProfile: null,
      broadcastAlert: { active: false, title: '', message: '', gateId: '', timestamp: '' },
      routeAdvisory: {
        active: true,
        title: 'Optimal Accessible Path',
        from: 'Gate B',
        to: 'Medical Alpha',
        steps: [
          'Proceed past security checkpoint 4',
          'Bypass Plaza C to avoid bottleneck',
          'Access Lift B to Concourse Level 3'
        ],
        reasoning: 'Path adjusted dynamically to avoid the 30-minute crowd bottleneck currently building at the Main Concourse while ensuring complete step-free elevator access based on your accessibility profile.',
        isAccessible: true
      },
      conciergeMode: 'STANDARD',
      theme: 'dark',
    })
  },
}))

// Listen for cross-tab sync messages (Theme & settings backup)
if (typeof window !== 'undefined' && syncChannel) {
  syncChannel.addEventListener('message', (event) => {
    const { type, payload } = event.data
    if (type === 'SET_GATE_METRICS') {
      useGlobalStore.setState({ gateMetrics: payload })
    } else if (type === 'UPDATE_GATE_METRIC') {
      const current = useGlobalStore.getState().gateMetrics
      useGlobalStore.setState({
        gateMetrics: {
          ...current,
          [payload.id]: { ...current[payload.id], ...payload.m }
        }
      })
    } else if (type === 'SET_ROUTE_ADVISORY') {
      useGlobalStore.setState({ routeAdvisory: payload })
    } else if (type === 'SET_MATCH_STATE') {
      useGlobalStore.setState({ matchMinute: payload.matchMinute, matchScore: payload.matchScore })
    } else if (type === 'SET_THEME') {
      useGlobalStore.setState({ theme: payload })
    } else if (type === 'SET_CUSTOM_API_KEY') {
      useGlobalStore.setState({ customApiKey: payload })
    } else if (type === 'SEND_FAN_CHAT_MESSAGE') {
      const current = useGlobalStore.getState().chatMessages
      useGlobalStore.setState({ chatMessages: [payload, ...current] })
    } else if (type === 'VOTE_POLL_OPTION') {
      const current = useGlobalStore.getState().pollVotes
      const { pollIdx, optionIdx } = payload
      const currentPollVotes = current[pollIdx] || {}
      useGlobalStore.setState({
        pollVotes: {
          ...current,
          [pollIdx]: {
            ...currentPollVotes,
            [optionIdx]: (currentPollVotes[optionIdx] || 0) + 100
          }
        }
      })
    } else if (type === 'SET_POLL_INDEX') {
      useGlobalStore.setState({ pollIndex: payload })
    } else if (type === 'ADD_CUSTOM_POLL') {
      const updated = [...useGlobalStore.getState().pollsList, payload]
      useGlobalStore.setState({
        pollsList: updated,
        pollIndex: updated.length - 1
      })
    }
  })
}
