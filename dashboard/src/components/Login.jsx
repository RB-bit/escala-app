import { useState } from 'react'
import { signInWithMagicLink, signInWithPassword } from '../lib/auth'

export default function Login() {
  const [mode, setMode] = useState('password') // 'password' | 'magic'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [sent, setSent] = useState(false)
  const [showPwd, setShowPwd] = useState(false)

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await signInWithPassword(email.trim().toLowerCase(), password)
    } catch (err) {
      const msg = err.message || ''
      if (msg.toLowerCase().includes('invalid login credentials')) {
        setError('Mail o contraseña incorrectos. Si es tu primera vez o olvidaste la contraseña, usá el link mágico abajo.')
      } else {
        setError(msg || 'No pudimos entrar.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleMagicSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await signInWithMagicLink(email.trim().toLowerCase())
      setSent(true)
    } catch (err) {
      setError(err.message || 'No pudimos enviar el link. Probá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      height: "100vh",
      background: "#080810",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Bricolage Grotesque', sans-serif",
      color: "#f0f0f8"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "420px",
        padding: "40px 32px",
        background: "#0e0e1a",
        border: "1px solid #1c1c2e",
        borderRadius: "12px",
        boxShadow: "0 20px 40px rgba(0,0,0,0.5)"
      }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ fontSize: "40px", marginBottom: "8px" }}>⚡</div>
          <h1 style={{ fontSize: "28px", fontWeight: "800", letterSpacing: "-0.03em" }}>ESCALA</h1>
          <p style={{ color: "#5a5a78", fontSize: "14px", marginTop: "4px" }}>Control de mando para e-commerce</p>
        </div>

        {sent ? (
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ fontSize: "44px" }}>📩</div>
            <div style={{ fontWeight: "700", fontSize: "18px" }}>Revisá tu email</div>
            <div style={{ color: "#9a9ab0", fontSize: "14px", lineHeight: 1.5 }}>
              Te mandamos un link a <span style={{ color: "#e8ff47", fontFamily: "monospace" }}>{email}</span>.
              Hacé click para entrar.
            </div>
            <button
              onClick={() => { setSent(false); setMode('password') }}
              style={{
                background: "transparent", color: "#5a5a78",
                border: "1px solid #1c1c2e", borderRadius: "8px",
                padding: "10px", fontSize: "13px", cursor: "pointer", marginTop: "8px"
              }}
            >
              Volver al inicio
            </button>
          </div>
        ) : mode === 'password' ? (
          <form onSubmit={handlePasswordSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "11px", color: "#5a5a78", fontFamily: "monospace", letterSpacing: "0.1em" }}>EMAIL</label>
              <input
                required
                type="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                style={{
                  background: "#080810", border: "1px solid #1c1c2e",
                  borderRadius: "8px", padding: "12px 16px",
                  color: "#f0f0f8", outline: "none", fontSize: "14px"
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "11px", color: "#5a5a78", fontFamily: "monospace", letterSpacing: "0.1em" }}>CONTRASEÑA</label>
              <div style={{ position: "relative" }}>
                <input
                  required
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: "100%", background: "#080810", border: "1px solid #1c1c2e",
                    borderRadius: "8px", padding: "12px 40px 12px 16px",
                    color: "#f0f0f8", outline: "none", fontSize: "14px"
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(s => !s)}
                  aria-label="Mostrar/ocultar contraseña"
                  style={{
                    position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)",
                    background: "transparent", border: "none", color: "#5a5a78",
                    cursor: "pointer", fontSize: "16px", padding: "4px"
                  }}
                >
                  {showPwd ? "👁️" : "🙈"}
                </button>
              </div>
            </div>

            {error && (
              <div style={{
                color: "#ff6b47", fontSize: "13px",
                background: "rgba(255,107,71,0.1)", padding: "10px",
                borderRadius: "6px", border: "1px solid rgba(255,107,71,0.2)",
                lineHeight: 1.4
              }}>
                {error}
              </div>
            )}

            <button
              disabled={loading}
              type="submit"
              style={{
                background: "#e8ff47", color: "#000", border: "none",
                borderRadius: "8px", padding: "14px",
                fontWeight: "800", cursor: loading ? "wait" : "pointer",
                fontSize: "15px", marginTop: "4px",
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>

            <button
              type="button"
              onClick={() => { setMode('magic'); setError(null); setPassword('') }}
              style={{
                background: "transparent", color: "#9a9ab0",
                border: "1px solid #1c1c2e", borderRadius: "8px",
                padding: "10px", fontSize: "12px", cursor: "pointer", lineHeight: 1.4
              }}
            >
              Primera vez / Olvidé contraseña → mandar link al mail
            </button>
          </form>
        ) : (
          <form onSubmit={handleMagicSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ fontFamily: "monospace", fontSize: "11px", color: "#9a9ab0", textAlign: "center", lineHeight: 1.5 }}>
              Te mandamos un link al mail. Hacé click y vas a poder armar tu contraseña.
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "11px", color: "#5a5a78", fontFamily: "monospace", letterSpacing: "0.1em" }}>EMAIL</label>
              <input
                required
                type="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                style={{
                  background: "#080810", border: "1px solid #1c1c2e",
                  borderRadius: "8px", padding: "12px 16px",
                  color: "#f0f0f8", outline: "none", fontSize: "14px"
                }}
              />
            </div>

            {error && (
              <div style={{
                color: "#ff6b47", fontSize: "13px",
                background: "rgba(255,107,71,0.1)", padding: "10px",
                borderRadius: "6px", border: "1px solid rgba(255,107,71,0.2)",
                textAlign: "center"
              }}>
                {error}
              </div>
            )}

            <button
              disabled={loading}
              type="submit"
              style={{
                background: "#e8ff47", color: "#000", border: "none",
                borderRadius: "8px", padding: "14px",
                fontWeight: "800", cursor: loading ? "wait" : "pointer",
                fontSize: "15px", opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? "Enviando link..." : "Enviar link al mail"}
            </button>

            <button
              type="button"
              onClick={() => { setMode('password'); setError(null) }}
              style={{
                background: "transparent", color: "#5a5a78",
                border: "1px solid #1c1c2e", borderRadius: "8px",
                padding: "10px", fontSize: "12px", cursor: "pointer"
              }}
            >
              ← Volver al login con contraseña
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
