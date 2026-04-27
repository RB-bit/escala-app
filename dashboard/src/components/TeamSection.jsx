import { useEffect, useState } from "react"
import { getMembers, inviteMember, removeMember, updateMemberRole } from "../lib/rolesService"

const ROLE_LABELS = {
  owner:  { label: "Dueño",   color: "#e8ff47", desc: "Acceso total: editar, eliminar, invitar" },
  editor: { label: "Editor",  color: "#47ffc8", desc: "Crea y edita contenido" },
  viewer: { label: "Solo ver", color: "#9a9ab0", desc: "Solo lectura" },
}

export default function TeamSection({ brand }) {
  const myRole = brand?.myRole
  const isOwner = myRole === 'owner'
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState("editor")
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState(null)

  const closeInvite = () => {
    setShowInvite(false)
    setInviteEmail("")
    setInviteRole("editor")
    setInviteError(null)
  }

  const fetchMembers = async () => {
    if (!brand?.id) return
    setLoading(true)
    setError(null)
    try {
      const data = await getMembers(brand.id)
      setMembers(data || [])
    } catch (err) {
      setError(err.message || "No se pudo cargar el equipo")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMembers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brand?.id])

  const handleInvite = async (e) => {
    e.preventDefault()
    setInviting(true)
    setInviteError(null)
    try {
      await inviteMember(brand.id, inviteEmail, inviteRole)
      closeInvite()
      fetchMembers()
    } catch (err) {
      setInviteError(err.message || "No se pudo invitar")
    } finally {
      setInviting(false)
    }
  }

  const handleRoleChange = async (memberId, newRole) => {
    try {
      await updateMemberRole(memberId, newRole)
      fetchMembers()
    } catch (err) {
      alert("Error al cambiar rol: " + err.message)
    }
  }

  const handleRemove = async (member) => {
    if (!confirm(`¿Quitar a ${member.email} de ${brand.name}?`)) return
    try {
      await removeMember(member.id)
      fetchMembers()
    } catch (err) {
      alert("Error al quitar miembro: " + err.message)
    }
  }

  return (
    <div style={{ marginTop: "32px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <div>
          <div style={{ fontSize: "18px", fontWeight: "800", letterSpacing: "-0.02em" }}>Equipo</div>
          <div style={{ fontFamily: "monospace", fontSize: "11px", color: "#5a5a78", marginTop: "2px" }}>
            Quién tiene acceso a {brand?.name}
          </div>
        </div>
        {isOwner && (
          <button
            onClick={() => setShowInvite(true)}
            style={{
              background: "#e8ff47",
              color: "#000",
              border: "none",
              borderRadius: "6px",
              padding: "8px 14px",
              fontWeight: "800",
              fontSize: "12px",
              cursor: "pointer",
              fontFamily: "monospace"
            }}
          >
            + INVITAR
          </button>
        )}
      </div>

      <div style={{ background: "#13131f", border: "1px solid #1c1c2e", borderRadius: "8px", overflow: "hidden" }}>
        {loading && (
          <div style={{ padding: "16px", color: "#5a5a78", fontSize: "13px", fontFamily: "monospace" }}>Cargando equipo...</div>
        )}
        {error && (
          <div style={{ padding: "16px", color: "#ff6b47", fontSize: "13px" }}>{error}</div>
        )}
        {!loading && !error && members.length === 0 && (
          <div style={{ padding: "20px", color: "#5a5a78", fontSize: "13px", textAlign: "center" }}>
            No hay miembros todavía.
          </div>
        )}
        {!loading && !error && members.map((m, idx) => {
          const meta = ROLE_LABELS[m.role] || ROLE_LABELS.viewer
          const isPending = !m.user_id
          return (
            <div
              key={m.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto auto",
                gap: "12px",
                alignItems: "center",
                padding: "14px 16px",
                borderTop: idx === 0 ? "none" : "1px solid #1c1c2e"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                <div style={{
                  width: "32px", height: "32px", borderRadius: "50%",
                  background: "#0e0e1a", border: "1px solid #252538",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: meta.color, fontWeight: "800", fontFamily: "monospace", fontSize: "13px",
                  flexShrink: 0
                }}>
                  {m.email[0].toUpperCase()}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: "13px", color: "#f0f0f8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {m.email}
                  </div>
                  {isPending && (
                    <div style={{ fontFamily: "monospace", fontSize: "10px", color: "#e8ff47", marginTop: "2px" }}>
                      ⏳ pendiente · esperando primer login
                    </div>
                  )}
                </div>
              </div>

              {isOwner && m.role !== 'owner' ? (
                <select
                  value={m.role}
                  onChange={(e) => handleRoleChange(m.id, e.target.value)}
                  style={{
                    background: "#0e0e1a",
                    border: "1px solid #252538",
                    color: meta.color,
                    padding: "6px 10px",
                    borderRadius: "5px",
                    fontFamily: "monospace",
                    fontSize: "11px",
                    cursor: "pointer"
                  }}
                >
                  <option value="editor">EDITOR</option>
                  <option value="viewer">SOLO VER</option>
                </select>
              ) : (
                <span style={{
                  fontFamily: "monospace", fontSize: "11px",
                  padding: "4px 10px", borderRadius: "4px",
                  background: `${meta.color}15`, color: meta.color,
                  border: `1px solid ${meta.color}30`
                }}>
                  {meta.label.toUpperCase()}
                </span>
              )}

              {isOwner && m.role !== 'owner' ? (
                <button
                  onClick={() => handleRemove(m)}
                  title="Quitar"
                  style={{
                    background: "transparent",
                    border: "1px solid #252538",
                    color: "#ff6b47",
                    width: "28px", height: "28px",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontSize: "14px"
                  }}
                >×</button>
              ) : <div style={{ width: "28px" }} />}
            </div>
          )
        })}
      </div>

      {showInvite && (
        <div
          onClick={() => !inviting && closeInvite()}
          style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100 }}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleInvite}
            style={{ background: "#13131f", border: "1px solid #1c1c2e", borderRadius: "12px", padding: "24px", width: "440px", boxShadow: "0 20px 40px rgba(0,0,0,0.5)", display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <div>
              <div style={{ fontSize: "20px", fontWeight: "800", letterSpacing: "-0.02em" }}>Invitar al equipo</div>
              <div style={{ fontFamily: "monospace", fontSize: "11px", color: "#5a5a78", marginTop: "4px" }}>
                {brand.emoji} {brand.name}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "11px", color: "#5a5a78", fontFamily: "monospace", letterSpacing: "0.1em" }}>EMAIL</label>
              <input
                required
                type="email"
                autoFocus
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="persona@email.com"
                style={{ background: "#080810", border: "1px solid #1c1c2e", borderRadius: "6px", padding: "10px 12px", color: "#f0f0f8", fontSize: "14px" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "11px", color: "#5a5a78", fontFamily: "monospace", letterSpacing: "0.1em" }}>ROL</label>
              {['editor', 'viewer'].map(r => {
                const meta = ROLE_LABELS[r]
                const selected = inviteRole === r
                return (
                  <button
                    type="button"
                    key={r}
                    onClick={() => setInviteRole(r)}
                    style={{
                      textAlign: "left",
                      background: selected ? `${meta.color}10` : "#0e0e1a",
                      border: `1px solid ${selected ? meta.color + '60' : '#1c1c2e'}`,
                      borderRadius: "6px",
                      padding: "10px 12px",
                      cursor: "pointer",
                      color: "#f0f0f8",
                      transition: "all 0.15s"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: "700", fontSize: "13px", color: meta.color }}>{meta.label}</span>
                      {selected && <span style={{ color: meta.color, fontFamily: "monospace", fontSize: "11px" }}>✓</span>}
                    </div>
                    <div style={{ color: "#5a5a78", fontSize: "11px", marginTop: "2px" }}>{meta.desc}</div>
                  </button>
                )
              })}
            </div>

            {inviteError && (
              <div style={{ color: "#ff6b47", fontSize: "12px", background: "rgba(255,107,71,0.1)", padding: "8px 10px", borderRadius: "6px", border: "1px solid rgba(255,107,71,0.2)" }}>
                {inviteError}
              </div>
            )}

            <div style={{ fontFamily: "monospace", fontSize: "11px", color: "#5a5a78", lineHeight: 1.5, background: "#0e0e1a", padding: "10px", borderRadius: "6px", border: "1px solid #1c1c2e" }}>
              Cuando entre con su email a la app, va a tener acceso automáticamente.
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
              <button
                type="button"
                onClick={closeInvite}
                disabled={inviting}
                style={{ flex: 1, background: "transparent", border: "1px solid #252538", color: "#5a5a78", borderRadius: "6px", padding: "10px", fontWeight: "600", cursor: "pointer" }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={inviting}
                style={{ flex: 1, background: "#e8ff47", border: "none", color: "#000", borderRadius: "6px", padding: "10px", fontWeight: "800", cursor: inviting ? "wait" : "pointer", opacity: inviting ? 0.7 : 1 }}
              >
                {inviting ? "Invitando..." : "Invitar"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
