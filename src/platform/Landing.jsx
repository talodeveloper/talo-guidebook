import { Link } from 'react-router-dom'
import Icon from '../components/Icon'

const BRAND = 'linear-gradient(135deg, #C84B31, #EA580C)'

function Feature({ icon, title, body }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: '#FFF1EC' }}>
        <Icon name={icon} size={22} className="text-orange-600" />
      </div>
      <h3 className="text-base font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{body}</p>
    </div>
  )
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top nav */}
      <header className="w-full">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: BRAND }}>
              <span className="text-white text-lg font-black">T</span>
            </div>
            <span className="text-lg font-bold text-slate-900">Talo</span>
          </div>
          <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
            Log in
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="max-w-3xl mx-auto px-6 pt-16 pb-12 text-center">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-orange-600 mb-4">
            Digital guidebooks for short-term rentals
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
            Beautiful guidebooks your guests will actually use.
          </h1>
          <p className="text-lg text-slate-500 mt-5 leading-relaxed">
            Give every guest a gorgeous, mobile-friendly guide to your property — check-in details,
            house rules, local recommendations, and more. Set up in minutes, no app required.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              to="/signup"
              className="px-6 py-3 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
              style={{ background: BRAND }}
            >
              Get started free
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 rounded-xl text-sm font-bold text-slate-700 bg-white border border-slate-200 hover:border-slate-300 transition-colors"
            >
              Log in
            </Link>
          </div>
          <p className="text-xs text-slate-400 mt-4">Free during beta · No credit card required</p>
        </section>

        {/* Features */}
        <section className="max-w-5xl mx-auto px-6 pb-20 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Feature icon="menu_book" title="Your own guidebook" body="A polished guide per property — entry instructions, Wi-Fi, house rules, and an activity center for local tips." />
          <Feature icon="bolt" title="Live in minutes" body="Edit everything from a simple admin panel and publish instantly. Guests open a link — nothing to install." />
          <Feature icon="public" title="Your own address" body="Every workspace gets its own subdomain, like yourname.talo.llc, with secure hosting included." />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between text-xs text-slate-400">
          <span>© {new Date().getFullYear()} Talo Rentals</span>
          <Link to="/signup" className="font-semibold text-slate-500 hover:text-slate-900">Get started →</Link>
        </div>
      </footer>
    </div>
  )
}
