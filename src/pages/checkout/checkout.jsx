import { useState } from 'react'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import useCartStore from '../../store/cartStore'
import toast from 'react-hot-toast'

export default function Checkout() {

  const { items, getTotalPrice, clearCart } = useCartStore()
  const totalPrice = getTotalPrice()

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    city: '',
    address: '',
    notes: '',
  })

  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!form.firstName.trim()) e.firstName = 'Prénom requis'
    if (!form.lastName.trim()) e.lastName = 'Nom requis'
    if (!form.phone.trim() || !/^[0-9]{9,10}$/.test(form.phone.replace(/\s/g, '')))
      e.phone = 'Numéro invalide'
    if (!form.city.trim()) e.city = 'Ville requise'
    if (!form.address.trim()) e.address = 'Adresse requise'
    return e
  }

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    if (errors[e.target.name]) setErrors(prev => ({ ...prev, [e.target.name]: null }))
  }

  const handleSubmit = async () => {
    if (items.length === 0) {
      toast.error('Votre panier est vide !')
      return
    }
    const e = validate()
    if (Object.keys(e).length > 0) {
      setErrors(e)
      return
    }

    setLoading(true)
    try {
      // Envoyer chaque article comme une commande séparée
      for (const item of items) {
        const payload = {
          client:  `${form.firstName} ${form.lastName}`,
          phone:   form.phone,
          produit: item.product.name,
          taille:  item.size  || null,
          couleur: item.color || null,
          prix:    item.product.price * item.quantity,
          adresse: `${form.city} — ${form.address}`,
        }

        const res = await fetch('https://site-twins.vercel.app/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || 'Erreur serveur')
        }
      }

      clearCart()
      setSubmitted(true)
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la commande. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#FAF8F5', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '80px' }}>
        <div style={{ textAlign: 'center', padding: '48px', maxWidth: '480px' }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%',
            backgroundColor: '#C9A96E', display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 32px'
          }}>
            <Check size={36} color="white" />
          </div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.5rem', color: '#1a1a1a', marginBottom: '16px' }}>
            Commande Confirmée
          </h1>
          <p style={{ color: '#666', lineHeight: 1.7, marginBottom: '40px', fontSize: '15px' }}>
            Merci <strong>{form.firstName}</strong> ! Votre commande a bien été reçue.
            Notre équipe vous contactera sous 24h au <strong>{form.phone}</strong> pour confirmer la livraison.
          </p>
          <Link to="/shop" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '14px 32px', backgroundColor: '#1a1a1a', color: 'white',
            textDecoration: 'none', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase'
          }}>
            Continuer mes achats <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: '#FAF8F5', minHeight: '100vh', paddingTop: '100px', paddingBottom: '80px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 48px' }}>

        {/* Header */}
        <div style={{ marginBottom: '48px' }}>
          <Link to="/cart" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#888', fontSize: '12px', letterSpacing: '0.15em', textTransform: 'uppercase', textDecoration: 'none', marginBottom: '24px' }}>
            <ArrowLeft size={14} /> Retour au panier
          </Link>
          <p style={{ fontSize: '11px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#C9A96E', marginBottom: '12px' }}>
            Finaliser
          </p>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2rem, 4vw, 3.5rem)', color: '#1a1a1a' }}>
            Votre Commande
          </h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '64px', alignItems: 'start' }}>

          {/* FORMULAIRE */}
          <div>
            <p style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#888', marginBottom: '32px' }}>
              Informations de livraison
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <Field label="Prénom" name="firstName" value={form.firstName} onChange={handleChange} error={errors.firstName} />
              <Field label="Nom" name="lastName" value={form.lastName} onChange={handleChange} error={errors.lastName} />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <Field label="Téléphone (WhatsApp)" name="phone" value={form.phone} onChange={handleChange} error={errors.phone} placeholder="06XXXXXXXX" />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <Field label="Ville" name="city" value={form.city} onChange={handleChange} error={errors.city} placeholder="Casablanca, Rabat, Marrakech..." />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <Field label="Adresse complète" name="address" value={form.address} onChange={handleChange} error={errors.address} placeholder="Rue, quartier, numéro..." />
            </div>

            <div style={{ marginBottom: '32px' }}>
              <label style={{ display: 'block', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#888', marginBottom: '8px' }}>
                Notes (optionnel)
              </label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Instructions spéciales pour la livraison..."
                rows={3}
                style={{
                  width: '100%', padding: '14px 16px',
                  border: '1px solid rgba(0,0,0,0.15)', backgroundColor: 'transparent',
                  fontSize: '14px', color: '#1a1a1a', resize: 'vertical',
                  fontFamily: 'Inter, sans-serif', outline: 'none',
                  transition: 'border-color 0.3s',
                }}
                onFocus={e => e.target.style.borderColor = '#C9A96E'}
                onBlur={e => e.target.style.borderColor = 'rgba(0,0,0,0.15)'}
              />
            </div>

            <div style={{ padding: '20px', backgroundColor: 'rgba(201,169,110,0.08)', border: '1px solid rgba(201,169,110,0.3)', marginBottom: '32px' }}>
              <p style={{ fontSize: '13px', color: '#666', lineHeight: 1.7 }}>
                🚚 <strong>Livraison Cash à la Livraison</strong> — Vous payez à la réception de votre commande. Délai : 2 à 4 jours ouvrables.
              </p>
            </div>
          </div>

          {/* RÉCAPITULATIF */}
          <div style={{ backgroundColor: 'white', padding: '40px', boxShadow: '0 4px 40px rgba(0,0,0,0.06)' }}>
            <p style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#888', marginBottom: '28px' }}>
              Récapitulatif
            </p>

            {items.length === 0 ? (
              <p style={{ color: '#999', fontSize: '14px', marginBottom: '24px' }}>Panier vide</p>
            ) : (
              <div style={{ marginBottom: '28px' }}>
                {items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '16px', marginBottom: '16px', borderBottom: i < items.length - 1 ? '1px solid rgba(0,0,0,0.07)' : 'none' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '15px', color: '#1a1a1a', marginBottom: '2px' }}>
                        {item.product.name}
                      </p>
                      <p style={{ fontSize: '12px', color: '#999' }}>Qté : {item.quantity}</p>
                    </div>
                    <p style={{ fontSize: '14px', color: '#C9A96E', fontWeight: '500', marginLeft: '16px' }}>
                      {item.product.price * item.quantity} MAD
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '20px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', color: '#888' }}>Sous-total</span>
              <span style={{ fontSize: '13px', color: '#1a1a1a' }}>{totalPrice} MAD</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '28px' }}>
              <span style={{ fontSize: '13px', color: '#888' }}>Livraison</span>
              <span style={{ fontSize: '13px', color: '#C9A96E' }}>Gratuite</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '36px', paddingTop: '20px', borderTop: '2px solid #1a1a1a' }}>
              <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '18px', color: '#1a1a1a' }}>Total</span>
              <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '20px', color: '#C9A96E' }}>{totalPrice} MAD</span>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                width: '100%', padding: '16px',
                backgroundColor: loading ? '#999' : '#1a1a1a', color: 'white',
                border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                transition: 'background-color 0.3s',
              }}
              onMouseEnter={e => !loading && (e.currentTarget.style.backgroundColor = '#C9A96E')}
              onMouseLeave={e => !loading && (e.currentTarget.style.backgroundColor = '#1a1a1a')}
            >
              {loading ? 'Envoi en cours...' : <> Confirmer la commande <ArrowRight size={14} /> </>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, name, value, onChange, error, placeholder }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: error ? '#e05252' : '#888', marginBottom: '8px' }}>
        {label}
      </label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          width: '100%', padding: '14px 16px',
          border: `1px solid ${error ? '#e05252' : 'rgba(0,0,0,0.15)'}`,
          backgroundColor: 'transparent', fontSize: '14px', color: '#1a1a1a',
          fontFamily: 'Inter, sans-serif', outline: 'none', transition: 'border-color 0.3s',
        }}
        onFocus={e => !error && (e.target.style.borderColor = '#C9A96E')}
        onBlur={e => !error && (e.target.style.borderColor = 'rgba(0,0,0,0.15)')}
      />
      {error && <p style={{ fontSize: '12px', color: '#e05252', marginTop: '4px' }}>{error}</p>}
    </div>
  )
}