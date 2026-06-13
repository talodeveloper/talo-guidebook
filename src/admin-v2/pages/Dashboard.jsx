import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminV2Store } from '../../data/adminV2Store'
import { properties as defaultProperties } from '../../data/properties'
import Icon from '../../components/Icon'

export default function Dashboard() {
  const [propertyList, setPropertyList] = useState(adminV2Store.getPropertiesList())

  useEffect(() => {
    return adminV2Store.subscribe(() => setPropertyList(adminV2Store.getPropertiesList()))
  }, [])

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Select a property to manage its guidebook content.</p>
      </div>

      {/* Global content card */}
      <div className="mb-6">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Shared Content</p>
        <Link to="/admin-v2/global"
          className="flex items-center justify-between p-5 bg-white rounded-2xl border border-slate-200 hover:border-orange-200 hover:shadow-sm transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #C84B31, #EA580C)' }}>
              <Icon name="public" size={18} className="text-white" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">Global Content</p>
              <p className="text-xs text-slate-500 mt-0.5">House rules that apply to all properties</p>
            </div>
          </div>
          <Icon name="arrow_forward" size={16} className="text-slate-400 group-hover:text-orange-600 transition-colors" />
        </Link>
      </div>

      {/* Property cards */}
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Properties</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {propertyList.map(p => {
          const info = adminV2Store.getPropertyInfo(p.slug)
          const def = defaultProperties[p.slug]
          return (
            <Link key={p.slug} to={`/admin-v2/property/${p.slug}`}
              className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-orange-200 hover:shadow-sm transition-all group">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${p.status === 'active' ? 'bg-green-500' : 'bg-amber-400'}`} />
                    <p className="font-bold text-slate-900 truncate">{info.name || p.name}</p>
                  </div>
                  <p className="text-xs text-slate-500 truncate">{info.address || def?.address}</p>
                </div>
                <Icon name="arrow_forward" size={16} className="text-slate-300 group-hover:text-orange-600 transition-colors flex-shrink-0 mt-0.5" />
              </div>
              <div className="flex gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Icon name="login" size={12} style={{ color: '#C84B31' }} />
                  {info.checkInTime || def?.checkInTime}
                </span>
                <span className="flex items-center gap-1">
                  <Icon name="logout" size={12} style={{ color: '#C84B31' }} />
                  {info.checkoutTime || def?.checkoutTime}
                </span>
                <span className="flex items-center gap-1">
                  <Icon name="group" size={12} style={{ color: '#C84B31' }} />
                  {info.maxGuests || def?.maxGuests} guests
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
