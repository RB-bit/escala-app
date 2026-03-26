import { useState, useEffect, useCallback, useRef } from "react"
import { fetchAccountInsights } from "../../lib/metaService"
import { fetchStoreRevenue } from "../../lib/tnService"
import { deleteBrand } from "../../lib/brandsService"
import ConnectMetaModal from "../ConnectMetaModal"
import ConnectTNModal from "../ConnectTNModal"

import { getDateRange } from "../DateFilter"

const DEFAULT_ROAS = 5

function Skeleton() {
  return (
    <div style={{
      height: "13px", width: "60px", borderRadius: "4px",
      background: "linear-gradient(90deg,#1c1c2e 25%,#2a2a3e 50%,#1c1c2e 75%)",
      backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite"
    }} />
  )
}

function formatARS(v) {
  if (v == null || v === 0) return "—"
  return `$${Math.round(v).toLocaleString("es-AR")}`
}

function DeltaBadge({ delta, invertColor }) {
  // invertColor=true  → lower is better (CPA): positive delta = green
  // invertColor=false → higher is better (ROAS, FAC): positive delta = green
  if (delta == null) return <span style={{ fontFamily:"monospace", fontSize:"11px", color:"#2c2c3e" }}>—</span>
  const good = invertColor ? delta >= 0 : delta >= 0
  return (
    <span style={{
      fontFamily: "monospace", fontSize: "11px", fontWeight: "700",
      padding: "3px 9px", borderRadius: "5px",
      background: good ? "rgba(71,255,200,0.12)" : "rgba(255,107,71,0.12)",
      color:      good ? "#47ffc8"               : "#ff6b47"
    }}>
      {delta >= 0 ? "+" : ""}{delta}%
    </span>
  )
}

function EditCell({ brandId, field, value, suffix, step, min, placeholder, editingTarget, setEditingTarget, onSave }) {
  const isEditing = editingTarget?.brandId === brandId && editingTarget?.field === field
  if (isEditing) {
    return (
      <input
        type="number" step={step || 1} min={min || 0}
        defaultValue={value || ""}
        placeholder={placeholder}
        autoFocus
        onClick={e => e.stopPropagation()}
        onBlur={e => {
          const v = parseFloat(e.target.value)
          if (!isNaN(v) && v > 0) onSave(v)
          setEditingTarget(null)
        }}
        onKeyDown={e => {
          if (e.key === "Enter") e.target.blur()
          if (e.key === "Escape") setEditingTarget(null)
        }}
        style={{
          width: "72px", background: "#1c1c2e", border: "1px solid #e8ff47",
          borderRadius: "4px", padding: "4px 6px", color: "#e8ff47",
          fontFamily: "monospace", fontSize: "12px", outline: "none"
        }}
      />
    )
  }
  return (
    <span
      onClick={e => { e.stopPropagation(); setEditingTarget({ brandId, field }) }}
      style={{
        fontFamily: "monospace", fontSize: "12px",
        color: value ? "#8888aa" : "#3a3a5a",
        borderBottom: "1px dashed #2c2c3e", cursor: "text", paddingBottom: "1px"
      }}
    >
      {value ? `${suffix === "x" ? "" : "$"}${suffix === "x" ? value + "x" : formatARS(value).replace("$","")}` : "— set"}
    </span>
  )
}

