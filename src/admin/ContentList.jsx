import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { SECTIONS } from '../data/sections'
import { contentStore } from '../data/contentStore'
import { adminStore } from '../data/adminStore'
import Icon from '../components/Icon'

export default function ContentList() {
  const [allBlocks, setAllBlocks] = useState(contentStore.getAllBlocks())
  const properties = adminStore.getProperties()

  useEffect(() => {
    return contentStore.subscribe(() => setAllBlocks(contentStore.getAllBlocks()))
  }, [])

  const getBlockSummary = (block) => {
    if (block.type === 'shared') {
      if (Array.isArray(block.sharedWith) && block.sharedWith.length > 0) {
        const names = block.sharedWith.map(s => properties.find(p => p.slug === s)?.name || s)
        return names.join(', ')
      }
      return 'All Properties'
    }
    return properties.find(p => p.slug === block.propertySlug)?.name || block.propertySlug
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-headline-lg font-bold text-primary">Content List</h1>
        <p className="text-on-surface-variant text-body-md mt-1">
          Complete overview of all guidebook content blocks across sections and properties.
        </p>
      </div>

      <div className="space-y-4">
        {SECTIONS.map((section) => {
          const sectionBlocks = allBlocks.filter((b) => b.sectionKey === section.key)
          return (
            <div key={section.key} className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 overflow-hidden">
              {/* Section header */}
              <div className="flex items-center gap-3 px-5 py-3.5 border-b border-outline-variant/10 bg-surface-container/50">
                <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                  <Icon name={section.icon} size={14} className="text-white" />
                </div>
                <h3 className="font-bold text-on-surface text-label-md flex-1">{section.label}</h3>
                <span className="text-[10px] font-bold text-on-surface-variant bg-outline-variant/20 px-2 py-0.5 rounded-full">
                  {sectionBlocks.length} block{sectionBlocks.length !== 1 ? 's' : ''}
                </span>
                <Link
                  to="/admin/content"
                  className="text-label-sm text-primary hover:underline"
                >
                  Edit →
                </Link>
              </div>

              {sectionBlocks.length === 0 ? (
                <div className="px-5 py-4 text-label-sm text-on-surface-variant italic">
                  No content blocks yet.
                </div>
              ) : (
                <div className="divide-y divide-outline-variant/10">
                  {sectionBlocks
                    .sort((a, b) => {
                      if (a.type !== b.type) return a.type === 'shared' ? -1 : 1
                      return (a.order || 99) - (b.order || 99)
                    })
                    .map((block) => (
                      <div key={block.id} className="flex items-start gap-3 px-5 py-3">
                        <span className={`mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide flex-shrink-0 ${
                          block.type === 'shared'
                            ? 'bg-secondary-container text-secondary'
                            : 'bg-primary/10 text-primary'
                        }`}>
                          {block.type === 'shared'
                            ? (Array.isArray(block.sharedWith) && block.sharedWith.length > 0
                                ? `${block.sharedWith.length} prop`
                                : 'Shared')
                            : 'Prop'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-label-md font-semibold text-on-surface truncate">{block.title}</p>
                          <p className="text-label-sm text-on-surface-variant">
                            {getBlockSummary(block)}
                            {block.images?.length > 0 && ` · ${block.images.length} photo${block.images.length > 1 ? 's' : ''}`}
                            {block.phone && ` · 📞`}
                            {block.link && ` · 🔗`}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
