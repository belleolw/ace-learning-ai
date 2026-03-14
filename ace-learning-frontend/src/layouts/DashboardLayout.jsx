import { useEffect, useRef, useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"

export default function DashboardLayout({
  profileName,
  profileSubtitle,
  navItems = [],
  children,
}) {
  const navigate = useNavigate()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleSignOut = () => {
    setIsDropdownOpen(false)
    navigate("/")
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
        <header className="mb-6 flex items-center justify-between rounded-3xl border border-slate-200 bg-white px-6 py-4 shadow-sm">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-500 text-sm font-bold text-white shadow-sm">
                A
              </div>
              <div>
                <div className="text-sm font-medium text-slate-500">Platform</div>
                <div className="text-lg font-semibold tracking-tight">Ace Learning</div>
              </div>
            </div>

            <nav className="hidden items-center gap-2 md:flex">
              {navItems.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.to}
                  className={({ isActive }) =>
                    `rounded-xl px-4 py-2 text-sm font-medium transition ${
                      isActive
                        ? "bg-blue-50 text-blue-600"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm">
              <span className="text-lg">🔔</span>
              <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-rose-500" />
            </button>

            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm transition hover:bg-slate-50"
              >
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500 to-blue-500" />
                <div className="hidden text-left sm:block">
                  <div className="text-sm font-semibold">{profileName}</div>
                  <div className="text-xs text-slate-500">{profileSubtitle}</div>
                </div>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 top-[calc(100%+0.75rem)] z-20 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
                  <div className="rounded-xl px-3 py-3">
                    <div className="text-sm font-semibold text-slate-900">{profileName}</div>
                    <div className="mt-1 text-xs text-slate-500">{profileSubtitle}</div>
                  </div>

                  <div className="my-2 h-px bg-slate-200" />

                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full rounded-xl px-3 py-3 text-left text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main>{children}</main>
      </div>
    </div>
  )
}