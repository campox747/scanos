import { useState, useMemo, useEffect } from 'react'
import { Search } from 'lucide-react'
import { db } from '../firebase/firebaseConfig'
import { collection, onSnapshot } from 'firebase/firestore'

export function InventoryList({ onSearchItem, isActive }) {
  const [inventory, setInventory] = useState([])
  const [sortBy, setSortBy] = useState('lastCheck')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Listen to inventory collection in real-time
  useEffect(() => {
    console.log('Setting up inventory listener...')
    const unsubscribe = onSnapshot(
      collection(db, 'inventory'),
      (snapshot) => {
        console.log('Inventory snapshot received:', snapshot.docs.length, 'documents')
        try {
          const items = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            lastCheck: doc.data().lastCheck?.toDate() || new Date()
          }))
          console.log('Processed inventory items:', items.length)
          setInventory(items)
          setIsLoading(false)
          setError(null)
        } catch (err) {
          console.error('Error processing inventory data:', err)
          setError('Error processing inventory data')
          setIsLoading(false)
          // Fallback to mock data if processing fails
          setInventory([
            {
              id: 'fallback-1',
              sku: 'BTL-001',
              name: 'Bottles',
              count: 1850,
              lastCheck: new Date(Date.now() - 1000 * 60 * 15),
              location: 'A-12',
            },
            {
              id: 'fallback-2',
              sku: 'BK-001',
              name: 'Books',
              count: 456,
              lastCheck: new Date(Date.now() - 1000 * 60 * 30),
              location: 'C-15',
            }
          ])
        }
      },
      (err) => {
        console.error('Error listening to inventory:', err)
        setError('Failed to connect to inventory database')
        setIsLoading(false)
        // Fallback to mock data if connection fails
        setInventory([
          {
            id: 'fallback-1',
            sku: 'BTL-001',
            name: 'Bottles',
            count: 1850,
            lastCheck: new Date(Date.now() - 1000 * 60 * 15),
            location: 'A-12',
          },
          {
            id: 'fallback-2',
            sku: 'BK-001',
            name: 'Books',
            count: 456,
            lastCheck: new Date(Date.now() - 1000 * 60 * 30),
            location: 'C-15',
          }
        ])
      }
    )

    return () => {
      console.log('Cleaning up inventory listener')
      unsubscribe()
    }
  }, [])

  const filteredAndSorted = useMemo(() => {
    let filtered = inventory

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          item.sku?.toLowerCase().includes(query) ||
          item.name?.toLowerCase().includes(query) ||
          item.location?.toLowerCase().includes(query)
      )
    }

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':      return a.name?.localeCompare(b.name) || 0
        case 'count':     return (b.count || 0) - (a.count || 0)
        case 'lastCheck': return (b.lastCheck?.getTime() || 0) - (a.lastCheck?.getTime() || 0)
        default:          return 0
      }
    })
  }, [inventory, searchQuery, sortBy])

  const formatTimeAgo = (date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / 1000 / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  const getCheckStatus = (date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / 1000 / 60)
    if (minutes < 30) return 'var(--green-status)'
    if (minutes < 90) return 'var(--yellow-caution)'
    return 'var(--red-alert)'
  }

  const sortButtonClass = (value) =>
    `px-3 py-1.5 text-xs uppercase tracking-wider border rounded transition-all ${
      sortBy === value
        ? 'border-[var(--accent-orange)] text-[var(--accent-orange)] bg-[var(--accent-orange)]/10'
        : 'border-[var(--border)] opacity-60 hover:opacity-100'
    }`

  return (
    <div className="bg-[var(--card)] border-2 border-[var(--border)] rounded flex flex-col h-full">

      {/* Header */}
      <div className="border-b-2 border-[var(--border)] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="uppercase tracking-wider" style={{ fontFamily: 'var(--font-sans)' }}>
            Inventory Database
          </h2>
          {error && (
            <span className="text-xs text-[var(--red-alert)] uppercase tracking-wider" style={{ fontFamily: 'var(--font-mono)' }}>
              Offline Mode
            </span>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search item..."
            className="w-full pl-10 pr-4 py-2.5 bg-[var(--input)] border border-[var(--border)] rounded focus:border-[var(--accent-orange)] focus:outline-none transition-colors uppercase"
            style={{ fontFamily: 'var(--font-mono)' }}
          />
        </div>

        {/* Sort buttons */}
        <div className="flex gap-2">
          <button onClick={() => setSortBy('lastCheck')} className={sortButtonClass('lastCheck')} style={{ fontFamily: 'var(--font-mono)' }}>Recent</button>
          <button onClick={() => setSortBy('name')}      className={sortButtonClass('name')}      style={{ fontFamily: 'var(--font-mono)' }}>A-Z</button>
          <button onClick={() => setSortBy('count')}     className={sortButtonClass('count')}     style={{ fontFamily: 'var(--font-mono)' }}>Count</button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-8 text-center opacity-50 uppercase tracking-wider" style={{ fontFamily: 'var(--font-mono)' }}>
            Loading inventory...
          </div>
        ) : error ? (
          <div className="p-8 text-center opacity-50 uppercase tracking-wider text-[var(--red-alert)]" style={{ fontFamily: 'var(--font-mono)' }}>
            {error}
          </div>
        ) : inventory.length === 0 ? (
          <div className="p-8 text-center opacity-50 uppercase tracking-wider" style={{ fontFamily: 'var(--font-mono)' }}>
            No inventory items found
          </div>
        ) : filteredAndSorted.length === 0 ? (
          <div className="p-8 text-center opacity-50 uppercase tracking-wider" style={{ fontFamily: 'var(--font-mono)' }}>
            No items match your search
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {filteredAndSorted.map((item) => (
              <div key={item.id} className="p-4 hover:bg-[var(--accent)] transition-colors">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs opacity-60 mb-1 uppercase tracking-wider" style={{ fontFamily: 'var(--font-mono)' }}>
                      {item.sku || 'N/A'}
                    </div>
                    <div className="text-lg font-bold uppercase tracking-wide" style={{ fontFamily: 'var(--font-sans)' }}>
                      {item.name || 'Unknown Item'}
                    </div>
                  </div>
                  <div className="text-right shrink-0" style={{ fontFamily: 'var(--font-mono)' }}>
                    <div className="text-2xl font-bold text-[var(--accent-orange)]">{(item.count || 0).toLocaleString()}</div>
                    <div className="text-xs opacity-60 uppercase">units</div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="opacity-60 text-xs uppercase tracking-wider" style={{ fontFamily: 'var(--font-mono)' }}>
                      Location: {item.location || 'Unknown'}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getCheckStatus(item.lastCheck) }} />
                      <div className="text-xs uppercase tracking-wider" style={{ fontFamily: 'var(--font-mono)' }}>
                        {formatTimeAgo(item.lastCheck)}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onSearchItem(item.name || 'Unknown Item')}
                    disabled={isActive}
                    className="px-4 py-2 bg-[var(--accent-orange)] text-[var(--background)] rounded text-xs uppercase tracking-wider font-bold hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-[var(--accent-orange)]"
                    style={{ fontFamily: 'var(--font-sans)' }}
                  >
                    🔍 Find Item
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer stats */}
      <div className="border-t-2 border-[var(--border)] p-4 bg-[var(--secondary)]" style={{ fontFamily: 'var(--font-mono)' }}>
        <div className="flex justify-between text-sm uppercase tracking-wider">
          <div>
            <span className="opacity-60">Total Items:</span>{' '}
            <span className="text-[var(--accent-orange)] font-bold">{filteredAndSorted.length}</span>
          </div>
          <div>
            <span className="opacity-60">Total Units:</span>{' '}
            <span className="text-[var(--accent-orange)] font-bold">
              {filteredAndSorted.reduce((sum, item) => sum + (item.count || 0), 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

    </div>
  )
}
