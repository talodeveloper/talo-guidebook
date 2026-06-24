import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { adminV3Store, BASE_PROPERTY_SLUGS } from '../../data/adminV3Store'
import { getHostMode, guidebookPath } from '../../data/tenant'
import Icon from '../../components/Icon'

// Full href to a guest guidebook, correct for the current host:
//   tenant subdomain -> /{slug} ; legacy/gh-pages -> /talo-guidebook/v3/{slug}
const guidebookHref = (slug) =>
  `${import.meta.env.BASE_URL.replace(/\/$/, '')}${guidebookPath(slug)}`

const COOL_OFF_DAYS = 30

// ── Two-layer delete confirmation ───────────────────────────────────────────
function DeletePropertyZone({ slug, propEntry, propertyName }) {
  const navigate = useNavigate()
  // 'idle' | 'warning' | 'credentials'
  const [stage, setStage] = useState('idle')
  const [creds, setCreds] = useState({ email: '', password: '' })
  const [credError, setCredError] = useState('')

  const deactivatedAt = propEntry?.deactivatedAt ? new Date(propEntry.deactivatedAt) : null
  const daysSince = deactivatedAt ? (Date.now() - deactivatedAt.getTime()) / 86400000 : 0
  const daysLeft = Math.max(0, Math.ceil(COOL_OFF_DAYS - daysSince))
  const canDelete = deactivatedAt && daysSince >= COOL_OFF_DAYS

  const handleFinalDelete = async () => {
    const ok = await adminV3Store.verifyCredentials(creds.email.trim(), creds.password)
    if (!ok) {
      setCredError('Incorrect email or password. Property was NOT deleted.')
      return
    }
    adminV3Store.deleteProperty(slug)
    navigate('/admin-v3/dashboard')
  }

  return (
    <div className="mt-8 rounded-2xl border border-red-200 bg-red-50/50 p-5">
      <p className="text-xs font-bold text-red-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
        <Icon name="warning" size={12} /> Danger Zone
      </p>

      {!canDelete ? (
        <p className="text-xs text-slate-500">
          <Icon name="hourglass_top" size={12} className="inline text-red-400 mr-1" />
          This property is deactivated. As a safety measure, permanent deletion becomes available{' '}
          <strong>{daysLeft} day{daysLeft !== 1 ? 's' : ''}</strong> from now ({COOL_OFF_DAYS}-day cool-off period).
          You can re-activate it at any time.
        </p>
      ) : stage === 'idle' ? (
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-xs text-slate-600">
            The {COOL_OFF_DAYS}-day cool-off period has passed. You can now permanently delete this property.
          </p>
          <button onClick={() => setStage('warning')}
            className="text-xs px-3 py-1.5 rounded-lg font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors">
            Delete Property…
          </button>
        </div>
      ) : stage === 'warning' ? (
        <div className="space-y-3">
          <p className="text-sm font-bold text-red-700">Are you sure you want to delete "{propertyName}"?</p>
          <p className="text-xs text-red-600 leading-relaxed">
            You will lose access to its guidebook, all section content, house-rule ordering, FAQ,
            activity curation, and property settings. <strong>This cannot be undone.</strong>
          </p>
          <div className="flex gap-2">
            <button onClick={() => setStage('idle')}
              className="text-xs px-3 py-1.5 rounded-lg font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50">
              Cancel
            </button>
            <button onClick={() => setStage('credentials')}
              className="text-xs px-3 py-1.5 rounded-lg font-semibold text-white bg-red-500 hover:bg-red-600">
              Yes, continue
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3 max-w-sm">
          <p className="text-sm font-bold text-red-700">Confirm with your admin credentials</p>
          <p className="text-xs text-slate-500">Enter the admin panel email and password to permanently delete this property.</p>
          <input type="email" value={creds.email} autoComplete="off"
            onChange={e => { setCreds(c => ({ ...c, email: e.target.value })); setCredError('') }}
            placeholder="Admin email"
            className="w-full px-3 py-2 text-sm rounded-lg border border-red-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-red-300" />
          <input type="password" value={creds.password} autoComplete="new-password"
            onChange={e => { setCreds(c => ({ ...c, password: e.target.value })); setCredError('') }}
            placeholder="Admin password"
            className="w-full px-3 py-2 text-sm rounded-lg border border-red-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-red-300" />
          {credError && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <Icon name="error" size={12} /> {credError}
            </p>
          )}
          <div className="flex gap-2">
            <button onClick={() => { setStage('idle'); setCreds({ email: '', password: '' }); setCredError('') }}
              className="text-xs px-3 py-1.5 rounded-lg font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50">
              Cancel
            </button>
            <button onClick={handleFinalDelete}
              disabled={!creds.email.trim() || !creds.password}
              className="text-xs px-3 py-1.5 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-40">
              Permanently Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}


export default function PropertyHomeV3() {
  const { slug } = useParams()
  const [info, setInfo] = useState(adminV3Store.getPropertyInfo(slug))
  const [propertiesList, setPropertiesList] = useState(adminV3Store.getPropertiesList())
  const [sectionConfig, setSectionConfig] = useState(adminV3Store.getSectionConfig(slug))
  const [confirmStatus, setConfirmStatus] = useState(false)

  useEffect(() => {
    // Re-fetch immediately when navigating between properties (slug change),
    // not just when the store notifies — otherwise stale data shows.
    const refresh = () => {
      setInfo(adminV3Store.getPropertyInfo(slug))
      setPropertiesList(adminV3Store.getPropertiesList())
      setSectionConfig(adminV3Store.getSectionConfig(slug))
    }
    refresh()
    return adminV3Store.subscribe(refresh)
  }, [slug])

  const propEntry = propertiesList.find(p => p.slug === slug)
  const isActive = propEntry?.status === 'active'
  const isBaseProperty = BASE_PROPERTY_SLUGS.includes(slug)

  const blockCount = (sectionKey) =>
    adminV3Store.getBlocksForSection(sectionKey, slug).length

  const handleToggleStatus = () => {
    if (!confirmStatus) { setConfirmStatus(true); return }
    adminV3Store.setPropertyStatus(slug, isActive ? 'inactive' : 'active')
    setConfirmStatus(false)
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-6">
        <Link to="/admin-v3/dashboard" className="hover:text-slate-600">Dashboard</Link>
        <Icon name="chevron_right" size={12} />
        <span className="text-slate-700 font-medium">{info.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-slate-400'}`} />
            <h1 className="text-2xl font-bold text-slate-900">{info.name || slug}</h1>
          </div>
          <p className="text-sm text-slate-500">{info.address || 'No address set'}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          {confirmStatus ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Are you sure?</span>
              <button onClick={() => setConfirmStatus(false)}
                className="text-xs px-2 py-1 rounded-lg hover:bg-slate-100 text-slate-500">No</button>
              <button onClick={handleToggleStatus}
                className={`text-xs px-3 py-1 rounded-lg font-semibold text-white ${isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}>
                {isActive ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          ) : (
            <button
              onClick={handleToggleStatus}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                isActive
                  ? 'text-slate-500 hover:bg-red-50 hover:text-red-600 border border-slate-200'
                  : 'text-green-700 hover:bg-green-50 border border-green-200'
              }`}
            >
              {isActive ? 'Deactivate Property' : 'Activate Property'}
            </button>
          )}
        </div>
      </div>

      {/* Quick action cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <Link to={`/admin-v3/property/${slug}/info`}
          className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:border-orange-200 hover:shadow-sm transition-all group">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #C84B31, #EA580C)' }}>
            <Icon name="tune" size={16} className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">Property Info</p>
            <p className="text-xs text-slate-500">WiFi, host, details</p>
          </div>
          <Icon name="arrow_forward" size={14} className="ml-auto text-slate-300 group-hover:text-orange-600 transition-colors flex-shrink-0" />
        </Link>

        <Link to={`/admin-v3/property/${slug}/faq`}
          className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:border-orange-200 hover:shadow-sm transition-all group">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #B45309, #D97706)' }}>
            <Icon name="help" size={16} className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">FAQ</p>
            <p className="text-xs text-slate-500">{adminV3Store.getFaq(slug).length} questions</p>
          </div>
          <Icon name="arrow_forward" size={14} className="ml-auto text-slate-300 group-hover:text-orange-600 transition-colors flex-shrink-0" />
        </Link>

        <Link to={`/admin-v3/property/${slug}/activities`}
          className="flex items-center gap-3 p-4 bg-white rounded-xl border border-orange-100 hover:border-orange-300 hover:shadow-sm transition-all group"
          style={{ background: 'linear-gradient(135deg, #FFF7ED, #FEF3C7)' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #C84B31, #EA580C)' }}>
            <Icon name="explore" size={16} className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">Activity Center</p>
            <p className="text-xs text-slate-500">Curate activities</p>
          </div>
          <Icon name="arrow_forward" size={14} className="ml-auto text-slate-300 group-hover:text-orange-600 transition-colors flex-shrink-0" />
        </Link>

        <Link to={`/admin-v3/property/${slug}/section/checkout`}
          className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:border-orange-200 hover:shadow-sm transition-all group">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-slate-700">
            <Icon name="checklist" size={16} className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">Check-Out</p>
            <p className="text-xs text-slate-500">Checklist</p>
          </div>
          <Icon name="arrow_forward" size={14} className="ml-auto text-slate-300 group-hover:text-orange-600 transition-colors flex-shrink-0" />
        </Link>
      </div>

      {/* Sections grid — driven by the per-property section config */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Guidebook Sections</p>
        <Link to={`/admin-v3/property/${slug}/sections`}
          className="flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 font-semibold">
          <Icon name="tune" size={13} /> Manage Sections — reorder, disable, add custom
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {sectionConfig.filter(s => !s.page).map(section => {
          const count = blockCount(section.key)
          const disabled = section.enabled === false
          return (
            <Link key={section.key}
              to={`/admin-v3/property/${slug}/section/${section.key}`}
              className={`bg-white rounded-xl border p-4 hover:border-orange-200 hover:shadow-sm transition-all group flex flex-col gap-2 ${disabled ? 'border-slate-200 opacity-50' : 'border-slate-200'}`}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: section.custom ? 'linear-gradient(135deg, #4338CA, #6D28D9)' : 'linear-gradient(135deg, #C84B31, #EA580C)' }}>
                <Icon name={section.icon} size={15} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900 leading-tight">{section.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {count} block{count !== 1 ? 's' : ''}{disabled ? ' · hidden' : ''}
                </p>
              </div>
              <Icon name="edit" size={13} className="text-slate-300 group-hover:text-orange-500 transition-colors self-end" />
            </Link>
          )
        })}
      </div>

      {/* Preview + V3 guidebook links */}
      <div className="mt-8 pt-6 border-t border-slate-100 flex gap-4">
        <a href={guidebookHref(slug)} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-orange-600 transition-colors">
          <Icon name="open_in_new" size={13} />
          Preview guidebook
        </a>
        {/* V2 only exists for the original properties on the legacy host — not on
            tenant subdomains, where everything is V3. */}
        {isBaseProperty && getHostMode() !== 'tenant' && (
          <a href={`${import.meta.env.BASE_URL}v2/${slug}`} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors">
            <Icon name="open_in_new" size={13} />
            V2 guidebook
          </a>
        )}
      </div>

      {/* Delete — only offered while deactivated, after the cool-off */}
      {!isActive && (
        <DeletePropertyZone slug={slug} propEntry={propEntry} propertyName={info.name || slug} />
      )}
    </div>
  )
}
