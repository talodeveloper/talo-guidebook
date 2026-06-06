import { useState } from 'react'
import { areaGuide } from '../data/properties'
import Icon from '../components/Icon'

const CATEGORIES = ['All', 'Restaurants', 'Things to Do', 'Places to See', 'Nearest Stores']

const RESTAURANT_IMGS = [
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80',
  'https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=600&q=80',
  'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&q=80',
]

const ACTIVITY_IMGS = [
  'https://images.unsplash.com/photo-1504022578-bc48c01abdc8?w=600&q=80',
  'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=600&q=80',
  'https://images.unsplash.com/photo-1475998285801-e4e29c55dd40?w=600&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80',
]

const PLACES_IMGS = [
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80',
  'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=600&q=80',
  'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600&q=80',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80',
  'https://images.unsplash.com/photo-1580927752452-89d86da3fa0a?w=600&q=80',
  'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=600&q=80',
]

function PlaceCard({ name, description, tag, address, phone, url, distance, img }) {
  return (
    <div className="group bg-surface-container-lowest border border-outline-variant/20 rounded-2xl overflow-hidden hover:shadow-teal-md transition-all duration-300">
      <div className="aspect-video relative overflow-hidden">
        <img
          src={img}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 bg-primary/90 text-white px-3 py-1 rounded-full text-label-sm font-bold backdrop-blur-sm">
          {tag}
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-headline-md font-semibold text-primary mb-1">{name}</h3>
        <p className="text-on-surface-variant text-body-md mb-3 leading-relaxed">{description}</p>
        <div className="space-y-1 text-label-sm text-on-surface-variant">
          {address && (
            <div className="flex items-center gap-1.5">
              <Icon name="location_on" size={14} className="text-secondary" />
              {address}
            </div>
          )}
          {phone && (
            <div className="flex items-center gap-1.5">
              <Icon name="phone" size={14} className="text-secondary" />
              <a href={`tel:${phone}`} className="hover:text-primary">{phone}</a>
            </div>
          )}
          {distance && (
            <div className="flex items-center gap-1.5">
              <Icon name="near_me" size={14} className="text-secondary" />
              {distance}
            </div>
          )}
        </div>
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1 text-primary text-label-md font-semibold border border-primary/30 px-4 py-1.5 rounded-lg hover:bg-primary hover:text-white transition-colors"
          >
            View Details <Icon name="open_in_new" size={14} />
          </a>
        )}
      </div>
    </div>
  )
}

export default function LocalGuide() {
  const [active, setActive] = useState('All')

  const show = (cat) => active === 'All' || active === cat

  return (
    <div className="max-w-container-max mx-auto px-5 md:px-16 py-10">
      <div className="mb-8">
        <h1 className="text-headline-xl font-bold text-primary mb-3">Local Guide</h1>
        <p className="text-body-lg text-on-surface-variant max-w-2xl">
          Hand-picked by your host — the best of Mission Hills and San Diego. From sunrise coffee to hidden beach coves.
        </p>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2 mb-10">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`px-4 py-2 rounded-full text-label-md font-semibold transition-colors ${
              active === cat
                ? 'bg-primary text-white shadow-sm'
                : 'bg-surface-container-high text-on-secondary-container hover:bg-secondary-container/50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Restaurants */}
      {show('Restaurants') && (
        <section className="mb-14">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 bg-secondary-container rounded-xl flex items-center justify-center">
              <Icon name="restaurant" size={18} className="text-primary" />
            </div>
            <h2 className="text-headline-lg font-bold text-primary">Restaurants</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {areaGuide.restaurants.map((r, i) => (
              <PlaceCard
                key={r.name}
                name={r.name}
                description={r.description}
                tag={r.cuisine}
                address={r.address}
                phone={r.phone}
                url={r.url}
                img={RESTAURANT_IMGS[i % RESTAURANT_IMGS.length]}
              />
            ))}
          </div>
        </section>
      )}

      {/* Things to Do */}
      {show('Things to Do') && (
        <section className="mb-14">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 bg-secondary-container rounded-xl flex items-center justify-center">
              <Icon name="directions_bike" size={18} className="text-primary" />
            </div>
            <h2 className="text-headline-lg font-bold text-primary">Things to Do</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {areaGuide.thingsToDo.map((item, i) => (
              <PlaceCard
                key={item.title}
                name={item.title}
                description={item.description}
                tag={item.category}
                address={null}
                distance={item.distance}
                url={item.url}
                img={ACTIVITY_IMGS[i % ACTIVITY_IMGS.length]}
              />
            ))}
          </div>
        </section>
      )}

      {/* Places to See */}
      {show('Places to See') && (
        <section className="mb-14">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 bg-secondary-container rounded-xl flex items-center justify-center">
              <Icon name="photo_camera" size={18} className="text-primary" />
            </div>
            <h2 className="text-headline-lg font-bold text-primary">Places to See</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {areaGuide.placesToSee.map((place, i) => (
              <PlaceCard
                key={place.title}
                name={place.title}
                description={place.description}
                tag="Attraction"
                address={place.address}
                url={place.url}
                img={PLACES_IMGS[i % PLACES_IMGS.length]}
              />
            ))}
          </div>
        </section>
      )}

      {/* Nearest Stores */}
      {show('Nearest Stores') && (
        <section className="mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 bg-secondary-container rounded-xl flex items-center justify-center">
              <Icon name="shopping_basket" size={18} className="text-primary" />
            </div>
            <h2 className="text-headline-lg font-bold text-primary">Nearest Stores</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {areaGuide.nearestStores.map((store) => (
              <div
                key={store.name}
                className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-5 flex gap-4 hover:shadow-teal-sm transition-shadow"
              >
                <div className="w-11 h-11 bg-secondary-container rounded-xl flex-shrink-0 flex items-center justify-center">
                  <Icon
                    name={
                      store.type === 'Coffee' ? 'coffee' :
                      store.type === 'Grocery' ? 'shopping_cart' :
                      store.type === 'Pharmacy' ? 'local_pharmacy' :
                      'store'
                    }
                    size={20}
                    className="text-primary"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-on-surface">{store.name}</p>
                    <span className="text-label-sm text-secondary font-bold bg-secondary-container/40 px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
                      {store.type}
                    </span>
                  </div>
                  <p className="text-on-surface-variant text-body-md mt-0.5">{store.address}</p>
                  <div className="flex items-center gap-3 mt-2 text-label-sm text-on-surface-variant">
                    <span className="flex items-center gap-1">
                      <Icon name="near_me" size={12} className="text-secondary" />
                      {store.distance}
                    </span>
                    {store.phone && (
                      <a href={`tel:${store.phone}`} className="flex items-center gap-1 hover:text-primary">
                        <Icon name="phone" size={12} className="text-secondary" />
                        {store.phone}
                      </a>
                    )}
                    {store.notes && <span className="italic">{store.notes}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
