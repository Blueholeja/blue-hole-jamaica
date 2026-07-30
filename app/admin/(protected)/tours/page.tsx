'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Plus, Edit2, Trash2, X, CheckCircle, XCircle } from 'lucide-react'
import { TOURS } from '@/lib/tours-data'
import { SERVICE_SLUGS } from '@/lib/reservation-utils'
import { Tour } from '@/types'
import { cn } from '@/lib/utils'

const inputClass = 'w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B896] focus:border-transparent'

function isExcursion(t: Tour) {
  return !SERVICE_SLUGS.includes(t.slug) && t.category !== 'overnight'
}

export default function AdminToursPage() {
  const [tours, setTours] = useState<Tour[]>(TOURS.filter(isExcursion))
  const [showForm, setShowForm] = useState(false)
  const [editingTour, setEditingTour] = useState<Tour | null>(null)
  const [formData, setFormData] = useState<Partial<Tour>>({
    name: '',
    slug: '',
    description: '',
    duration: '',
    price: 0,
    category: 'day_tour',
    available: true,
    highlights: [],
    images: [],
  })

  useEffect(() => {
    async function fetchTours() {
      try {
        const res = await fetch('/api/tours')
        const data = await res.json()
        if (Array.isArray(data)) setTours(data.filter(isExcursion))
      } catch {
        // keep static fallback already in state
      }
    }
    fetchTours()
  }, [])

  function openAddForm() {
    setEditingTour(null)
    setFormData({ name: '', slug: '', description: '', duration: '', price: 0, category: 'day_tour', available: true, highlights: [], images: [] })
    setShowForm(true)
  }

  function openEditForm(tour: Tour) {
    setEditingTour(tour)
    setFormData({ ...tour })
    setShowForm(true)
  }

  async function handleSave() {
    if (editingTour) {
      // Update
      try {
        await fetch(`/api/tours/${editingTour.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
        setTours(tours.map((t) => (t.id === editingTour.id ? { ...t, ...formData } as Tour : t)))
      } catch {
        // Fall back to local state update
        setTours(tours.map((t) => (t.id === editingTour.id ? { ...t, ...formData } as Tour : t)))
      }
    } else {
      // Create
      const newTour: Tour = {
        id: Date.now().toString(),
        ...formData,
        images: formData.images || [],
        highlights: formData.highlights || [],
        name: formData.name || '',
        slug: formData.slug || formData.name?.toLowerCase().replace(/\s+/g, '-') || '',
        description: formData.description || '',
        duration: formData.duration || '',
        price: formData.price || 0,
        category: formData.category || 'day_tour',
        available: formData.available !== false,
      }
      try {
        const res = await fetch('/api/tours', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newTour),
        })
        if (res.ok) {
          const created = await res.json()
          setTours([...tours, created])
        } else {
          setTours([...tours, newTour])
        }
      } catch {
        setTours([...tours, newTour])
      }
    }
    setShowForm(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this tour?')) return
    try {
      await fetch(`/api/tours/${id}`, { method: 'DELETE' })
    } catch {}
    setTours(tours.filter((t) => t.id !== id))
  }

  async function toggleAvailability(tour: Tour) {
    const updated = { ...tour, available: !tour.available }
    setTours(tours.map((t) => (t.id === tour.id ? updated : t)))
    try {
      await fetch(`/api/tours/${tour.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ available: !tour.available }),
      })
    } catch {}
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1B3A2D]">Tours</h1>
          <p className="text-gray-500 text-sm mt-1">{tours.length} tours</p>
        </div>
        <button
          onClick={openAddForm}
          className="flex items-center gap-2 bg-[#00B896] hover:bg-[#009B7F] text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors"
        >
          <Plus size={16} />
          Add Tour
        </button>
      </div>

      {/* Tours Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {tours.map((tour) => (
          <div key={tour.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            <div className="relative h-40">
              <Image
                src={tour.images[0] || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400'}
                alt={tour.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 33vw"
              />
              <div className="absolute top-2 right-2">
                <button
                  onClick={() => toggleAvailability(tour)}
                  className={cn(
                    'text-xs font-semibold px-2 py-1 rounded-full transition-colors',
                    tour.available ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'
                  )}
                >
                  {tour.available ? 'Active' : 'Inactive'}
                </button>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-[#1B3A2D] mb-1">{tour.name}</h3>
              <p className="text-gray-400 text-xs mb-1 capitalize">{tour.category.replace('_', ' ')} · {tour.duration}</p>
              <p className="text-[#00B896] font-semibold text-sm mb-3">${tour.price}/person</p>
              <div className="flex gap-2">
                <button
                  onClick={() => openEditForm(tour)}
                  className="flex-1 flex items-center justify-center gap-1.5 border border-gray-200 hover:border-[#1B3A2D] text-gray-600 hover:text-[#1B3A2D] py-2 rounded-lg text-xs font-medium transition-colors"
                >
                  <Edit2 size={13} />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(tour.id)}
                  className="flex items-center justify-center gap-1.5 border border-red-200 hover:border-red-400 text-red-400 hover:text-red-600 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setShowForm(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-[#1B3A2D] text-lg">
                {editingTour ? 'Edit Tour' : 'Add New Tour'}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Tour Name *</label>
                <input
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Blue Hole Adventure"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Tour description..."
                  className={cn(inputClass, 'resize-none')}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Price (USD) *</label>
                  <input
                    type="number"
                    value={formData.price || ''}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    placeholder="85"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Duration</label>
                  <input
                    value={formData.duration || ''}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="3-4 Hours"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Category</label>
                <select
                  value={formData.category || 'day_tour'}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as Tour['category'] })}
                  className={inputClass}
                >
                  <option value="day_tour">Day Tour</option>
                  <option value="airport_transfer">Airport Transfer</option>
                  <option value="overnight">Overnight Stay</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Image URL</label>
                <input
                  value={(formData.images || [])[0] || ''}
                  onChange={(e) => setFormData({ ...formData, images: [e.target.value] })}
                  placeholder="https://images.unsplash.com/..."
                  className={inputClass}
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="available"
                  checked={formData.available !== false}
                  onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                  className="rounded border-gray-300 text-[#00B896] focus:ring-[#00B896]"
                />
                <label htmlFor="available" className="text-sm text-gray-600">Available for booking</label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 bg-[#00B896] hover:bg-[#009B7F] text-white py-2.5 rounded-xl text-sm font-semibold transition-colors"
              >
                {editingTour ? 'Save Changes' : 'Add Tour'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
