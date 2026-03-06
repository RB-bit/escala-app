import { useState, useEffect, useRef } from "react"

// ─── CONFIG ────────────────────────────────────────────────────────────────────
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
console.log('CLIENT_ID:', GOOGLE_CLIENT_ID ? '[DEFINED ✓]' : '[UNDEFINED ✗ — check .env.local]')
const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive"
const DISCOVERY_DOC = "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"
const META_TOKEN = import.meta.env.VITE_META_ACCESS_TOKEN
const META_GRAPH = "https://graph.facebook.com/v21.0"

// ─── STEPS ─────────────────────────────────────────────────────────────────────
const STEPS = [
  { id: "research", icon: "🔍", label: "Research" },
  { id: "roadmap", icon: "🗺️", label: "Creative Roadmap" },
  { id: "assets", icon: "📁", label: "Assets & Drive" },
  { id: "launch", icon: "🚀", label: "Lanzamiento" },
]

// ─── MOCK CAMPAIGN DATA FOR LAUNCH STEP ────────────────────────────────────────
const MOCK_CAMPAIGNS = [
  { id: "c1", name: "CBO - NAVIDAD 3/12/25", status: "active" },
  { id: "c2", name: "CBO - HOT SALE Mayo", status: "paused" },
  { id: "c3", name: "Retargeting — Carrito Abandonado", status: "active" },
]

// ─── HELPER ────────────────────────────────────────────────────────────────────
const fmt = (bytes) => {
  if (!bytes) return "—"
  if (bytes < 1024) return bytes + " B"
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
  return (bytes / 1048576).toFixed(1) + " MB"
}

const isMedia = (f) =>
  f.mimeType?.startsWith("image/") ||
  f.mimeType?.startsWith("video/") ||
  f.mimeType === "application/vnd.google-apps.folder"

const isFolder = (f) => f.mimeType === "application/vnd.google-apps.folder"

