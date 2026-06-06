import { useOutletContext } from 'react-router-dom'
import { sharedContent } from '../data/sharedContent'
import Icon from '../components/Icon'

function SectionCard({ id, icon, title, badge, children }) {
  return (
    <div id={id} className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 overflow-hidden scroll-mt-24">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-outline-variant/10 bg-surface-container/50">
        <div className="w-9 h-9 bg-secondary-container rounded-lg flex items-center justify-center">
          <Icon name={icon} size={18} className="text-primary" />
        </div>
        <h2 className="text-headline-md font-semibold text-primary flex-1">{title}</h2>
        {badge && (
          <span className="text-label-sm font-bold text-secondary bg-secondary-container/60 px-2.5 py-1 rounded-full">
            {badge}
          </span>
        )}
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

export default function HouseManual() {
  const { property } = useOutletContext()
  const shared = sharedContent

  return (
    <div className="max-w-container-max mx-auto px-5 md:px-16 py-10">
      <div className="mb-8">
        <span className="text-label-sm text-secondary font-bold uppercase tracking-widest mb-2 block">House Manual</span>
        <h1 className="text-headline-xl font-bold text-primary mb-2">Everything You Need</h1>
        <p className="text-body-lg text-on-surface-variant max-w-2xl">
          All the essentials for your stay — from WiFi and entry codes to house rules and check-out steps.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column — property-specific */}
        <div className="lg:col-span-2 space-y-5">

          {/* WiFi */}
          <SectionCard id="wifi" icon="wifi" title="Wi-Fi">
            <div className="bg-primary rounded-2xl p-6 text-white">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-white/60 text-label-sm uppercase tracking-wider mb-1">Network Name</p>
                  <p className="text-2xl font-bold">{property.wifi.network}</p>
                </div>
                <div>
                  <p className="text-white/60 text-label-sm uppercase tracking-wider mb-1">Password</p>
                  <p className="text-2xl font-bold">{property.wifi.password}</p>
                </div>
              </div>
              <p className="text-white/70 text-body-md mt-4">{property.wifi.notes}</p>
            </div>
          </SectionCard>

          {/* Entry */}
          <SectionCard id="entry" icon="key" title="How to Enter">
            <ol className="space-y-4">
              {property.entry.instructions.map((step, i) => (
                <li key={i} className="flex gap-4">
                  <span className="w-7 h-7 bg-primary rounded-full text-white text-sm font-bold flex-shrink-0 flex items-center justify-center">
                    {i + 1}
                  </span>
                  <p className="text-on-surface text-body-md pt-0.5 leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </SectionCard>

          {/* Parking */}
          <SectionCard id="parking" icon="local_parking" title="Parking">
            <ul className="space-y-3">
              {property.parking.instructions.map((tip, i) => (
                <li key={i} className="flex gap-3">
                  <Icon name="check_circle" size={18} className="text-secondary flex-shrink-0 mt-0.5" />
                  <p className="text-on-surface text-body-md leading-relaxed">{tip}</p>
                </li>
              ))}
            </ul>
          </SectionCard>

          {/* Bedrooms & Bathrooms */}
          <SectionCard id="rooms" icon="bed" title="Bedrooms & Bathrooms">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
              {[
                { icon: 'king_bed', label: 'Queen Beds', value: property.bedrooms_detail.queensBeds },
                { icon: 'bed', label: 'Full Beds', value: property.bedrooms_detail.fullBeds },
                { icon: 'weekend', label: 'Sofa Beds', value: property.bedrooms_detail.sofaBeds },
                { icon: 'bathroom', label: 'Bathrooms', value: `${property.bathrooms_detail.full} full + ${property.bathrooms_detail.half} half` },
              ].map((item) => (
                <div key={item.label} className="bg-surface-container rounded-xl p-3 text-center">
                  <Icon name={item.icon} size={20} className="text-primary mb-1" />
                  <div className="text-primary font-bold text-lg">{item.value}</div>
                  <div className="text-on-surface-variant text-label-sm">{item.label}</div>
                </div>
              ))}
            </div>
            <p className="text-on-surface-variant text-body-md leading-relaxed">{property.bedrooms_detail.description}</p>
            <p className="text-on-surface-variant text-body-md leading-relaxed mt-2">{property.bathrooms_detail.description}</p>
          </SectionCard>

          {/* Trash */}
          <SectionCard id="trash" icon="delete" title="Trash & Recycling">
            <p className="text-on-surface text-body-md leading-relaxed">{property.trash}</p>
            <div className="flex gap-4 mt-4">
              <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-label-md font-semibold">
                <span className="w-4 h-4 rounded-full bg-blue-500 inline-block"></span>
                Blue = Recycling
              </div>
              <div className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-label-md font-semibold">
                <span className="w-4 h-4 rounded-full bg-gray-600 inline-block"></span>
                Black = Trash
              </div>
            </div>
          </SectionCard>

          {/* Pets */}
          <SectionCard id="pets" icon={property.petsAllowed ? 'pets' : 'do_not_disturb'} title="Pet Policy">
            <div className={`rounded-xl p-4 flex gap-3 ${property.petsAllowed ? 'bg-secondary-container/30' : 'bg-error-container/30'}`}>
              <Icon
                name={property.petsAllowed ? 'check_circle' : 'cancel'}
                size={22}
                className={property.petsAllowed ? 'text-secondary' : 'text-error'}
              />
              <div>
                {property.petsAllowed ? (
                  <>
                    <p className="text-on-surface font-semibold">Pets are welcome with prior approval</p>
                    <p className="text-on-surface-variant text-body-md mt-1">
                      A fee of {property.petFee} applies to help with cleaning. The property has a fenced yard — please supervise pets outdoors.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-on-surface font-semibold">No pets allowed at this property</p>
                    <p className="text-on-surface-variant text-body-md mt-1">
                      No pets, wildlife, or animals of any kind on the property at any time without permission from the host. Fees will be charged for violations.
                    </p>
                  </>
                )}
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Right column — shared rules */}
        <div className="space-y-5">
          {/* House rules */}
          <div id="rules" className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 overflow-hidden scroll-mt-24">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-outline-variant/10 bg-primary">
              <Icon name="gavel" size={18} className="text-white" />
              <h2 className="text-headline-md font-semibold text-white flex-1">House Rules</h2>
              <span className="text-label-sm font-bold text-primary bg-white px-2.5 py-1 rounded-full">ALL PROPERTIES</span>
            </div>
            <div className="p-5 space-y-4">
              {shared.houseRules.rules.map((rule) => (
                <div key={rule.number} className="flex gap-3">
                  <div className="w-9 h-9 bg-surface-container rounded-lg flex-shrink-0 flex items-center justify-center">
                    <Icon name={rule.icon} size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-on-surface text-body-md">{rule.title}</p>
                    <p className="text-on-surface-variant text-body-md mt-0.5 leading-relaxed">{rule.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Things to know */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-outline-variant/10 bg-surface-container/50">
              <Icon name="info" size={18} className="text-primary" />
              <h2 className="text-headline-md font-semibold text-primary">Things to Know</h2>
              <span className="text-label-sm font-bold text-secondary bg-secondary-container/60 px-2.5 py-1 rounded-full ml-auto">ALL</span>
            </div>
            <div className="p-5 space-y-3">
              {shared.thingsToKnow.items.map((item, i) => (
                <div key={i} className="flex gap-3">
                  <Icon name={item.icon} size={18} className="text-secondary flex-shrink-0 mt-0.5" />
                  <p className="text-on-surface-variant text-body-md leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Getting around */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-outline-variant/10 bg-surface-container/50">
              <Icon name="directions" size={18} className="text-primary" />
              <h2 className="text-headline-md font-semibold text-primary">Getting Around</h2>
              <span className="text-label-sm font-bold text-secondary bg-secondary-container/60 px-2.5 py-1 rounded-full ml-auto">ALL</span>
            </div>
            <div className="p-5 space-y-4">
              {shared.gettingAround.options.map((opt) => (
                <div key={opt.title} className="flex gap-3">
                  <div className="w-9 h-9 bg-secondary-container rounded-lg flex-shrink-0 flex items-center justify-center">
                    <Icon name={opt.icon} size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-on-surface text-body-md">{opt.title}</p>
                    <p className="text-on-surface-variant text-body-md mt-0.5 leading-relaxed">{opt.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency */}
          <div className="bg-error/5 border border-error/20 rounded-2xl p-5">
            <div className="flex gap-3 items-start">
              <Icon name="emergency" size={22} className="text-error flex-shrink-0" />
              <div>
                <p className="font-bold text-on-surface mb-1">Emergency Contacts</p>
                <p className="text-on-surface-variant text-body-md">
                  Police / Medical / Fire: <strong>911</strong>
                </p>
                <p className="text-on-surface-variant text-body-md">
                  Host: <a href={`tel:${property.ownerPhone}`} className="text-primary font-semibold">{property.ownerPhone}</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
