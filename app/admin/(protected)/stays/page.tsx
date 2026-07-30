'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Plus, Edit2, Trash2, X } from 'lucide-react'
import { TOURS } from '@/lib/tours-data'
import { Tour } from '@/types'
import { cn } from '@/lib/utils'

const inputClass = 'w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B896] focus:border-transparent'

function isStay(t: Tour) {
  return t.category === 'overnight'
}

export default function AdminStaysPage() {
  const [stays, setStays] = useState<Tour[]>(TOURS.filter(isStay))
  const [showForm, setShowForm] = useState(false)
  const [editingStay, setEditingStay] = useState<Tour | null>(null)
  const [formData, setFormData] = useState<Partial<Tour>>({
    name: '',
    slug: '',
    description: '',
    duration: '',
    price: 0,
    category: 'overnight',
    available: true,
    highlights: [],
    images: [],
  })

  useEffect(() => {
    async function fetchStays() {
      try {
        const res = await fetch('/api/tours')
        const data = await res.json()
        if (Array.isArray(data)) setStays(data.filter(isStay))
      } catch {
        // keep static fallback already in state
      }
    }
    fetchStays()
  }, [])

  function openAddForm() {
    setEditingStay(null)
    setFormData({ name: '', slug: '', description: '', duration: '', price: 0, category: 'overnight', available: true, highlights: [], images: [] })
    setShowForm(true)
  }

  function openEditForm(stay: Tour) {
    setEditingStay(stay)
    setFormData({ ...stay })
    setShowForm(true)
  }

  async function handleSave() {
    if (editingStay) {
      try {
        await fetch(`/api/tours/${editingStay.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
      } catch {}
      setStays(stays.map((s) => (s.id === editingStay.id ? { ...s, ...formData } as Tour : s)))
    } else {
      const newStay: Tour = {
        id: Date.now().toString(),
        ...formData,
        images: formData.images || [],
        highlights: formData.highlights || [],
        name: formData.name || '',
        slug: formData.slug || formData.name?.toLowerCase().replace(/\s+/g, '-') || '',
        description: formData.description || '',
        duration: formData.duration || '',
        price: formData.price || 0,
        category: 'overnight',
        available: formData.available !== false,
      }
      try {
        const res = await fetch('/api/tours', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newStay),
        })
        if (res.ok) {
          const created = await res.json()
          setStays([...stays, created])
        } else {
          setStays([...stays, newStay])
        }
      } catch {
        setStays([...stays, newStay])
      }
    }
    setShowForm(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this stay?')) return
    try {
      await fetch(`/api/tours/${id}`, { method: 'DELETE' })
    } catch {}
    setStays(stays.filter((s) => s.id !== id))
  }

  async function toggleAvailability(stay: Tour) {
    const updated = { ...stay, available: !stay.available }
    setStays(stays.map((s) => (s.id === stay.id ? updated : s)))
    try {
      await fetch(`/api/tours/${stay.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ available: !stay.available }),
      })
    } catch {}
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1B3A2D]">Stays</h1>
          <p className="text-gray-500 text-sm mt-1">{stays.length} overnight stays</p>
        </div>
        <button
          onClick={openAddForm}
          className="flex items-center gap-2 bg-[#00B896] hover:bg-[#009B7F] text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors"
        >
          <Plus size={16} />
          Add Stay
        </button>
      </div>

      {/* Stays Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {stays.map((stay) => (
          <div key={stay.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            <div className="relative h-40">
              <Image
                src={stay.images[0] || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400'}
                alt={stay.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 33vw"
              />
              <div className="absolute top-2 right-2">
                <button
                  onClick={() => toggleAvailability(stay)}
                  className={cn(
                    'text-xs font-semibold px-2 py-1 rounded-full transition-colors',
                    stay.available ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'
                  )}
                >
                  {stay.available ? 'Active' : 'Inactive'}
                </button>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-[#1B3A2D] mb-1">{stay.name}</h3>
              <p className="text-gray-400 text-xs mb-1">{stay.duration}</p>
              <p className="text-[#00B896] font-semibold text-sm mb-3">${stay.price}/person</p>
              <div className="flex gap-2">
                <button
                  onClick={() => openEditForm(stay)}
                  className="flex-1 flex items-center justify-center gap-1.5 border border-gray-200 hover:border-[#1B3A2D] text-gray-600 hover:text-[#1B3A2D] py-2 rounded-lg text-xs font-medium transition-colors"
                >
                  <Edit2 size={13} />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(stay.id)}
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
                {editingStay ? 'Edit Stay' : 'Add New Stay'}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Stay Name *</label>
                <input
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Blue Hole Overnight Stay"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Stay description..."
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
                    placeholder="200"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Duration</label>
                  <input
                    value={formData.duration || ''}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="1-3 Nights"
                    className={inputClass}
                  />
                </div>
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
                {editingStay ? 'Save Changes' : 'Add Stay'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
