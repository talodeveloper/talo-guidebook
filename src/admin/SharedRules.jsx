import { useState, useEffect } from 'react'
import { adminStore } from '../data/adminStore'
import { SHARED_SECTION_KEYS, SHARED_SECTION_LABELS } from '../data/sharedContent'
import Icon from '../components/Icon'

const SECTION_ICONS = {
  houseRules: 'gavel',
  legalInfo: 'policy',
  thingsToKnow: 'info',
  checkoutInstructions: 'logout',
  gettingAround: 'directions',
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  })
}

function SectionEditor({ sectionKey, data, onSave }) {
  const [content, setContent] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    // Flatten section to editable text representation
    if (data.content) {
      setContent(data.content)
    } else if (data.rules) {
      setContent(data.rules.map((r) => `${r.title}:\n${r.body}`).join('\n\n'))
    } else if (data.items) {
      setContent(data.items.map((i) => i.text).join('\n'))
    } else if (data.steps) {
      setContent(data.steps.map((s) => `• ${s.text}`).join('\n'))
    } else if (data.options) {
      setContent(data.options.map((o) => `${o.title}:\n${o.body}`).join('\n\n'))
    }
  }, [sectionKey, data])

  const handleSave = () => {
    onSave(sectionKey, content)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="space-y-4">
      <p className="text-on-surface-variant text-body-md">
        Editing this section will instantly update all property guidebook links — no re-sending required.
      </p>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={14}
        className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface text-on-surface text-body-md leading-relaxed focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-y font-mono"
      />
      <div className="flex items-center justify-between">
        <p className="text-label-sm text-on-surface-variant">
          Last updated: {formatDate(data.lastUpdated)}
        </p>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-label-md font-semibold transition-all ${
            saved
              ? 'bg-secondary-container text-primary'
              : 'bg-primary text-white hover:bg-primary-container'
          }`}
        >
          <Icon name={saved ? 'check' : 'save'} size={16} className={saved ? 'text-primary' : 'text-white'} />
          {saved ? 'Saved! All links updated.' : 'Save Section'}
        </button>
      </div>
    </div>
  )
}

export default function SharedRules() {
  const [activeSection, setActiveSection] = useState(SHARED_SECTION_KEYS[0])
  const [shared, setShared] = useState(adminStore.getShared())

  useEffect(() => {
    const unsub = adminStore.subscribe(() => setShared(adminStore.getShared()))
    return unsub
  }, [])

  const handleSave = (key, content) => {
    adminStore.updateSharedSection(key, { content })
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-headline-lg font-bold text-primary mb-1">Shared Rules</h1>
        <p className="text-on-surface-variant text-body-md max-w-2xl">
          These 5 sections are shared across all properties. Edit once — every guest guidebook link reflects the change instantly without any re-sending.
        </p>
      </div>

      {/* Banner */}
      <div className="bg-secondary-container/30 border border-secondary/20 rounded-2xl px-5 py-4 flex items-start gap-3 mb-8">
        <Icon name="bolt" size={20} className="text-primary flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-on-surface text-body-md">Changes are instant</p>
          <p className="text-on-surface-variant text-body-md">
            When you save a shared section, both Reynard Way and Hawk Street guidebook links immediately reflect the new content. No PDF re-sending or link changes needed.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <p className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider mb-3">Sections</p>
          <nav className="space-y-1">
            {SHARED_SECTION_KEYS.map((key) => {
              const data = shared[key]
              return (
                <button
                  key={key}
                  onClick={() => setActiveSection(key)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors ${
                    activeSection === key
                      ? 'bg-secondary-container/60 text-primary font-semibold'
                      : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                  }`}
                >
                  <Icon name={SECTION_ICONS[key]} size={18} />
                  <div className="flex-1 min-w-0">
                    <p className="text-label-md truncate">{SHARED_SECTION_LABELS[key]}</p>
                    <p className="text-label-sm text-on-surface-variant truncate">
                      {formatDate(data?.lastUpdated)}
                    </p>
                  </div>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Editor */}
        <div className="lg:col-span-3">
          {shared[activeSection] && (
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-4 border-b border-outline-variant/10 bg-surface-container/50">
                <Icon name={SECTION_ICONS[activeSection]} size={20} className="text-primary" />
                <h2 className="text-headline-md font-semibold text-primary flex-1">
                  {SHARED_SECTION_LABELS[activeSection]}
                </h2>
                <span className="text-label-sm font-bold text-white bg-primary px-3 py-1 rounded-full">
                  ALL PROPERTIES
                </span>
              </div>
              <div className="p-6">
                <SectionEditor
                  key={activeSection}
                  sectionKey={activeSection}
                  data={shared[activeSection]}
                  onSave={handleSave}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
