'use client'
import { useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, getUserProfile } from '@/lib/firebase'
import { useGlobalStore } from '@/store/globalState'
import LoginGate from '@/components/auth/LoginGate'
import FanPortal from '@/components/fan/FanPortal'
import OrgPortal from '@/components/organizer/OrgPortal'
import { FanProfile, OrgProfile } from '@/types'

export default function Home() {
  const role = useGlobalStore(s => s.role)
  const setRole = useGlobalStore(s => s.setRole)
  const setFanProfile = useGlobalStore(s => s.setFanProfile)
  const setOrgProfile = useGlobalStore(s => s.setOrgProfile)
  const authLoading = useGlobalStore(s => s.authLoading)
  const setAuthLoading = useGlobalStore(s => s.setAuthLoading)
  const initFirestoreSync = useGlobalStore(s => s.initFirestoreSync)

  useEffect(() => {
    const loadLocalUser = () => {
      const localUserJson = localStorage.getItem('stadiapulse_local_user')
      if (localUserJson) {
        try {
          const data = JSON.parse(localUserJson)
          setRole(data.role)
          if (data.role === 'fan') {
            setFanProfile(data.profile as FanProfile)
          } else if (data.role === 'organizer') {
            setOrgProfile(data.profile as OrgProfile)
          }
          initFirestoreSync(true)
        } catch (localErr) {
          console.error('Error parsing local user session:', localErr)
          setRole(null)
        }
      } else {
        setRole(null)
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Fetch custom profile data from Firestore
        const data = await getUserProfile(user.uid)
        if (data) {
          setRole(data.role)
          if (data.role === 'fan') {
            setFanProfile(data.profile as FanProfile)
          } else if (data.role === 'organizer') {
            setOrgProfile(data.profile as OrgProfile)
          }
          initFirestoreSync(true)
        } else {
          // Fallback if Firestore fails (e.g. offline)
          loadLocalUser()
        }
      } else {
        // Fallback: check local storage if no active Firebase user
        loadLocalUser()
      }
      setAuthLoading(false)
    })

    return () => unsubscribe()
  }, [setRole, setFanProfile, setOrgProfile, setAuthLoading, initFirestoreSync])

  if (authLoading) {
    return (
      <main
        className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(225,37,27,0.12) 0%, transparent 60%), #070711'
        }}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-400/20 border-t-red-600 animate-spin" />
          <h2 className="font-outfit font-black text-lg text-white tracking-widest uppercase">StadiaPulse AI</h2>
          <span className="text-xs text-slate-500">Restoring live session…</span>
        </div>
      </main>
    )
  }

  if (role === 'fan') return <FanPortal />
  if (role === 'organizer') return <OrgPortal />
  return <LoginGate />
}
