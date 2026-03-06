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
  const [metaSourceVal, setMetaSourceVal] = useState("cuenta") // cuenta, facebook, instagram
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

  const fetchMetaAssets = async ({ append = false, imgCursor = null, vidCursor = null, newSource = metaSourceVal } = {}) => {
    if (!META_TOKEN) { setMetaError("VITE_META_ACCESS_TOKEN no configurado en .env.local"); return }
    setMetaLoading(true)
    setMetaError(null)

    try {
      if (newSource === "cuenta") {
        const accountId = brand?.metaAccounts?.[0]
        if (!accountId) { setMetaError("Esta marca no tiene cuenta Meta configurada."); setMetaLoading(false); return }

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
          id: img.hash, name: img.name || `Image ${img.hash}`, thumbnailLink: img.url,
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

      } else if (newSource === "facebook") {
        const fbId = brand?.facebookPageId
        if (!fbId || fbId.includes("placeholder")) { setMetaError("Esta marca no tiene un Facebook Page ID configurado todavía."); setMetaLoading(false); return }

        const params = new URLSearchParams({
          fields: "id,full_picture,message,created_time,attachments{media_type,media_url}",
          limit: "50",
          access_token: META_TOKEN,
          ...(imgCursor ? { after: imgCursor } : {}),
        })
        const res = await fetch(`${META_GRAPH}/${fbId}/published_posts?${params}`).then(r => r.json())
        if (res.error) throw new Error(res.error.message)

        const posts = (res.data || []).filter(p => p.full_picture || p.attachments?.data?.[0]?.media_url).map(p => {
          const isVideo = p.attachments?.data?.[0]?.media_type === "video_inline" || p.attachments?.data?.[0]?.media_type === "video"
          return {
            id: p.id, name: p.message ? p.message.slice(0, 40) + "..." : `Post ${p.id}`,
            thumbnailLink: p.full_picture || p.attachments?.data?.[0]?.media_url,
            mimeType: isVideo ? "video/mp4" : "image/jpeg", source: "Facebook",
            updatedTime: p.created_time,
            videoUrl: isVideo ? p.attachments?.data?.[0]?.media_url : null
          }
        })
        setMetaAssets(prev => append ? [...prev, ...posts] : posts)
        setMetaImageCursor(res.paging?.cursors?.after || null)
        setMetaVideoCursor(null)
        setMetaHasMore(!!res.paging?.next)

      } else if (newSource === "instagram") {
        const igId = brand?.instagramAccountId
        if (!igId || igId.includes("placeholder")) { setMetaError("Esta marca no tiene un Instagram Account ID configurado todavía."); setMetaLoading(false); return }

        const params = new URLSearchParams({
          fields: "id,media_url,media_type,thumbnail_url,caption,timestamp",
          limit: "50",
          access_token: META_TOKEN,
          ...(imgCursor ? { after: imgCursor } : {}),
        })
        const res = await fetch(`${META_GRAPH}/${igId}/media?${params}`).then(r => r.json())
        if (res.error) throw new Error(res.error.message)

        const media = (res.data || []).map(m => {
          const isVideo = m.media_type === "VIDEO" || m.media_type === "REELS"
          return {
            id: m.id, name: m.caption ? m.caption.slice(0, 40) + "..." : `IG ${m.media_type}`,
            thumbnailLink: isVideo ? m.thumbnail_url : m.media_url,
            mimeType: isVideo ? "video/mp4" : "image/jpeg", source: "Instagram",
            updatedTime: m.timestamp,
            videoUrl: isVideo ? m.media_url : null
          }
        })
        setMetaAssets(prev => append ? [...prev, ...media] : media)
        setMetaImageCursor(res.paging?.cursors?.after || null)
        setMetaVideoCursor(null)
        setMetaHasMore(!!res.paging?.next)
      }

    } catch (e) {
      setMetaError(`Error al cargar desde ${newSource}: ` + e.message)
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
            <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", justifyContent: "space-between" }}>
              <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ display: "flex", gap: "4px" }}>
                  {[["cuenta", "Cuenta Ads"], ["facebook", "Facebook"], ["instagram", "Instagram"]].map(([val, label]) => (
                    <button key={val} onClick={() => { setMetaSourceVal(val); fetchMetaAssets({ newSource: val }); }}
                      style={{ ...s.tag("#e8ff47", metaSourceVal === val), padding: "5px 12px", cursor: "pointer", border: `1px solid ${metaSourceVal === val ? "#e8ff4740" : "#1c1c2e"}` }}>
                      {label}
                    </button>
                  ))}
                </div>
                <div style={{ width: "1px", height: "20px", background: "#1c1c2e" }}></div>
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
              </div>
              <div>
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
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "16px" }}>
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
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "16px" }}>
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
                          <div style={{ position: "absolute", top: "6px", right: "6px", width: "18px", height: "18px", borderRadius: "50%", background: "#e8ff47", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "800", color: "#000", zIndex: 10 }}>✓</div>
                        )}
                        <div style={{ width: "100%", aspectRatio: "1/1", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "8px", borderRadius: "4px", overflow: "hidden", background: "#080810", position: "relative" }}>
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

