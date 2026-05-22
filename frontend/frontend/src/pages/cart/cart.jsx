import { Link } from 'react-router-dom'
import { ArrowRight, Trash2 } from 'lucide-react'
import useCartStore from '../../store/cartStore'

export default function Cart() {
  const { items, removeItem, getTotalItems, getTotalPrice } = useCartStore()
  const total = getTotalPrice()

  if (items.length === 0) {
    return (
      <div style={{ backgroundColor: '#FAF8F5', minHeight: '100vh', paddingTop: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '32px' }}>
        <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', color: '#1a1a1a' }}>Votre panier est vide</p>
        <Link to="/shop" style={{
          display: 'inline-flex', alignItems: 'center', gap: '12px',
          backgroundColor: '#1a1a1a', color: 'white',
          padding: '16px 40px', fontSize: '11px', letterSpacing: '0.2em',
          textTransform: 'uppercase', textDecoration: 'none',
        }}>
          Voir la collection <ArrowRight size={14} />
        </Link>
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: '#FAF8F5', minHeight: '100vh', paddingTop: '120px' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '0 48px 96px' }}>

        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2rem, 4vw, 4rem)', color: '#1a1a1a', marginBottom: '64px' }}>
          Panier ({getTotalItems()})
        </h1>

        {items.map((item, index) => (
          <div key={index} style={{ borderTop: '1px solid rgba(0,0,0,0.1)', padding: '24px 0', display: 'flex', gap: '24px', alignItems: 'center' }}>
            <img src={item.product.img} alt={item.product.name} style={{ width: '100px', height: '130px', objectFit: 'cover' }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '20px', color: '#1a1a1a', marginBottom: '8px' }}>{item.product.name}</p>
              <p style={{ fontSize: '14px', color: '#C9A96E' }}>{item.product.price} MAD × {item.quantity}</p>
              <p style={{ fontSize: '14px', color: '#1a1a1a', fontWeight: '500', marginTop: '4px' }}>
                = {item.product.price * item.quantity} MAD
              </p>
            </div>
            <button onClick={() => removeItem(index)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(0,0,0,0.4)' }}>
              <Trash2 size={18} />
            </button>
          </div>
        ))}

        <div style={{ borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
          <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '24px', color: '#1a1a1a' }}>Total : {total} MAD</p>
          <Link to="/checkout" style={{
            display: 'inline-flex', alignItems: 'center', gap: '12px',
            backgroundColor: '#1a1a1a', color: 'white',
            padding: '16px 40px', fontSize: '11px', letterSpacing: '0.2em',
            textTransform: 'uppercase', textDecoration: 'none',
          }}>
            Commander <ArrowRight size={14} />
          </Link>
        </div>

      </div>
    </div>
  )
}