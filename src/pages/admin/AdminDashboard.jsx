import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

const API_ORDERS   = 'https://site-twins.vercel.app/api/orders'
const API_PRODUCTS = 'https://site-twins.vercel.app/api/products'

const FILTERS = ['tous', 'en attente', 'confirmé', 'livré']
const FILTER_LABELS = { 'tous': 'Toutes', 'en attente': 'En attente', 'confirmé': 'Confirmé', 'livré': 'Livré' }

const getBadge = (statut) => {
  const map = {
    'en attente': { background: '#FEF3C7', color: '#92400E' },
    'confirmé':   { background: '#EDE9FE', color: '#4C1D95' },
    'livré':      { background: '#DCFCE7', color: '#14532D' },
  }
  return { ...(map[statut] || { background: '#F3F4F6', color: '#374151' }), fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px', display: 'inline-block' }
}

const CATEGORIES = [
  { id: 1, name: 'T-shirt', slug: 't-shirt' },
  { id: 2, name: 'Pantalons', slug: 'pantalons' },
  { id: 3, name: 'Robes', slug: 'robes' },
]

export default function AdminDashboard() {
  const [tab, setTab]           = useState('commandes')
  const [orders, setOrders]     = useState([])
  const [stats, setStats]       = useState({})
  const [filter, setFilter]     = useState('tous')
  const [loading, setLoading]   = useState(true)
  const [products, setProducts] = useState([])
  const [editProduct, setEditProduct] = useState(null)
  const [newProduct, setNewProduct]   = useState({ name: '', price: '', category_id: 1, images: [''] })
  const [showForm, setShowForm] = useState(false)
  const navigate  = useNavigate()
  const filterRef = useRef(filter)

  const getAuthHeader = () => {
    const token = localStorage.getItem('admin_token')
    return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
  }

  const logout = () => {
    localStorage.removeItem('admin_token')
    navigate('/admin/login')
  }

  // ─── COMMANDES ────────────────────────────────────────────────────────────
  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_ORDERS}/admin/stats`, { headers: getAuthHeader() })
      if (res.status === 401) { logout(); return }
      setStats(await res.json())
    } catch (err) { console.error(err) }
  }

  const fetchOrders = async (f) => {
    try {
      setLoading(true)
      const url = f === 'tous' ? `${API_ORDERS}/admin/all` : `${API_ORDERS}/admin/all?status=${encodeURIComponent(f)}`
      const res = await fetch(url, { headers: getAuthHeader() })
      if (res.status === 401) { logout(); return }
      const data = await res.json()
      setOrders(data.orders || [])
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const changeStatus = async (id, statut) => {
    try {
      await fetch(`${API_ORDERS}/admin/${id}/status`, { method: 'PUT', headers: getAuthHeader(), body: JSON.stringify({ status: statut }) })
      fetchStats()
      fetchOrders(filterRef.current)
    } catch (err) { console.error(err) }
  }

  const handleFilter = (f) => {
    filterRef.current = f
    setFilter(f)
    fetchOrders(f)
  }

  // ─── PRODUITS ─────────────────────────────────────────────────────────────
  const fetchProducts = async () => {
    try {
      const res  = await fetch(`${API_PRODUCTS}/admin/all`, { headers: getAuthHeader() })
      const data = await res.json()
      setProducts(data)
    } catch (err) { console.error(err) }
  }

  const saveProduct = async () => {
    try {
      const payload = {
        ...newProduct,
        price: parseFloat(newProduct.price),
        images: newProduct.images.filter(i => i.trim() !== ''),
      }
      const res = await fetch(`${API_PRODUCTS}/admin/create`, {
        method: 'POST', headers: getAuthHeader(), body: JSON.stringify(payload)
      })
      if (res.ok) { setShowForm(false); setNewProduct({ name: '', price: '', category_id: 1, images: [''] }); fetchProducts() }
    } catch (err) { console.error(err) }
  }

  const updateProduct = async () => {
    try {
      const payload = { ...editProduct, price: parseFloat(editProduct.price) }
      await fetch(`${API_PRODUCTS}/admin/${editProduct.id}`, {
        method: 'PUT', headers: getAuthHeader(), body: JSON.stringify(payload)
      })
      setEditProduct(null)
      fetchProducts()
    } catch (err) { console.error(err) }
  }

  const deleteProduct = async (id) => {
    if (!confirm('Supprimer ce produit ?')) return
    try {
      await fetch(`${API_PRODUCTS}/admin/${id}`, { method: 'DELETE', headers: getAuthHeader() })
      fetchProducts()
    } catch (err) { console.error(err) }
  }

  useEffect(() => {
  const load = async () => {
    await fetchStats()
    await fetchOrders('tous')
    await fetchProducts()
  }
  load()// eslint-disable-next-line react-hooks/exhaustive-deps
}, [])

  const inputStyle = { width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', marginBottom: '12px', boxSizing: 'border-box' }
  const btnStyle   = { padding: '8px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAF8F5' }}>

      {/* Topbar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e5e5', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '34px', height: '34px', background: '#534AB7', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>👗</div>
          <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '17px', fontWeight: '700' }}>Twins — Admin</span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setTab('commandes')} style={{ ...btnStyle, background: tab === 'commandes' ? '#534AB7' : '#f3f4f6', color: tab === 'commandes' ? '#fff' : '#555' }}>📦 Commandes</button>
          <button onClick={() => setTab('produits')}  style={{ ...btnStyle, background: tab === 'produits'  ? '#534AB7' : '#f3f4f6', color: tab === 'produits'  ? '#fff' : '#555' }}>👗 Produits</button>
          <button onClick={logout} style={{ ...btnStyle, background: 'none', border: '1px solid #ddd', color: '#555' }}>Déconnexion</button>
        </div>
      </div>

      <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>

        {/* ── STATS ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '1.5rem' }}>
          {[
            { label: 'Total commandes', value: stats.total_orders, color: '#1a1a1a' },
            { label: 'En attente',      value: stats.pending,      color: '#B45309' },
            { label: 'Confirmées',      value: stats.confirmed,    color: '#3C3489' },
            { label: 'Livrées',         value: stats.delivered,    color: '#166534' },
          ].map(s => (
            <div key={s.label} style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '10px', padding: '1rem 1.25rem' }}>
              <p style={{ fontSize: '12px', color: '#888', margin: '0 0 4px' }}>{s.label}</p>
              <p style={{ fontSize: '26px', fontWeight: '600', margin: 0, color: s.color }}>{s.value ?? '—'}</p>
            </div>
          ))}
        </div>

        <div style={{ background: '#534AB7', borderRadius: '10px', padding: '1rem 1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ color: '#c5c1f0', fontSize: '13px', margin: 0 }}>Chiffre d'affaires (livrées)</p>
          <p style={{ color: '#fff', fontSize: '24px', fontWeight: '700', margin: 0 }}>{stats.total_revenue ? `${Number(stats.total_revenue).toFixed(2)} MAD` : '—'}</p>
        </div>

        {/* ── ONGLET COMMANDES ── */}
        {tab === 'commandes' && (
          <>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem', flexWrap: 'wrap' }}>
              {FILTERS.map(f => (
                <button key={f} onClick={() => handleFilter(f)} style={{ padding: '6px 16px', border: '1px solid', borderRadius: '20px', fontSize: '13px', cursor: 'pointer', background: filter === f ? '#534AB7' : '#fff', color: filter === f ? '#fff' : '#555', borderColor: filter === f ? '#534AB7' : '#ddd' }}>
                  {FILTER_LABELS[f]}
                </button>
              ))}
            </div>

            {loading ? (
              <p style={{ color: '#888', textAlign: 'center', padding: '2rem' }}>Chargement...</p>
            ) : orders.length === 0 ? (
              <p style={{ color: '#888', textAlign: 'center', padding: '2rem' }}>Aucune commande.</p>
            ) : orders.map(o => (
              <div key={o.id} style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '10px', padding: '1rem 1.25rem', marginBottom: '10px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '12px', color: '#aaa', margin: '0 0 6px' }}>CMD-{String(o.id).padStart(3, '0')} · {o.created_at}</p>
                  <span style={getBadge(o.statut)}>{o.statut}</span>
                  <p style={{ fontSize: '15px', fontWeight: '600', margin: '6px 0 3px' }}>{o.client}</p>
                  <p style={{ fontSize: '13px', color: '#555', margin: '0 0 2px' }}>📱 {o.phone}</p>
                  {o.email && <p style={{ fontSize: '13px', color: '#555', margin: '0 0 2px' }}>✉️ {o.email}</p>}
                  <p style={{ fontSize: '13px', color: '#555', margin: '0 0 2px' }}>🛍 {o.produit}{o.taille ? ` — ${o.taille}` : ''}{o.couleur ? ` — ${o.couleur}` : ''}</p>
                  {o.adresse && <p style={{ fontSize: '13px', color: '#555', margin: '2px 0 0' }}>📍 {o.adresse}</p>}
                  <p style={{ fontSize: '14px', fontWeight: '700', color: '#1a1a1a', margin: '8px 0 0' }}>{o.prix} MAD</p>
                </div>
                <div style={{ minWidth: '140px' }}>
                  <p style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>Changer le statut</p>
                  <select value={o.statut} onChange={e => changeStatus(o.id, e.target.value)} style={{ fontSize: '13px', padding: '6px 10px', border: '1px solid #ddd', borderRadius: '8px', background: '#fff', cursor: 'pointer', width: '100%' }}>
                    <option value="en attente">En attente</option>
                    <option value="confirmé">Confirmé</option>
                    <option value="livré">Livré</option>
                  </select>
                </div>
              </div>
            ))}
          </>
        )}

        {/* ── ONGLET PRODUITS ── */}
        {tab === 'produits' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '20px', margin: 0 }}>Gestion des produits</h2>
              <button onClick={() => setShowForm(!showForm)} style={{ ...btnStyle, background: '#534AB7', color: '#fff' }}>+ Ajouter un produit</button>
            </div>

            {/* Formulaire ajout */}
            {showForm && (
              <div style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '10px', padding: '1.5rem', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: '0 0 1rem', fontSize: '15px' }}>Nouveau produit</h3>
                <input style={inputStyle} placeholder="Nom du produit" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} />
                <input style={inputStyle} placeholder="Prix (MAD)" type="number" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} />
                <select style={inputStyle} value={newProduct.category_id} onChange={e => setNewProduct({ ...newProduct, category_id: parseInt(e.target.value) })}>
                  {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <p style={{ fontSize: '12px', color: '#888', marginBottom: '6px' }}>URLs des images (une par ligne) :</p>
                {newProduct.images.map((img, i) => (
                  <input key={i} style={inputStyle} placeholder={`/images/produit${i+1}.jpg`} value={img}
                    onChange={e => { const imgs = [...newProduct.images]; imgs[i] = e.target.value; setNewProduct({ ...newProduct, images: imgs }) }} />
                ))}
                <button onClick={() => setNewProduct({ ...newProduct, images: [...newProduct.images, ''] })} style={{ ...btnStyle, background: '#f3f4f6', color: '#555', marginBottom: '12px' }}>+ Ajouter une image</button>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={saveProduct} style={{ ...btnStyle, background: '#534AB7', color: '#fff' }}>Enregistrer</button>
                  <button onClick={() => setShowForm(false)} style={{ ...btnStyle, background: '#f3f4f6', color: '#555' }}>Annuler</button>
                </div>
              </div>
            )}

            {/* Liste produits */}
            {products.map(p => (
              <div key={p.id} style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '10px', padding: '1rem 1.25rem', marginBottom: '10px' }}>
                {editProduct?.id === p.id ? (
                  <div>
                    <input style={inputStyle} value={editProduct.name} onChange={e => setEditProduct({ ...editProduct, name: e.target.value })} />
                    <input style={inputStyle} type="number" value={editProduct.price} onChange={e => setEditProduct({ ...editProduct, price: e.target.value })} />
                    <select style={inputStyle} value={editProduct.category_id} onChange={e => setEditProduct({ ...editProduct, category_id: parseInt(e.target.value) })}>
                      {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={updateProduct} style={{ ...btnStyle, background: '#534AB7', color: '#fff' }}>Sauvegarder</button>
                      <button onClick={() => setEditProduct(null)} style={{ ...btnStyle, background: '#f3f4f6', color: '#555' }}>Annuler</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {p.images?.[0] && <img src={p.images[0]} alt={p.name} style={{ width: '50px', height: '65px', objectFit: 'cover', borderRadius: '4px' }} />}
                      <div>
                        <p style={{ fontWeight: '600', margin: '0 0 4px', fontSize: '15px' }}>{p.name}</p>
                        <p style={{ color: '#C9A96E', margin: '0 0 2px', fontSize: '14px' }}>{p.price} MAD</p>
                        <p style={{ color: '#888', margin: 0, fontSize: '12px' }}>{p.category?.name || '—'}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => setEditProduct(p)} style={{ ...btnStyle, background: '#EDE9FE', color: '#4C1D95' }}>✏️ Modifier</button>
                      <button onClick={() => deleteProduct(p.id)} style={{ ...btnStyle, background: '#FEE2E2', color: '#991B1B' }}>🗑️ Supprimer</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}