// Assuming s, META_TOKEN, META_GRAPH are from outer scope in AdsTab.jsx
function LaunchStep({ brand, selectedFiles }) {
  const [stage, setStage] = useState(1);
  const [assetsConfig, setAssetsConfig] = useState(
    selectedFiles.map(f => ({ ...f, adName: f.name ? f.name.replace(/\.[^/.]+$/, "") : `ad_${Math.random().toString(36).substring(7)}`, customThumbnail: "" }))
  );

  const [copyConfig, setCopyConfig] = useState({
    primaryTexts: [""], headlines: [""], descriptions: [""], websiteUrl: "https://www.example.com", displayLink: "", cta: "LEARN_MORE"
  });

  const CTAS = ["SHOP_NOW", "LEARN_MORE", "SIGN_UP", "GET_OFFER", "ORDER_NOW", "BOOK_NOW", "CONTACT_US", "BUY_NOW", "GET_STARTED"];
  const OBJECTIVES = ["OUTCOME_SALES", "OUTCOME_TRAFFIC", "OUTCOME_ENGAGEMENT", "OUTCOME_LEADS", "OUTCOME_APP_PROMOTION", "OUTCOME_AWARENESS"];

  const [campaignMode, setCampaignMode] = useState("existing");
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const [newCampaign, setNewCampaign] = useState({ name: "Campaña Nueva", objective: "OUTCOME_SALES", dailyBudget: "5000", specialAdCategory: "NONE" });
  const [fetchedCampaigns, setFetchedCampaigns] = useState([]);

  const [adSetMode, setAdSetMode] = useState("existing");
  const [selectedAdSetId, setSelectedAdSetId] = useState("");
  const [newAdSet, setNewAdSet] = useState({ name: "Conjunto Nuevo", sourceAdSetId: "", dailyBudgetOverride: "" });
  const [assetAdSets, setAssetAdSets] = useState({});
  const [fetchedAdSets, setFetchedAdSets] = useState([]);

  const [selectedPageId, setSelectedPageId] = useState(brand?.facebookPageId || "");
  const [pages, setPages] = useState([]);

  const [selectedIgAccountId, setSelectedIgAccountId] = useState(brand?.instagramAccountId || "");
  const [igAccounts, setIgAccounts] = useState([]);

  const [claudeReview, setClaudeReview] = useState(null);
  const [loadingReview, setLoadingReview] = useState(false);

  const [launchState, setLaunchState] = useState("idle");
  const [launchResults, setLaunchResults] = useState({});

  useEffect(() => {
    // Pages
    if (!globalThis.META_TOKEN) return;
    fetch(`https://graph.facebook.com/v22.0/me/accounts?fields=id,name&access_token=${globalThis.META_TOKEN}`)
      .then(r => r.json())
      .then(d => {
        if (d.data) {
          setPages(d.data);
          if (d.data.length && (!brand?.facebookPageId)) setSelectedPageId(d.data[0].id)
        }
      })
      .catch(() => { });
  }, [brand]);

  useEffect(() => {
    if (!selectedPageId || !globalThis.META_TOKEN) {
      setIgAccounts([]);
      if (!brand?.instagramAccountId) setSelectedIgAccountId("");
      return;
    }
    fetch(`https://graph.facebook.com/v22.0/${selectedPageId}/instagram_accounts?fields=id,username,profile_pic&access_token=${globalThis.META_TOKEN}`)
      .then(r => r.json())
      .then(d => {
        if (d.data) {
          setIgAccounts(d.data);
          if (d.data.length > 0 && (!brand?.instagramAccountId)) setSelectedIgAccountId(d.data[0].id);
          else if (d.data.length === 0) setSelectedIgAccountId("");
        }
      })
      .catch(() => { });
  }, [selectedPageId, brand]);

  useEffect(() => {
    if (stage === 2 && campaignMode === "existing" && globalThis.META_TOKEN) {
      const accountId = brand?.metaAccounts?.[0];
      if (accountId) {
        fetch(`https://graph.facebook.com/v22.0/${accountId}/campaigns?fields=id,name,status,objective&access_token=${globalThis.META_TOKEN}`)
          .then(r => r.json()).then(d => d.data && setFetchedCampaigns(d.data)).catch(() => { });
      }
    }
  }, [stage, campaignMode, brand]);

  useEffect(() => {
    const cid = campaignMode === "existing" ? selectedCampaignId : null;
    if (stage === 2 && cid && (adSetMode === "existing" || newAdSet.sourceAdSetId || adSetMode === "multiple") && globalThis.META_TOKEN) {
      fetch(`https://graph.facebook.com/v22.0/${cid}/adsets?fields=id,name,status,daily_budget&access_token=${globalThis.META_TOKEN}`)
        .then(r => r.json()).then(d => d.data && setFetchedAdSets(d.data)).catch(() => { });
    }
  }, [stage, selectedCampaignId, campaignMode, adSetMode, newAdSet.sourceAdSetId]);

  const runReview = async () => {
    setLoadingReview(true);
    const prompt = `Revisá estos ads para Meta:
Website: ${copyConfig.websiteUrl}
Textos principales: ${copyConfig.primaryTexts.join(" | ")}
Títulos: ${copyConfig.headlines.join(" | ")}
Descripciones: ${copyConfig.descriptions.join(" | ")}
CTA: ${copyConfig.cta}
Objetivo: ${campaignMode === "new" ? newCampaign.objective : "Existente"}

Evaluá concisamente:
1. Advertí si algún título tiene más de 40 caracteres.
2. Sugerí CTA más fuerte si aplica.
3. Chequeá presupuesto si es nuevo (Presupuesto diario: ${newCampaign.dailyBudget || newAdSet.dailyBudgetOverride || "N/A"} ARS).
4. Calificá textos 1-10 y sugerí mejoras.
`;
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 600, messages: [{ role: "user", content: prompt }] })
      });
      const data = await res.json();
      setClaudeReview(data.content?.[0]?.text || "Sin revisión.");
    } catch {
      setClaudeReview("Error en Claude.");
    }
    setLoadingReview(false);
  };

  const handleLaunch = async (targetStatus) => {
    setLaunchState("launching");
    const accountId = brand?.metaAccounts?.[0];
    let activeCampaignId = selectedCampaignId;
    let activeAdSetId = selectedAdSetId;
    const results = {};

    try {
      if (campaignMode === "new") {
        const res = await fetch(`${globalThis.META_GRAPH}/${accountId}/campaigns`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newCampaign.name, objective: newCampaign.objective, status: targetStatus, special_ad_categories: [newCampaign.specialAdCategory], access_token: globalThis.META_TOKEN })
        }).then(r => r.json());
        if (res.error) throw new Error(res.error.error_user_msg || res.error.message);
        activeCampaignId = res.id;
      }

      if (adSetMode === "new") {
        let payload = { name: newAdSet.name, campaign_id: activeCampaignId, daily_budget: Number(newAdSet.dailyBudgetOverride || newCampaign.dailyBudget) * 100, billing_event: "IMPRESSIONS", optimization_goal: "OFFSITE_CONVERSIONS", status: targetStatus, access_token: globalThis.META_TOKEN };
        if (newAdSet.sourceAdSetId) {
          const src = await fetch(`${globalThis.META_GRAPH}/${newAdSet.sourceAdSetId}?fields=targeting,promoted_object&access_token=${globalThis.META_TOKEN}`).then(r => r.json());
          if (src.targeting) payload.targeting = src.targeting;
          if (src.promoted_object) payload.promoted_object = src.promoted_object;
        } else {
          payload.targeting = { geo_locations: { countries: ["AR"] } };
        }
        const res = await fetch(`${globalThis.META_GRAPH}/${accountId}/adsets`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }).then(r => r.json());
        if (res.error) throw new Error(res.error.error_user_msg || res.error.message);
        activeAdSetId = res.id;
      }

      for (const asset of assetsConfig) {
        try {
          let imageHash = null;
          let videoId = null;
          const isVideo = asset.mimeType.startsWith("video/");

          if (asset.source === "Cuenta") {
            if (isVideo) videoId = asset.id;
            else imageHash = asset.id;
          } else {
            const blobUrl = isVideo && asset.videoUrl ? asset.videoUrl : asset.thumbnailLink;
            let tokenHeader = {};
            if (asset.source !== "Facebook" && asset.source !== "Instagram") {
              const gapiToken = window.gapi?.client?.getToken?.()?.access_token;
              if (!gapiToken) throw new Error("Falta token de Drive");
              tokenHeader = { Authorization: `Bearer ${gapiToken}` };
            }

            const blob = await fetch(asset.source !== "Facebook" && asset.source !== "Instagram" ? `https://www.googleapis.com/drive/v3/files/${asset.id}?alt=media` : blobUrl, { headers: tokenHeader }).then(r => r.blob());

            const fd = new FormData();
            fd.append("access_token", globalThis.META_TOKEN);
            if (isVideo) {
              fd.append("source", blob, asset.name + ".mp4");
              const ur = await fetch(`${globalThis.META_GRAPH}/${accountId}/advideos`, { method: "POST", body: fd }).then(r => r.json());
              if (ur.error) throw new Error(ur.error.error_user_msg || ur.error.message);
              videoId = ur.id;
            } else {
              let uploadBlob = blob;
              if (blob.type === "image/webp") {
                const bmp = await createImageBitmap(blob);
                const cvs = document.createElement("canvas");
                cvs.width = bmp.width; cvs.height = bmp.height;
                cvs.getContext("2d").drawImage(bmp, 0, 0);
                uploadBlob = await new Promise(r => cvs.toBlob(r, "image/jpeg", 0.9));
              }
              fd.append("filename", uploadBlob, asset.name + ".jpg");
              const ur = await fetch(`${globalThis.META_GRAPH}/${accountId}/adimages`, { method: "POST", body: fd }).then(r => r.json());
              if (ur.error) throw new Error(ur.error.error_user_msg || ur.error.message);
              imageHash = ur.images[asset.name + ".jpg"]?.hash || ur.images[Object.keys(ur.images)[0]]?.hash;
            }
          }

          const adSetForAsset = adSetMode === "multiple" ? assetAdSets[asset.id] : activeAdSetId;
          if (!adSetForAsset) throw new Error("No hay conjunto de anuncios asignado.");

          let creativePayload = {
            name: `Creative - ${asset.adName}`,
            access_token: globalThis.META_TOKEN,
          };

          const isMultipleText = copyConfig.primaryTexts.length > 1 || copyConfig.headlines.length > 1 || copyConfig.descriptions.length > 1;

          if (isMultipleText) {
            creativePayload.asset_feed_spec = {
              bodies: copyConfig.primaryTexts.filter(t => t).map(text => ({ text })),
              titles: copyConfig.headlines.filter(t => t).map(text => ({ text })),
              descriptions: copyConfig.descriptions.filter(t => t).map(text => ({ text })),
              call_to_action_types: [copyConfig.cta],
              link_urls: [{ website_url: copyConfig.websiteUrl }],
              ad_formats: [isVideo ? "SINGLE_VIDEO" : "SINGLE_IMAGE"]
            };
            if (isVideo) creativePayload.asset_feed_spec.videos = [{ video_id: videoId }];
            else creativePayload.asset_feed_spec.images = [{ hash: imageHash }];
            creativePayload.object_story_spec = { page_id: selectedPageId };
            if (selectedIgAccountId) creativePayload.object_story_spec.instagram_actor_id = selectedIgAccountId;
          } else {
            creativePayload.object_story_spec = { page_id: selectedPageId };
            if (selectedIgAccountId) creativePayload.object_story_spec.instagram_actor_id = selectedIgAccountId;
            if (isVideo) {
              creativePayload.object_story_spec.video_data = {
                video_id: videoId,
                message: copyConfig.primaryTexts[0],
                title: copyConfig.headlines[0],
                link_description: copyConfig.descriptions[0],
                call_to_action: { type: copyConfig.cta, value: { link: copyConfig.websiteUrl } },
                image_url: asset.customThumbnail || undefined
              };
            } else {
              creativePayload.object_story_spec.link_data = {
                image_hash: imageHash,
                link: copyConfig.websiteUrl,
                message: copyConfig.primaryTexts[0],
                name: copyConfig.headlines[0],
                description: copyConfig.descriptions[0],
                call_to_action: { type: copyConfig.cta }
              };
            }
          }

          const crRes = await fetch(`${globalThis.META_GRAPH}/${accountId}/adcreatives`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify(creativePayload)
          }).then(r => r.json());
          if (crRes.error) throw new Error(crRes.error.error_user_msg || crRes.error.message);

          const adRes = await fetch(`${globalThis.META_GRAPH}/${accountId}/ads`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: asset.adName, adset_id: adSetForAsset, creative: { creative_id: crRes.id }, status: targetStatus, access_token: globalThis.META_TOKEN
            })
          }).then(r => r.json());
          if (adRes.error) throw new Error(adRes.error.error_user_msg || adRes.error.message);

          results[asset.id] = { status: "success", adId: adRes.id };
        } catch (e) {
          results[asset.id] = { status: "error", message: e.message };
        }
      }

      setLaunchResults(results);
      setLaunchState("success");
    } catch (e) {
      setLaunchState("error");
      setClaudeReview(e.message);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={s.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <div style={{ fontWeight: "800", fontSize: "15px", marginBottom: "4px" }}>🚀 Lanzamiento a Meta Ads</div>
            <div style={{ fontFamily: "monospace", fontSize: "11px", color: "#5a5a78" }}>
              Etapa {stage} de 4 · {selectedFiles.length} asset(s) seleccionados
            </div>
          </div>
        </div>

        {/* ── STAGE 1: ASSET SUMMARY & COPY ── */}
        {stage === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Assets List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={s.label}>1. ASSETS SELECCIONADOS ({assetsConfig.length})</div>
              {assetsConfig.map((ass, idx) => {
                const isVideo = ass.mimeType.startsWith("video/");
                return (
                  <div key={ass.id} style={{ display: "flex", gap: "12px", background: "#13131f", padding: "12px", borderRadius: "8px", border: "1px solid #1c1c2e" }}>
                    {/* Thumbnail */}
                    <div style={{ width: "80px", height: "80px", background: "#080810", borderRadius: "6px", overflow: "hidden", position: "relative", flexShrink: 0 }}>
                      <img src={ass.thumbnailLink || "https://placehold.co/80/080810/5a5a78?text=MEDIA"} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <div style={{ position: "absolute", bottom: "2px", right: "2px", background: "rgba(0,0,0,0.8)", padding: "1px 4px", fontSize: "8px", fontFamily: "monospace", borderRadius: "2px", color: "#fff" }}>
                        {ass.source.toUpperCase()}
                      </div>
                    </div>
                    {/* Config */}
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                      <div>
                        <div style={{ fontSize: "11px", fontFamily: "monospace", color: "#5a5a78", marginBottom: "4px" }}>NOMBRE DEL ANUNCIO</div>
                        <input value={ass.adName} onChange={e => {
                          const nf = [...assetsConfig]; nf[idx].adName = e.target.value; setAssetsConfig(nf);
                        }} style={{ ...s.input, padding: "6px 10px" }} />
                      </div>
                      {isVideo && (
                        <div>
                          <div style={{ fontSize: "11px", fontFamily: "monospace", color: "#5a5a78", marginBottom: "4px" }}>THUMBNAIL URL (OPCIONAL)</div>
                          <input value={ass.customThumbnail} placeholder="https://..." onChange={e => {
                            const nf = [...assetsConfig]; nf[idx].customThumbnail = e.target.value; setAssetsConfig(nf);
                          }} style={{ ...s.input, padding: "6px 10px" }} />
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Copy fields */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={s.label}>2. COPY DEL ANUNCIO (APLICA A TODOS)</div>

              {/* Primary Texts */}
              <div style={{ background: "#13131f", padding: "12px", borderRadius: "8px", border: "1px solid #1c1c2e" }}>
                <div style={{ fontSize: "11px", fontFamily: "monospace", color: "#f0f0f8", marginBottom: "8px", display: "flex", justifyContent: "space-between" }}>
                  <span>TEXTO PRINCIPAL (Admite múltiples para rotación)</span>
                  {copyConfig.primaryTexts.length < 5 && (
                    <button onClick={() => setCopyConfig(p => ({ ...p, primaryTexts: [...p.primaryTexts, ""] }))} style={{ background: "none", border: "none", color: "#47c8ff", cursor: "pointer", fontFamily: "monospace" }}>+ Añadir variación</button>
                  )}
                </div>
                {copyConfig.primaryTexts.map((pt, i) => (
                  <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                    <textarea value={pt} onChange={e => {
                      const nt = [...copyConfig.primaryTexts]; nt[i] = e.target.value; setCopyConfig(p => ({ ...p, primaryTexts: nt }));
                    }} placeholder={`Texto principal ${i + 1}`} style={{ ...s.input, minHeight: "60px", resize: "vertical" }} />
                    {copyConfig.primaryTexts.length > 1 && (
                      <button onClick={() => setCopyConfig(p => ({ ...p, primaryTexts: p.primaryTexts.filter((_, idx) => idx !== i) }))} style={s.btn("#ff6b47", "outline")}>✕</button>
                    )}
                  </div>
                ))}
              </div>

              {/* Headlines */}
              <div style={{ background: "#13131f", padding: "12px", borderRadius: "8px", border: "1px solid #1c1c2e" }}>
                <div style={{ fontSize: "11px", fontFamily: "monospace", color: "#f0f0f8", marginBottom: "8px", display: "flex", justifyContent: "space-between" }}>
                  <span>TÍTULO (HASTA 5)</span>
                  {copyConfig.headlines.length < 5 && (
                    <button onClick={() => setCopyConfig(p => ({ ...p, headlines: [...p.headlines, ""] }))} style={{ background: "none", border: "none", color: "#47c8ff", cursor: "pointer", fontFamily: "monospace" }}>+ Añadir variación</button>
                  )}
                </div>
                {copyConfig.headlines.map((pt, i) => (
                  <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                    <input value={pt} onChange={e => {
                      const nt = [...copyConfig.headlines]; nt[i] = e.target.value; setCopyConfig(p => ({ ...p, headlines: nt }));
                    }} placeholder={`Título ${i + 1} (Máx 40 chars)`} style={s.input} maxLength={50} />
                    {copyConfig.headlines.length > 1 && (
                      <button onClick={() => setCopyConfig(p => ({ ...p, headlines: p.headlines.filter((_, idx) => idx !== i) }))} style={s.btn("#ff6b47", "outline")}>✕</button>
                    )}
                  </div>
                ))}
              </div>

              {/* Descriptions & URLs */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ background: "#13131f", padding: "12px", borderRadius: "8px", border: "1px solid #1c1c2e" }}>
                  <div style={{ fontSize: "11px", fontFamily: "monospace", color: "#f0f0f8", marginBottom: "8px" }}>DESCRIPCIONES (HASTA 3)</div>
                  {copyConfig.descriptions.map((pt, i) => (
                    <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                      <input value={pt} onChange={e => {
                        const nt = [...copyConfig.descriptions]; nt[i] = e.target.value; setCopyConfig(p => ({ ...p, descriptions: nt }));
                      }} placeholder={`Descripción ${i + 1}`} style={s.input} />
                    </div>
                  ))}
                  {copyConfig.descriptions.length < 3 && (
                    <button onClick={() => setCopyConfig(p => ({ ...p, descriptions: [...p.descriptions, ""] }))} style={{ background: "none", border: "none", color: "#47c8ff", cursor: "pointer", fontFamily: "monospace", fontSize: "10px", marginTop: "4px" }}>+ Añadir variación</button>
                  )}
                </div>
                <div style={{ background: "#13131f", padding: "12px", borderRadius: "8px", border: "1px solid #1c1c2e" }}>
                  <div style={{ fontSize: "11px", fontFamily: "monospace", color: "#f0f0f8", marginBottom: "8px" }}>URL Y CALL TO ACTION</div>
                  <input value={copyConfig.websiteUrl} onChange={e => setCopyConfig(p => ({ ...p, websiteUrl: e.target.value }))} placeholder="Website URL (Requerido)" style={{ ...s.input, marginBottom: "8px" }} />
                  <input value={copyConfig.displayLink} onChange={e => setCopyConfig(p => ({ ...p, displayLink: e.target.value }))} placeholder="Display Link (Opcional)" style={{ ...s.input, marginBottom: "12px" }} />
                  <select value={copyConfig.cta} onChange={e => setCopyConfig(p => ({ ...p, cta: e.target.value }))} style={{ ...s.input, appearance: "none" }}>
                    {CTAS.map(c => <option key={c} value={c}>{c.replace("_", " ")}</option>)}
                  </select>
                </div>
              </div>

              {/* FB Page & IG Account Selection */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ background: "#13131f", padding: "12px", borderRadius: "8px", border: "1px solid #1c1c2e" }}>
                  <div style={{ fontSize: "11px", fontFamily: "monospace", color: "#f0f0f8", marginBottom: "8px" }}>FACEBOOK PAGE (REQUERIDO PARA CREAR ADS)</div>
                  <select value={selectedPageId} onChange={e => setSelectedPageId(e.target.value)} style={{ ...s.input, appearance: "none" }}>
                    <option value="">Seleccioná una página...</option>
                    {pages.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div style={{ background: "#13131f", padding: "12px", borderRadius: "8px", border: "1px solid #1c1c2e" }}>
                  <div style={{ fontSize: "11px", fontFamily: "monospace", color: "#f0f0f8", marginBottom: "8px" }}>CUENTA DE INSTAGRAM</div>
                  <select value={selectedIgAccountId} onChange={e => setSelectedIgAccountId(e.target.value)} style={{ ...s.input, appearance: "none" }} disabled={!selectedPageId || igAccounts.length === 0}>
                    <option value="">Ninguna cuenta de IG</option>
                    {igAccounts.map(ig => <option key={ig.id} value={ig.id}>@{ig.username}</option>)}
                  </select>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ── STAGE 2: CAMPAIGN & AD SET CONFIGURATION ── */}
        {stage === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Campaign Config */}
            <div>
              <div style={s.label}>1. CAMPAÑA DESTINO</div>
              <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
                <button onClick={() => setCampaignMode("existing")} style={s.btn(campaignMode === "existing" ? "#e8ff47" : "#5a5a78", campaignMode === "existing" ? "primary" : "outline")}>Usar existente</button>
                <button onClick={() => setCampaignMode("new")} style={s.btn(campaignMode === "new" ? "#e8ff47" : "#5a5a78", campaignMode === "new" ? "primary" : "outline")}>Crear nueva</button>
              </div>

              {campaignMode === "existing" && (
                <div style={{ background: "#13131f", padding: "16px", borderRadius: "8px", border: "1px solid #1c1c2e" }}>
                  <select value={selectedCampaignId} onChange={e => setSelectedCampaignId(e.target.value)} style={{ ...s.input, appearance: "none" }}>
                    <option value="">Seleccioná una campaña...</option>
                    {fetchedCampaigns.map(c => <option key={c.id} value={c.id}>{c.name} ({c.objective}) [{c.status}]</option>)}
                  </select>
                </div>
              )}

              {campaignMode === "new" && (
                <div style={{ background: "#13131f", padding: "16px", borderRadius: "8px", border: "1px solid #1c1c2e", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <div style={{ fontSize: "11px", fontFamily: "monospace", color: "#5a5a78", marginBottom: "4px" }}>NOMBRE DE CAMPAÑA</div>
                      <input value={newCampaign.name} onChange={e => setNewCampaign(p => ({ ...p, name: e.target.value }))} style={s.input} />
                    </div>
                    <div>
                      <div style={{ fontSize: "11px", fontFamily: "monospace", color: "#5a5a78", marginBottom: "4px" }}>OBJETIVO</div>
                      <select value={newCampaign.objective} onChange={e => setNewCampaign(p => ({ ...p, objective: e.target.value }))} style={{ ...s.input, appearance: "none" }}>
                        {OBJECTIVES.map(c => <option key={c} value={c}>{c.replace("OUTCOME_", "")}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <div style={{ fontSize: "11px", fontFamily: "monospace", color: "#5a5a78", marginBottom: "4px" }}>PRESUPUESTO DIARIO (ARS)</div>
                      <input type="number" value={newCampaign.dailyBudget} onChange={e => setNewCampaign(p => ({ ...p, dailyBudget: e.target.value }))} style={s.input} />
                    </div>
                    <div>
                      <div style={{ fontSize: "11px", fontFamily: "monospace", color: "#5a5a78", marginBottom: "4px" }}>CATEGORÍA ESPECIAL</div>
                      <select value={newCampaign.specialAdCategory} onChange={e => setNewCampaign(p => ({ ...p, specialAdCategory: e.target.value }))} style={{ ...s.input, appearance: "none" }}>
                        <option value="NONE">Ninguna (Defecto)</option>
                        <option value="EMPLOYMENT">Empleo</option>
                        <option value="HOUSING">Vivienda</option>
                        <option value="CREDIT">Crédito</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Ad Set Config */}
            <hr style={{ border: "none", borderTop: "1px solid #1c1c2e" }} />
            <div>
              <div style={s.label}>2. CONJUNTO DE ANUNCIOS (AD SET)</div>
              <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
                <button onClick={() => setAdSetMode("existing")} style={s.btn(adSetMode === "existing" ? "#47c8ff" : "#5a5a78", adSetMode === "existing" ? "primary" : "outline")}>Usar existente</button>
                <button onClick={() => setAdSetMode("new")} style={s.btn(adSetMode === "new" ? "#47c8ff" : "#5a5a78", adSetMode === "new" ? "primary" : "outline")}>Crear nuevo</button>
                <button onClick={() => setAdSetMode("multiple")} style={s.btn(adSetMode === "multiple" ? "#c47bff" : "#5a5a78", adSetMode === "multiple" ? "primary" : "outline")}>Múltiples conjuntos</button>
              </div>

              {adSetMode === "existing" && (
                <div style={{ background: "#13131f", padding: "16px", borderRadius: "8px", border: "1px solid #1c1c2e" }}>
                  <select value={selectedAdSetId} onChange={e => setSelectedAdSetId(e.target.value)} style={{ ...s.input, appearance: "none" }}>
                    <option value="">Seleccioná un conjunto...</option>
                    {fetchedAdSets.map(c => <option key={c.id} value={c.id}>{c.name} [${c.daily_budget ? c.daily_budget / 100 : "—"}]</option>)}
                  </select>
                </div>
              )}

              {adSetMode === "new" && (
                <div style={{ background: "#13131f", padding: "16px", borderRadius: "8px", border: "1px solid #1c1c2e", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <div style={{ fontSize: "11px", fontFamily: "monospace", color: "#5a5a78", marginBottom: "4px" }}>NOMBRE DEL CONJUNTO</div>
                      <input value={newAdSet.name} onChange={e => setNewAdSet(p => ({ ...p, name: e.target.value }))} style={s.input} />
                    </div>
                    <div>
                      <div style={{ fontSize: "11px", fontFamily: "monospace", color: "#5a5a78", marginBottom: "4px" }}>COPIAR CONFIGURACIÓN DE</div>
                      <select value={newAdSet.sourceAdSetId} onChange={e => setNewAdSet(p => ({ ...p, sourceAdSetId: e.target.value }))} style={{ ...s.input, appearance: "none" }}>
                        <option value="">(Sin copiar - defaults)</option>
                        {fetchedAdSets.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", fontFamily: "monospace", color: "#5a5a78", marginBottom: "4px" }}>PRESUPUESTO DIARIO OVERRIDE (ARS - Opcional)</div>
                    <input type="number" value={newAdSet.dailyBudgetOverride} onChange={e => setNewAdSet(p => ({ ...p, dailyBudgetOverride: e.target.value }))} placeholder="Usa el de la campaña si está vacío" style={s.input} />
                  </div>
                </div>
              )}

              {adSetMode === "multiple" && (
                <div style={{ background: "#13131f", padding: "16px", borderRadius: "8px", border: "1px solid #1c1c2e" }}>
                  <div style={{ fontSize: "12px", color: "#c8c8e8", marginBottom: "16px" }}>Asigná cada asset a un conjunto de anuncios distinto para crear múltiples versiones de un solo clic.</div>
                  {assetsConfig.map(ass => (
                    <div key={ass.id} style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "12px" }}>
                      <div style={{ width: "40px", height: "40px", borderRadius: "4px", overflow: "hidden", background: "#080810", flexShrink: 0 }}>
                        <img src={ass.thumbnailLink || "https://placehold.co/40/080810/5a5a78?text=MEDIA"} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <select value={assetAdSets[ass.id] || ""} onChange={e => setAssetAdSets(p => ({ ...p, [ass.id]: e.target.value }))} style={{ ...s.input, appearance: "none" }}>
                          <option value="">Seleccioná un conjunto...</option>
                          {fetchedAdSets.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── STAGE 3: CLAUDE AI REVIEW ── */}
        {stage === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ background: "rgba(232,255,71,0.06)", border: "1px solid rgba(232,255,71,0.2)", borderRadius: "8px", padding: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "24px" }}>🤖</span>
                  <div style={{ fontWeight: "700", color: "#e8ff47", fontSize: "15px" }}>Revisión Preventiva</div>
                </div>
                {!claudeReview && (
                  <button onClick={runReview} disabled={loadingReview} style={s.btn()}>
                    {loadingReview ? "⟳ Analizando..." : "Solicitar Revisión"}
                  </button>
                )}
              </div>

              {!claudeReview ? (
                <div style={{ fontSize: "13px", color: "#c8c8e8" }}>Hacé clic en el botón para que Claude analice la configuración, presupuesto y copy antes de publicarlos en Meta. Esto prevendrá errores comunes.</div>
              ) : (
                <div style={{ background: "#13131f", padding: "16px", borderRadius: "8px", border: "1px solid #1c1c2e", color: "#f0f0f8", fontSize: "13px", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                  {claudeReview}
                </div>
              )}
            </div>
            {claudeReview && (
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button onClick={() => setStage(4)} style={s.btn()}>Aceptar revisión y continuar →</button>
              </div>
            )}
          </div>
        )}

        {/* ── STAGE 4: LAUNCH SUMMARY ── */}
        {stage === 4 && launchState === "idle" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ background: "#13131f", padding: "20px", borderRadius: "8px", border: "1px solid #1c1c2e" }}>
              <div style={s.label}>RESUMEN DE LANZAMIENTO</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "12px", fontSize: "13px" }}>
                <div>
                  <span style={{ color: "#5a5a78" }}>Assets a subir:</span> <span style={{ color: "#47ffc8", fontWeight: "700" }}>{assetsConfig.length} medios</span>
                </div>
                <div>
                  <span style={{ color: "#5a5a78" }}>Textos principales:</span> <span style={{ color: "#e8ff47", fontWeight: "700" }}>{copyConfig.primaryTexts.filter(t => t).length} variaciones</span>
                </div>
                <div>
                  <span style={{ color: "#5a5a78" }}>Campaña:</span> <span style={{ color: "#f0f0f8", fontWeight: "700" }}>{campaignMode === "new" ? "NUEVA: " + newCampaign.name : "EXISTENTE: " + selectedCampaignId}</span>
                </div>
                <div>
                  <span style={{ color: "#5a5a78" }}>Ad Sets:</span> <span style={{ color: "#f0f0f8", fontWeight: "700" }}>{adSetMode === "new" ? "NUEVO: " + newAdSet.name : adSetMode === "multiple" ? "MÚLTIPLES" : "EXISTENTE: " + selectedAdSetId}</span>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "16px" }}>
              <button disabled={!selectedPageId} onClick={() => handleLaunch("PAUSED")} style={{ ...s.btn("#47ffc8"), flex: 1, padding: "16px", justifyContent: "center" }}>
                Lanzar Pausado (Recomendado)
              </button>
              <button disabled={!selectedPageId} onClick={() => handleLaunch("ACTIVE")} style={{ ...s.btn("#ff6b47"), flex: 1, padding: "16px", justifyContent: "center" }}>
                Lanzar Activo
              </button>
            </div>
            {!selectedPageId && <div style={{ color: "#ff6b47", fontSize: "12px", textAlign: "center" }}>⚠ Falta seleccionar una página de Facebook en el paso 1.</div>}
          </div>
        )}

        {/* ── LAUNCHING / SUCCESS STATE ── */}
        {launchState !== "idle" && (
          <div style={{ textAlign: "center", padding: "40px" }}>
            {launchState === "launching" && (
              <>
                <div style={{ fontSize: "40px", marginBottom: "16px", animation: "pulse 1.5s infinite" }}>🚀</div>
                <div style={{ fontSize: "18px", fontWeight: "700", marginBottom: "8px" }}>Lanzando a Meta Ads...</div>
                <div style={{ color: "#5a5a78", fontSize: "13px" }}>Subiendo medios y configurando anuncios. Esto puede demorar unos segundos.</div>
              </>
            )}
            {launchState === "success" && (
              <>
                <div style={{ fontSize: "40px", marginBottom: "16px" }}>✅</div>
                <div style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px" }}>Lanzamiento completado</div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxWidth: "400px", margin: "0 auto 24px" }}>
                  {Object.entries(launchResults).map(([id, result]) => {
                    const asset = assetsConfig.find(a => a.id === id);
                    return (
                      <div key={id} style={{ display: "flex", justifyContent: "space-between", background: "#13131f", padding: "10px", borderRadius: "6px", border: "1px solid #1c1c2e" }}>
                        <span style={{ fontSize: "13px", color: "#f0f0f8" }}>{asset?.adName}</span>
                        {result.status === "success" ? (
                          <span style={{ color: "#47ffc8", fontSize: "12px", fontFamily: "monospace" }}>ÉXITO ({result.adId})</span>
                        ) : (
                          <span style={{ color: "#ff6b47", fontSize: "12px", fontFamily: "monospace", maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={result.message}>ERROR: {result.message}</span>
                        )}
                      </div>
                    )
                  })}
                </div>

                <a href={`https://adsmanager.facebook.com/adsmanager/manage/ads?act=${brand?.metaAccounts?.[0]}`} target="_blank" rel="noopener noreferrer" style={{ ...s.btn("#e8ff47"), textDecoration: "none", display: "inline-flex", margin: "0 auto" }}>
                  Abrir Ads Manager ↗
                </a>
              </>
            )}
            {launchState === "error" && (
              <>
                <div style={{ fontSize: "40px", marginBottom: "16px" }}>❌</div>
                <div style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px", color: "#ff6b47" }}>Error en el lanzamiento</div>
                <div style={{ color: "#c8c8e8", fontSize: "13px", background: "#13131f", padding: "16px", borderRadius: "8px", border: "1px solid #1c1c2e", whiteSpace: "pre-wrap", maxWidth: "500px", margin: "0 auto" }}>
                  {claudeReview /* Reusing state to store error locally */}
                </div>
                <button onClick={() => setLaunchState("idle")} style={{ ...s.btn("#5a5a78", "outline"), margin: "24px auto 0" }}>Volver a intentar</button>
              </>
            )}
          </div>
        )}

      </div>

      {launchState === "idle" && (
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <button onClick={() => setStage(Math.max(1, stage - 1))} disabled={stage === 1} style={{ ...s.btn("#5a5a78", "outline"), opacity: stage === 1 ? 0.3 : 1 }}>← Anterior</button>
          <button onClick={() => setStage(Math.min(4, stage + 1))} disabled={stage === 4 || (stage === 3 && !claudeReview)} style={{ ...s.btn(), opacity: (stage === 4 || (stage === 3 && !claudeReview)) ? 0.3 : 1 }}>Siguiente →</button>
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
