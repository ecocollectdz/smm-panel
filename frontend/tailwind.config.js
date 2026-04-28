/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: { base:'#020805', deep:'#040f07', card:'#070f09', elevated:'#0b1a0e', hover:'#0f2214' },
        g: { 400:'#4ade80', 500:'#22c55e', 600:'#16a34a', 700:'#15803d' },
        accent: { DEFAULT:'#22c55e', light:'#4ade80', dim:'rgba(34,197,94,0.12)', glow:'rgba(34,197,94,0.3)' },
        gold: '#f59e0b',
      },
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        body:    ['"DM Sans"', 'sans-serif'],
        arabic:  ['"Cairo"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'grid-green': 'linear-gradient(rgba(34,197,94,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(34,197,94,0.03) 1px,transparent 1px)',
        'radial-green': 'radial-gradient(ellipse 80% 50% at 50% -20%,rgba(34,197,94,0.15) 0%,transparent 60%)',
        'money': 'linear-gradient(135deg,#22c55e,#15803d)',
      },
      boxShadow: {
        'glow-sm': '0 0 15px rgba(34,197,94,0.2)',
        'glow':    '0 0 30px rgba(34,197,94,0.25)',
        'glow-lg': '0 0 60px rgba(34,197,94,0.3)',
        'card':    '0 1px 0 rgba(255,255,255,0.06),0 4px 20px rgba(0,0,0,0.4)',
        'premium': '0 0 0 1px rgba(34,197,94,0.15),0 8px 40px rgba(0,0,0,0.5)',
      },
      animation: {
        'shimmer': 'shimmer 2.5s infinite',
        'marquee': 'marquee 30s linear infinite',
        'border-glow': 'borderGlow 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        shimmer: { '0%':{ backgroundPosition:'-200% 0' }, '100%':{ backgroundPosition:'200% 0' } },
        marquee: { '0%':{ transform:'translateX(0)' }, '100%':{ transform:'translateX(-50%)' } },
        borderGlow: { '0%,100%':{ borderColor:'rgba(34,197,94,0.2)' }, '50%':{ borderColor:'rgba(34,197,94,0.6)' } },
        float: { '0%,100%':{ transform:'translateY(0px)' }, '50%':{ transform:'translateY(-12px)' } },
      },
    },
  },
  plugins: [],
}
