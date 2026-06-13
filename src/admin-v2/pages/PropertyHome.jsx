import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { adminV2Store } from '../../data/adminV2Store'
import { SECTIONS } from '../../data/sections'
import Icon from '../../components/Icon'

const EDITABLE_SECTIONS = SECTIONS.filter(s =>
  s.key !== 'videos' && s.key !== 'checkout'
)

export default function PropertyHome() {
  const { slug } = useParams()
  const [info, setInfo] = useState(adminV2Store.getPropertyInfo(slug))

  useEffect(() => {
    return adminV2Store.subscribe(() => setInfo(adminV2Store.getPropertyInfo(slug)))
  }, [slug])

  const blockCount = (sectionKey) =>
    adminV2Store.getBlocksForSection(sectionKey, slug).length

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-6">
        <Link to="/admin-v2/dashboard" className="hover:text-slate-600">Dashboard</Link>
        <Icon name="chevron_right" size={12} />
        <span className="text-slate-700 font-medium">{info.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{info.name}</h1>
          <p className="text-sm text-slate-500 mt-1">{info.address}</p>
        </div>
      </div>

      {/* Quick action cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        <Link to={`/admin-v2/property/${slug}/info`}
          className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:border-orange-200 hover:shadow-sm transition-all group">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #C84B31, #EA580C)' }}>
            <Icon name="tune" size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Property Info</p>
            <p className="text-xs text-slate-500">WiFi, host, details</p>
          </div>
          <Icon name="arrow_forward" size={14} className="ml-auto text-slate-300 group-hover:text-orange-600 transition-colors" />
        </Link>

        <Link to={`/admin-v2/property/${slug}/faq`}
          className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:border-orange-200 hover:shadow-sm transition-all group">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #B45309, #D97706)' }}>
            <Icon name="help" size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">FAQ</p>
            <p className="text-xs text-slate-500">{adminV2Store.getFaq(slug).length} questions</p>
          </div>
          <Icon name="arrow_forward" size={14} className="ml-auto text-slate-300 group-hover:text-orange-600 transition-colors" />
        </Link>

        <Link to={`/admin-v2/property/${slug}/section/checkout`}
          className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:border-orange-200 hover:shadow-sm transition-all group">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-slate-700">
            <Icon name="checklist" size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Check-Out</p>
            <p className="text-xs text-slate-500">Checklist & instructions</p>
          </div>
          <Icon name="arrow_forward" size={14} className="ml-auto text-slate-300 group-hover:text-orange-600 transition-colors" />
        </Link>
      </div>

      {/* Sections grid */}
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Guidebook Sections</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {EDITABLE_SECTIONS.map(section => {
          const count = blockCount(section.key)
          return (
            <Link key={section.key}
              to={`/admin-v2/property/${slug}/section/${section.key}`}
              className="bg-white rounded-xl border border-slate-200 p-4 hover:border-orange-200 hover:shadow-sm transition-all group flex flex-col gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #C84B31, #EA580C)' }}>
                <Icon name={section.icon} size={15} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900 leading-tight">{section.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{count} block{count !== 1 ? 's' : ''}</p>
              </div>
              <Icon name="edit" size={13} className="text-slate-300 group-hover:text-orange-500 transition-colors self-end" />
            </Link>
          )
        })}
      </div>

      {/* Preview link */}
      <div className="mt-8 pt-6 border-t border-slate-100">
        <a href={`/v2/${slug}`} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-orange-600 transition-colors">
          <Icon name="open_in_new" size={13} />
          Preview guidebook
        </a>
      </div>
    </div>
  )
}
