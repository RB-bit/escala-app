import { useState } from 'react'
import { setPassword, signOut } from '../lib/auth'

export default function SetPassword({ email, onDone }) {
  const [password, setPwd] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [show, setShow] = useState(false)

  const inputType = show ? 'text' : 'password'
  const eyeBtnStyle = {
    position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)",
    background: "transparent", border: "none", color: "#5a5a78",
    cursor: "pointer", fontSize: "16px", padding: "4px"
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    if (password.length < 8) {
      setError('La contraseña tiene que tener al menos 8 caracteres.')
      return
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }
    setLoading(true)
    try {
      await setPassword(password)
      onDone?.()
    } catch (err) {
      setError(err.message || 'No pudimos guardar la contraseña.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      height: "100vh", background: "#080810",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Bricolage Grotesque', sans-serif", color: "#f0f0f8"
    }}>
      <div style={{
        width: "100%", maxWidth: "420px",
        padding: "40px 32px", background: "#0e0e1a",
        border: "1px solid #1c1c2e", borderRadius: "12px",
        boxShadow: "0 20px 40px rgba(0,0,0,0.5)"
      }}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ fontSize: "40px", marginBottom: "8px" }}>🔐</div>
          <h1 style={{ fontSize: "22px", fontWeight: "800", letterSpacing: "-0.03em" }}>Creá tu contraseña</h1>
          <p style={{ color: "#5a5a78", fontSize: "13px", marginTop: "6px", lineHeight: 1.5 }}>
            Es la última vez que usás el link mágico.<br />
            Desde ahora vas a entrar con tu mail y esta contraseña.
          </p>
          {email && (
            <div style={{ color: "#e8ff47", fontFamily: "monospace", fontSize: "12px", marginTop: "10px" }}>
              {email}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", color: "#5a5a78", fontFamily: "monospace", letterSpacing: "0.1em" }}>NUEVA CONTRASEÑA</label>
            <div style={{ position: "relative" }}>
              <input
                required
                type={inputType}
                autoFocus
                value={password}
                onChange={(e) => setPwd(e.target.value)}
                placeholder="mínimo 8 caracteres"
                style={{
                  width: "100%", background: "#080810", border: "1px solid #1c1c2e",
                  borderRadius: "8px", padding: "12px 40px 12px 16px",
                  color: "#f0f0f8", outline: "none", fontSize: "14px"
                }}
              />
              <button type="button" onClick={() => setShow(s => !s)} style={eyeBtnStyle} aria-label="Mostrar/ocultar contraseña">
                {show ? "👁️" : "🙈"}
              </button>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", color: "#5a5a78", fontFamily: "monospace", letterSpacing: "0.1em" }}>REPETIR CONTRASEÑA</label>
            <div style={{ position: "relative" }}>
              <input
                required
                type={inputType}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                style={{
                  width: "100%", background: "#080810", border: "1px solid #1c1c2e",
                  borderRadius: "8px", padding: "12px 40px 12px 16px",
                  color: "#f0f0f8", outline: "none", fontSize: "14px"
                }}
              />
              <button type="button" onClick={() => setShow(s => !s)} style={eyeBtnStyle} aria-label="Mostrar/ocultar contraseña">
                {show ? "👁️" : "🙈"}
              </button>
            </div>
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
              fontSize: "15px", marginTop: "6px",
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? "Guardando..." : "Guardar contraseña"}
          </button>

          <button
            type="button"
            onClick={() => signOut()}
            style={{
              background: "transparent", color: "#5a5a78",
              border: "1px solid #1c1c2e", borderRadius: "8px",
              padding: "10px", fontSize: "12px", cursor: "pointer"
            }}
          >
            Cerrar sesión
          </button>
        </form>
      </div>
    </div>
  )
}
