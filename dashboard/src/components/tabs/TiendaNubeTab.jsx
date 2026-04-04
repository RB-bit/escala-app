import { useTiendaNube, formatLastSync } from "../../hooks/useTiendaNube"

export default function TiendaNubeTab({ storeId }) {
    const { orders, products, storeInfo, lastSyncAt, syncStatus, isLoading, error, refetch } = useTiendaNube(storeId)

    // ── Derived metrics ──
    const totalOrders = orders.length
    const totalRevenue = orders.reduce((s, o) => s + parseFloat(o.total || 0), 0)
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Health score: 0–100
    // products ya tienen low_stock calculado por Supabase (columna generada)
    const lowStockCount = products.filter(p => p.low_stock).length
    const stockRatio = products.length > 0 ? 1 - lowStockCount / products.length : 1
    const salesVelocity = Math.min(totalOrders / 20, 1)
    const healthScore = Math.round((stockRatio * 60 + salesVelocity * 40) * 100) / 100
    const healthColor = healthScore >= 70 ? "#47ffc8" : healthScore >= 40 ? "#e8ff47" : "#ff6b47"
    const healthLabel = healthScore >= 70 ? "Excelente" : healthScore >= 40 ? "Regular" : "Crítico"

    const fmtARS = (n) => `$${Math.round(n).toLocaleString("es-AR")}`

    const hasFetched = !isLoading && !error && (orders.length > 0 || products.length > 0 || storeInfo)

    const syncIndicatorColor = syncStatus === 'ok' ? '#47ffc8' : syncStatus === 'error' ? '#ff6b47' : syncStatus === 'syncing' ? '#e8ff47' : '#5a5a78'

    if (!storeId) {
        return (
            <div style={{ padding: "40px", textAlign: "center", background: "#0e0e1a", border: "1px solid #1c1c2e", borderRadius: "8px" }}>
                <div style={{ fontSize: "32px", marginBottom: "12px" }}>🔗</div>
                <div style={{ fontWeight: "700", marginBottom: "6px" }}>Ninguna tienda conectada</div>
                <div style={{ fontFamily: "monospace", fontSize: "11px", color: "#5a5a78" }}>
                    Esta marca no tiene una Tienda Nube configurada. Agregá el tn_store_id en la tabla stores de Supabase.
                </div>
            </div>
        )
    }

    return (
        <>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <div style={{ fontSize: "22px", fontWeight: "800", letterSpacing: "-0.02em" }}>🛍️ Tienda Nube</div>
                    <div style={{ fontFamily: "monospace", fontSize: "11px", color: "#5a5a78", marginTop: "2px" }}>
                        {storeInfo?.tn_store_name || `ID ${storeId}`}
                        <span style={{ marginLeft: "10px", color: syncIndicatorColor }}>
                            ● {formatLastSync(lastSyncAt)}
                        </span>
                    </div>
                </div>
                <button
                    onClick={refetch}
                    disabled={isLoading}
                    style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px", background: "transparent", border: "1px solid #252538", borderRadius: "6px", color: isLoading ? "#5a5a78" : "#f0f0f8", fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: "12px", cursor: isLoading ? "wait" : "pointer", transition: "all 0.15s" }}
                >
                    {isLoading ? "⟳ Cargando…" : "↻ Actualizar"}
                </button>
            </div>

            {/* Error */}
            {error && (
                <div style={{ padding: "14px 18px", background: "rgba(255,107,71,0.08)", border: "1px solid rgba(255,107,71,0.3)", borderRadius: "8px", fontFamily: "monospace", fontSize: "12px", color: "#ff6b47" }}>
                    ⚠ Error al cargar datos: {error}
                </div>
            )}

            {/* Loading skeleton */}
            {isLoading && !hasFetched && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px" }}>
                    {[0, 1, 2, 3].map(i => (
                        <div key={i} style={{ background: "#13131f", border: "1px solid #1c1c2e", borderRadius: "8px", padding: "16px 18px", height: "80px", animation: "pulse 1.5s ease-in-out infinite" }} />
                    ))}
                </div>
            )}

            {/* ── KPI SUMMARY ── */}
            {(hasFetched || !isLoading) && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px" }}>
                    {[
                        { label: "ÓRDENES TOTALES", value: hasFetched ? String(totalOrders) : "—", color: "#e8ff47" },
                        { label: "REVENUE TOTAL", value: hasFetched ? fmtARS(totalRevenue) : "—", color: "#47ffc8" },
                        { label: "TICKET PROMEDIO", value: hasFetched ? fmtARS(avgOrderValue) : "—", color: "#c47bff" },
                        { label: "SALUD DE TIENDA", value: hasFetched ? `${Math.round(healthScore)}/100` : "—", color: healthColor },
                    ].map((s, i) => (
                        <div key={i} style={{ background: "#13131f", border: "1px solid #1c1c2e", borderRadius: "8px", padding: "16px 18px", borderTop: `2px solid ${s.color}` }}>
                            <div style={{ fontFamily: "monospace", fontSize: "10px", color: "#5a5a78", marginBottom: "8px" }}>{s.label}</div>
                            <div style={{ fontSize: "26px", fontWeight: "800", letterSpacing: "-0.03em", color: s.color, marginBottom: "4px" }}>
                                {isLoading && !hasFetched ? <span style={{ opacity: 0.3 }}>…</span> : s.value}
                            </div>
                            {i === 3 && hasFetched && <div style={{ fontFamily: "monospace", fontSize: "11px", color: healthColor }}>{healthLabel}</div>}
                        </div>
                    ))}
                </div>
            )}

            {/* ── HEALTH SCORE BAR ── */}
            {hasFetched && (
                <div style={{ background: "#0e0e1a", border: "1px solid #1c1c2e", borderRadius: "8px", padding: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                        <div style={{ fontSize: "13px", fontWeight: "700", color: "#f0f0f8" }}>📊 Score de Salud de Tienda</div>
                        <div style={{ fontFamily: "monospace", fontSize: "24px", fontWeight: "800", color: healthColor }}>{Math.round(healthScore)}<span style={{ fontSize: "14px", color: "#5a5a78" }}>/100</span></div>
                    </div>
                    <div style={{ height: "10px", background: "#13131f", borderRadius: "5px", overflow: "hidden", marginBottom: "12px" }}>
                        <div style={{ height: "100%", width: `${healthScore}%`, background: `linear-gradient(90deg, ${healthColor}80, ${healthColor})`, borderRadius: "5px", transition: "width 0.6s ease" }} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                        {[
                            { label: "Stock saludable", value: `${products.filter(p => !p.low_stock).length} productos`, icon: "📦", color: "#47ffc8" },
                            { label: "Stock bajo (<5)", value: `${lowStockCount} productos`, icon: "⚠️", color: "#ff6b47" },
                            { label: "Velocidad de ventas", value: `${totalOrders} órdenes recientes`, icon: "🚀", color: "#c47bff" },
                        ].map((item, i) => (
                            <div key={i} style={{ padding: "12px", background: "#13131f", borderRadius: "6px", border: `1px solid ${item.color}20` }}>
                                <div style={{ fontSize: "18px", marginBottom: "4px" }}>{item.icon}</div>
                                <div style={{ fontFamily: "monospace", fontSize: "10px", color: "#5a5a78", marginBottom: "4px" }}>{item.label}</div>
                                <div style={{ fontSize: "14px", fontWeight: "700", color: item.color }}>{item.value}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── PRODUCTS TABLE ── */}
            {hasFetched && products.length > 0 && (
                <div style={{ background: "#0e0e1a", border: "1px solid #1c1c2e", borderRadius: "8px", padding: "20px" }}>
                    <div style={{ fontSize: "13px", fontWeight: "700", color: "#f0f0f8", marginBottom: "16px" }}>📦 Productos ({products.length})</div>
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr>{["PRODUCTO", "PRECIO", "STOCK", "ESTADO"].map(h => (
                                    <th key={h} style={{ fontFamily: "monospace", fontSize: "10px", letterSpacing: "0.1em", color: "#5a5a78", textAlign: "left", padding: "8px 12px", borderBottom: "1px solid #1c1c2e" }}>{h}</th>
                                ))}</tr>
                            </thead>
                            <tbody>
                                {products.slice(0, 20).map((p, i) => (
                                    <tr key={p.tn_product_id} style={{ background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}>
                                        <td style={{ padding: "11px 12px", fontSize: "13px", fontWeight: "500", borderBottom: "1px solid #1c1c2e", maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</td>
                                        <td style={{ padding: "11px 12px", fontFamily: "monospace", fontSize: "12px", color: "#47ffc8", borderBottom: "1px solid #1c1c2e" }}>{fmtARS(p.price)}</td>
                                        <td style={{ padding: "11px 12px", fontFamily: "monospace", fontSize: "12px", borderBottom: "1px solid #1c1c2e", color: p.low_stock ? "#ff6b47" : "#f0f0f8" }}>{p.total_stock}</td>
                                        <td style={{ padding: "11px 12px", borderBottom: "1px solid #1c1c2e" }}>
                                            {p.low_stock
                                                ? <span style={{ fontFamily: "monospace", fontSize: "10px", padding: "3px 8px", borderRadius: "3px", background: "rgba(255,107,71,0.15)", color: "#ff6b47" }}>⚠ STOCK BAJO</span>
                                                : <span style={{ fontFamily: "monospace", fontSize: "10px", padding: "3px 8px", borderRadius: "3px", background: "rgba(71,255,200,0.1)", color: "#47ffc8" }}>✓ OK</span>
                                            }
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ── ORDERS TABLE ── */}
            {hasFetched && orders.length > 0 && (
                <div style={{ background: "#0e0e1a", border: "1px solid #1c1c2e", borderRadius: "8px", padding: "20px" }}>
                    <div style={{ fontSize: "13px", fontWeight: "700", color: "#f0f0f8", marginBottom: "16px" }}>🧾 Órdenes Recientes ({totalOrders})</div>
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr>{["N° ORDEN", "CLIENTE", "TOTAL", "PAGO", "FECHA"].map(h => (
                                    <th key={h} style={{ fontFamily: "monospace", fontSize: "10px", letterSpacing: "0.1em", color: "#5a5a78", textAlign: "left", padding: "8px 12px", borderBottom: "1px solid #1c1c2e" }}>{h}</th>
                                ))}</tr>
                            </thead>
                            <tbody>
                                {orders.slice(0, 15).map((o, i) => {
                                    const payStatus = o.payment_status || "pending"
                                    const payColor = payStatus === "paid" ? "#47ffc8" : payStatus === "pending" ? "#e8ff47" : "#ff6b47"
                                    const payLabel = payStatus === "paid" ? "✓ PAGADO" : payStatus === "pending" ? "⏳ PENDIENTE" : payStatus.toUpperCase()
                                    const orderDate = o.tn_created_at ? new Date(o.tn_created_at).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—"
                                    return (
                                        <tr key={o.tn_order_id} style={{ background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}>
                                            <td style={{ padding: "11px 12px", fontFamily: "monospace", fontSize: "12px", color: "#e8ff47", borderBottom: "1px solid #1c1c2e" }}>#{o.order_number || o.tn_order_id}</td>
                                            <td style={{ padding: "11px 12px", fontSize: "13px", borderBottom: "1px solid #1c1c2e", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.customer_name || o.customer_email || "—"}</td>
                                            <td style={{ padding: "11px 12px", fontFamily: "monospace", fontSize: "12px", color: "#47ffc8", borderBottom: "1px solid #1c1c2e" }}>{fmtARS(parseFloat(o.total || 0))}</td>
                                            <td style={{ padding: "11px 12px", borderBottom: "1px solid #1c1c2e" }}>
                                                <span style={{ fontFamily: "monospace", fontSize: "10px", padding: "3px 8px", borderRadius: "3px", background: `${payColor}18`, color: payColor }}>{payLabel}</span>
                                            </td>
                                            <td style={{ padding: "11px 12px", fontFamily: "monospace", fontSize: "11px", color: "#5a5a78", borderBottom: "1px solid #1c1c2e" }}>{orderDate}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Empty state: tienda sin datos aún (sync pendiente) */}
            {!isLoading && !error && orders.length === 0 && products.length === 0 && (
                <div style={{ padding: "40px", textAlign: "center", background: "#0e0e1a", border: "1px solid #1c1c2e", borderRadius: "8px" }}>
                    <div style={{ fontSize: "32px", marginBottom: "12px" }}>⏳</div>
                    <div style={{ fontWeight: "700", marginBottom: "6px" }}>Esperando primera sincronización</div>
                    <div style={{ fontFamily: "monospace", fontSize: "11px", color: "#5a5a78", marginBottom: "12px" }}>
                        Corré <code style={{ background: "#13131f", padding: "2px 6px", borderRadius: "3px" }}>node worker.js --full</code> en /sync para cargar los datos iniciales.
                    </div>
                    <div style={{ fontFamily: "monospace", fontSize: "10px", color: "#5a5a78" }}>
                        Store ID: {storeId} · Status: {syncStatus || 'pending'}
                    </div>
                </div>
            )}
        </>
    )
}
