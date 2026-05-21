import { useState, useEffect } from 'react'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import useCartStore from '../../store/cartStore'
import toast from 'react-hot-toast'

const API = 'https://site-twins.vercel.app/api/products'
const categories = ['tous', 'robes', 'T-shirt', 'pantalons']

const FALLBACK_PRODUCTS = [
  { id: 1,  name: 't-shirt', category: 'T-shirt',   price: 149, images: ['/images/produit1.jpg', '/images/backproduit1.jpg'] },
  { id: 2,  name: 't-shirt', category: 'T-shirt',   price: 149, images: ['/images/produit2.jpeg', '/images/backproduit2.jpeg'] },
  { id: 3,  name: 't-shirt', category: 'T-shirt',   price: 149, images: ['/images/produit3.jpeg', '/images/backproduit3.jpeg'] },
  { id: 4,  name: 't-shirt', category: 'T-shirt',   price: 149, images: ['/images/produit4.jpeg', '/images/backproduit4.jpeg'] },
  { id: 5,  name: 't-shirt', category: 'T-shirt',   price: 149, images: ['/images/produit5.jpeg', '/images/backproduit5.jpeg'] },
  { id: 6,  name: 't-shirt', category: 'T-shirt',   price: 149, images: ['/images/produit.jpg'] },
  { id: 7,  name: 'jean',    category: 'pantalons', price: 199, images: ['/images/jean1.jpg'] },
  { id: 8,  name: 'jean',    category: 'pantalons', price: 199, images: ['/images/jean2.jpg'] },
  { id: 9,  name: 'jean',    category: 'pantalons', price: 199, images: ['/images/jean3.jpg'] },
  { id: 10, name: 'robe',    category: 'robes',     price: 169, images: ['/images/robe1.jpg'] },
  { id: 11, name: 'robe',    category: 'robes',     price: 169, images: ['/images/robe2.jpg'] },
  { id: 12, name: 'robe',    category: 'robes',     price: 169, images: ['/images/robe3.jpg'] },
]

function ProductCard({ product }) {
  const [currentImg, setCurrentImg] = useState(0)
  const addItem = useCartStore(state => state.addItem)
  const images = product.images || []

  const handleAddToCart = () => {
    addItem(product, null, null, 1)
    toast.success(`${product.name} ajouté au panier !`)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'relative', aspectRatio: '3/4', overflow: 'hidden', marginBottom: '16px' }}>
        <img
          src={images[currentImg]}
          alt={`${product.name} - vue ${currentImg + 1}`}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.7s ease' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        />
        {images.length > 1 && (
          <>
            <div onClick={() => setCurrentImg((currentImg - 1 + images.length) % images.length)}
              style={{ position: 'absolute', left: 0, top: 0, width: '50%', height: '100%', cursor: 'w-resize', zIndex: 2 }} />
            <div onClick={() => setCurrentImg((currentImg + 1) % images.length)}
              style={{ position: 'absolute', right: 0, top: 0, width: '50%', height: '100%', cursor: 'e-resize', zIndex: 2 }} />
          </>
        )}
        {images.length > 1 && (
          <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '6px', zIndex: 3 }}>
            {images.map((_, i) => (
              <div key={i} onClick={(e) => { e.stopPropagation(); setCurrentImg(i) }} style={{
                width: i === currentImg ? '20px' : '6px', height: '6px', borderRadius: '3px',
                backgroundColor: i === currentImg ? 'white' : 'rgba(255,255,255,0.5)',
                transition: 'all 0.3s ease', cursor: 'pointer',
              }} />
            ))}
          </div>
        )}
        {currentImg > 0 && (
          <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 3, backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 8px' }}>Dos</div>
        )}
      </div>
      <div style={{ marginBottom: '12px' }}>
        <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '18px', color: '#1a1a1a', marginBottom: '4px' }}>{product.name}</p>
        <p style={{ fontSize: '14px', color: '#C9A96E' }}>{product.price} MAD</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button
          style={{ width: '100%', padding: '12px', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', backgroundColor: 'transparent', border: '1px solid #1a1a1a', cursor: 'pointer', transition: 'all 0.3s ease' }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#1a1a1a'; e.currentTarget.style.color = 'white' }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#1a1a1a' }}
          onClick={handleAddToCart}
        >Ajouter au Panier</button>
        <Link to="/checkout" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#1a1a1a', textDecoration: 'none', fontWeight: '600' }}>
          Commander <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  )
}

export default function Shop() {
  const [active, setActive]     = useState('tous')
  const [products, setProducts] = useState(FALLBACK_PRODUCTS)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const url = active === 'tous' ? `${API}/` : `${API}/?category=${active}`
        const res  = await fetch(url)
        const data = await res.json()
        if (data.products && data.products.length > 0) {
          setProducts(data.products)
        } else {
          const filtered = active === 'tous' ? FALLBACK_PRODUCTS : FALLBACK_PRODUCTS.filter(p => p.category === active)
          setProducts(filtered)
        }
      } catch {
        const filtered = active === 'tous' ? FALLBACK_PRODUCTS : FALLBACK_PRODUCTS.filter(p => p.category === active)
        setProducts(filtered)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [active])

  return (
    <div style={{ backgroundColor: '#FAF8F5', minHeight: '100vh', paddingTop: '120px' }}>
      <div style={{ padding: '0 48px 64px', maxWidth: '1280px', margin: '0 auto' }}>
        <p style={{ fontSize: '11px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#C9A96E', marginBottom: '16px' }}>Nouvelle Collection 2026</p>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2.5rem, 5vw, 5rem)', color: '#1a1a1a', lineHeight: 1.05 }}>Collection</h1>
      </div>
      <div style={{ padding: '0 48px 48px', maxWidth: '1280px', margin: '0 auto', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        {categories.map(cat => (
          <button key={cat} onClick={() => setActive(cat)} style={{
            padding: '8px 24px', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase',
            cursor: 'pointer', border: '1px solid',
            borderColor: active === cat ? '#1a1a1a' : 'rgba(0,0,0,0.2)',
            backgroundColor: active === cat ? '#1a1a1a' : 'transparent',
            color: active === cat ? 'white' : '#1a1a1a',
            transition: 'all 0.3s',
          }}>{cat}</button>
        ))}
      </div>
      <div style={{ padding: '0 48px 96px', maxWidth: '1280px', margin: '0 auto' }}>
        {loading ? (
          <p style={{ color: '#888', textAlign: 'center', padding: '4rem' }}>Chargement...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '40px 24px' }}>
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}