import { NavLink, Link } from 'react-router-dom'

export function NavBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto max-w-screen-2xl px-8 h-14 flex items-center justify-between">
        <Link to="/" className="text-sm font-semibold tracking-tight">
          Card Optimizer
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