// ─── STYLES ────────────────────────────────────────────────────────────────────
const s = {
  card: { background: "#0e0e1a", border: "1px solid #1c1c2e", borderRadius: "8px", padding: "20px" },
  label: { fontFamily: "monospace", fontSize: "10px", letterSpacing: "0.12em", color: "#5a5a78", marginBottom: "8px" },
  tag: (color, active) => ({
    fontFamily: "monospace", fontSize: "10px", padding: "3px 8px", borderRadius: "3px",
    background: active ? `${color}20` : "rgba(90,90,120,0.15)",
    color: active ? color : "#5a5a78",
    border: `1px solid ${active ? color + "40" : "transparent"}`,
  }),
  btn: (color = "#e8ff47", variant = "primary") => ({
    display: "flex", alignItems: "center", gap: "6px",
    padding: "8px 16px", borderRadius: "6px", cursor: "pointer",
    fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "13px", fontWeight: "700",
    border: variant === "primary" ? "none" : `1px solid ${color}40`,
    background: variant === "primary" ? color : "transparent",
    color: variant === "primary" ? "#000" : color,
    transition: "all 0.15s",
    opacity: 1,
  }),
  input: {
    width: "100%", background: "#13131f", border: "1px solid #252538", borderRadius: "6px",
    padding: "10px 14px", color: "#f0f0f8", fontFamily: "'Bricolage Grotesque', sans-serif",
    fontSize: "13px", outline: "none",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { fontFamily: "monospace", fontSize: "10px", letterSpacing: "0.1em", color: "#5a5a78", textAlign: "left", padding: "8px 12px", borderBottom: "1px solid #1c1c2e" },
  td: { padding: "11px 12px", fontSize: "13px", borderBottom: "1px solid #1c1c2e" },
}

// ══════════════════════════════════════════════════════════════════════════════
// STEP 1 — RESEARCH
// ══════════════════════════════════════════════════════════════════════════════
function ResearchStep({ brand }) {
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState(null)
  const [error, setError] = useState(null)

  const campaigns = brand?.campaigns ?? []
  const activeCampaigns = campaigns.filter(c => c.status === "active")
  const avgRoas = activeCampaigns.length
    ? (activeCampaigns.reduce((a, c) => a + c.roas, 0) / activeCampaigns.length).toFixed(1)
    : 0
  const fatiguing = campaigns.filter(c => c.roas < 2.5 && c.status === "active")

  const runAnalysis = async () => {
    setLoading(true)
    setError(null)
    const prompt = `Analizá estas campañas de Meta Ads para la marca "${brand?.name}" y generá un reporte de inteligencia creativa en español.

Campañas activas:
${campaigns.map(c => `- ${c.name}: ROAS ${c.roas}x, estado ${c.status}, gastado ${c.spent} de ${c.budget}, impresiones ${c.impressions}`).join("\n")}

Respondé SOLO con un JSON válido con esta estructura exacta (sin markdown, sin backticks):
{
  "resumen": "2-3 oraciones sobre el estado general de la cuenta",
  "ganadores": [{"nombre": "...", "motivo": "..."}],
  "fatigando": [{"nombre": "...", "señal": "..."}],
  "conceptos": [
    {"titulo": "...", "angulo": "...", "formato": "imagen|video|carrusel|reel", "prioridad": "alta|media"}
  ],
  "accion_inmediata": "una acción concreta a tomar hoy"
}`

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }]
        })
      })
      const data = await res.json()
      const text = data.content?.[0]?.text || ""
      const clean = text.replace(/```json|```/g, "").trim()
      setReport(JSON.parse(clean))
    } catch (e) {
      setError("Error al generar el análisis. Intentá de nuevo.")
    }
    setLoading(false)
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Header */}
      <div style={{ ...s.card }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <div style={{ fontWeight: "800", fontSize: "15px", marginBottom: "4px" }}>📊 Análisis de cuenta publicitaria</div>
            <div style={{ fontFamily: "monospace", fontSize: "11px", color: "#5a5a78" }}>
              {campaigns.length} campañas · ROAS promedio {avgRoas}x
            </div>
          </div>
          <button onClick={runAnalysis} disabled={loading} style={s.btn()}>
            {loading ? "⟳ Analizando…" : "⚡ Generar análisis"}
          </button>
        </div>

        {/* Quick stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "10px" }}>
          {[
            { label: "CAMPAÑAS ACTIVAS", value: String(activeCampaigns.length), color: "#47ffc8" },
            { label: "ROAS PROMEDIO", value: avgRoas + "x", color: "#e8ff47" },
            { label: "FATIGANDO", value: String(fatiguing.length), color: fatiguing.length > 0 ? "#ff6b47" : "#47ffc8" },
          ].map((stat, i) => (
            <div key={i} style={{ background: "#13131f", borderRadius: "6px", padding: "12px 14px", borderTop: `2px solid ${stat.color}` }}>
              <div style={s.label}>{stat.label}</div>
              <div style={{ fontFamily: "monospace", fontSize: "20px", fontWeight: "800", color: stat.color }}>{stat.value}</div>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div style={{ padding: "12px 16px", background: "rgba(255,107,71,0.08)", border: "1px solid rgba(255,107,71,0.3)", borderRadius: "6px", fontFamily: "monospace", fontSize: "12px", color: "#ff6b47" }}>
          ⚠ {error}
        </div>
      )}

      {/* Report */}
      {report && (
        <>
          {/* Resumen */}
          <div style={s.card}>
            <div style={s.label}>RESUMEN EJECUTIVO</div>
            <div style={{ fontSize: "14px", lineHeight: "1.6", color: "#c8c8e8" }}>{report.resumen}</div>
            {report.accion_inmediata && (
              <div style={{ marginTop: "12px", padding: "10px 14px", background: "rgba(232,255,71,0.06)", border: "1px solid rgba(232,255,71,0.2)", borderRadius: "6px" }}>
                <span style={{ fontFamily: "monospace", fontSize: "10px", color: "#e8ff47", marginRight: "8px" }}>ACCIÓN HOY →</span>
                <span style={{ fontSize: "13px" }}>{report.accion_inmediata}</span>
              </div>
            )}
          </div>

          {/* Ganadores y fatigando */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div style={s.card}>
              <div style={s.label}>🏆 GANADORES</div>
              {report.ganadores?.map((g, i) => (
                <div key={i} style={{ padding: "8px 0", borderBottom: "1px solid #1c1c2e" }}>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: "#47ffc8", marginBottom: "2px" }}>{g.nombre}</div>
                  <div style={{ fontFamily: "monospace", fontSize: "11px", color: "#5a5a78" }}>{g.motivo}</div>
                </div>
              ))}
            </div>
            <div style={s.card}>
              <div style={s.label}>⚠ FATIGANDO</div>
              {report.fatigando?.length > 0 ? report.fatigando.map((f, i) => (
                <div key={i} style={{ padding: "8px 0", borderBottom: "1px solid #1c1c2e" }}>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: "#ff6b47", marginBottom: "2px" }}>{f.nombre}</div>
                  <div style={{ fontFamily: "monospace", fontSize: "11px", color: "#5a5a78" }}>{f.señal}</div>
                </div>
              )) : (
                <div style={{ fontFamily: "monospace", fontSize: "12px", color: "#47ffc8", paddingTop: "8px" }}>✓ Sin campañas fatigando</div>
              )}
            </div>
          </div>

          {/* Conceptos */}
          <div style={s.card}>
            <div style={s.label}>💡 CONCEPTOS A TESTEAR ESTA SEMANA</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "4px" }}>
              {report.conceptos?.map((c, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "12px", background: "#13131f", borderRadius: "6px", border: "1px solid #1c1c2e" }}>
                  <div style={{ fontFamily: "monospace", fontSize: "11px", padding: "3px 8px", borderRadius: "3px", background: "rgba(232,255,71,0.1)", color: "#e8ff47", flexShrink: 0 }}>#{i + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: "700", fontSize: "13px", marginBottom: "4px" }}>{c.titulo}</div>
                    <div style={{ fontFamily: "monospace", fontSize: "11px", color: "#5a5a78", marginBottom: "8px" }}>{c.angulo}</div>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <span style={s.tag("#c47bff", true)}>{c.formato}</span>
                      <span style={s.tag(c.prioridad === "alta" ? "#ff6b47" : "#e8ff47", true)}>{c.prioridad}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {!report && !loading && (
        <div style={{ ...s.card, textAlign: "center", padding: "40px" }}>
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>🔍</div>
          <div style={{ fontWeight: "700", marginBottom: "6px" }}>Sin análisis generado</div>
          <div style={{ fontFamily: "monospace", fontSize: "11px", color: "#5a5a78" }}>
            Hacé click en "Generar análisis" para que Claude analice tus campañas y sugiera los próximos conceptos a testear.
          </div>
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// STEP 2 — CREATIVE ROADMAP
// ══════════════════════════════════════════════════════════════════════════════
function RoadmapStep({ brand }) {
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ titulo: "", angulo: "", formato: "imagen", prioridad: "media", estado: "pendiente", hipotesis: "" })
  const [adding, setAdding] = useState(false)

  const estados = { pendiente: "#5a5a78", en_progreso: "#e8ff47", lanzado: "#47ffc8", pausado: "#ff6b47" }
  const formatos = ["imagen", "video", "reel", "carrusel"]
  const prioridades = ["alta", "media", "baja"]

  const add = () => {
    if (!form.titulo.trim()) return
    setItems(prev => [...prev, { ...form, id: Date.now(), fecha: new Date().toLocaleDateString("es-AR") }])
    setForm({ titulo: "", angulo: "", formato: "imagen", prioridad: "media", estado: "pendiente", hipotesis: "" })
    setAdding(false)
  }

  const toggleEstado = (id) => {
    const cycle = { pendiente: "en_progreso", en_progreso: "lanzado", lanzado: "pausado", pausado: "pendiente" }
    setItems(prev => prev.map(i => i.id === id ? { ...i, estado: cycle[i.estado] } : i))
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ ...s.card, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontWeight: "800", fontSize: "15px", marginBottom: "4px" }}>🗺️ Creative Roadmap</div>
          <div style={{ fontFamily: "monospace", fontSize: "11px", color: "#5a5a78" }}>
            {items.length} hipótesis documentadas · {items.filter(i => i.estado === "lanzado").length} lanzadas
          </div>
        </div>
        <button onClick={() => setAdding(true)} style={s.btn()}>+ Nueva hipótesis</button>
      </div>

      {/* Form */}
      {adding && (
        <div style={s.card}>
          <div style={s.label}>NUEVA HIPÓTESIS CREATIVA</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "8px" }}>
            <input value={form.titulo} onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))}
              placeholder="Título del concepto" style={s.input} />
            <input value={form.angulo} onChange={e => setForm(p => ({ ...p, angulo: e.target.value }))}
              placeholder="Ángulo creativo (ej: problema-solución, aspiracional, social proof)" style={s.input} />
            <textarea value={form.hipotesis} onChange={e => setForm(p => ({ ...p, hipotesis: e.target.value }))}
              placeholder="Hipótesis: ¿Por qué creés que este concepto va a funcionar?"
              style={{ ...s.input, minHeight: "80px", resize: "vertical" }} />
            <div style={{ display: "flex", gap: "10px" }}>
              <div style={{ flex: 1 }}>
                <div style={s.label}>FORMATO</div>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {formatos.map(f => (
                    <button key={f} onClick={() => setForm(p => ({ ...p, formato: f }))}
                      style={{ ...s.tag("#c47bff", form.formato === f), padding: "5px 10px", cursor: "pointer", border: `1px solid ${form.formato === f ? "#c47bff40" : "#1c1c2e"}` }}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={s.label}>PRIORIDAD</div>
                <div style={{ display: "flex", gap: "6px" }}>
                  {prioridades.map(p => (
                    <button key={p} onClick={() => setForm(prev => ({ ...prev, prioridad: p }))}
                      style={{ ...s.tag(p === "alta" ? "#ff6b47" : p === "media" ? "#e8ff47" : "#5a5a78", form.prioridad === p), padding: "5px 10px", cursor: "pointer", border: `1px solid ${form.prioridad === p ? "#ffffff20" : "#1c1c2e"}` }}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
              <button onClick={() => setAdding(false)} style={s.btn("#5a5a78", "outline")}>Cancelar</button>
              <button onClick={add} style={s.btn()}>Guardar hipótesis</button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      {items.length > 0 ? (
        <div style={s.card}>
          <table style={s.table}>
            <thead>
              <tr>{["CONCEPTO", "FORMATO", "PRIORIDAD", "ESTADO", "FECHA"].map(h => (
                <th key={h} style={s.th}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={item.id} style={{ background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}>
                  <td style={s.td}>
                    <div style={{ fontWeight: "600" }}>{item.titulo}</div>
                    {item.angulo && <div style={{ fontFamily: "monospace", fontSize: "10px", color: "#5a5a78", marginTop: "2px" }}>{item.angulo}</div>}
                  </td>
                  <td style={s.td}><span style={s.tag("#c47bff", true)}>{item.formato}</span></td>
                  <td style={s.td}><span style={s.tag(item.prioridad === "alta" ? "#ff6b47" : item.prioridad === "media" ? "#e8ff47" : "#5a5a78", true)}>{item.prioridad}</span></td>
                  <td style={s.td}>
                    <button onClick={() => toggleEstado(item.id)}
                      style={{ ...s.tag(estados[item.estado], true), cursor: "pointer", padding: "4px 10px" }}>
                      {item.estado.replace("_", " ")}
                    </button>
                  </td>
                  <td style={{ ...s.td, fontFamily: "monospace", fontSize: "11px", color: "#5a5a78" }}>{item.fecha}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : !adding && (
        <div style={{ ...s.card, textAlign: "center", padding: "40px" }}>
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>🗺️</div>
          <div style={{ fontWeight: "700", marginBottom: "6px" }}>Sin hipótesis documentadas</div>
          <div style={{ fontFamily: "monospace", fontSize: "11px", color: "#5a5a78" }}>
            Usá el análisis del paso anterior para generar tus primeras hipótesis creativas.
          </div>
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// STEP 3 — ASSETS & DRIVE
// ══════════════════════════════════════════════════════════════════════════════
function AssetsStep({ brand, onSelectFiles, signedIn, setSignedIn, scriptsReady, tokenClientRef }) {
  const [files, setFiles] = useState([])
  const [sharedFolders, setSharedFolders] = useState([])
  const [sharedDrives, setSharedDrives] = useState([])
  const [globalResults, setGlobalResults] = useState([])
  const [searchingGlobal, setSearchingGlobal] = useState(false)
  const [folderStack, setFolderStack] = useState([{ id: "root", name: "Mi Drive" }])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState([])
  const [error, setError] = useState(null)
  const [search, setSearch] = useState("")
  const [pathInput, setPathInput] = useState("")
  const [showPathInput, setShowPathInput] = useState(false)
  const [source, setSource] = useState("drive")
  const [metaAssets, setMetaAssets] = useState([])
  const [metaLoading, setMetaLoading] = useState(false)
  const [metaError, setMetaError] = useState(null)
  const [metaFilter, setMetaFilter] = useState("all")
  const [metaSearch, setMetaSearch] = useState("")
  const [metaDateFilter, setMetaDateFilter] = useState("all")
  const [metaImageCursor, setMetaImageCursor] = useState(null)
  const [metaVideoCursor, setMetaVideoCursor] = useState(null)
  const [metaHasMore, setMetaHasMore] = useState(false)

  const signIn = () => {
    if (!scriptsReady || !tokenClientRef.current) {
      setError("Los scripts de Google aún no cargaron. Esperá un momento e intentá de nuevo.")
      return
    }
    // Update callback in case it wasn't bound to setSignedIn yet
    tokenClientRef.current.callback = (resp) => {
      if (resp.error) { setError("Error de autenticación: " + resp.error); return }
      setSignedIn(true)
    }
    tokenClientRef.current.requestAccessToken()
  }

  useEffect(() => {
    if (signedIn && folderStack.length === 1 && files.length === 0 && !loading) {
      listFiles(folderStack[0].id)
    }
  }, [signedIn])

  const listFiles = async (folderId) => {
    setLoading(true)
    setError(null)
    setSearch("")
    setGlobalResults([])
    try {
      if (folderId === "shared") {
        const res = await window.gapi.client.drive.files.list({
          q: `sharedWithMe=true and trashed=false and mimeType='application/vnd.google-apps.folder'`,
          fields: "files(id,name,mimeType,size,thumbnailLink,modifiedTime)",
          orderBy: "folder,name",
          pageSize: 50,
          includeItemsFromAllDrives: true,
          supportsAllDrives: true,
          corpora: "allDrives"
        })
        setFiles(res.result.files)
        setSharedFolders([])
      } else {
        const res = await window.gapi.client.drive.files.list({
          q: `'${folderId}' in parents and trashed=false`,
          fields: "files(id,name,mimeType,size,thumbnailLink,modifiedTime)",
          orderBy: "folder,name",
          pageSize: 50,
          includeItemsFromAllDrives: true,
          supportsAllDrives: true,
          corpora: "allDrives"
        })
        setFiles(res.result.files.filter(isMedia))

        if (folderId === "root") {
          const resShared = await window.gapi.client.drive.files.list({
            q: `sharedWithMe=true and trashed=false and mimeType='application/vnd.google-apps.folder'`,
            fields: "files(id,name,mimeType,size,thumbnailLink,modifiedTime)",
            orderBy: "folder,name",
            pageSize: 50,
            includeItemsFromAllDrives: true,
            supportsAllDrives: true,
            corpora: "allDrives"
          })
          setSharedFolders(resShared.result.files)

          const resDrives = await window.gapi.client.drive.drives.list({
            pageSize: 20,
            fields: "drives(id,name)"
          })
          setSharedDrives(resDrives.result.drives)
        } else {
          setSharedFolders([])
          setSharedDrives([])
        }
      }
    } catch (e) {
      setError("Error al listar archivos: " + (e.result?.error?.message || e.message))
    }
    setLoading(false)
  }

  const searchGlobal = async (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    setSearchingGlobal(true);
    setGlobalResults([]);
    setError(null);
    try {
      const cleanSearch = search.replace(/'/g, "\\'");
      const res = await window.gapi.client.drive.files.list({
        q: `name contains '${cleanSearch}' and trashed=false`,
        fields: "files(id,name,mimeType,size,thumbnailLink,modifiedTime,parents)",
        orderBy: "folder,name",
        pageSize: 50,
        includeItemsFromAllDrives: true,
        supportsAllDrives: true
      });
      setGlobalResults(res.result.files.filter(isMedia));
    } catch (e) {
      setError("Error en búsqueda global: " + (e.result?.error?.message || e.message));
    }
    setSearchingGlobal(false);
  }

  const openFolder = (folder) => {
    setFolderStack(prev => [...prev, { id: folder.id, name: folder.name }])
    setFiles([])
    listFiles(folder.id)
  }

  const goBack = () => {
    if (folderStack.length <= 1) return
    const newStack = folderStack.slice(0, -1)
    setFolderStack(newStack)
    listFiles(newStack[newStack.length - 1].id)
  }

  const navigateToShared = () => {
    setFolderStack([{ id: "root", name: "Mi Drive" }, { id: "shared", name: "Compartido conmigo" }])
    setFiles([])
    setSharedFolders([])
    setSharedDrives([])
    setGlobalResults([])
    setPathInput("")
    setShowPathInput(false)
    listFiles("shared")
  }

  const navigateToId = (rawInput) => {
    const trimmed = rawInput.trim()
    if (!trimmed) return
    // Extract folder ID from a Drive URL like .../folders/FOLDER_ID or just raw ID
    const match = trimmed.match(/folders\/([a-zA-Z0-9_-]+)/)
    const folderId = match ? match[1] : trimmed
    const folderName = `ID: ${folderId.slice(0, 12)}…`
    setFolderStack([{ id: "root", name: "Mi Drive" }, { id: folderId, name: folderName }])
    setFiles([])
    setPathInput("")
    setShowPathInput(false)
    listFiles(folderId)
  }

  const toggleSelect = (file) => {
    if (isFolder(file)) return
    setSelected(prev => {
      const exists = prev.find(f => f.id === file.id)
      const next = exists ? prev.filter(f => f.id !== file.id) : [...prev, file]
      onSelectFiles?.(next)
      return next
    })
  }

  const fetchMetaAssets = async ({ append = false, imgCursor = null, vidCursor = null } = {}) => {
    const accountId = brand?.metaAccounts?.[0]
    if (!accountId) { setMetaError("Esta marca no tiene cuenta Meta configurada."); return }
    if (!META_TOKEN) { setMetaError("VITE_META_ACCESS_TOKEN no configurado en .env.local"); return }
    setMetaLoading(true)
    setMetaError(null)
    try {
      const imgParams = new URLSearchParams({
        fields: "name,url,width,height,updated_time,hash",
        limit: "50",
        access_token: META_TOKEN,
        ...(imgCursor ? { after: imgCursor } : {}),
      })
      const vidParams = new URLSearchParams({
        fields: "title,picture,source,length,updated_time",
        limit: "50",
        access_token: META_TOKEN,
        ...(vidCursor ? { after: vidCursor } : {}),
      })
      const [imgRes, vidRes] = await Promise.all([
        fetch(`${META_GRAPH}/${accountId}/adimages?${imgParams}`).then(r => r.json()),
        fetch(`${META_GRAPH}/${accountId}/advideos?${vidParams}`).then(r => r.json()),
      ])
      if (imgRes.error) throw new Error(imgRes.error.message)
      if (vidRes.error) throw new Error(vidRes.error.message)
      const images = (imgRes.data || []).map(img => ({
        id: img.hash, name: img.name, thumbnailLink: img.url,
        mimeType: "image/jpeg", source: "Cuenta",
        width: img.width, height: img.height, updatedTime: img.updated_time,
      }))
      const videos = (vidRes.data || []).map(vid => ({
        id: vid.id, name: vid.title || `Video ${vid.id}`, thumbnailLink: vid.picture,
        mimeType: "video/mp4", source: "Cuenta",
        videoUrl: vid.source,
        durationSecs: vid.length, updatedTime: vid.updated_time,
      }))
      const combined = [...images, ...videos].sort((a, b) => new Date(b.updatedTime) - new Date(a.updatedTime))
      setMetaAssets(prev => append ? [...prev, ...combined] : combined)
      setMetaImageCursor(imgRes.paging?.cursors?.after || null)
      setMetaVideoCursor(vidRes.paging?.cursors?.after || null)
      setMetaHasMore(!!(imgRes.paging?.next || vidRes.paging?.next))
    } catch (e) {
      setMetaError("Error al cargar biblioteca Meta: " + e.message)
    }
    setMetaLoading(false)
  }

  const filteredMetaAssets = metaAssets.filter(a => {
    const typeOk = metaFilter === "all"
      || (metaFilter === "image" && a.mimeType.startsWith("image/"))
      || (metaFilter === "video" && a.mimeType.startsWith("video/"))
    const nameOk = !metaSearch.trim() || a.name.toLowerCase().includes(metaSearch.toLowerCase())
    const dateOk = metaDateFilter === "all" || (() => {
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() - parseInt(metaDateFilter))
      return new Date(a.updatedTime) >= cutoff
    })()
    return typeOk && nameOk && dateOk
  })

  const currentFolder = folderStack[folderStack.length - 1]
  const filteredFiles = search.trim()
    ? files.filter(f => f.name.toLowerCase().includes(search.toLowerCase()))
    : files
  const filteredShared = search.trim()
    ? sharedFolders.filter(f => f.name.toLowerCase().includes(search.toLowerCase()))
    : sharedFolders
  const filteredSharedDrives = search.trim()
    ? sharedDrives.filter(d => d.name.toLowerCase().includes(search.toLowerCase()))
    : sharedDrives

  const renderFile = (file) => {
    const sel = selected.find(f => f.id === file.id)
    const folder = isFolder(file)
    return (
      <div
        key={file.id}
        onClick={() => folder ? openFolder(file) : toggleSelect(file)}
        style={{
          background: sel ? "rgba(232,255,71,0.08)" : "#13131f",
          border: sel ? "1px solid rgba(232,255,71,0.4)" : "1px solid #1c1c2e",
          borderRadius: "6px", padding: "10px", cursor: "pointer",
          transition: "all 0.15s", position: "relative",
        }}
      >
        {sel && (
          <div style={{ position: "absolute", top: "6px", right: "6px", width: "18px", height: "18px", borderRadius: "50%", background: "#e8ff47", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "800", color: "#000" }}>✓</div>
        )}
        <div style={{ height: "80px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "8px", borderRadius: "4px", overflow: "hidden", background: "#080810" }}>
          {file.thumbnailLink ? (
            <img src={file.thumbnailLink} alt={file.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <span style={{ fontSize: "28px" }}>{folder ? "📂" : file.mimeType?.startsWith("video/") ? "🎬" : "🖼️"}</span>
          )}
        </div>
        <div style={{ fontFamily: "monospace", fontSize: "10px", color: folder ? "#e8ff47" : "#f0f0f8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {file.name}
        </div>
        {!folder && file.size && (
          <div style={{ fontFamily: "monospace", fontSize: "9px", color: "#5a5a78", marginTop: "2px" }}>{fmt(parseInt(file.size))}</div>
        )}
      </div>
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

      {/* ── Source tab switcher ── */}
      <div style={{ display: "flex", gap: "4px", background: "#0e0e1a", border: "1px solid #1c1c2e", borderRadius: "8px", padding: "4px" }}>
        {[
          { id: "drive", icon: "📁", label: "Google Drive" },
          { id: "meta", icon: "🖼️", label: `Biblioteca Meta · ${brand?.name || ""}` },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setSource(tab.id)
              if (tab.id === "meta" && metaAssets.length === 0 && !metaLoading) fetchMetaAssets()
            }}
            style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              padding: "10px 8px", borderRadius: "6px", cursor: "pointer",
              background: source === tab.id ? "rgba(232,255,71,0.1)" : "transparent",
              border: source === tab.id ? "1px solid rgba(232,255,71,0.25)" : "1px solid transparent",
              color: source === tab.id ? "#e8ff47" : "#5a5a78",
              fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "13px", fontWeight: source === tab.id ? "700" : "500",
              transition: "all 0.15s",
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── Unified selection bar ── */}
      {selected.length > 0 && (
        <div style={{ padding: "10px 14px", background: "rgba(232,255,71,0.08)", border: "1px solid rgba(232,255,71,0.2)", borderRadius: "6px", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <span style={{ fontFamily: "monospace", fontSize: "12px", color: "#e8ff47" }}>
            {selected.length} archivo{selected.length > 1 ? "s" : ""} seleccionado{selected.length > 1 ? "s" : ""}
            {selected.some(f => f.source !== "meta") && selected.some(f => f.source === "meta") && (
              <span style={{ color: "#5a5a78" }}>{" "}· {selected.filter(f => f.source !== "meta").length} Drive · {selected.filter(f => f.source === "meta").length} Meta</span>
            )}
          </span>
          <button onClick={() => { setSelected([]); onSelectFiles?.([]) }} style={{ fontFamily: "monospace", fontSize: "11px", color: "#5a5a78", background: "none", border: "none", cursor: "pointer" }}>
            Limpiar selección
          </button>
        </div>
      )}

      {/* ── Drive: auth gate ── */}
      {source === "drive" && !signedIn && (
        <div style={{ ...s.card, textAlign: "center", padding: "48px 24px" }}>
          <div style={{ fontSize: "40px", marginBottom: "16px" }}>📁</div>
          <div style={{ fontWeight: "800", fontSize: "18px", marginBottom: "8px" }}>Conectá tu Google Drive</div>
          <div style={{ fontFamily: "monospace", fontSize: "12px", color: "#5a5a78", marginBottom: "24px", maxWidth: "360px", margin: "0 auto 24px" }}>
            Autorizá el acceso para explorar tus carpetas y seleccionar los assets que querés subir a Meta Ads.
          </div>
          {error && <div style={{ marginBottom: "16px", fontFamily: "monospace", fontSize: "12px", color: "#ff6b47" }}>⚠ {error}</div>}
          <button
            onClick={signIn}
            disabled={!scriptsReady}
            style={{ ...s.btn(), margin: "0 auto", padding: "12px 28px", fontSize: "14px", opacity: scriptsReady ? 1 : 0.5, cursor: scriptsReady ? "pointer" : "wait" }}
          >
            {scriptsReady ? "Conectar Google Drive" : "⟳ Cargando Google..."}
          </button>
        </div>
      )}

      {/* ── Drive: browser ── */}
      {source === "drive" && signedIn && (
        <div style={s.card}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "14px" }}>📂</span>
            {folderStack.map((f, i) => (
              <span key={f.id} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                {i > 0 && <span style={{ color: "#3a3a55", fontSize: "12px" }}>/</span>}
                <span
                  onClick={() => {
                    if (i < folderStack.length - 1) {
                      const ns = folderStack.slice(0, i + 1)
                      setFolderStack(ns)
                      listFiles(f.id)
                    }
                  }}
                  style={{
                    fontFamily: "monospace", fontSize: "12px",
                    color: i === folderStack.length - 1 ? "#f0f0f8" : "#5a5a78",
                    cursor: i < folderStack.length - 1 ? "pointer" : "default",
                    padding: "2px 6px", borderRadius: "4px",
                    background: i === folderStack.length - 1 ? "rgba(255,255,255,0.05)" : "transparent",
                    textDecoration: i < folderStack.length - 1 ? "underline" : "none",
                  }}
                >{f.name}</span>
              </span>
            ))}
            <div style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
              {folderStack.length > 1 && (
                <button onClick={goBack} style={s.btn("#5a5a78", "outline")}>← Volver</button>
              )}
              <button onClick={() => listFiles(currentFolder.id)} style={s.btn("#5a5a78", "outline")}>↻</button>
              <button onClick={navigateToShared} style={s.btn("#c47bff", "outline")}>👥 Compartido conmigo</button>
              <button onClick={() => setShowPathInput(p => !p)} style={s.btn("#5a5a78", "outline")} title="Ir a carpeta por URL o ID">🔗 Ir a carpeta</button>
            </div>
          </div>

          {/* ── Direct path input ── */}
          {showPathInput && (
            <div style={{ marginBottom: "12px", display: "flex", gap: "8px", alignItems: "center" }}>
              <input
                value={pathInput}
                onChange={e => setPathInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && navigateToId(pathInput)}
                placeholder="Pegá una URL de Drive o un Folder ID…"
                style={{ ...s.input, flex: 1, fontSize: "12px", padding: "8px 12px" }}
                autoFocus
              />
              <button onClick={() => navigateToId(pathInput)} style={s.btn()}>Ir</button>
              <button onClick={() => { setShowPathInput(false); setPathInput("") }} style={s.btn("#5a5a78", "outline")}>✕</button>
            </div>
          )}

          {/* ── Search bar ── */}
          <form onSubmit={searchGlobal} style={{ marginBottom: "12px", display: "flex", gap: "8px", alignItems: "center" }}>
            <div style={{ position: "relative", flex: 1 }}>
              <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "13px", pointerEvents: "none" }}>🔍</span>
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); if (!e.target.value) setGlobalResults([]); }}
                placeholder="Buscar archivos en esta carpeta (Enter para buscar en todo Drive)…"
                style={{ ...s.input, paddingLeft: "32px", fontSize: "12px", padding: "8px 12px 8px 32px" }}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => { setSearch(""); setGlobalResults([]); }}
                  style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#5a5a78", cursor: "pointer", fontSize: "13px" }}
                >✕</button>
              )}
            </div>
            <button type="submit" disabled={!search || searchingGlobal} style={{ ...s.btn(), padding: "8px 16px", opacity: (!search || searchingGlobal) ? 0.5 : 1 }}>
              {searchingGlobal ? "Buscando…" : "Buscar en Drive"}
            </button>
          </form>


          {error && <div style={{ marginBottom: "12px", fontFamily: "monospace", fontSize: "12px", color: "#ff6b47" }}>⚠ {error}</div>}

          {/* ── search result label ── */}
          {search && !loading && (
            <div style={{ marginBottom: "8px", fontFamily: "monospace", fontSize: "11px", color: "#5a5a78" }}>
              {filteredFiles.length + filteredShared.length + filteredSharedDrives.length} resultado{(filteredFiles.length + filteredShared.length + filteredSharedDrives.length) !== 1 ? "s" : ""} para "{search}"
            </div>
          )}

          {/* ── File grid ── */}
          {loading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "10px" }}>
              {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
                <div key={i} style={{ height: "120px", background: "#13131f", borderRadius: "6px", animation: "pulse 1.5s ease-in-out infinite" }} />
              ))}
            </div>
          ) : (
            <>
              {filteredFiles.length === 0 && filteredShared.length === 0 && filteredSharedDrives.length === 0 && (
                <div style={{ textAlign: "center", padding: "32px", fontFamily: "monospace", fontSize: "12px", color: "#5a5a78" }}>
                  {search ? `⚠ Sin resultados para "${search}"` : "📂 Carpeta vacía o sin archivos de imagen/video"}
                </div>
              )}
              {filteredFiles.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "10px" }}>
                  {filteredFiles.map(file => renderFile(file))}
                </div>
              )}
              {currentFolder.id === "root" && filteredShared.length > 0 && (
                <>
                  <div style={{ ...s.label, marginTop: "24px", marginBottom: "12px", color: "#c47bff" }}>👥 COMPARTIDO CONMIGO</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "10px" }}>
                    {filteredShared.map(file => renderFile(file))}
                  </div>
                </>
              )}

              {currentFolder.id === "root" && filteredSharedDrives.length > 0 && (
                <>
                  <div style={{ ...s.label, marginTop: "24px", marginBottom: "12px", color: "#47ffc8" }}>🏢 DRIVES COMPARTIDOS</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "10px" }}>
                    {filteredSharedDrives.map(drive => renderFile({ ...drive, mimeType: "application/vnd.google-apps.folder" }))}
                  </div>
                </>
              )}

              {globalResults.length > 0 && (
                <>
                  <div style={{ ...s.label, marginTop: "24px", marginBottom: "12px", color: "#47ffc8" }}>RESULTADOS EN TODO DRIVE</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "10px" }}>
                    {globalResults.map(file => {
                      const sel = selected.find(f => f.id === file.id);
                      const folder = isFolder(file);
                      return (
                        <div
                          key={file.id}
                          onClick={() => folder ? navigateToId(file.id) : toggleSelect(file)}
                          style={{
                            background: sel ? "rgba(232,255,71,0.08)" : "#13131f",
                            border: sel ? "1px solid rgba(232,255,71,0.4)" : "1px solid #1c1c2e",
                            borderRadius: "6px", padding: "10px", cursor: "pointer",
                            transition: "all 0.15s", position: "relative",
                            display: "flex", flexDirection: "column"
                          }}
                        >
                          {sel && (
                            <div style={{ position: "absolute", top: "6px", right: "6px", width: "18px", height: "18px", borderRadius: "50%", background: "#e8ff47", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "800", color: "#000" }}>✓</div>
                          )}
                          <div style={{ height: "80px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "8px", borderRadius: "4px", overflow: "hidden", background: "#080810" }}>
                            {file.thumbnailLink ? (
                              <img src={file.thumbnailLink} alt={file.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                              <span style={{ fontSize: "28px" }}>{folder ? "📂" : file.mimeType?.startsWith("video/") ? "🎬" : "🖼️"}</span>
                            )}
                          </div>
                          <div style={{ fontFamily: "monospace", fontSize: "10px", color: folder ? "#e8ff47" : "#f0f0f8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {file.name}
                          </div>
                          <div style={{ flex: 1 }} />
                          {!folder && file.size && (
                            <div style={{ fontFamily: "monospace", fontSize: "9px", color: "#5a5a78", marginTop: "2px", marginBottom: "6px" }}>{fmt(parseInt(file.size))}</div>
                          )}
                          {file.parents?.[0] && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigateToId(file.parents[0]);
                              }}
                              style={{ ...s.btn("#47ffc8", "outline"), width: "100%", padding: "4px 8px", fontSize: "10px", marginTop: folder ? "8px" : "0", justifyContent: "center" }}
                            >
                              Ir a carpeta padre
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* ══ META LIBRARY TAB ══ */}
      {source === "meta" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

          {/* Controls */}
          <div style={s.card}>
            <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "12px", flexWrap: "wrap" }}>
              <div style={{ display: "flex", gap: "4px" }}>
                {[["all", "Todos"], ["image", "Imágenes"], ["video", "Videos"]].map(([val, label]) => (
                  <button key={val} onClick={() => setMetaFilter(val)}
                    style={{ ...s.tag("#47c8ff", metaFilter === val), padding: "5px 12px", cursor: "pointer", border: `1px solid ${metaFilter === val ? "#47c8ff40" : "#1c1c2e"}` }}>
                    {label}
                  </button>
                ))}
              </div>
              <select value={metaDateFilter} onChange={e => setMetaDateFilter(e.target.value)}
                style={{ ...s.input, width: "auto", padding: "5px 10px", fontSize: "12px" }}>
                <option value="all">Todos los tiempos</option>
                <option value="30">Últimos 30 días</option>
                <option value="90">Últimos 90 días</option>
                <option value="180">Últimos 180 días</option>
              </select>
              <div style={{ marginLeft: "auto" }}>
                <button onClick={() => fetchMetaAssets()} disabled={metaLoading}
                  style={{ ...s.btn("#5a5a78", "outline"), opacity: metaLoading ? 0.5 : 1 }}>
                  {metaLoading ? "⟳ Cargando…" : "↻ Recargar"}
                </button>
              </div>
            </div>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "13px", pointerEvents: "none" }}>🔍</span>
              <input value={metaSearch} onChange={e => setMetaSearch(e.target.value)}
                placeholder="Buscar por nombre…"
                style={{ ...s.input, fontSize: "12px", padding: "8px 12px 8px 32px" }} />
              {metaSearch && (
                <button type="button" onClick={() => setMetaSearch("")}
                  style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#5a5a78", cursor: "pointer", fontSize: "13px" }}>✕</button>
              )}
            </div>
          </div>

          {metaError && (
            <div style={{ padding: "12px 16px", background: "rgba(255,107,71,0.08)", border: "1px solid rgba(255,107,71,0.3)", borderRadius: "6px", fontFamily: "monospace", fontSize: "12px", color: "#ff6b47" }}>
              ⚠ {metaError}
            </div>
          )}

          {/* Assets grid */}
          <div style={{ ...s.card, maxHeight: "600px", overflowY: "auto", overflowX: "hidden", padding: "20px" }}>
            {metaLoading && metaAssets.length === 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
                  <div key={i} style={{ height: "120px", background: "#13131f", borderRadius: "6px", animation: "pulse 1.5s ease-in-out infinite" }} />
                ))}
              </div>
            ) : filteredMetaAssets.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", fontFamily: "monospace", fontSize: "12px", color: "#5a5a78" }}>
                {metaAssets.length === 0
                  ? "Hacé click en \"↻ Recargar\" para cargar la biblioteca de assets de Meta."
                  : "⚠ Sin resultados para los filtros aplicados."}
              </div>
            ) : (
              <>
                <div style={{ fontFamily: "monospace", fontSize: "10px", color: "#5a5a78", marginBottom: "12px" }}>
                  {filteredMetaAssets.length} asset{filteredMetaAssets.length !== 1 ? "s" : ""}
                  {metaSearch && ` · "${metaSearch}"`}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                  {filteredMetaAssets.map(asset => {
                    const sel = selected.find(f => f.id === asset.id)
                    const isVideo = asset.mimeType.startsWith("video/")
                    return (
                      <div
                        key={asset.id}
                        onClick={() => {
                          setSelected(prev => {
                            const exists = prev.find(f => f.id === asset.id)
                            const next = exists ? prev.filter(f => f.id !== asset.id) : [...prev, asset]
                            onSelectFiles?.(next)
                            return next
                          })
                        }}
                        style={{
                          background: sel ? "rgba(232,255,71,0.08)" : "#13131f",
                          border: sel ? "1px solid rgba(232,255,71,0.4)" : "1px solid #1c1c2e",
                          borderRadius: "6px", padding: "10px", cursor: "pointer",
                          transition: "all 0.15s", position: "relative",
                        }}
                      >
                        {sel && (
                          <div style={{ position: "absolute", top: "6px", right: "6px", width: "18px", height: "18px", borderRadius: "50%", background: "#e8ff47", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "800", color: "#000" }}>✓</div>
                        )}
                        <div style={{ width: "100%", maxWidth: "450px", maxHeight: "450px", aspectRatio: "1/1", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "8px", borderRadius: "4px", overflow: "hidden", background: "#080810", position: "relative", margin: "0 auto" }}>
                          {isVideo && asset.videoUrl ? (
                            <video src={asset.videoUrl} autoPlay loop muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : asset.thumbnailLink ? (
                            <img src={asset.thumbnailLink} alt={asset.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            <span style={{ fontSize: "28px" }}>{isVideo ? "🎬" : "🖼️"}</span>
                          )}
                          <div style={{ position: "absolute", top: "6px", left: "6px", background: "rgba(0,0,0,0.7)", borderRadius: "3px", padding: "2px 6px", fontFamily: "monospace", fontSize: "9px", color: "#c47bff", border: "1px solid rgba(196,123,255,0.3)" }}>
                            {asset.source.toUpperCase()}
                          </div>
                          {isVideo && <div style={{ position: "absolute", bottom: "4px", right: "4px", background: "rgba(0,0,0,0.7)", borderRadius: "3px", padding: "1px 5px", fontFamily: "monospace", fontSize: "9px", color: "#fff" }}>VIDEO</div>}
                        </div>
                        <div style={{ fontFamily: "monospace", fontSize: "11px", color: "#5a5a78", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {asset.name}
                        </div>
                        {asset.width && (
                          <div style={{ fontFamily: "monospace", fontSize: "11px", color: "#5a5a78", marginTop: "2px" }}>{asset.width}×{asset.height}</div>
                        )}
                        {asset.durationSecs != null && (
                          <div style={{ fontFamily: "monospace", fontSize: "11px", color: "#5a5a78", marginTop: "2px" }}>{Math.floor(asset.durationSecs / 60)}:{String(asset.durationSecs % 60).padStart(2, "0")}</div>
                        )}
                      </div>
                    )
                  })}
                </div>
                {metaHasMore && (
                  <div style={{ textAlign: "center", marginTop: "16px" }}>
                    <button
                      onClick={() => fetchMetaAssets({ append: true, imgCursor: metaImageCursor, vidCursor: metaVideoCursor })}
                      disabled={metaLoading}
                      style={{ ...s.btn("#5a5a78", "outline"), margin: "0 auto", opacity: metaLoading ? 0.5 : 1 }}
                    >
                      {metaLoading ? "⟳ Cargando…" : "Cargar más"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// STEP 4 — LAUNCH
// ══════════════════════════════════════════════════════════════════════════════
function LaunchStep({ brand, selectedFiles }) {
  const [instructions, setInstructions] = useState("")
  const [selectedCampaign, setSelectedCampaign] = useState("")
  const [launching, setLaunching] = useState(false)
  const [result, setResult] = useState(null)

  const campaigns = brand?.campaigns ?? []
  const activeCampaigns = campaigns.filter(c => c.status === "active")

  const launch = async () => {
    if (!instructions.trim() || selectedFiles.length === 0) return
    setLaunching(true)
    setResult(null)

    const prompt = `Sos un agente de Meta Ads para la marca "${brand?.name}". 
El usuario quiere subir ${selectedFiles.length} archivo(s) a Meta Ads con estas instrucciones: "${instructions}"
${selectedCampaign ? `Campaña destino: ${selectedCampaign}` : "Sin campaña especificada."}

Archivos seleccionados: ${selectedFiles.map(f => f.name).join(", ")}

Generá un plan de acción detallado en español con:
1. Qué harías con cada archivo
2. Configuración recomendada del ad set (objetivo, audiencia, presupuesto sugerido)
3. Copy sugerido para cada anuncio
4. Próximos pasos

Respondé de forma clara y accionable.`

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }]
        })
      })
      const data = await res.json()
      setResult(data.content?.[0]?.text || "Sin respuesta")
    } catch {
      setResult("Error al conectar con Claude. Intentá de nuevo.")
    }
    setLaunching(false)
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={s.card}>
        <div style={{ fontWeight: "800", fontSize: "15px", marginBottom: "16px" }}>🚀 Lanzamiento a Meta Ads</div>

        {/* Selected files summary */}
        {selectedFiles.length > 0 ? (
          <div style={{ marginBottom: "16px", padding: "12px 14px", background: "rgba(71,255,200,0.06)", border: "1px solid rgba(71,255,200,0.2)", borderRadius: "6px" }}>
            <div style={{ fontFamily: "monospace", fontSize: "10px", color: "#47ffc8", marginBottom: "8px" }}>
              {selectedFiles.length} ARCHIVO{selectedFiles.length > 1 ? "S" : ""} SELECCIONADO{selectedFiles.length > 1 ? "S" : ""}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {selectedFiles.map(f => (
                <span key={f.id} style={{ fontFamily: "monospace", fontSize: "11px", padding: "3px 8px", background: "rgba(71,255,200,0.1)", color: "#47ffc8", borderRadius: "3px" }}>
                  {f.mimeType?.startsWith("video/") ? "🎬" : "🖼️"} {f.name}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ marginBottom: "16px", padding: "12px 14px", background: "rgba(255,107,71,0.06)", border: "1px solid rgba(255,107,71,0.2)", borderRadius: "6px", fontFamily: "monospace", fontSize: "12px", color: "#ff6b47" }}>
            ⚠ Seleccioná archivos en el paso anterior para continuar
          </div>
        )}

        {/* Campaign selector */}
        <div style={{ marginBottom: "12px" }}>
          <div style={s.label}>CAMPAÑA DESTINO (opcional)</div>
          <select
            value={selectedCampaign}
            onChange={e => setSelectedCampaign(e.target.value)}
            style={{ ...s.input, appearance: "none" }}
          >
            <option value="">Sin campaña específica</option>
            {activeCampaigns.map(c => (
              <option key={c.name} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Instructions */}
        <div style={{ marginBottom: "16px" }}>
          <div style={s.label}>TUS INSTRUCCIONES</div>
          <textarea
            value={instructions}
            onChange={e => setInstructions(e.target.value)}
            placeholder='Ej: "Subí estos 3 videos como nuevos ads en la campaña de retargeting con objetivo conversiones, presupuesto $5000/día cada uno"'
            style={{ ...s.input, minHeight: "100px", resize: "vertical" }}
          />
        </div>

        <button
          onClick={launch}
          disabled={launching || selectedFiles.length === 0 || !instructions.trim()}
          style={{
            ...s.btn(),
            opacity: (launching || selectedFiles.length === 0 || !instructions.trim()) ? 0.4 : 1,
            width: "100%", justifyContent: "center", padding: "12px",
          }}
        >
          {launching ? "⟳ Generando plan de lanzamiento…" : "🚀 Generar plan de lanzamiento"}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div style={s.card}>
          <div style={s.label}>PLAN DE LANZAMIENTO</div>
          <div style={{ fontSize: "13px", lineHeight: "1.8", color: "#c8c8e8", whiteSpace: "pre-wrap", marginTop: "8px" }}>
            {result}
          </div>
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
export default function AdsTab({ brand }) {
  const [step, setStep] = useState("research")
  const [selectedFiles, setSelectedFiles] = useState([])

  // ── Google auth lifted here so it persists across step navigation ──
  const [gapiLoaded, setGapiLoaded] = useState(false)
  const [gisLoaded, setGisLoaded] = useState(false)
  const [signedIn, setSignedIn] = useState(false)
  const tokenClientRef = useRef(null)
  const scriptsReady = gapiLoaded && gisLoaded

  useEffect(() => {
    // ── GAPI ──
    const initGapi = () => {
      window.gapi.load("client", async () => {
        await window.gapi.client.init({ discoveryDocs: [DISCOVERY_DOC] })
        setGapiLoaded(true)
      })
    }
    if (window.gapi) { initGapi() }
    else {
      const gapiScript = document.createElement("script")
      gapiScript.src = "https://apis.google.com/js/api.js"
      gapiScript.onload = initGapi
      document.head.appendChild(gapiScript)
    }

    // ── GIS ──
    const initGis = () => {
      tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: DRIVE_SCOPE,
        callback: (resp) => {
          if (resp.error) return
          setSignedIn(true)
        }
      })
      setGisLoaded(true)
    }
    if (window.google?.accounts) { initGis() }
    else {
      const gisScript = document.createElement("script")
      gisScript.src = "https://accounts.google.com/gsi/client"
      gisScript.onload = initGis
      document.head.appendChild(gisScript)
    }
  }, [])

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: "22px", fontWeight: "800", letterSpacing: "-0.02em" }}>🎯 Creación de Ads</div>
          <div style={{ fontFamily: "monospace", fontSize: "11px", color: "#5a5a78", marginTop: "2px" }}>
            {brand?.emoji} {brand?.name} · Flujo de 4 pasos
          </div>
        </div>
      </div>

      {/* Step navigator */}
      <div style={{ display: "flex", gap: "0px", background: "#0e0e1a", border: "1px solid #1c1c2e", borderRadius: "8px", padding: "4px", overflow: "hidden" }}>
        {STEPS.map((st, i) => {
          const active = step === st.id
          const stepIndex = STEPS.findIndex(s => s.id === step)
          const done = i < stepIndex
          return (
            <button
              key={st.id}
              onClick={() => setStep(st.id)}
              style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                padding: "10px 8px", borderRadius: "6px", cursor: "pointer",
                background: active ? "rgba(232,255,71,0.1)" : "transparent",
                border: active ? "1px solid rgba(232,255,71,0.25)" : "1px solid transparent",
                color: active ? "#e8ff47" : done ? "#47ffc8" : "#5a5a78",
                fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "13px", fontWeight: active ? "700" : "500",
                transition: "all 0.15s",
              }}
            >
              <span>{done ? "✓" : st.icon}</span>
              <span style={{ display: window.innerWidth < 900 ? "none" : "block" }}>{st.label}</span>
            </button>
          )
        })}
      </div>

      {/* Step content */}
      {step === "research" && <ResearchStep brand={brand} />}
      {step === "roadmap" && <RoadmapStep brand={brand} />}
      {step === "assets" && <AssetsStep brand={brand} onSelectFiles={setSelectedFiles} signedIn={signedIn} setSignedIn={setSignedIn} scriptsReady={scriptsReady} tokenClientRef={tokenClientRef} />}
      {step === "launch" && <LaunchStep brand={brand} selectedFiles={selectedFiles} />}

      {/* Step navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "8px" }}>
        <button
          onClick={() => setStep(STEPS[Math.max(0, STEPS.findIndex(s => s.id === step) - 1)].id)}
          disabled={step === STEPS[0].id}
          style={{ ...s.btn("#5a5a78", "outline"), opacity: step === STEPS[0].id ? 0.3 : 1 }}
        >
          ← Paso anterior
        </button>
        <button
          onClick={() => setStep(STEPS[Math.min(STEPS.length - 1, STEPS.findIndex(s => s.id === step) + 1)].id)}
          disabled={step === STEPS[STEPS.length - 1].id}
          style={{ ...s.btn(), opacity: step === STEPS[STEPS.length - 1].id ? 0.3 : 1 }}
        >
          Siguiente paso →
        </button>
      </div>
    </div>
  )
}
