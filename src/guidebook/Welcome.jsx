import { useOutletContext, Link, useParams } from 'react-router-dom'
import { areaGuide } from '../data/properties'
import { sharedContent } from '../data/sharedContent'
import Icon from '../components/Icon'

export default function Welcome() {
  const { property } = useOutletContext()
  const { slug } = useParams()

  const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(property.address)}`

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[560px] md:h-[680px] overflow-hidden">
        <img
          src={property.photos.hero}
          alt={`${property.name} exterior`}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 hero-gradient flex flex-col justify-end pb-12 px-5 md:px-16 text-white">
          <div className="max-w-2xl">
            <span className="inline-block bg-secondary/70 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-label-sm font-bold uppercase tracking-widest mb-4">
              Guest Guidebook · {property.neighborhood}
            </span>
            <h1 className="text-4xl md:text-headline-xl font-bold mb-3 leading-tight">
              Welcome to<br />{property.name}
            </h1>
            <p className="text-lg opacity-90 max-w-lg mb-6 leading-relaxed">
              {property.welcomeMessage}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to={`/${slug}/manual`}
                className="bg-primary text-white px-6 py-3 rounded-xl text-label-md font-semibold flex items-center gap-2 hover:bg-primary-container transition-colors"
              >
                <Icon name="menu_book" size={18} className="text-white" />
                House Manual
              </Link>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/20 backdrop-blur-md text-white border border-white/30 px-6 py-3 rounded-xl text-label-md font-semibold flex items-center gap-2 hover:bg-white/30 transition-colors"
              >
                <Icon name="map" size={18} className="text-white" />
                Get Directions
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Essentials bento grid */}
      <section className="max-w-container-max mx-auto px-5 md:px-16 mt-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

          {/* WiFi card */}
          <div className="md:col-span-2 bg-white rounded-2xl p-7 border border-outline-variant/30 shadow-teal-sm hover:shadow-teal-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 bg-secondary-container rounded-xl flex items-center justify-center mb-5">
                <Icon name="wifi" size={22} className="text-primary" />
              </div>
              <h3 className="text-headline-md font-semibold text-primary mb-1">Wi-Fi</h3>
              <p className="text-on-surface-variant text-body-md mb-5">{property.wifi.notes}</p>
            </div>
            <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/20 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-label-sm text-on-surface-variant uppercase tracking-wider">Network</span>
                <span className="font-bold text-primary">{property.wifi.network}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-label-sm text-on-surface-variant uppercase tracking-wider">Password</span>
                <span className="font-bold text-primary">{property.wifi.password}</span>
              </div>
            </div>
          </div>

          {/* Address card */}
          <div className="bg-white rounded-2xl p-7 border border-outline-variant/30 shadow-teal-sm hover:shadow-teal-md transition-shadow">
            <div className="w-11 h-11 bg-secondary-container rounded-xl flex items-center justify-center mb-5">
              <Icon name="home_pin" size={22} className="text-primary" />
            </div>
            <h3 className="text-headline-md font-semibold text-primary mb-3">Location</h3>
            <p className="text-on-surface-variant text-body-md mb-5 leading-relaxed">{property.address}</p>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary text-label-md font-semibold flex items-center gap-1 hover:underline"
            >
              Get Directions <Icon name="open_in_new" size={14} className="text-primary" />
            </a>
          </div>

          {/* Contact card */}
          <div className="bg-primary rounded-2xl p-7 shadow-teal-md hover:shadow-teal-lg transition-shadow flex flex-col">
            <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center mb-5">
              <Icon name="support_agent" size={22} className="text-white" />
            </div>
            <h3 className="text-headline-md font-semibold text-white mb-2">Need Help?</h3>
            <p className="text-white/80 text-body-md mb-auto leading-relaxed">
              Your host {property.ownerName} is available. Reach out anytime.
            </p>
            <div className="mt-6 space-y-2">
              <a
                href={`tel:${property.ownerPhone}`}
                className="bg-white text-primary w-full py-2.5 rounded-xl text-label-md font-semibold flex items-center justify-center gap-2 hover:bg-secondary-container transition-colors"
              >
                <Icon name="phone" size={16} className="text-primary" /> Call Host
              </a>
              <a
                href={`mailto:${property.ownerEmail}`}
                className="bg-white/20 text-white w-full py-2.5 rounded-xl text-label-md font-semibold flex items-center justify-center gap-2 hover:bg-white/30 transition-colors"
              >
                <Icon name="mail" size={16} className="text-white" /> Email Host
              </a>
            </div>
          </div>

          {/* Amenity chips */}
          <div className="md:col-span-4">
            <h4 className="text-label-sm text-on-surface-variant font-bold uppercase tracking-widest mb-4">Property Amenities</h4>
            <div className="flex flex-wrap gap-2">
              {property.amenities.map((amenity) => (
                <span
                  key={amenity}
                  className="bg-surface-container text-on-surface px-4 py-2 rounded-full text-label-md border border-outline-variant/30 flex items-center gap-1.5"
                >
                  <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
                  {amenity}
                </span>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Parking', icon: 'local_parking', tab: 'manual', hash: 'parking' },
              { label: 'Entry Code', icon: 'key', tab: 'manual', hash: 'entry' },
              { label: 'House Rules', icon: 'gavel', tab: 'manual', hash: 'rules' },
              { label: 'Check-Out', icon: 'logout', tab: 'checkout', hash: '' },
            ].map((link) => (
              <Link
                key={link.label}
                to={`/${slug}/${link.tab}${link.hash ? `#${link.hash}` : ''}`}
                className="bg-surface-container rounded-xl p-4 flex items-center gap-3 border border-outline-variant/20 hover:bg-surface-container-high hover:border-outline-variant/40 transition-all cursor-pointer group"
              >
                <div className="p-2 bg-white rounded-lg shadow-teal-sm group-hover:shadow-teal-md transition-shadow">
                  <Icon name={link.icon} size={20} className="text-primary" />
                </div>
                <span className="text-headline-md text-on-surface font-semibold text-[1rem]">{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Area guide preview */}
      <section className="max-w-container-max mx-auto px-5 md:px-16 mt-16 pb-8">
        <div className="flex justify-between items-end mb-7">
          <div>
            <h2 className="text-headline-lg text-primary font-bold">Explore the Neighborhood</h2>
            <p className="text-on-surface-variant text-body-md">Hand-picked by your host, Joe Saari.</p>
          </div>
          <Link
            to={`/${slug}/guide`}
            className="hidden md:flex items-center gap-1.5 text-primary text-label-md font-semibold hover:translate-x-0.5 transition-transform"
          >
            Full Guide <Icon name="arrow_forward" size={18} className="text-primary" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {areaGuide.restaurants.slice(0, 3).map((r) => (
            <div key={r.name} className="group cursor-pointer">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4 border border-outline-variant/20 shadow-teal-sm">
                <img
                  src={`https://images.unsplash.com/photo-${r.name.includes('Filipino') || r.name.includes('Filippi') ? '1555396273-367ea4eb4db5' : r.name.includes('Thai') ? '1562565652-a0d8f0c59eb4' : '1517248135467-4c7edcad34c4'}?w=600&q=80`}
                  alt={r.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3">
                  <span className="bg-white/90 backdrop-blur-md text-primary px-3 py-1 rounded-full text-label-sm font-bold">
                    {r.cuisine}
                  </span>
                </div>
              </div>
              <h4 className="text-headline-md font-semibold text-primary mb-1 group-hover:text-secondary transition-colors">
                {r.name}
              </h4>
              <p className="text-on-surface-variant text-body-md">{r.description}</p>
            </div>
          ))}
        </div>

        <Link
          to={`/${slug}/guide`}
          className="md:hidden mt-6 flex items-center justify-center gap-1.5 text-primary text-label-md font-semibold border border-primary/30 py-3 rounded-xl hover:bg-primary hover:text-white transition-colors"
        >
          View Full Local Guide <Icon name="arrow_forward" size={18} />
        </Link>
      </section>

      {/* Host welcome note */}
      <section className="max-w-container-max mx-auto px-5 md:px-16 pb-8">
        <div className="bg-primary/5 border border-primary/10 rounded-2xl p-8 flex gap-6 items-start">
          <div className="w-14 h-14 bg-primary rounded-full flex-shrink-0 flex items-center justify-center">
            <Icon name="person" size={28} className="text-white" />
          </div>
          <div>
            <p className="text-on-surface text-body-lg leading-relaxed mb-3 italic">
              "San Diego has so much to offer — beaches, parks, water activities, museums, restaurants, and nightlife. We've curated our favorite spots to help you make the most of your visit!"
            </p>
            <div className="flex items-center gap-2">
              <span className="text-primary font-bold text-label-md">{property.ownerName}</span>
              <span className="text-on-surface-variant text-label-sm">· Host & Founder, TALO Rentals</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
