import { useState, useEffect } from 'react'
import { ControlPanel } from './components/ControlPanel'
import { VideoFeed } from './components/VideoFeed'
import { InventoryList } from './components/InventoryList'
import { StatusBar } from './components/StatusBar'
import { db } from './firebase/firebaseConfig'

import { serverTimestamp, onSnapshot, updateDoc, doc, collection, getDocs } from 'firebase/firestore'

const ROBOT_DOC = doc(db, 'robots', 'robot1')

export default function App() {
  const [robotData, setRobotData] = useState('idle') // null = connecting

  // Single Firestore listener — owned here, passed down as props
  useEffect(() => {
    const unsubscribe = onSnapshot(ROBOT_DOC, (snapshot) => {
      if (snapshot.exists()) setRobotData(snapshot.data())
    })
    return () => unsubscribe()
  }, [])

  const robotStatus  = robotData?.status      ?? null
  const searchTarget = robotData?.searchTarget ?? null

  // Write handlers — all Firestore writes live here
  const handleStartRound = async () => {
    await updateDoc(ROBOT_DOC, {
      status: 'running',
      lastCommand: 'start_round',
      searchTarget: null,
      updatedAt: serverTimestamp(),
    })
  }

  const handleSearchItem = async (itemName) => {
    if (itemName.trim()) {
      await updateDoc(ROBOT_DOC, {
        status: 'searching',
        lastCommand: 'search_item',
        searchTarget: itemName,
        updatedAt: serverTimestamp(),
      })
    }
  }

  const handleEmergencyStop = async () => {
    await updateDoc(ROBOT_DOC, {
      status: 'idle',
      lastCommand: 'emergency_stop',
      searchTarget: null,
      updatedAt: serverTimestamp(),
    })
  }

  return (
    <div className="size-full flex flex-col bg-[var(--background)]" style={{ fontFamily: 'var(--font-sans)' }}>
      <StatusBar status={robotStatus} />

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-4 p-4 overflow-hidden">
        {/* Left: Video + Controls */}
        <div className="flex flex-col gap-4">
          <VideoFeed status={robotStatus} />
          <ControlPanel
            robotStatus={robotStatus}
            searchTarget={searchTarget}
            onStartRound={handleStartRound}
            onEmergencyStop={handleEmergencyStop}
          />
        </div>

        {/* Right: Inventory */}
        <InventoryList
          onSearchItem={handleSearchItem}
          isActive={robotStatus !== 'idle' && robotStatus !== null}
        />
      </div>
    </div>
  )
}
