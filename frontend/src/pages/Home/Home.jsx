import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useEffect, useRef } from 'react'

// ==============================
// 👇 CHANGE JUSTE LE NOM ICI
const HERO_IMAGE = '/images/background.jpg'
// ==============================

// Styles Ken Burns injectés une seule fois
const kenBurnsCSS = `
  @keyframes kenBurns {
    0%   { transform: scale(1)    translateX(0%)   translateY(0%); }
    25%  { transform: scale(1.08) translateX(-1%)  translateY(-1%); }
    50%  { transform: scale(1.12) translateX(1%)   translateY(-0.5%); }
    75%  { transform: scale(1.08) translateX(-0.5%) translateY(1%); }
    100% { transform: scale(1)    translateX(0%)   translateY(0%); }
  }

  .ken-burns-img {
    position: absolute;
    inset: -5%;          /* légère marge pour éviter les bords blancs pendant le pan */
    width: 110%;
    height: 110%;
    background-image: var(--hero-bg);
    background-size: cover;
    background-position: center;
    animation: kenBurns 20s ease-in-out infinite;
    will-change: transform;
  }
`

export default function Home() {
  const styleRef = useRef(null)

  useEffect(() => {
    if (!styleRef.current) {
      const tag = document.createElement('style')
      tag.textContent = kenBurnsCSS
      document.head.appendChild(tag)
      styleRef.current = tag
    }
    return () => {
      if (styleRef.current) {
        styleRef.current.remove()
        styleRef.current = null
      }
    }
  }, [])

  const categories = [
    { id: 1, name: 'tshirt', category: 'tops',      price: 350, img: '/images/produit2.jpeg' },
    { id: 2, name: 'jean',   category: 'pantalons', price: 350, img: '/images/jean3.jpg' },
    { id: 3, name: 'robe',   category: 'robes',     price: 350, img: '/images/robe2.jpg' },
  ]

  return (
    <div style={{ backgroundColor: '#FAF8F5' }}>

      {/* HERO */}
      <section style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'flex-end',
        paddingBottom: '96px',
        overflow: 'hidden',
      }}>
        {/* Image Ken Burns */}
        <div
          className="ken-burns-img"
          style={{ '--hero-bg': `url('${HERO_IMAGE}')` }}
        />

        {/* Overlay sombre */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.35)',
          zIndex: 1,
        }} />

        {/* Contenu */}
        <div style={{ position: 'relative', zIndex: 10, padding: '0 96px' }}>
          <p style={{
            color: 'rgba(255,255,255,0.7)',
            fontSize: '11px',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            marginBottom: '24px',
          }}>
            Nouvelle Collection 2026
          </p>
          <h1 style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: 'clamp(3rem, 8vw, 7rem)',
            color: 'white',
            lineHeight: 1.05,
            marginBottom: '40px',
          }}>
            L'élégance<br />à la marocaine
          </h1>
          <Link to="/shop" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: 'white',
            color: '#1a1a1a',
            padding: '16px 40px',
            fontSize: '11px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            textDecoration: 'none',
            transition: 'all 0.4s',
          }}>
            Découvrir <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* CATEGORIES */}
      <section style={{ padding: '96px 48px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            marginBottom: '56px',
          }}>
            <h2 style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: 'clamp(2rem, 4vw, 3.5rem)',
              color: '#1a1a1a',
            }}>
              Nos Produits
            </h2>
            <Link to="/shop" style={{
              fontSize: '11px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#6B6B6B',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              Tout voir <ArrowRight size={12} />
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px' }}>
            {categories.map(cat => (
              <Link key={cat.id + cat.name} to={`/shop?category=${cat.category}`} style={{ textDecoration: 'none', display: 'block' }}>
                <div style={{ position: 'relative', aspectRatio: '3/4', overflow: 'hidden' }}>
                  <img
                    src={cat.img}
                    alt={cat.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.7s ease' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  />
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 60%)',
                  }} />
                  <p style={{
                    position: 'absolute',
                    bottom: '24px',
                    left: '24px',
                    fontFamily: 'Playfair Display, serif',
                    fontSize: '24px',
                    color: 'white',
                    margin: 0,
                  }}>
                    {cat.name}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* BANDEAU */}
      <section style={{ backgroundColor: '#1a1a1a', padding: '96px 48px', textAlign: 'center' }}>
        <p style={{
          color: '#C9A96E',
          fontSize: '11px',
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          marginBottom: '16px',
        }}>
          Livraison gratuite
        </p>
        <h2 style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: 'clamp(2rem, 4vw, 3.5rem)',
          color: 'white',
          marginBottom: '32px',
          lineHeight: 1.2,
        }}>
          Livraison partout<br />au Maroc
        </h2>
        <p style={{
          color: 'rgba(255,255,255,0.5)',
          fontSize: '14px',
          marginBottom: '40px',
          maxWidth: '480px',
          margin: '0 auto 40px',
        }}>
          Commandez via WhatsApp ou en ligne. Livraison rapide.
        </p>
        <Link to="/shop" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '12px',
          border: '1px solid rgba(255,255,255,0.3)',
          color: 'white',
          padding: '16px 40px',
          fontSize: '11px',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          textDecoration: 'none',
        }}>
          Commander <ArrowRight size={14} />
        </Link>
      </section>

      {/* WHATSAPP BOUTON */}
      <a
        href="https://wa.me/0634698259"
        target="_blank"
        rel="noreferrer"
        style={{
          position: 'fixed',
          bottom: '32px',
          right: '32px',
          zIndex: 50,
          backgroundColor: '#25D366',
          color: 'white',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          textDecoration: 'none',
        }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>

    </div>
  )
}
