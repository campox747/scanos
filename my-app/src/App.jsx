import { useState , useEffect } from 'react'
import { ControlPanel } from './components/ControlPanel'
import { VideoFeed } from './components/VideoFeed'
import { InventoryList } from './components/InventoryList'
import { StatusBar } from './components/StatusBar'
import { db } from '../../firebase/firebaseConfig'
import { collection, onSnapshot, updateDoc, doc } from 'firebase/firestore'

const ROBOT_DOC = doc(db, 'robots', 'robot1') // points to robot in firestore

export default function App() {
  const [robotStatus, setRobotStatus] = useState('idle')

  // Read: listen to robot status from firebase
  useEffect(() => {
    const unsubscribe = onSnapshot(ROBOT_DOC, (snapshot) => {
      const data = snapshot.data()
      if (data?.status) setRobotStatus(data.status)
    })
    return () => unsubscribe() // stop listening when app unmounts
  }, [])

  // Write: each handler below writes to firebase

  const handleStartRound = async () => {
    await updateDoc(ROBOT_DOC, {status: 'running', lastCommand: 'start_round'})
  }

  const handleSearchItem = async (itemName) => {
    if (itemName.trim()) {
      await updateDoc(ROBOT_DOC, {status: 'searching', searchTarget: itemName})
    }
  }

  const handleEmergencyStop = async () => {
    await updateDoc(ROBOT_DOC, {status: 'idle', lastCommand: 'emergency_stop'})
  }

  return (
    <div className="size-full flex flex-col bg-[var(--background)]" style={{ fontFamily: 'var(--font-sans)' }}>
      <StatusBar status={robotStatus}
      />

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-4 p-4 overflow-hidden">
        {/* Left: Video + Controls */}
        <div className="flex flex-col gap-4">
          <VideoFeed status={robotStatus}
          />
          <ControlPanel
            onStartRound={handleStartRound}
            onSearchItem={handleSearchItem}
            onEmergencyStop={handleEmergencyStop}
            isActive={robotStatus !== 'idle'}
          />
        </div>

        {/* Right: Inventory */}
        <InventoryList
          onSearchItem={handleSearchItem}
          isActive={robotStatus !== 'idle'}
        />
      </div>
    </div>
  )
}
