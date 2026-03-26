import { useState, useEffect } from "react"
import { fetchAdAccounts } from "../lib/metaService"
import { saveMetaConnection } from "../lib/brandsService"

export default function ConnectMetaModal({ brand, onClose, onConnected }) {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState("")
  const [saving, setSaving] = useState(false)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    fetchAdAccounts()
      .then(data => {
        // Sort active accounts first, then alphabetically
        const sorted = [...data].sort((a, b) => {
          if (a.account_status === 1 && b.account_status !== 1) return -1
          if (b.account_status === 1 && a.account_status !== 1) return 1
          return a.name.localeCompare(b.name)
        })
        setAccounts(sorted)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = accounts.filter(acc =>
    acc.name.toLowerCase().includes(search.toLowerCase()) ||
    acc.id.includes(search)
  )

  const handleConnect = async () => {
    if (!selected) return
    setSaving(true)
    try {
      await saveMetaConnection(brand.id, {
        adAccountId: selected.id,
        adAccountName: selected.name,
      })
      onConnected(brand.id, selected)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const brandColor = brand.color || "#e8ff47"

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: "#13131f", border: "1px solid #1c1c2e",
        borderRadius: "14px", padding: "28px", width: "480px",
        maxHeight: "80vh", display: "flex", flexDirection: "column",
        gap: "20px", boxShadow: "0 24px 60px rgba(0,0,0,0.6)"
      }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: "18px", fontWeight: "800", letterSpacing: "-0.02em" }}>
              Conectar cuenta Meta
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px" }}>
              <div style={{
                width: "24px", height: "24px", borderRadius: "6px",
                background: `${brandColor}18`, border: `1px solid ${brandColor}30`,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px"
              }}>
                {brand.emoji || "🚀"}
              </div>
              <span style={{ fontFamily: "monospace", fontSize: "12px", color: "#5a5a78" }}>
                {brand.name}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none", border: "none", color: "#5a5a78",
              fontSize: "20px", cursor: "pointer", lineHeight: 1, padding: "2px"
            }}
          >
            ×
          </button>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Buscar cuenta..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          autoFocus
          style={{
            background: "#080810", border: "1px solid #1c1c2e",
            borderRadius: "8px", padding: "10px 14px", color: "#f0f0f8",
            fontSize: "13px", outline: "none",
            borderColor: search ? "#e8ff4740" : "#1c1c2e"
          }}
        />

        {/* Account list */}
        <div style={{ overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
          {loading && (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#5a5a78" }}>
              <div style={{ fontSize: "24px", marginBottom: "8px", animation: "spin 1s linear infinite" }}>⟳</div>
              <div style={{ fontFamily: "monospace", fontSize: "12px" }}>Cargando cuentas Meta...</div>
            </div>
          )}

          {error && (
            <div style={{
              background: "rgba(255,107,71,0.08)", border: "1px solid rgba(255,107,71,0.2)",
              borderRadius: "8px", padding: "14px", color: "#ff6b47",
              fontFamily: "monospace", fontSize: "12px"
            }}>
              ⚠️ {error}
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "30px", color: "#5a5a78", fontFamily: "monospace", fontSize: "12px" }}>
              No se encontraron cuentas
            </div>
          )}

          {!loading && filtered.map(acc => {
            const isActive = acc.account_status === 1
            const isSelected = selected?.id === acc.id
            return (
              <div
                key={acc.id}
                onClick={() => setSelected(acc)}
                style={{
                  padding: "12px 14px", borderRadius: "8px", cursor: "pointer",
                  border: `1px solid ${isSelected ? brandColor + "60" : "#1c1c2e"}`,
                  background: isSelected ? `${brandColor}10` : "#0e0e1a",
                  transition: "all 0.15s", display: "flex", alignItems: "center",
                  justifyContent: "space-between", gap: "12px"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                  <div style={{
                    width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0,
                    background: isActive ? "#47ffc8" : "#5a5a78"
                  }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{
                      fontWeight: "600", fontSize: "13px",
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
                    }}>
                      {acc.name}
                    </div>
                    <div style={{ fontFamily: "monospace", fontSize: "10px", color: "#5a5a78" }}>
                      {acc.id} {acc.currency && `· ${acc.currency}`}
                    </div>
                  </div>
                </div>
                {isSelected && (
                  <div style={{ color: brandColor, fontSize: "16px", flexShrink: 0 }}>✓</div>
                )}
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: "10px", background: "transparent",
              border: "1px solid #1c1c2e", borderRadius: "8px",
              color: "#5a5a78", fontSize: "13px", cursor: "pointer"
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleConnect}
            disabled={!selected || saving}
            style={{
              flex: 2, padding: "10px",
              background: selected && !saving ? "#e8ff47" : "#1c1c2e",
              border: "none", borderRadius: "8px",
              color: selected && !saving ? "#000" : "#5a5a78",
              fontSize: "13px", fontWeight: "700",
              cursor: selected && !saving ? "pointer" : "not-allowed",
              transition: "all 0.15s"
            }}
          >
            {saving ? "Guardando..." : selected ? `Conectar "${selected.name}"` : "Seleccioná una cuenta"}
          </button>
        </div>

      </div>
    </div>
  )
}
