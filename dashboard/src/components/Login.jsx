import { useState } from 'react'
import { signIn } from '../lib/auth'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await signIn(email, password)
    } catch (err) {
      setError(err.message === 'Invalid login credentials' ? 'Credenciales incorrectas' : err.message)
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
        maxWidth: "400px", 
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

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "12px", color: "#5a5a78", fontFamily: "monospace", letterSpacing: "0.1em" }}>EMAIL</label>
            <input 
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              style={{ 
                background: "#080810", 
                border: "1px solid #1c1c2e", 
                borderRadius: "8px", 
                padding: "12px 16px", 
                color: "#f0f0f8",
                outline: "none",
                fontSize: "14px"
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "12px", color: "#5a5a78", fontFamily: "monospace", letterSpacing: "0.1em" }}>CONTRASEÑA</label>
            <input 
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ 
                background: "#080810", 
                border: "1px solid #1c1c2e", 
                borderRadius: "8px", 
                padding: "12px 16px", 
                color: "#f0f0f8",
                outline: "none",
                fontSize: "14px"
              }}
            />
          </div>

          {error && (
            <div style={{ 
              color: "#ff6b47", 
              fontSize: "13px", 
              background: "rgba(255,107,71,0.1)", 
              padding: "10px", 
              borderRadius: "6px",
              border: "1px solid rgba(255,107,71,0.2)",
              textAlign: "center"
            }}>
              {error}
            </div>
          )}

          <button 
            disabled={loading}
            type="submit"
            style={{ 
              background: "#e8ff47", 
              color: "#000", 
              border: "none", 
              borderRadius: "8px", 
              padding: "14px", 
              fontWeight: "800", 
              cursor: "pointer", 
              fontSize: "15px",
              marginTop: "8px",
              transition: "all 0.2s"
            }}
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  )
}
