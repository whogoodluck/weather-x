import { Link, useLocation } from 'react-router-dom'
import { useTheme } from './theme-provider'
import { Button } from './ui/button'

export function Navbar() {
  const { theme, setTheme } = useTheme()
  const { pathname } = useLocation()

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')

  return (
    <nav className='sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-sm'>
      <div className='mx-auto flex max-w-6xl items-center justify-between px-4 py-3'>
        <div className='flex items-center gap-2'>
          <span className='text-2xl'>🌤️</span>
          <span className='text-base font-bold tracking-tight'>WeatherX</span>
        </div>

        <div className='flex items-center gap-1'>
          <Link
            to='/'
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              pathname === '/'
                ? 'bg-accent'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Today
          </Link>
          <Link
            to='/historical'
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              pathname === '/historical'
                ? 'bg-accent'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Historical
          </Link>
        </div>

        <Button
          size='icon'
          variant='secondary'
          onClick={toggleTheme}
          aria-label='Toggle theme'
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </Button>
      </div>
    </nav>
  )
}
