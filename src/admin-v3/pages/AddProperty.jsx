import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { adminV3Store } from '../../data/adminV3Store'
import Icon from '../../components/Icon'

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

export default function AddProperty() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const previewSlug = slugify(name)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) { setError('Property name is required.'); return }
    setSubmitting(true)
    const result = adminV3Store.addProperty({ name: name.trim(), address: address.trim() })
    setSubmitting(false)
    if (result.error) { setError(result.error); return }
    navigate(`/admin-v3/property/${result.slug}`)
  }

  return (
    <div className="p-6 md:p-8 max-w-xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-6">
        <Link to="/admin-v3/dashboard" className="hover:text-slate-600">Dashboard</Link>
        <Icon name="chevron_right" size={12} />
        <span className="text-slate-700 font-medium">Add Property</span>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Add Property</h1>
        <p className="text-sm text-slate-500 mt-1">
          A new guidebook will be created at <code className="text-orange-600">/v3/{previewSlug || 'property-name'}</code>.
          All sections will be created blank — fill them in from the property page.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
        {error && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            Property Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={e => { setName(e.target.value); setError('') }}
            placeholder="e.g. Spain Villa"
            autoFocus
            className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-300"
          />
          {name && (
            <p className="text-[11px] text-slate-400 mt-1.5">
              Guidebook URL: <span className="font-mono text-orange-500">/v3/{previewSlug}</span>
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Address</label>
          <input
            type="text"
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="123 Main St, Barcelona, Spain"
            className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-300"
          />
          <p className="text-[10px] text-slate-400 mt-1">You can fill in all details from the property page after creation.</p>
        </div>

        <div className="bg-slate-50 rounded-xl p-4 space-y-1.5">
          <p className="text-xs font-semibold text-slate-600">What gets created:</p>
          <div className="text-xs text-slate-500 space-y-1">
            <p className="flex items-center gap-1.5"><Icon name="check" size={13} className="text-green-500" /> All standard guidebook sections (blank)</p>
            <p className="flex items-center gap-1.5"><Icon name="check" size={13} className="text-green-500" /> Activity Center with all global activities enabled by default</p>
            <p className="flex items-center gap-1.5"><Icon name="check" size={13} className="text-green-500" /> Empty FAQ list</p>
            <p className="flex items-center gap-1.5"><Icon name="check" size={13} className="text-green-500" /> Host info pre-filled with Joe's contact details</p>
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={() => navigate('/admin-v3/dashboard')}
            className="flex-1 py-2.5 text-sm text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={submitting}
            className="flex-1 py-2.5 text-sm font-bold text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #C84B31, #EA580C)' }}>
            {submitting ? 'Creating…' : 'Create Property'}
          </button>
        </div>
      </form>
    </div>
  )
}