export default function ClientsTab({ brands, onSelectBrand, onNewClient, onBrandDeleted, datePreset, customStart, customEnd }) {
  const [insights,       setInsights]       = useState({})
  const [roasTargets,    setRoasTargets]    = useState({})
  const [cpaTargets,     setCpaTargets]     = useState({})
  const [revTargets,     setRevTargets]     = useState({})
  const [editingTarget,  setEditingTarget]  = useState(null)
  const [sortBy,         setSortBy]         = useState("revenue")
  const [sortDir,        setSortDir]        = useState("desc")
  const [connectingBrand,   setConnectingBrand]   = useState(null)
  const [connectingTNBrand, setConnectingTNBrand] = useState(null)
  const [tnInsights,        setTnInsights]        = useState({})
  const [deletingBrand,     setDeletingBrand]     = useState(null)
  const [deleteLoading,     setDeleteLoading]     = useState(false)

  // ── Resolve date range from global filter ──
  const { start: dateStart, end: dateEnd } = getDateRange(datePreset, customStart, customEnd)

  // ── Fetch counter to cancel stale responses ──
  const fetchIdRef = useRef(0)

  // ── Fetch all insights (Meta + TN in parallel) ──
  const fetchAll = useCallback(async () => {
    if (!brands?.length) return

    const myFetchId = ++fetchIdRef.current

    // Mark all as loading
    const loading = {}
    brands.forEach(b => { loading[b.id] = { loading: true } })
    setInsights(loading)
    const tnLoading = {}
    brands.forEach(b => { if (b.tiendanube_connections?.[0]) tnLoading[b.id] = { loading: true } })
    setTnInsights(tnLoading)

    await Promise.all(brands.map(async brand => {
      // Meta
      const metaConn = brand.meta_connections?.[0]
      if (!metaConn?.ad_account_id) {
        if (fetchIdRef.current !== myFetchId) return
        setInsights(p => ({ ...p, [brand.id]: { loading: false, noAccount: true } }))
      } else {
        try {
          const data = await fetchAccountInsights(metaConn.ad_account_id, metaConn.access_token, datePreset, dateStart, dateEnd)
          if (fetchIdRef.current !== myFetchId) return
          setInsights(p => ({ ...p, [brand.id]: { ...data, loading: false } }))
        } catch {
          if (fetchIdRef.current !== myFetchId) return
          setInsights(p => ({ ...p, [brand.id]: { loading: false, error: true } }))
        }
      }

      // TN
      const tnConn = brand.tiendanube_connections?.[0]
      if (tnConn?.store_id && tnConn?.access_token) {
        try {
          const tnData = await fetchStoreRevenue(tnConn.store_id, tnConn.access_token, dateStart, dateEnd)
          if (fetchIdRef.current !== myFetchId) return
          setTnInsights(p => ({ ...p, [brand.id]: { ...tnData, loading: false } }))
        } catch {
          if (fetchIdRef.current !== myFetchId) return
          setTnInsights(p => ({ ...p, [brand.id]: { loading: false, error: true } }))
        }
      }
    }))
  }, [brands, datePreset, dateStart, dateEnd])

  useEffect(() => { fetchAll() }, [fetchAll])

  // ── Helpers ──
  const getRoas = id  => roasTargets[id] ?? DEFAULT_ROAS
  const getCpa  = id  => cpaTargets[id]  ?? null
  const getRev  = id  => revTargets[id]  ?? null

  const calcDelta = (actual, target, invert) => {
    if (!actual || !target) return null
    const d = invert
      ? Math.round((target / actual - 1) * 100)   // CPA: lower = better
      : Math.round((actual / target - 1) * 100)    // ROAS / Revenue: higher = better
    return d
  }

  // ── Sort ──
  const handleSort = col => {
    setSortBy(prev => { if (prev === col) { setSortDir(d => d==="desc"?"asc":"desc"); return prev } setSortDir("desc"); return col })
  }

  const getVal = (ins, id, col) => {
    if (col === "spend")   return ins.spend   || 0
    if (col === "revenue") return ins.revenue || 0
    if (col === "tnRev")   return tnInsights[id]?.revenue || 0
    if (col === "roas")    return ins.roas    || 0
    if (col === "cpa")     return ins.conversions > 0 ? ins.spend / ins.conversions : 0
    if (col === "deltaRoas") return calcDelta(ins.roas, getRoas(id), false) ?? -999
    if (col === "deltaCpa") {
      const cpa = ins.conversions > 0 ? ins.spend / ins.conversions : null
      return calcDelta(cpa, getCpa(id), true) ?? -999
    }
    return 0
  }

  const sortedBrands = [...(brands || [])].sort((a, b) => {
    const ia = insights[a.id] || {}
    const ib = insights[b.id] || {}
    const av = sortBy === "name" ? a.name : getVal(ia, a.id, sortBy)
    const bv = sortBy === "name" ? b.name : getVal(ib, b.id, sortBy)
    if (typeof av === "string") return sortDir==="asc" ? av.localeCompare(bv) : bv.localeCompare(av)
    return sortDir === "asc" ? av - bv : bv - av
  })

  // ── Totals ──
  const loaded = (brands||[]).filter(b => { const i=insights[b.id]; return i&&!i.loading&&!i.error&&!i.noAccount })
  const totals = loaded.reduce((acc,b) => {
    const i  = insights[b.id]
    const tn = tnInsights[b.id]
    acc.spend       += i.spend       || 0
    acc.metaRev     += i.revenue     || 0
    acc.tnRev       += (!tn?.loading && !tn?.error && tn?.revenue) ? tn.revenue : 0
    acc.conversions += i.conversions || 0
    return acc
  }, { spend:0, metaRev:0, tnRev:0, conversions:0 })
  // Use TN revenue for blend when available, otherwise Meta attributed
  const blendRev  = totals.tnRev > 0 ? totals.tnRev : totals.metaRev
  const totalRoas = totals.spend > 0 ? blendRev / totals.spend : 0
  const totalCpa  = totals.conversions > 0 ? totals.spend / totals.conversions : 0

  // ── Delete brand ──
  const handleDelete = async () => {
    if (!deletingBrand) return
    setDeleteLoading(true)
    try {
      await deleteBrand(deletingBrand.id)
      setDeletingBrand(null)
      onBrandDeleted?.()
    } catch (err) {
      alert(`Error al eliminar: ${err.message}`)
    } finally {
      setDeleteLoading(false)
    }
  }

  // ── After TN connect ──
  const handleTNConnected = (brandId, { storeId, storeName }) => {
    setConnectingTNBrand(null)
    const brand = brands.find(b => b.id === brandId)
    if (brand) {
      brand.tiendanube_connections = [{ store_id: storeId, store_name: storeName, access_token: "" }]
      // Note: token is not in local state for security, will reload on next fetchAll
    }
  }

  // ── After Meta connect ──
  const handleConnected = (brandId, account) => {
    setConnectingBrand(null)
    const brand = brands.find(b => b.id === brandId)
    if (brand) {
      brand.meta_connections = [{ ad_account_id: account.id, ad_account_name: account.name }]
      setInsights(p => ({ ...p, [brandId]: { loading: true } }))
      fetchAccountInsights(account.id, null, datePreset)
        .then(data => setInsights(p => ({ ...p, [brandId]: { ...data, loading: false } })))
        .catch(()  => setInsights(p => ({ ...p, [brandId]: { loading: false, error: true } })))
    }
  }

  // ── Column header ──
  const SortIcon = ({ col }) =>
    sortBy !== col
      ? <span style={{ color:"#2c2c3e", marginLeft:"3px" }}>↕</span>
      : <span style={{ color:"#e8ff47", marginLeft:"3px" }}>{sortDir==="desc"?"↓":"↑"}</span>

  const th = (label, col, opts={}) => (
    <th
      onClick={col ? () => handleSort(col) : undefined}
      style={{
        fontFamily:"monospace", fontSize:"10px", letterSpacing:"0.07em",
        color: sortBy===col ? "#e8ff47" : "#5a5a78",
        textAlign:"left", padding:"11px 14px",
        borderBottom:"1px solid #1c1c2e",
        cursor: col ? "pointer" : "default",
        userSelect:"none", whiteSpace:"nowrap",
        ...opts
      }}
    >
      {label}{col && <SortIcon col={col} />}
    </th>
  )

  const tdBase = { padding:"13px 14px", borderBottom:"1px solid #0e0e1a" }

  // ── Source badge ──
  const SourceBadge = ({ ok, label }) => (
    <span style={{
      fontFamily:"monospace", fontSize:"9px", padding:"2px 5px",
      borderRadius:"3px", fontWeight:"700",
      background: ok ? "rgba(71,255,200,0.1)" : "rgba(90,90,120,0.15)",
      color: ok ? "#47ffc8" : "#3a3a5a",
      border: `1px solid ${ok ? "rgba(71,255,200,0.2)" : "#1c1c2e"}`
    }}>{label}</span>
  )

  return (
    <div>
      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
      `}</style>

      {/* ── Header ── */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"20px" }}>
        <div>
          <div style={{ fontSize:"22px", fontWeight:"800", letterSpacing:"-0.02em" }}>📊 Seguimiento de Clientes</div>
          <div style={{ fontFamily:"monospace", fontSize:"11px", color:"#5a5a78", marginTop:"3px" }}>
            {brands?.length||0} clientes · {dateStart} → {dateEnd}
            {loaded.length < (brands?.length||0) &&
              <span style={{ color:"#e8ff47", marginLeft:"8px" }}>· Cargando {(brands?.length||0)-loaded.length} cuentas...</span>}
          </div>
        </div>
        <button onClick={onNewClient} style={{
          padding:"6px 14px", background:"#e8ff47", color:"#000",
          border:"none", borderRadius:"6px", fontSize:"12px", fontWeight:"700",
          cursor:"pointer"
        }}>+ Nuevo cliente</button>
      </div>

      {/* ── KPI cards ── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:"12px", marginBottom:"20px" }}>
        {[
          { label:"GASTO TOTAL",    value: formatARS(totals.spend),                           color:"#ff6b47" },
          { label: totals.tnRev > 0 ? "FAC. REAL (TN)" : "FAC. META",
            value: formatARS(totals.tnRev > 0 ? totals.tnRev : totals.metaRev), color:"#e8ff47" },
          { label:"ROAS BLEND",     value: totalRoas ? `${totalRoas.toFixed(2)}x` : "—",      color:"#47ffc8" },
          { label:"CPA PROMEDIO",   value: formatARS(totalCpa),                               color:"#c47bff" },
          { label:"CONVERSIONES",   value: totals.conversions ? totals.conversions.toLocaleString("es-AR") : "—", color:"#6699ff" },
        ].map((k,i) => (
          <div key={i} style={{
            background:"#13131f", border:"1px solid #1c1c2e",
            borderTop:`2px solid ${k.color}`, borderRadius:"8px", padding:"14px 16px"
          }}>
            <div style={{ fontFamily:"monospace", fontSize:"10px", color:"#5a5a78", marginBottom:"6px" }}>{k.label}</div>
            <div style={{ fontSize:"20px", fontWeight:"800", letterSpacing:"-0.03em", color:k.color }}>
              {loaded.length===0 ? <Skeleton /> : k.value}
            </div>
          </div>
        ))}
      </div>

      {/* ── Table ── */}
      <div style={{ background:"#0e0e1a", border:"1px solid #1c1c2e", borderRadius:"10px", overflowX:"auto" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", minWidth:"1100px" }}>
          <thead>
            <tr style={{ background:"#13131f" }}>
              {th("CLIENTE", null, { minWidth:"200px" })}
              {th("FUENTES", null)}
              {th("GASTO",       "spend")}
              {th("FAC. META",   "revenue")}
              {th("FAC. REAL",  "tnRev")}
              {th("OBJ FAC.",    null)}
              {th("% FAC.",      null)}
              {th("ROAS",        "roas")}
              {th("OBJ ROAS",    null)}
              {th("% ROAS",      "deltaRoas")}
              {th("CPA",         "cpa")}
              {th("OBJ CPA",     null)}
              {th("% CPA",       "deltaCpa")}
              {th("",            null)}
            </tr>
          </thead>
          <tbody>
            {sortedBrands.map(brand => {
              const ins    = insights[brand.id] || {}
              const hasMeta = !!brand.meta_connections?.[0]?.ad_account_id
              const hasTN   = !!brand.tiendanube_connections?.[0]
              const color  = brand.color || "#e8ff47"

              const cpa = !ins.loading && ins.conversions > 0 ? ins.spend / ins.conversions : null
              const tn  = tnInsights[brand.id]
              const tnRev = tn && !tn.loading && !tn.error ? tn.revenue : null
              // Use TN revenue for blend ROAS when available
              const blendRoas = tnRev && ins.spend ? tnRev / ins.spend : ins.roas

              const deltaRoas = calcDelta(blendRoas, getRoas(brand.id), false)
              const deltaCpa  = calcDelta(cpa,      getCpa(brand.id),  true)
              const deltaRev  = calcDelta(ins.revenue, getRev(brand.id), false)

              const empty = ins.loading ? <Skeleton />
                          : (ins.noAccount||ins.error) ? <span style={{ color:"#2c2c3e", fontFamily:"monospace" }}>—</span>
                          : null

              return (
                <tr key={brand.id}
                  style={{ borderBottom:"1px solid #1c1c2e", cursor:"pointer", transition:"background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background="#13131f"}
                  onMouseLeave={e => e.currentTarget.style.background="transparent"}
                  onClick={() => onSelectBrand(brand)}
                >
                  {/* CLIENTE */}
                  <td style={tdBase}>
                    <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                      <div style={{
                        width:"32px", height:"32px", borderRadius:"8px", flexShrink:0,
                        background:`${color}15`, border:`1px solid ${color}30`,
                        display:"flex", alignItems:"center", justifyContent:"center", fontSize:"16px"
                      }}>{brand.emoji||"🚀"}</div>
                      <div style={{ fontWeight:"700", fontSize:"13px" }}>{brand.name}</div>
                    </div>
                  </td>

                  {/* FUENTES */}
                  <td style={tdBase}>
                    <div style={{ display:"flex", flexDirection:"column", gap:"4px" }}>
                      {hasMeta
                        ? <SourceBadge ok label="META ✓" />
                        : <button onClick={e=>{e.stopPropagation();setConnectingBrand(brand)}} style={{
                            padding:"2px 6px", fontSize:"9px", background:"rgba(232,255,71,0.07)",
                            border:"1px solid rgba(232,255,71,0.2)", borderRadius:"3px",
                            color:"#e8ff47", cursor:"pointer", fontFamily:"monospace", fontWeight:"700"
                          }}>+ Meta</button>
                      }
                      {hasTN
                        ? <SourceBadge ok label="TN ✓" />
                        : <button onClick={e=>{e.stopPropagation();setConnectingTNBrand(brand)}} style={{
                            padding:"2px 6px", fontSize:"9px", background:"rgba(71,255,200,0.07)",
                            border:"1px solid rgba(71,255,200,0.2)", borderRadius:"3px",
                            color:"#47ffc8", cursor:"pointer", fontFamily:"monospace", fontWeight:"700"
                          }}>+ TN</button>
                      }
                    </div>
                  </td>

                  {/* GASTO */}
                  <td style={{ ...tdBase, fontFamily:"monospace", fontSize:"12px" }}>
                    {empty || formatARS(ins.spend)}
                  </td>

                  {/* FAC META */}
                  <td style={{ ...tdBase, fontFamily:"monospace", fontSize:"12px", color:"#8888aa" }}>
                    {empty || formatARS(ins.revenue)}
                  </td>

                  {/* FAC REAL (TN) */}
                  <td style={{ ...tdBase, fontFamily:"monospace", fontSize:"12px", fontWeight:"700" }}>
                    {!hasTN ? (
                      <span style={{ color:"#2c2c3e" }}>—</span>
                    ) : tnInsights[brand.id]?.loading ? (
                      <Skeleton />
                    ) : tnInsights[brand.id]?.error ? (
                      <span style={{ color:"#2c2c3e" }}>—</span>
                    ) : (
                      <span style={{ color:"#47ffc8" }}>{formatARS(tnInsights[brand.id]?.revenue)}</span>
                    )}
                  </td>

                  {/* OBJ FAC */}
                  <td style={tdBase} onClick={e=>e.stopPropagation()}>
                    <EditCell brandId={brand.id} field="rev" value={getRev(brand.id)}
                      suffix="$" step={100000} min={0} placeholder="Objetivo ARS"
                      editingTarget={editingTarget} setEditingTarget={setEditingTarget}
                      onSave={v => setRevTargets(p=>({...p,[brand.id]:v}))} />
                  </td>

                  {/* % FAC */}
                  <td style={tdBase}>
                    {ins.loading ? <Skeleton /> : <DeltaBadge delta={deltaRev} />}
                  </td>

                  {/* ROAS (Blend when TN available) */}
                  <td style={tdBase}>
                    {empty || (
                      <div>
                        {blendRoas ? (
                          <span style={{
                            fontFamily:"monospace", fontSize:"12px", fontWeight:"700",
                            color: blendRoas >= getRoas(brand.id) ? "#47ffc8"
                                 : blendRoas >= getRoas(brand.id)*0.8 ? "#e8ff47"
                                 : "#ff6b47"
                          }}>{blendRoas.toFixed(2)}x</span>
                        ) : (
                          <span style={{ color:"#2c2c3e" }}>—</span>
                        )}
                        {tnRev && <div style={{ fontFamily:"monospace", fontSize:"9px", color:"#47ffc8", marginTop:"1px" }}>blend ✓</div>}
                      </div>
                    )}
                  </td>

                  {/* OBJ ROAS */}
                  <td style={tdBase} onClick={e=>e.stopPropagation()}>
                    <EditCell brandId={brand.id} field="roas" value={getRoas(brand.id)}
                      suffix="x" step={0.5} min={0.5}
                      editingTarget={editingTarget} setEditingTarget={setEditingTarget}
                      onSave={v => setRoasTargets(p=>({...p,[brand.id]:v}))} />
                  </td>

                  {/* % ROAS */}
                  <td style={tdBase}>
                    {ins.loading ? <Skeleton /> : (blendRoas ? <DeltaBadge delta={deltaRoas} /> : <span style={{ color:"#2c2c3e" }}>—</span>)}
                  </td>

                  {/* CPA */}
                  <td style={{ ...tdBase, fontFamily:"monospace", fontSize:"12px" }}>
                    {empty || (cpa ? formatARS(cpa) : <span style={{ color:"#2c2c3e" }}>—</span>)}
                  </td>

                  {/* OBJ CPA */}
                  <td style={tdBase} onClick={e=>e.stopPropagation()}>
                    <EditCell brandId={brand.id} field="cpa" value={getCpa(brand.id)}
                      suffix="$" step={1000} min={0} placeholder="Objetivo ARS"
                      editingTarget={editingTarget} setEditingTarget={setEditingTarget}
                      onSave={v => setCpaTargets(p=>({...p,[brand.id]:v}))} />
                  </td>

                  {/* % CPA */}
                  <td style={tdBase}>
                    {ins.loading ? <Skeleton /> : <DeltaBadge delta={deltaCpa} invertColor />}
                  </td>

                  {/* ACCIONES */}
                  <td style={{ ...tdBase, textAlign:"right", paddingRight:"16px" }}
                    onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => setDeletingBrand(brand)}
                      title="Eliminar cliente"
                      style={{
                        padding:"5px 10px", borderRadius:"6px",
                        background:"rgba(255,59,48,0.08)",
                        border:"1px solid rgba(255,59,48,0.2)",
                        color:"#ff6b47", fontSize:"12px", cursor:"pointer",
                        fontFamily:"monospace", fontWeight:"600",
                        transition:"all 0.15s"
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background="rgba(255,59,48,0.18)"; e.currentTarget.style.borderColor="rgba(255,59,48,0.5)" }}
                      onMouseLeave={e => { e.currentTarget.style.background="rgba(255,59,48,0.08)"; e.currentTarget.style.borderColor="rgba(255,59,48,0.2)" }}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {(!brands||brands.length===0) && (
          <div style={{ padding:"60px", textAlign:"center", color:"#5a5a78" }}>
            <div style={{ fontSize:"32px", marginBottom:"12px" }}>📭</div>
            <div style={{ fontWeight:"700", marginBottom:"6px" }}>No hay clientes todavía</div>
            <div style={{ fontFamily:"monospace", fontSize:"12px" }}>Agregá tu primer cliente para empezar a trackear</div>
          </div>
        )}
      </div>

      <div style={{ fontFamily:"monospace", fontSize:"10px", color:"#2c2c3e", marginTop:"10px", textAlign:"right" }}>
        Hacé click en OBJ ROAS · OBJ FAC · OBJ CPA para editarlos · Click en fila para ver detalle del cliente
      </div>

      {connectingTNBrand && (
        <ConnectTNModal
          brand={connectingTNBrand}
          onClose={() => setConnectingTNBrand(null)}
          onConnected={handleTNConnected}
        />
      )}

      {connectingBrand && (
        <ConnectMetaModal
          brand={connectingBrand}
          onClose={() => setConnectingBrand(null)}
          onConnected={handleConnected}
        />
      )}

      {/* Delete confirmation modal */}
      {deletingBrand && (
        <div style={{
          position:"fixed", inset:0, background:"rgba(0,0,0,0.85)",
          display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000
        }} onClick={e => { if(e.target===e.currentTarget) setDeletingBrand(null) }}>
          <div style={{
            background:"#13131f", border:"1px solid #2c1c1c",
            borderRadius:"12px", padding:"28px", width:"380px",
            boxShadow:"0 24px 60px rgba(0,0,0,0.6)"
          }}>
            <div style={{ fontSize:"32px", marginBottom:"12px" }}>⚠️</div>
            <div style={{ fontSize:"17px", fontWeight:"800", marginBottom:"8px" }}>
              Eliminar "{deletingBrand.name}"
            </div>
            <div style={{ fontFamily:"monospace", fontSize:"12px", color:"#5a5a78", marginBottom:"24px", lineHeight:1.6 }}>
              Se eliminará el proyecto y todas sus conexiones (Meta, Tienda Nube).<br/>
              <strong style={{ color:"#ff6b47" }}>Esta acción no se puede deshacer.</strong>
            </div>
            <div style={{ display:"flex", gap:"10px" }}>
              <button
                onClick={() => setDeletingBrand(null)}
                style={{
                  flex:1, padding:"10px", background:"transparent",
                  border:"1px solid #1c1c2e", borderRadius:"8px",
                  color:"#5a5a78", fontSize:"13px", cursor:"pointer"
                }}
              >Cancelar</button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                style={{
                  flex:1, padding:"10px",
                  background: deleteLoading ? "#1c1c2e" : "#ff3b30",
                  border:"none", borderRadius:"8px",
                  color:"#fff", fontSize:"13px", fontWeight:"700",
                  cursor: deleteLoading ? "not-allowed" : "pointer"
                }}
              >{deleteLoading ? "Eliminando..." : "Sí, eliminar"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
