import { NavLink, Link } from 'react-router-dom'

export function NavBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-primary/20 bg-background/90 backdrop-blur-sm">
      <div className="px-8 sm:px-16 h-14 flex items-center justify-between">
        <Link
          to="/"
          className="text-sm font-semibold tracking-tight text-primary"
          style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
        >
          Pocket
        </Link>
        <nav className="flex items-center gap-6">
          <NavLink
            to="/browse"
            className={({ isActive }) =>
              `text-sm transition-colors ${isActive ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'}`
            }
          >
            Browse
          </NavLink>
        </nav>
      </div>
    </header>
  )
}
