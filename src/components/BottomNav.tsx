import { NavLink } from 'react-router-dom'
import { Home, CheckSquare, Heart, Image, Settings as SettingsIcon } from 'lucide-react'

const ITEMS = [
  { to: '/dashboard', label: 'Home', icon: Home },
  { to: '/habits', label: 'Habits', icon: CheckSquare },
  { to: '/boards', label: 'Boards', icon: Image },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
] as const

export default function BottomNav() {
  return (
    <>
      <nav className="fixed bottom-0 inset-x-0 h-20 bg-white/95 backdrop-blur border-t border-line flex items-center justify-around px-4 pb-4 pt-2 z-40">
        {ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 text-[11px] ${isActive ? 'text-apeksha' : 'text-muted'}`
            }
          >
            <Icon size={22} strokeWidth={1.8} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Buzzer FAB — center-bottom, sits above the nav */}
      <button
        aria-label="Buzz partner"
        className="fixed bottom-14 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-coral text-white shadow-lg shadow-coral/30 flex items-center justify-center z-50 active:scale-95 transition"
      >
        <Heart size={24} fill="currentColor" />
      </button>
    </>
  )
}
