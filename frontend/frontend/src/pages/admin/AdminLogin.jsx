import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function AdminLogin() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const navigate = useNavigate()

  const handleLogin = async () => {
    setError('')
    setLoading(true)
    try {
      const res = await fetch('https://site-twins.vercel.app/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (!res.ok) { setError('Email ou mot de passe incorrect.'); setLoading(false); return }
      localStorage.setItem('admin_token', data.token)
      navigate('/admin/dashboard')
    } catch {
      setError('Erreur serveur. Vérifiez que le backend tourne.')
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', backgroundColor: '#FAF8F5',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: '#fff', border: '1px solid #e5e5e5', borderRadius: '12px',
        padding: '2rem', width: '100%', maxWidth: '380px',
        boxShadow: '0 2px 16px rgba(0,0,0,0.06)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
          <div style={{
            width: '42px', height: '42px', background: '#534AB7', borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px'
          }}>👗</div>
          <div>
            <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '18px', fontWeight: '700', margin: 0 }}>Espace Admin</p>
            <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>Boutique Twins</p>
          </div>
        </div>

        <label style={labelStyle}>Email</label>
        <input
          type="email" value={email} onChange={e => setEmail(e.target.value)}
          placeholder="admin@myfashion.com" style={inputStyle}
        />

        <label style={{ ...labelStyle, marginTop: '12px' }}>Mot de passe</label>
        <input
          type="password" value={password} onChange={e => setPassword(e.target.value)}
          placeholder="••••••••" style={inputStyle}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
        />

        {error && <p style={{ fontSize: '13px', color: '#c0392b', marginTop: '8px' }}>{error}</p>}

        <button onClick={handleLogin} disabled={loading} style={{
          marginTop: '1.25rem', width: '100%', padding: '11px',
          background: loading ? '#9992d4' : '#534AB7', color: '#fff',
          border: 'none', borderRadius: '8px', fontSize: '15px',
          cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '500'
        }}>
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </div>
    </div>
  )
}

const labelStyle = { fontSize: '13px', color: '#555', display: 'block', marginBottom: '4px' }
const inputStyle = {
  width: '100%', padding: '10px 12px', border: '1px solid #ddd',
  borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box'
}