import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Navigation from '../navigation/Navigation'
import './main.css'

function Main() {
  const [isNavOpen, setIsNavOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 600)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 600)
      if (window.innerWidth > 600) {
        setIsNavOpen(false) // Reset nav when resizing to desktop
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className={`main-container ${isNavOpen ? 'nav-open' : ''}`}>
      {/* Show Hamburger only when nav is closed on small screens */}
      {isMobile && !isNavOpen && (
        <button className="nav-toggle" onClick={() => setIsNavOpen(true)}>
          ☰
        </button>
      )}

      <Navigation isNavOpen={isNavOpen} setIsNavOpen={setIsNavOpen} />

      {/* Main Content */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}

export default Main
