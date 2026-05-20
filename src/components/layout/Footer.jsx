import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#1a1a1a', color: 'white', padding: '64px 0' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '48px', marginBottom: '48px' }}>

          <div>
            <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '28px', marginBottom: '16px' }}>MyFashion</h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', lineHeight: '1.7' }}>
              Vêtements féminins élégants. Livraison partout au Maroc.
            </p>
          </div>

          <div>
            <p style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '24px' }}>Navigation</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[['/', 'Accueil'], ['/shop', 'Collection'], ['/cart', 'Panier'], ['/contact', 'Contact']].map(([to, label]) => (
                <Link key={to} to={to} style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', textDecoration: 'none' }}>{label}</Link>
              ))}
            </div>
          </div>

          <div>
            <p style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '24px' }}>Contact</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <a href="https://wa.me/0634698259" target="_blank" rel="noreferrer" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', textDecoration: 'none' }}>WhatsApp</a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', textDecoration: 'none' }}>Instagram</a>
            </div>
          </div>

        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '32px', textAlign: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', letterSpacing: '0.15em' }}>2024 MyFashion — Tous droits réservés</p>
        </div>
      </div>
    </footer>
  )
}