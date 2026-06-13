import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminV3Store } from '../../data/adminV3Store'
import { properties as defaultProperties } from '../../data/properties'
import Icon from '../../components/Icon'

export default function DashboardV3() {
  const [propertyList, setPropertyList] = useState(adminV3Store.getPropertiesList())
  const [activityCount, setActivityCount] = useState(adminV3Store.getActivities().length)

  useEffect(() => {
    return adminV3Store.subscribe(() => {
      setPropertyList(adminV3Store.getPropertiesList())
      setActivityCount(adminV3Store.getActivities().length)
    })
  }, [])

  const activeProps = propertyList.filter(p => p.status === 'active')
  const inactiveProps = propertyList.filter(p => p.status !== 'active')

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Manage properties, activities, and guidebook content.</p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
        <Link to="/admin-v3/activities"
          className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-200 hover:border-orange-200 hover:shadow-sm transition-all group">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #C84B31, #EA580C)' }}>
            <Icon name="explore" size={18} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-900">Global Activities</p>
            <p className="text-xs text-slate-500 mt-0.5">{activityCount} activities in library</p>
          </div>
          <Icon name="arrow_forward" size={16} className="text-slate-400 group-hover:text-orange-600 transition-colors flex-shrink-0" />
        </Link>

        <Link to="/admin-v3/global"
          className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-200 hover:border-orange-200 hover:shadow-sm transition-all group">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #B45309, #D97706)' }}>
            <Icon name="public" size={18} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-900">Global Content</p>
            <p className="text-xs text-slate-500 mt-0.5">House rules shared across all properties</p>
          </div>
          <Icon name="arrow_forward" size={16} className="text-slate-400 group-hover:text-orange-600 transition-colors flex-shrink-0" />
        </Link>
      </div>

      {/* Active properties */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Properties</p>
          <Link to="/admin-v3/add-property"
            className="flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 font-semibold">
            <Icon name="add" size={14} /> Add Property
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {activeProps.map(p => {
            const info = adminV3Store.getPropertyInfo(p.slug)
            const def = defaultProperties[p.slug]
            return (
              <Link key={p.slug} to={`/admin-v3/property/${p.slug}`}
                className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-orange-200 hover:shadow-sm transition-all group">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                      <p className="font-bold text-slate-900 truncate">{info.name || p.name}</p>
                    </div>
                    <p className="text-xs text-slate-500 truncate">{info.address || def?.address || '—'}</p>
                  </div>
                  <Icon name="arrow_forward" size={16} className="text-slate-300 group-hover:text-orange-600 transition-colors flex-shrink-0 mt-0.5" />
                </div>
                <div className="flex gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Icon name="login" size={12} style={{ color: '#C84B31' }} />
                    {info.checkInTime || def?.checkInTime || '4:00 PM'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon name="logout" size={12} style={{ color: '#C84B31' }} />
                    {info.checkoutTime || def?.checkoutTime || '11:00 AM'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon name="group" size={12} style={{ color: '#C84B31' }} />
                    {info.maxGuests || def?.maxGuests || '—'} guests
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Inactive properties */}
      {inactiveProps.length > 0 && (
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Inactive / Deactivated</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {inactiveProps.map(p => {
              const info = adminV3Store.getPropertyInfo(p.slug)
              return (
                <Link key={p.slug} to={`/admin-v3/property/${p.slug}`}
                  className="bg-slate-50 rounded-2xl border border-slate-200 p-5 hover:border-slate-300 transition-all group opacity-60">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 rounded-full bg-slate-400 flex-shrink-0" />
                        <p className="font-bold text-slate-700 truncate">{info.name || p.name}</p>
                        <span className="text-[10px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded font-semibold uppercase">Inactive</span>
                      </div>
                      <p className="text-xs text-slate-400 truncate">{info.address || '—'}</p>
                    </div>
                    <Icon name="arrow_forward" size={16} className="text-slate-300 flex-shrink-0 mt-0.5" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
