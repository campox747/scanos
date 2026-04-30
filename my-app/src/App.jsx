import { useState, useEffect } from 'react'
import { ControlPanel } from './components/ControlPanel'
import { InventoryList } from './components/InventoryList'
import { StatusBar } from './components/StatusBar'
import { db } from './firebase/firebaseConfig'

import { serverTimestamp, onSnapshot, updateDoc, doc } from 'firebase/firestore'

const ROBOT_DOC = doc(db, 'robots', 'robot1')

export default function App() {
  const [robotData, setRobotData] = useState('idle')

  useEffect(() => {
    const unsubscribe = onSnapshot(ROBOT_DOC, (snapshot) => {
      if (snapshot.exists()) setRobotData(snapshot.data())
    })
    return () => unsubscribe()
  }, [])

  const robotStatus  = robotData?.status      ?? null
  const searchTarget = robotData?.searchTarget ?? null

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

      {/* Changed grid layout to 50/50 split and removed VideoFeed container */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 overflow-hidden">
        
        <ControlPanel
          robotStatus={robotStatus}
          searchTarget={searchTarget}
          onStartRound={handleStartRound}
          onEmergencyStop={handleEmergencyStop}
        />

        <InventoryList
          onSearchItem={handleSearchItem}
          isActive={robotStatus !== 'idle' && robotStatus !== null}
        />
      </div>
    </div>
  )
}