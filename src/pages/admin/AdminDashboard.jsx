import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

const API = 'https://site-twins.vercel.app/api/orders'

const FILTERS = ['tous', 'en attente', 'confirmé', 'livré']

const FILTER_LABELS = {
  'tous':       'Toutes',
  'en attente': 'En attente',
  'confirmé':   'Confirmé',
  'livré':      'Livré',
}

const getBadge = (statut) => {
  const map = {
    'en attente': { background: '#FEF3C7', color: '#92400E' },
    'confirmé':   { background: '#EDE9FE', color: '#4C1D95' },
    'livré':      { background: '#DCFCE7', color: '#14532D' },
  }
  return {
    ...(map[statut] || { background: '#F3F4F6', color: '#374151' }),
    fontSize: '11px', fontWeight: '600',
    padding: '3px 10px', borderRadius: '20px',
    display: 'inline-block'
  }
}

export default function AdminDashboard() {
  const [orders, setOrders]   = useState([])
  const [stats, setStats]     = useState({})
  const [filter, setFilter]   = useState('tous')
  const [loading, setLoading] = useState(true)
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

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API}/admin/stats`, { headers: getAuthHeader() })
      if (res.status === 401) { logout(); return }
      setStats(await res.json())
    } catch (err) {
      console.error('Erreur stats:', err)
    }
  }

  const fetchOrders = async (f) => {
    try {
      setLoading(true)
      const url = f === 'tous'
        ? `${API}/admin/all`
        : `${API}/admin/all?status=${encodeURIComponent(f)}`
      const res = await fetch(url, { headers: getAuthHeader() })
      if (res.status === 401) { logout(); return }
      const data = await res.json()
      setOrders(data.orders || [])
    } catch (err) {
      console.error('Erreur commandes:', err)
    } finally {
      setLoading(false)
    }
  }

  const changeStatus = async (id, statut) => {
    try {
      await fetch(`${API}/admin/${id}/status`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify({ status: statut })
      })
      fetchStats()
      fetchOrders(filterRef.current)
    } catch (err) {
      console.error('Erreur changement statut:', err)
    }
  }

  const handleFilter = (f) => {
    filterRef.current = f
    setFilter(f)
    fetchOrders(f)
  }

  useEffect(() => {
    const authHeader = getAuthHeader()

    const loadStats = async () => {
      try {
        const res = await fetch(`${API}/admin/stats`, { headers: authHeader })
        if (res.status === 401) { navigate('/admin/login'); return }
        setStats(await res.json())
      } catch (err) {
        console.error('Erreur stats:', err)
      }
    }

    const loadOrders = async () => {
      try {
        setLoading(true)
        const res = await fetch(`${API}/admin/all`, { headers: authHeader })
        if (res.status === 401) { navigate('/admin/login'); return }
        const data = await res.json()
        setOrders(data.orders || [])
      } catch (err) {
        console.error('Erreur commandes:', err)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
    loadOrders()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAF8F5' }}>

      {/* Topbar */}
      <div style={{
        background: '#fff', borderBottom: '1px solid #e5e5e5',
        padding: '0 2rem', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', height: '60px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '34px', height: '34px', background: '#534AB7', borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px'
          }}>👗</div>
          <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '17px', fontWeight: '700' }}>
            Twins — Admin
          </span>
        </div>
        <button onClick={logout} style={{
          background: 'none', border: '1px solid #ddd', borderRadius: '8px',
          padding: '6px 14px', fontSize: '13px', cursor: 'pointer', color: '#555'
        }}>Déconnexion</button>
      </div>

      <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '1.5rem' }}>
          {[
            { label: 'Total commandes', value: stats.total_orders, color: '#1a1a1a' },
            { label: 'En attente',      value: stats.pending,      color: '#B45309' },
            { label: 'Confirmées',      value: stats.confirmed,    color: '#3C3489' },
            { label: 'Livrées',         value: stats.delivered,    color: '#166534' },
          ].map(s => (
            <div key={s.label} style={{
              background: '#fff', border: '1px solid #e5e5e5',
              borderRadius: '10px', padding: '1rem 1.25rem'
            }}>
              <p style={{ fontSize: '12px', color: '#888', margin: '0 0 4px' }}>{s.label}</p>
              <p style={{ fontSize: '26px', fontWeight: '600', margin: 0, color: s.color }}>
                {s.value ?? '—'}
              </p>
            </div>
          ))}
        </div>

        {/* Revenu */}
        <div style={{
          background: '#534AB7', borderRadius: '10px', padding: '1rem 1.5rem',
          marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <p style={{ color: '#c5c1f0', fontSize: '13px', margin: 0 }}>Chiffre d'affaires (livrées)</p>
          <p style={{ color: '#fff', fontSize: '24px', fontWeight: '700', margin: 0 }}>
            {stats.total_revenue ? `${Number(stats.total_revenue).toFixed(2)} MAD` : '—'}
          </p>
        </div>

        {/* Filtres */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem', flexWrap: 'wrap' }}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => handleFilter(f)} style={{
              padding: '6px 16px', border: '1px solid', borderRadius: '20px',
              fontSize: '13px', cursor: 'pointer',
              background:  filter === f ? '#534AB7' : '#fff',
              color:       filter === f ? '#fff'    : '#555',
              borderColor: filter === f ? '#534AB7' : '#ddd',
            }}>
              {FILTER_LABELS[f]}
            </button>
          ))}
        </div>

        {/* Liste commandes */}
        {loading ? (
          <p style={{ color: '#888', textAlign: 'center', padding: '2rem' }}>Chargement...</p>
        ) : orders.length === 0 ? (
          <p style={{ color: '#888', textAlign: 'center', padding: '2rem' }}>Aucune commande.</p>
        ) : orders.map(o => (
          <div key={o.id} style={{
            background: '#fff', border: '1px solid #e5e5e5', borderRadius: '10px',
            padding: '1rem 1.25rem', marginBottom: '10px',
            display: 'flex', alignItems: 'flex-start',
            justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap'
          }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '12px', color: '#aaa', margin: '0 0 6px' }}>
                CMD-{String(o.id).padStart(3, '0')} · {o.created_at}
              </p>
              <span style={getBadge(o.statut)}>{o.statut}</span>
              <p style={{ fontSize: '15px', fontWeight: '600', margin: '6px 0 3px' }}>{o.client}</p>
              <p style={{ fontSize: '13px', color: '#555', margin: '0 0 2px' }}>📱 {o.phone}</p>
              {o.email && (
                <p style={{ fontSize: '13px', color: '#555', margin: '0 0 2px' }}>✉️ {o.email}</p>
              )}
              <p style={{ fontSize: '13px', color: '#555', margin: '0 0 2px' }}>
                🛍 {o.produit}
                {o.taille  ? ` — ${o.taille}`  : ''}
                {o.couleur ? ` — ${o.couleur}` : ''}
              </p>
              {o.adresse && (
                <p style={{ fontSize: '13px', color: '#555', margin: '2px 0 0' }}>📍 {o.adresse}</p>
              )}
              <p style={{ fontSize: '14px', fontWeight: '700', color: '#1a1a1a', margin: '8px 0 0' }}>
                {o.prix} MAD
              </p>
            </div>
            <div style={{ minWidth: '140px' }}>
              <p style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>Changer le statut</p>
              <select
                value={o.statut}
                onChange={e => changeStatus(o.id, e.target.value)}
                style={{
                  fontSize: '13px', padding: '6px 10px', border: '1px solid #ddd',
                  borderRadius: '8px', background: '#fff', cursor: 'pointer', width: '100%'
                }}
              >
                <option value="en attente">En attente</option>
                <option value="confirmé">Confirmé</option>
                <option value="livré">Livré</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}