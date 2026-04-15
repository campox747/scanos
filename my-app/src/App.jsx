import { useState } from 'react'
import { ControlPanel } from './components/ControlPanel'
import { VideoFeed } from './components/VideoFeed'
import { InventoryList } from './components/InventoryList'
import { StatusBar } from './components/StatusBar'

export default function App() {
  const [robotStatus, setRobotStatus] = useState('idle')

  const handleStartRound = () => {
    setRobotStatus('running')
    setTimeout(() => setRobotStatus('idle'), 5000)
  }

  const handleSearchItem = (itemName) => {
    if (itemName.trim()) {
      setRobotStatus('searching')
      setTimeout(() => setRobotStatus('idle'), 3000)
    }
  }

  const handleReturnHome = () => {
    console.log('Robot returning to home position')
  }

  const handleEmergencyStop = () => {
    setRobotStatus('idle')
    console.log('EMERGENCY STOP ACTIVATED')
  }

  return (
    <div className="size-full flex flex-col bg-[var(--background)]" style={{ fontFamily: 'var(--font-sans)' }}>
      <StatusBar status={robotStatus} />

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-4 p-4 overflow-hidden">
        {/* Left: Video + Controls */}
        <div className="flex flex-col gap-4">
          <VideoFeed status={robotStatus} />
          <ControlPanel
            onStartRound={handleStartRound}
            onReturnHome={handleReturnHome}
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
