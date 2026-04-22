import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Zap, Shield, Clock, TrendingUp, Star, ChevronDown,
  Instagram, Twitter, Youtube, Music2, MessageCircle,
  ArrowRight, CheckCircle2, Globe, BarChart3, Headphones
} from 'lucide-react'

/* ─── Data ────────────────────────────────────────────────────────────────── */
const PLATFORMS = [
  { icon: Instagram, label: 'Instagram', color: 'from-pink-500 to-orange-400' },
  { icon: Music2,    label: 'TikTok',    color: 'from-cyan-400 to-blue-500' },
  { icon: Youtube,   label: 'YouTube',   color: 'from-red-500 to-rose-600' },
  { icon: Twitter,   label: 'Twitter',   color: 'from-sky-400 to-blue-500' },
  { icon: MessageCircle, label: 'Telegram', color: 'from-blue-400 to-indigo-500' },
]

const FEATURES = [
  { icon: Zap,       title: 'Instant Delivery',   desc: 'Orders start processing within seconds of placement. No waiting around.',        color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  { icon: Shield,    title: 'Guaranteed Safe',     desc: 'All services use safe, compliant methods. Your account stays protected.',          color: 'text-emerald-400',bg: 'bg-emerald-400/10' },
  { icon: BarChart3, title: 'Real Growth',         desc: 'Authentic-looking engagement that builds social proof and credibility.',           color: 'text-blue-400',   bg: 'bg-blue-400/10' },
  { icon: Clock,     title: '24/7 Support',        desc: 'Round-the-clock customer support. We\'re here whenever you need help.',           color: 'text-purple-400', bg: 'bg-purple-400/10' },
  { icon: Globe,     title: 'Global Coverage',     desc: 'Services available for accounts worldwide, across all major platforms.',          color: 'text-pink-400',   bg: 'bg-pink-400/10' },
  { icon: Headphones,title: 'Dedicated Panel',     desc: 'Full-featured dashboard to manage all your orders and balance in one place.',     color: 'text-orange-400', bg: 'bg-orange-400/10' },
]

const PLANS = [
  {
    name: 'Starter',
    price: '9.99',
    desc: 'Perfect for individuals getting started',
    features: ['$9.99 balance credit', 'Access to 500+ services', 'Instant order processing', 'Email support'],
    highlight: false,
    badge: null,
  },
  {
    name: 'Growth',
    price: '49.99',
    desc: 'Most popular for content creators',
    features: ['$49.99 balance credit', '5% bonus balance ($52.49)', 'Priority processing', 'Live chat support', 'Order history & analytics'],
    highlight: true,
    badge: 'Most Popular',
  },
  {
    name: 'Pro',
    price: '149.99',
    desc: 'For agencies & power users',
    features: ['$149.99 balance credit', '10% bonus balance ($164.99)', 'Fastest processing', 'Dedicated support', 'API access', 'Bulk order tools'],
    highlight: false,
    badge: 'Best Value',
  },
]

const TESTIMONIALS = [
  { name: 'Sarah Mitchell', role: 'Fashion Influencer', avatar: 'SM', rating: 5, text: 'Viral99 completely transformed my Instagram. My follower count doubled in 3 weeks and engagement is through the roof. Absolutely worth every penny.' },
  { name: 'Carlos Rivera', role: 'YouTube Creator', avatar: 'CR', rating: 5, text: 'I was skeptical at first but the results speak for themselves. My videos are reaching way more people now. The panel is super easy to use too.' },
  { name: 'Priya Sharma',  role: 'Digital Marketing Agency', avatar: 'PS', rating: 5, text: 'We manage 50+ client accounts through Viral99. The API integration and bulk ordering tools save us hours every week. Best SMM panel we\'ve used.' },
  { name: 'Jake Thompson', role: 'TikTok Creator', avatar: 'JT', rating: 5, text: 'My TikTok blew up after using their views service. Got on the FYP multiple times. The delivery is genuinely instant, no exaggeration.' },
]

const FAQS = [
  { q: 'How fast will I see results?', a: 'Most orders start delivering within seconds to a few minutes. Delivery speed varies by service type, but we guarantee the fastest possible processing.' },
  { q: 'Is this safe for my account?', a: 'Yes. All our services use methods compliant with platform terms. We never ask for your password and all growth appears organic.' },
  { q: 'What payment methods do you accept?', a: 'We accept all major credit/debit cards via Stripe\'s secure payment system. Your payment info is never stored on our servers.' },
  { q: 'What happens if my order doesn\'t complete?', a: 'We offer a refill guarantee on qualifying services. If delivery drops below your ordered quantity, contact support for a free refill or refund.' },
  { q: 'Can I order for multiple accounts?', a: 'Absolutely. You can place as many orders as you need for different links. There\'s no limit on the number of orders per account.' },
  { q: 'Do you have an API for resellers?', a: 'Yes! Upgrade to a Pro account to access our reseller API. You can integrate our services into your own panel seamlessly.' },
]

/* ─── Sub-components ──────────────────────────────────────────────────────── */
function NavBar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 nav-gradient border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shadow-glow">
              <TrendingUp size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-white text-lg">Viral99</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            {['Features','Pricing','Testimonials','FAQ'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`}
                className="text-gray-400 hover:text-white text-sm font-medium transition-colors">
                {item}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth/login" className="btn-ghost text-sm">Sign in</Link>
            <Link to="/auth/register" className="btn-primary text-sm">Get Started</Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

function Hero() {
  return (
    <section className="relative pt-28 pb-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-100" />
      <div className="absolute inset-0 bg-hero-gradient" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-accent/10 rounded-full blur-[100px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent-light text-xs font-semibold mb-8 animate-fade-in">
          <Zap size={12} className="fill-current" />
          Trusted by 50,000+ creators worldwide
        </div>

        <h1 className="font-display font-bold text-5xl sm:text-6xl lg:text-7xl text-white leading-[1.05] mb-6 animate-slide-up">
          Grow Your Social<br />
          <span className="text-gradient">Media Presence</span>
        </h1>

        <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
          The most reliable SMM panel for instant followers, views, likes and engagement.
          Real results. Unbeatable prices. Delivered in seconds.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <Link to="/auth/register" className="btn-primary px-8 py-3.5 text-base gap-3 animate-glow-pulse">
            Start Growing Now <ArrowRight size={18} />
          </Link>
          <a href="#pricing" className="btn-secondary px-8 py-3.5 text-base">
            View Pricing
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.3s' }}>
          {[
            { value: '50K+',  label: 'Active Users' },
            { value: '2M+',   label: 'Orders Completed' },
            { value: '500+',  label: 'Services' },
            { value: '99.9%', label: 'Uptime' },
          ].map(stat => (
            <div key={stat.label} className="card px-4 py-3 text-center">
              <div className="font-display font-bold text-xl text-white">{stat.value}</div>
              <div className="text-gray-500 text-xs mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Platform pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-12">
          {PLATFORMS.map(({ icon: Icon, label, color }) => (
            <div key={label} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-dark-800 border border-white/[0.06] text-gray-300 text-sm">
              <div className={`w-4 h-4 rounded bg-gradient-to-br ${color} flex items-center justify-center`}>
                <Icon size={10} className="text-white" />
              </div>
              {label}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Features() {
  return (
    <section id="features" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display font-bold text-4xl text-white mb-4">
            Why Choose <span className="text-gradient">Viral99?</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Everything you need to grow your social media presence, in one powerful platform.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc, color, bg }) => (
            <div key={title} className="card-hover p-6 group">
              <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon size={22} className={color} />
              </div>
              <h3 className="font-display font-semibold text-white text-lg mb-2">{title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Pricing() {
  return (
    <section id="pricing" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/5 to-transparent pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display font-bold text-4xl text-white mb-4">
            Simple, <span className="text-gradient">Transparent</span> Pricing
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Add balance to your account and spend it on any service. No subscriptions, no hidden fees.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {PLANS.map(plan => (
            <div key={plan.name} className={`relative rounded-2xl p-6 flex flex-col ${
              plan.highlight
                ? 'bg-accent border-2 border-accent/70 shadow-glow-lg scale-105'
                : 'card'
            }`}>
              {plan.badge && (
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold ${
                  plan.highlight ? 'bg-white text-accent' : 'bg-accent text-white'
                }`}>
                  {plan.badge}
                </div>
              )}
              <div className="mb-6">
                <h3 className="font-display font-bold text-xl text-white mb-1">{plan.name}</h3>
                <p className={`text-sm ${plan.highlight ? 'text-indigo-200' : 'text-gray-400'}`}>{plan.desc}</p>
              </div>
              <div className="mb-6">
                <span className="font-display font-bold text-4xl text-white">${plan.price}</span>
                <span className={`text-sm ml-2 ${plan.highlight ? 'text-indigo-200' : 'text-gray-500'}`}>one-time</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map(f => (
                  <li key={f} className={`flex items-start gap-2.5 text-sm ${plan.highlight ? 'text-indigo-100' : 'text-gray-300'}`}>
                    <CheckCircle2 size={16} className={`flex-shrink-0 mt-0.5 ${plan.highlight ? 'text-white' : 'text-accent-light'}`} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/auth/register" className={`w-full text-center py-3 rounded-xl font-display font-semibold text-sm transition-all ${
                plan.highlight
                  ? 'bg-white text-accent hover:bg-indigo-50'
                  : 'btn-primary'
              }`}>
                Get Started
              </Link>
            </div>
          ))}
        </div>
        <p className="text-center text-gray-500 text-sm mt-8">
          Or deposit any custom amount from your dashboard. Minimum $1.
        </p>
      </div>
    </section>
  )
}

function Testimonials() {
  return (
    <section id="testimonials" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display font-bold text-4xl text-white mb-4">
            Loved by <span className="text-gradient">Creators</span>
          </h2>
          <p className="text-gray-400 text-lg">Don't take our word for it.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {TESTIMONIALS.map(t => (
            <div key={t.name} className="card-hover p-5 flex flex-col">
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} size={14} className="text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-300 text-sm leading-relaxed flex-1 mb-4">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent-light text-xs font-bold">
                  {t.avatar}
                </div>
                <div>
                  <div className="text-white text-sm font-semibold">{t.name}</div>
                  <div className="text-gray-500 text-xs">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FAQ() {
  const [open, setOpen] = useState(null)
  return (
    <section id="faq" className="py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display font-bold text-4xl text-white mb-4">
            Frequently Asked <span className="text-gradient">Questions</span>
          </h2>
        </div>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div key={i} className={`card overflow-hidden transition-all ${open === i ? 'border-accent/25' : ''}`}>
              <button onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left">
                <span className="font-display font-semibold text-white text-sm">{faq.q}</span>
                <ChevronDown size={18} className={`text-gray-400 flex-shrink-0 transition-transform ${open === i ? 'rotate-180' : ''}`} />
              </button>
              {open === i && (
                <div className="px-5 pb-5">
                  <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTA() {
  return (
    <section className="py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="relative card p-12 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-transparent to-purple-600/10" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-[80px]" />
          <div className="relative">
            <h2 className="font-display font-bold text-4xl text-white mb-4">
              Ready to Go Viral?
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
              Join thousands of creators who trust Viral99 to grow their presence.
              Start with just $1.
            </p>
            <Link to="/auth/register" className="btn-primary px-10 py-4 text-base animate-glow-pulse">
              Create Free Account <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-white/[0.06] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
              <TrendingUp size={14} className="text-white" />
            </div>
            <span className="font-display font-bold text-white">Viral99</span>
          </div>
          <p className="text-gray-500 text-sm">© {new Date().getFullYear()} Viral99. All rights reserved.</p>
          <div className="flex gap-4">
            {['Terms','Privacy','Support'].map(l => (
              <a key={l} href="#" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

/* ─── Main Page ───────────────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-dark-950">
      <NavBar />
      <Hero />
      <Features />
      <Pricing />
      <Testimonials />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  )
}
