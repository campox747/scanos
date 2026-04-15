import { useState, useEffect } from 'react'
import { db } from '../../firebase/firebaseConfig'
import { serverTimestamp, onSnapshot, updateDoc, doc } from 'firebase/firestore'

// Firestore path: robots/robot1
const ROBOT_REF = doc(db, 'robots', 'robot1')

export function ControlPanel() {

  const sendCommand = async (fields, label) => {
    try {
      await updateDoc(ROBOT_REF, {
        ...fields,
        updatedAt: serverTimestamp(),
      })
    } catch (err) {
      console.error(`Error during ${label}:`, err)
      setError(`Failed to send command: ${label}`)
    }
  }

  // Derive flags from live Firestore data
  const robotStatus  = robotData?.status ?? null
  const searchTarget = robotData?.searchTarget ?? null

  const isLoading    = robotStatus === 'null'
  const isRunning    = robotStatus === 'running'
  const isSearching  = robotStatus === 'searching'

  const canStart = isIdle
  const canReturn = isRunning || isSearching   // recall from any active state
  const canStop   = isRunning || isSearching

  const statusLabel = isLoading
    ? 'Connecting…'
    : {
        idle:      'Idle',
        running:   'Running Round',
        searching: `Searching${searchTarget ? `: ${searchTarget}` : ''}`,
      }[robotStatus] ?? robotStatus

  const statusColor = {
    idle:      'var(--accent-yellow)',
    running:   'var(--accent-orange)',
    searching: '#60a5fa',
  }[robotStatus] ?? 'var(--border)'

  return (
    <div className="bg-[var(--card)] border-2 border-[var(--border)] rounded p-6 space-y-4">

      {/* Status bar */}
      <div className="flex items-center gap-3 px-1">
        <span
          className="h-2.5 w-2.5 rounded-full animate-pulse"
          style={{ backgroundColor: statusColor }}
        />
        <span
          className="text-xs uppercase tracking-widest opacity-70"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          Status: <span style={{ color: statusColor }}>{statusLabel}</span>
        </span>
        {error && (
          <span
            className="ml-auto text-xs text-[var(--red-alert)] uppercase tracking-wider"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            ⚠ {error}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* START ROUND */}
        <div className="space-y-2">
          <label
            className="block opacity-70 text-xs uppercase tracking-wider"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Automatic Inventory
          </label>
          <button
            onClick= {onStartRound}
            disabled={!canStart || isLoading}
            className="w-full h-40 bg-[var(--accent-orange)] text-[var(--background)] rounded transition-all duration-200 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed relative overflow-hidden border-4 border-[var(--accent-orange)]"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            <div className="relative z-10">
              <div className="text-5xl mb-2">▶</div>
              <div className="text-xl font-bold uppercase tracking-wider">
                {isRunning ? 'Running…' : isSearching ? 'Searching…' : 'Start Round'}
              </div>
            </div>
            {(isRunning || isSearching) && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
            )}
          </button>
        </div>

        {/* RETURN HOME */}
        <div className="space-y-2">
          <label
            className="block opacity-70 text-xs uppercase tracking-wider"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Navigation
          </label>
          <button
            onClick={onSearchItem}
            disabled={!canReturn || isLoading}
            className="w-full h-40 bg-[var(--secondary)] text-[var(--foreground)] rounded transition-all duration-200 hover:bg-[var(--accent-yellow)] hover:text-[var(--background)] disabled:opacity-40 disabled:cursor-not-allowed border-2 border-[var(--border)] relative overflow-hidden"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            <div className="relative z-10">
              <div className="text-5xl mb-2">⌂</div>
              <div className="text-xl font-bold uppercase tracking-wider">
                Return Home
              </div>
            </div>
          </button>
        </div>

        {/* EMERGENCY STOP */}
        <div className="space-y-2">
          <label
            className="block opacity-70 text-xs uppercase tracking-wider"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Stop
          </label>
          <button
            onClick={onEmergencyStop}
            disabled={isLoading}
            className="w-full h-40 bg-[var(--red-alert)] text-white rounded transition-all duration-200 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed border-4 border-[var(--red-alert)] shadow-lg"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            <div className="relative z-10">
              <div className="text-5xl mb-2">⬛</div>
              <div className="text-xl font-bold uppercase tracking-wider">Emergency Stop</div>
            </div>
          </button>
        </div>

      </div>
    </div>
  )
}
