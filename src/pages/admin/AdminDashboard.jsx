/**
 * ProductManager.jsx — Twins Style Admin
 * ─────────────────────────────────────────────────────────────────────────────
 * Intégration :
 *   1. Remplace l'onglet "produits" de AdminDashboard.jsx par <ProductManager />
 *   2. Passe-lui les props : token (string), apiBase (URL de base, ex. "https://site-twins.vercel.app/api")
 *   3. Configure Supabase Storage (voir README en bas du fichier)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'

// ── Supabase ─────────────────────────────────────────────────────────────────
// Mets tes propres clés ici (ou passe-les en props / variables d'env)
const SUPABASE_URL    = import.meta.env.VITE_SUPABASE_URL    || ''
const SUPABASE_ANON   = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
const STORAGE_BUCKET  = 'products'   // nom de ton bucket Supabase Storage

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)

// ── Catégories (identique à l'existant) ──────────────────────────────────────
const CATEGORIES = [
  { id: 1, name: 'T-shirt',   slug: 't-shirt'   },
  { id: 2, name: 'Pantalons', slug: 'pantalons'  },
  { id: 3, name: 'Robes',     slug: 'robes'      },
]

// ── Palette Twins Style ───────────────────────────────────────────────────────
const C = {
  violet:    '#534AB7',
  violetLt:  '#EDE9FE',
  violetDk:  '#3C3489',
  gold:      '#C9A96E',
  bg:        '#FAF8F5',
  white:     '#FFFFFF',
  border:    '#E5E5E5',
  muted:     '#888888',
  danger:    '#991B1B',
  dangerLt:  '#FEE2E2',
  text:      '#1A1A1A',
  textSub:   '#555555',
}

// ── Styles partagés ───────────────────────────────────────────────────────────
const S = {
  input: {
    width: '100%', padding: '9px 12px', border: `1px solid ${C.border}`,
    borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box',
    outline: 'none', background: C.white, color: C.text,
    transition: 'border-color .15s',
  },
  btn: (bg, color) => ({
    padding: '8px 18px', borderRadius: '8px', border: 'none',
    cursor: 'pointer', fontSize: '13px', fontWeight: '600',
    background: bg, color: color,
    transition: 'opacity .15s',
    display: 'inline-flex', alignItems: 'center', gap: '6px',
  }),
  card: {
    background: C.white, border: `1px solid ${C.border}`,
    borderRadius: '12px', padding: '1.25rem 1.5rem',
    marginBottom: '12px',
  },
  label: {
    display: 'block', fontSize: '12px', fontWeight: '600',
    color: C.muted, marginBottom: '5px', letterSpacing: '.5px',
    textTransform: 'uppercase',
  },
  field: { marginBottom: '14px' },
  badge: (color) => ({
    display: 'inline-block', fontSize: '11px', fontWeight: '600',
    padding: '2px 10px', borderRadius: '20px',
    background: color + '22', color: color, border: `1px solid ${color}44`,
  }),
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook : upload image vers Supabase Storage
// ─────────────────────────────────────────────────────────────────────────────
function useImageUpload() {
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const upload = useCallback(async (file) => {
    if (!file) return null
    setUploading(true)
    setUploadError('')
    try {
      const ext  = file.name.split('.').pop()
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(path, file, { contentType: file.type, upsert: false })
      if (error) throw error
      const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path)
      return data.publicUrl
    } catch (err) {
      setUploadError(err.message || 'Erreur upload')
      return null
    } finally {
      setUploading(false)
    }
  }, [])

  return { upload, uploading, uploadError }
}

// ─────────────────────────────────────────────────────────────────────────────
// Sous-composant : zone de drop d'image
// ─────────────────────────────────────────────────────────────────────────────
function ImageUploadZone({ onFile, preview, uploading, error }) {
  const inputRef  = useRef()
  const [dragging, setDragging] = useState(false)

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f && f.type.startsWith('image/')) onFile(f)
  }

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      style={{
        border: `2px dashed ${dragging ? C.violet : C.border}`,
        borderRadius: '10px', padding: '1.5rem',
        textAlign: 'center', cursor: 'pointer',
        background: dragging ? C.violetLt : '#FAFAFA',
        transition: 'all .2s', marginBottom: '14px',
        minHeight: '100px', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: '8px',
      }}
    >
      <input
        ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={e => e.target.files[0] && onFile(e.target.files[0])}
      />
      {preview ? (
        <>
          <img src={preview} alt="Aperçu"
            style={{ maxHeight: '100px', maxWidth: '120px', borderRadius: '6px', objectFit: 'cover' }} />
          <span style={{ fontSize: '12px', color: C.muted }}>Cliquer ou glisser pour changer</span>
        </>
      ) : uploading ? (
        <Spinner />
      ) : (
        <>
          <span style={{ fontSize: '28px' }}>📸</span>
          <span style={{ fontSize: '13px', color: C.muted }}>
            Glisser une photo ici ou <strong style={{ color: C.violet }}>cliquer pour choisir</strong>
          </span>
          <span style={{ fontSize: '11px', color: C.muted }}>JPG, PNG, WebP — max 5 Mo</span>
        </>
      )}
      {error && <span style={{ fontSize: '12px', color: C.danger }}>{error}</span>}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Sous-composant : formulaire "Ajouter un produit"
// ─────────────────────────────────────────────────────────────────────────────
function AddProductForm({ apiBase, headers, onSuccess, onCancel }) {
  const EMPTY = { name: '', description: '', price: '', category_id: 1 }
  const [form, setForm]       = useState(EMPTY)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')
  const { upload, uploading, uploadError } = useImageUpload()

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleFile = (file) => {
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError('Le nom est requis.'); return }
    if (!form.price || isNaN(form.price)) { setError('Prix invalide.'); return }
    setError('')
    setSaving(true)

    try {
      let imageUrl = ''
      if (imageFile) {
        imageUrl = await upload(imageFile)
        if (!imageUrl) { setSaving(false); return }  // uploadError déjà affiché
      }

      const payload = {
        name:        form.name.trim(),
        description: form.description.trim(),
        price:       parseFloat(form.price),
        category_id: form.category_id,
        images:      imageUrl ? [imageUrl] : [],
      }

      const res = await fetch(`${apiBase}/products/admin/create`, {
        method: 'POST', headers, body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(`Erreur ${res.status}`)
      setForm(EMPTY); setImageFile(null); setImagePreview('')
      onSuccess()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ ...S.card, border: `1.5px solid ${C.violet}33` }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
        <span style={{ fontSize: '20px' }}>✨</span>
        <h3 style={{ margin: 0, fontSize: '16px', fontFamily: 'Playfair Display, serif', color: C.text }}>
          Nouveau produit
        </h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1.5rem' }}>
        {/* Colonne gauche */}
        <div>
          <div style={S.field}>
            <label style={S.label}>Nom du produit *</label>
            <input style={S.input} placeholder="Ex: Robe fleurie bohème"
              value={form.name} onChange={e => set('name', e.target.value)} />
          </div>

          <div style={S.field}>
            <label style={S.label}>Prix (MAD) *</label>
            <input style={{ ...S.input, width: '160px' }} type="number" min="0" step="0.01"
              placeholder="299.00" value={form.price} onChange={e => set('price', e.target.value)} />
          </div>

          <div style={S.field}>
            <label style={S.label}>Catégorie</label>
            <select style={{ ...S.input, width: 'auto', paddingRight: '32px' }}
              value={form.category_id} onChange={e => set('category_id', parseInt(e.target.value))}>
              {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div style={S.field}>
            <label style={S.label}>Description</label>
            <textarea
              style={{ ...S.input, minHeight: '90px', resize: 'vertical', lineHeight: '1.5' }}
              placeholder="Matière, coupe, conseils entretien…"
              value={form.description} onChange={e => set('description', e.target.value)}
            />
          </div>
        </div>

        {/* Colonne droite : photo */}
        <div>
          <label style={S.label}>Photo du produit</label>
          <ImageUploadZone
            onFile={handleFile}
            preview={imagePreview}
            uploading={uploading}
            error={uploadError}
          />
          <p style={{ fontSize: '11px', color: C.muted, margin: '-8px 0 0' }}>
            L'image sera stockée dans Supabase Storage et liée au produit automatiquement.
          </p>
        </div>
      </div>

      {error && (
        <div style={{ background: C.dangerLt, color: C.danger, borderRadius: '8px',
          padding: '8px 14px', fontSize: '13px', marginTop: '8px' }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', marginTop: '1rem' }}>
        <button onClick={handleSubmit} disabled={saving || uploading}
          style={{ ...S.btn(C.violet, '#fff'), opacity: (saving || uploading) ? .6 : 1 }}>
          {saving ? <><Spinner size={14} color="#fff" /> Enregistrement…</> : '✅ Ajouter le produit'}
        </button>
        <button onClick={onCancel} style={S.btn(C.bg, C.textSub)}>
          Annuler
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Sous-composant : carte produit (mode lecture + mode édition inline)
// ─────────────────────────────────────────────────────────────────────────────
function ProductRow({ product, apiBase, headers, onRefresh }) {
  const [editing, setEditing]   = useState(false)
  const [draft, setDraft]       = useState({})
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [saving, setSaving]     = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError]       = useState('')
  const { upload, uploading, uploadError } = useImageUpload()

  const startEdit = () => {
    setDraft({
      name:        product.name        || '',
      description: product.description || '',
      price:       product.price       ?? '',
      category_id: product.category_id ?? 1,
    })
    setImageFile(null)
    setImagePreview(product.images?.[0] || '')
    setEditing(true)
    setError('')
  }

  const handleFile = (file) => {
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSave = async () => {
    if (!draft.name.trim()) { setError('Nom requis'); return }
    if (isNaN(draft.price) || draft.price === '') { setError('Prix invalide'); return }
    setSaving(true); setError('')
    try {
      let images = product.images || []
      if (imageFile) {
        const url = await upload(imageFile)
        if (!url) { setSaving(false); return }
        images = [url]
      }
      const payload = {
        name:        draft.name.trim(),
        description: draft.description.trim(),
        price:       parseFloat(draft.price),
        category_id: draft.category_id,
        images,
      }
      const res = await fetch(`${apiBase}/products/admin/${product.id}`, {
        method: 'PUT', headers, body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(`Erreur ${res.status}`)
      setEditing(false)
      onRefresh()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Supprimer "${product.name}" ? Cette action est irréversible.`)) return
    setDeleting(true)
    try {
      await fetch(`${apiBase}/products/admin/${product.id}`, { method: 'DELETE', headers })
      onRefresh()
    } catch (err) {
      alert('Erreur suppression : ' + err.message)
    } finally {
      setDeleting(false)
    }
  }

  const catName = CATEGORIES.find(c => c.id === (product.category_id ?? product.category?.id))?.name

  // ── Mode lecture ────────────────────────────────────────────────────────────
  if (!editing) return (
    <div style={{ ...S.card, display: 'flex', alignItems: 'flex-start',
      gap: '1rem', flexWrap: 'wrap' }}>
      {/* Image */}
      <div style={{ width: '64px', height: '82px', flexShrink: 0,
        borderRadius: '8px', overflow: 'hidden', background: '#f3f4f6',
        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {product.images?.[0]
          ? <img src={product.images[0]} alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ fontSize: '24px' }}>👗</span>}
      </div>

      {/* Infos */}
      <div style={{ flex: 1, minWidth: '200px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <p style={{ margin: 0, fontWeight: '700', fontSize: '15px', color: C.text }}>
            {product.name}
          </p>
          {catName && <span style={S.badge(C.violet)}>{catName}</span>}
        </div>
        {product.description && (
          <p style={{ margin: '0 0 6px', fontSize: '13px', color: C.textSub,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            overflow: 'hidden' }}>
            {product.description}
          </p>
        )}
        <p style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: C.gold }}>
          {Number(product.price).toFixed(2)} MAD
        </p>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
        <button onClick={startEdit} style={S.btn(C.violetLt, C.violetDk)}>
          ✏️ Modifier
        </button>
        <button onClick={handleDelete} disabled={deleting}
          style={{ ...S.btn(C.dangerLt, C.danger), opacity: deleting ? .6 : 1 }}>
          {deleting ? '…' : '🗑️'}
        </button>
      </div>
    </div>
  )

  // ── Mode édition inline ─────────────────────────────────────────────────────
  return (
    <div style={{ ...S.card, border: `1.5px solid ${C.violet}55` }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1.5rem' }}>
        {/* Champs */}
        <div>
          <div style={S.field}>
            <label style={S.label}>Nom</label>
            <input style={S.input} value={draft.name}
              onChange={e => setDraft(d => ({ ...d, name: e.target.value }))} />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ ...S.field, flex: 1 }}>
              <label style={S.label}>Prix (MAD)</label>
              <input style={S.input} type="number" min="0" step="0.01" value={draft.price}
                onChange={e => setDraft(d => ({ ...d, price: e.target.value }))} />
            </div>
            <div style={{ ...S.field, flex: 1 }}>
              <label style={S.label}>Catégorie</label>
              <select style={S.input} value={draft.category_id}
                onChange={e => setDraft(d => ({ ...d, category_id: parseInt(e.target.value) }))}>
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div style={S.field}>
            <label style={S.label}>Description</label>
            <textarea
              style={{ ...S.input, minHeight: '80px', resize: 'vertical', lineHeight: '1.5' }}
              value={draft.description}
              onChange={e => setDraft(d => ({ ...d, description: e.target.value }))}
            />
          </div>
        </div>

        {/* Photo */}
        <div>
          <label style={S.label}>Photo</label>
          <ImageUploadZone onFile={handleFile} preview={imagePreview}
            uploading={uploading} error={uploadError} />
        </div>
      </div>

      {error && (
        <div style={{ background: C.dangerLt, color: C.danger, borderRadius: '8px',
          padding: '8px 14px', fontSize: '13px', marginBottom: '8px' }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={handleSave} disabled={saving || uploading}
          style={{ ...S.btn(C.violet, '#fff'), opacity: (saving || uploading) ? .6 : 1 }}>
          {saving ? <><Spinner size={14} color="#fff" /> Enregistrement…</> : '💾 Sauvegarder'}
        </button>
        <button onClick={() => setEditing(false)} style={S.btn(C.bg, C.textSub)}>
          Annuler
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Composant principal : ProductManager
// ─────────────────────────────────────────────────────────────────────────────
export default function ProductManager({ token, apiBase = 'https://site-twins.vercel.app/api' }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch]     = useState('')
  const [catFilter, setCatFilter] = useState(0)   // 0 = toutes

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token || localStorage.getItem('admin_token')}`,
  }

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch(`${apiBase}/products/admin/all`, { headers })
      const data = await res.json()
      setProducts(Array.isArray(data) ? data : [])
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [apiBase])   // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchProducts() }, [fetchProducts])

  // Filtres côté client
  const visible = products.filter(p => {
    const matchSearch = !search || p.name?.toLowerCase().includes(search.toLowerCase())
    const matchCat    = !catFilter || (p.category_id ?? p.category?.id) === catFilter
    return matchSearch && matchCat
  })

  return (
    <div>
      {/* ── En-tête section ── */}
      <div style={{ display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px',
        marginBottom: '1.25rem' }}>
        <h2 style={{ margin: 0, fontFamily: 'Playfair Display, serif',
          fontSize: '21px', color: C.text }}>
          Gestion des produits
          <span style={{ fontSize: '14px', fontWeight: '400',
            color: C.muted, marginLeft: '10px' }}>
            ({products.length} en ligne)
          </span>
        </h2>
        <button
          onClick={() => setShowForm(v => !v)}
          style={{ ...S.btn(showForm ? C.bg : C.violet, showForm ? C.textSub : '#fff'),
            border: showForm ? `1px solid ${C.border}` : 'none' }}>
          {showForm ? '✕ Annuler' : '+ Ajouter un produit'}
        </button>
      </div>

      {/* ── Formulaire ajout (collapsible) ── */}
      {showForm && (
        <AddProductForm
          apiBase={apiBase}
          headers={headers}
          onSuccess={() => { setShowForm(false); fetchProducts() }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* ── Barre de recherche + filtre catégorie ── */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input
          style={{ ...S.input, maxWidth: '260px' }}
          placeholder="🔍 Rechercher un produit…"
          value={search} onChange={e => setSearch(e.target.value)}
        />
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[{ id: 0, name: 'Toutes' }, ...CATEGORIES].map(c => (
            <button key={c.id} onClick={() => setCatFilter(c.id)}
              style={{
                padding: '7px 14px', borderRadius: '20px', fontSize: '12px',
                fontWeight: '600', cursor: 'pointer', border: '1px solid',
                background: catFilter === c.id ? C.violet : C.white,
                color: catFilter === c.id ? '#fff' : C.textSub,
                borderColor: catFilter === c.id ? C.violet : C.border,
              }}>
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── Liste produits ── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: C.muted }}>
          <Spinner size={28} /> <p>Chargement des produits…</p>
        </div>
      ) : visible.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: C.muted }}>
          <span style={{ fontSize: '36px' }}>👗</span>
          <p style={{ fontSize: '14px', marginTop: '8px' }}>
            {search ? 'Aucun produit ne correspond à ta recherche.' : 'Aucun produit pour l\'instant.'}
          </p>
        </div>
      ) : (
        visible.map(p => (
          <ProductRow
            key={p.id}
            product={p}
            apiBase={apiBase}
            headers={headers}
            onRefresh={fetchProducts}
          />
        ))
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Utilitaire : spinner SVG léger
// ─────────────────────────────────────────────────────────────────────────────
function Spinner({ size = 18, color = C.violet }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      style={{ animation: 'spin .7s linear infinite' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="3" strokeOpacity=".25" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke={color} strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

/*
 * ─────────────────────────────────────────────────────────────────────────────
 * GUIDE D'INTÉGRATION SUPABASE STORAGE
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * 1. CRÉER LE BUCKET
 *    Dans ton Dashboard Supabase → Storage → "New bucket"
 *    Nom : "products"   |   Public : ✅ activé
 *
 * 2. POLITIQUE RLS (Storage → products → Policies)
 *    Ajouter "INSERT" pour les admins authentifiés :
 *
 *    CREATE POLICY "Admin upload" ON storage.objects
 *      FOR INSERT WITH CHECK (
 *        bucket_id = 'products'
 *        AND auth.role() = 'authenticated'
 *      );
 *
 *    Si tu n'utilises pas Supabase Auth mais un JWT maison,
 *    tu peux temporairement mettre la policy en "public" le
 *    temps du développement, puis la restreindre en prod.
 *
 * 3. VARIABLES D'ENVIRONNEMENT (.env)
 *    VITE_SUPABASE_URL=https://xxxx.supabase.co
 *    VITE_SUPABASE_ANON_KEY=eyJhbGciOiJI…
 *
 * 4. INTÉGRATION DANS AdminDashboard.jsx
 *    Remplace la section {tab === 'produits' && ...} par :
 *
 *    import ProductManager from './ProductManager'
 *    ...
 *    {tab === 'produits' && (
 *      <ProductManager apiBase="https://site-twins.vercel.app/api" />
 *    )}
 *
 * 5. TABLE products (si elle n'a pas encore de colonne description)
 *    ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT;
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */
