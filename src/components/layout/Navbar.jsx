import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ShoppingBag, Menu, X } from 'lucide-react'
import useCartStore from '../../store/cartStore'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const getTotalItems = useCartStore(s => s.getTotalItems)
  const totalItems = getTotalItems()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setMenuOpen(false), 0)
    return () => clearTimeout(t)
  }, [location.pathname])

  const links = [
    { to: '/', label: 'Accueil' },
    { to: '/shop', label: 'Collection' },
    { to: '/contact', label: 'Contact' },
  ]

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        backgroundColor: scrolled ? 'rgba(255,255,255,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(10px)' : 'none',
        boxShadow: scrolled ? '0 1px 10px rgba(0,0,0,0.05)' : 'none',
        transition: 'all 0.5s ease',
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '80px' }}>

          <Link to="/" style={{ fontFamily: 'Playfair Display, serif', fontSize: '24px', color: '#1a1a1a', textDecoration: 'none', letterSpacing: '0.05em' }}>
            MyFashion
          </Link>

          <div style={{ display: 'flex', gap: '40px' }}>
            {links.map(link => (
              <Link key={link.to} to={link.to} style={{
                fontSize: '12px', letterSpacing: '0.2em', textTransform: 'uppercase',
                textDecoration: 'none',
                color: location.pathname === link.to ? '#C9A96E' : '#1a1a1a',
                transition: 'color 0.3s',
              }}>
                {link.label}
              </Link>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <Link to="/cart" style={{ position: 'relative', color: '#1a1a1a' }}>
              <ShoppingBag size={22} />
              {totalItems > 0 && (
                <span style={{
                  position: 'absolute', top: '-8px', right: '-8px',
                  background: '#C9A96E', color: 'white', fontSize: '10px',
                  width: '18px', height: '18px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {totalItems}
                </span>
              )}
            </Link>
            <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'none' }}>
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {menuOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 40, backgroundColor: '#FAF8F5',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '40px',
        }}>
          {links.map(link => (
            <Link key={link.to} to={link.to} style={{ fontFamily: 'serif', fontSize: '2.5rem', color: '#1a1a1a', textDecoration: 'none' }}>
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </>
  )
}