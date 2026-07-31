'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FavoriteEntry {
  tour_id: string
}

export default function FavoriteButton({ tourId, className }: { tourId: string; className?: string }) {
  const router = useRouter()
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null)
  const [favorited, setFavorited] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    fetch('/api/customers/favorites')
      .then(async (res) => {
        if (!res.ok) {
          setLoggedIn(false)
          return
        }
        const data: FavoriteEntry[] = await res.json()
        setLoggedIn(true)
        setFavorited(data.some((f) => f.tour_id === tourId))
      })
      .catch(() => setLoggedIn(false))
  }, [tourId])

  async function toggle(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    if (!loggedIn) {
      router.push('/account/login')
      return
    }

    setBusy(true)
    const next = !favorited
    setFavorited(next) // optimistic
    try {
      if (next) {
        await fetch('/api/customers/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tour_id: tourId }),
        })
      } else {
        await fetch(`/api/customers/favorites/${tourId}`, { method: 'DELETE' })
      }
    } catch {
      setFavorited(!next) // revert on failure
    } finally {
      setBusy(false)
    }
  }

  if (loggedIn === null) return null

  return (
    <button
      onClick={toggle}
      disabled={busy}
      aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
      aria-pressed={favorited}
      className={cn(
        'flex items-center justify-center w-9 h-9 rounded-full bg-white/90 hover:bg-white shadow-sm transition-colors disabled:opacity-60',
        className
      )}
    >
      <Heart size={18} className={favorited ? 'fill-red-500 text-red-500' : 'text-gray-500'} />
    </button>
  )
}
