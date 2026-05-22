export default function Contact() {
  return (
    <div style={{ backgroundColor: '#FAF8F5', minHeight: '100vh', paddingTop: '120px' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '0 48px 96px' }}>

        <p style={{ fontSize: '11px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#C9A96E', marginBottom: '16px' }}>
          Nous contacter
        </p>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(2.5rem, 5vw, 5rem)', color: '#1a1a1a', lineHeight: 1.05, marginBottom: '64px' }}>
          Contact
        </h1>

        {/* WHATSAPP */}
        <div style={{ borderTop: '1px solid rgba(0,0,0,0.1)', padding: '40px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.4)', marginBottom: '8px' }}>WhatsApp</p>
            <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '24px', color: '#1a1a1a' }}>+212634698259"</p>
          </div>
          <a href="https://api.whatsapp.com/send/?phone=212634698259" target="_blank" rel="noreferrer" style={{
            display: 'inline-flex', alignItems: 'center', gap: '12px',
            backgroundColor: '#25D366', color: 'white',
            padding: '14px 32px', fontSize: '11px', letterSpacing: '0.2em',
            textTransform: 'uppercase', textDecoration: 'none',
          }}>
            Écrire sur WhatsApp
          </a>
        </div>

        {/* INSTAGRAM */}
        <div style={{ borderTop: '1px solid rgba(0,0,0,0.1)', padding: '40px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.4)', marginBottom: '8px' }}>Instagram</p>
            <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '24px', color: '#1a1a1a' }}>@Twins_style</p>
          </div>
          <a href="https://instagram.com/Twins_style" target="_blank" rel="noreferrer" style={{
            display: 'inline-flex', alignItems: 'center', gap: '12px',
            backgroundColor: '#1a1a1a', color: 'white',
            padding: '14px 32px', fontSize: '11px', letterSpacing: '0.2em',
            textTransform: 'uppercase', textDecoration: 'none',
          }}>
            Voir le profil
          </a>
        </div>

        {/* EMAIL */}
        <div style={{ borderTop: '1px solid rgba(0,0,0,0.1)', borderBottom: '1px solid rgba(0,0,0,0.1)', padding: '40px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.4)', marginBottom: '8px' }}>Email</p>
            <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '24px', color: '#1a1a1a' }}>contact@myfashion.ma</p>
          </div>
          <a href="mailto:contact@myfashion.ma" style={{
            display: 'inline-flex', alignItems: 'center', gap: '12px',
            border: '1px solid #1a1a1a', color: '#1a1a1a',
            padding: '14px 32px', fontSize: '11px', letterSpacing: '0.2em',
            textTransform: 'uppercase', textDecoration: 'none',
          }}>
            Envoyer un email
          </a>
        </div>

        {/* LIVRAISON INFO */}
        <div style={{ marginTop: '64px', backgroundColor: '#1a1a1a', padding: '48px', textAlign: 'center' }}>
          <p style={{ color: '#C9A96E', fontSize: '11px', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '16px' }}>Livraison</p>
          <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '28px', color: 'white', lineHeight: 1.3 }}>
            Livraison gratuite partout au Maroc
          </p>
        </div>

      </div>
    </div>
  )
}