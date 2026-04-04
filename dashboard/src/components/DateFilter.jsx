import { useState, useRef, useEffect } from "react"

const PRESETS = [
  { label: "Hoy",          value: "today" },
  { label: "Ayer",         value: "yesterday" },
  { label: "Últimos 7d",   value: "last_7d" },
  { label: "Últimos 14d",  value: "last_14d" },
  { label: "Últimos 30d",  value: "last_30d" },
  { label: "Este mes",     value: "this_month" },
  { label: "Mes pasado",   value: "last_month" },
  { label: "Este año",     value: "this_year" },
]

/** Returns { label, startDate, endDate } for the active selection */
export function getDateRange(preset, customStart, customEnd) {
  const now = new Date()
  // Argentina es UTC-3 (sin DST)
  const toART = d => new Date(d.getTime() - 3 * 60 * 60 * 1000)
  const fmt = d => toART(d).toISOString().slice(0, 10)

  switch (preset) {
    case "today":
      return { start: fmt(now), end: fmt(now) }
    case "yesterday": {
      const y = new Date(now.getTime() - 86400_000)
      return { start: fmt(y), end: fmt(y) }
    }
    case "last_7d":
      return { start: fmt(new Date(now.getTime() - 7 * 86400_000)), end: fmt(now) }
    case "last_14d":
      return { start: fmt(new Date(now.getTime() - 14 * 86400_000)), end: fmt(now) }
    case "last_30d":
      return { start: fmt(new Date(now.getTime() - 30 * 86400_000)), end: fmt(now) }
    case "this_month":
      return { start: fmt(new Date(now.getFullYear(), now.getMonth(), 1)), end: fmt(now) }
    case "last_month": {
      const first = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const last  = new Date(now.getFullYear(), now.getMonth(), 0)
      return { start: fmt(first), end: fmt(last) }
    }
    case "this_year":
      return { start: fmt(new Date(now.getFullYear(), 0, 1)), end: fmt(now) }
    case "custom":
      return { start: customStart || fmt(now), end: customEnd || fmt(now) }
    default:
      return { start: fmt(new Date(now.getFullYear(), now.getMonth(), 1)), end: fmt(now) }
  }
}

export default function DateFilter({ datePreset, customStart, customEnd, onChange }) {
  const [showDropdown, setShowDropdown] = useState(false)
  const [tempStart, setTempStart] = useState(customStart || "")
  const [tempEnd, setTempEnd]     = useState(customEnd || "")
  const ref = useRef(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setShowDropdown(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const activeLabel = datePreset === "custom"
    ? `${customStart || "?"} → ${customEnd || "?"}`
    : PRESETS.find(p => p.value === datePreset)?.label || "Este mes"

  const { start, end } = getDateRange(datePreset, customStart, customEnd)

  const handlePreset = (value) => {
    onChange({ preset: value })
    setShowDropdown(false)
  }

  const handleCustomApply = () => {
    if (tempStart && tempEnd) {
      onChange({ preset: "custom", customStart: tempStart, customEnd: tempEnd })
      setShowDropdown(false)
    }
  }

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: "6px" }}>

      {/* Main button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        style={{
          display: "flex", alignItems: "center", gap: "8px",
          padding: "7px 14px", background: "#13131f",
          border: "1px solid #1c1c2e", borderRadius: "8px",
          color: "#e8ff47", fontSize: "12px", fontWeight: "700",
          fontFamily: "monospace", cursor: "pointer", transition: "all 0.15s",
          whiteSpace: "nowrap",
        }}
      >
        <span style={{ fontSize: "14px" }}>📅</span>
        {activeLabel}
        <span style={{ fontSize: "10px", color: "#5a5a78", marginLeft: "2px" }}>
          {datePreset !== "custom" && `${start} → ${end}`}
        </span>
        <span style={{ fontSize: "8px", color: "#5a5a78" }}>{showDropdown ? "▲" : "▼"}</span>
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", right: 0,
          background: "#13131f", border: "1px solid #1c1c2e",
          borderRadius: "10px", padding: "8px",
          boxShadow: "0 16px 40px rgba(0,0,0,0.6)",
          zIndex: 100, minWidth: "280px",
        }}>

          {/* Presets */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px", marginBottom: "10px" }}>
            {PRESETS.map(p => (
              <button
                key={p.value}
                onClick={() => handlePreset(p.value)}
                style={{
                  padding: "8px 10px",
                  background: datePreset === p.value ? "rgba(232,255,71,0.12)" : "transparent",
                  border: datePreset === p.value ? "1px solid rgba(232,255,71,0.3)" : "1px solid transparent",
                  borderRadius: "6px", fontSize: "11px", fontWeight: "600",
                  color: datePreset === p.value ? "#e8ff47" : "#8888aa",
                  cursor: "pointer", textAlign: "left", transition: "all 0.1s",
                  fontFamily: "monospace",
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div style={{ height: "1px", background: "#1c1c2e", margin: "6px 0 10px" }} />

          {/* Custom range */}
          <div style={{ fontSize: "10px", fontFamily: "monospace", color: "#5a5a78", marginBottom: "6px", fontWeight: "700" }}>
            RANGO PERSONALIZADO
          </div>
          <div style={{ display: "flex", gap: "6px", alignItems: "center", marginBottom: "8px" }}>
            <input
              type="date"
              value={tempStart}
              onChange={e => setTempStart(e.target.value)}
              style={{
                flex: 1, padding: "7px 8px", background: "#080810",
                border: "1px solid #1c1c2e", borderRadius: "6px",
                color: "#f0f0f8", fontSize: "11px", fontFamily: "monospace",
              }}
            />
            <span style={{ color: "#5a5a78", fontSize: "11px" }}>→</span>
            <input
              type="date"
              value={tempEnd}
              onChange={e => setTempEnd(e.target.value)}
              style={{
                flex: 1, padding: "7px 8px", background: "#080810",
                border: "1px solid #1c1c2e", borderRadius: "6px",
                color: "#f0f0f8", fontSize: "11px", fontFamily: "monospace",
              }}
            />
          </div>
          <button
            onClick={handleCustomApply}
            disabled={!tempStart || !tempEnd}
            style={{
              width: "100%", padding: "8px",
              background: tempStart && tempEnd ? "#e8ff47" : "#1c1c2e",
              color: tempStart && tempEnd ? "#000" : "#5a5a78",
              border: "none", borderRadius: "6px",
              fontSize: "11px", fontWeight: "800", cursor: tempStart && tempEnd ? "pointer" : "not-allowed",
            }}
          >
            Aplicar rango
          </button>
        </div>
      )}
    </div>
  )
}
