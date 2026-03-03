import { TN_STORE_ID } from "../../data/brands"

export default function TiendaNubeTab({ tnLoading, tnError, tnOrders, tnProducts, tnStore, tnFetched, fetchTiendaNube }) {
    // ── Derived metrics ──
    const totalOrders = tnOrders.length
    const totalRevenue = tnOrders.reduce((s, o) => s + parseFloat(o.total || 0), 0)
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Products with stock
    const productsWithStock = tnProducts.map(p => {
        const allVariants = p.variants || []
        const totalStock = allVariants.reduce((s, v) => s + (parseInt(v.stock, 10) || 0), 0)
        const price = allVariants.length > 0 ? parseFloat(allVariants[0].price) : parseFloat(p.price || 0)
        const isLowStock = totalStock < 5
        return { id: p.id, name: typeof p.name === "object" ? (p.name.es || p.name.pt || Object.values(p.name)[0]) : p.name, price, stock: totalStock, isLowStock }
    })

    // Health score: 0–100
    const lowStockCount = productsWithStock.filter(p => p.isLowStock).length
    const stockRatio = productsWithStock.length > 0 ? 1 - lowStockCount / productsWithStock.length : 1
    const salesVelocity = Math.min(totalOrders / 20, 1) // 20 orders = full score
    const healthScore = Math.round((stockRatio * 60 + salesVelocity * 40) * 100) / 100
    const healthColor = healthScore >= 70 ? "#47ffc8" : healthScore >= 40 ? "#e8ff47" : "#ff6b47"
    const healthLabel = healthScore >= 70 ? "Excelente" : healthScore >= 40 ? "Regular" : "Crítico"

    const fmtARS = (n) => `$${Math.round(n).toLocaleString("es-AR")}`

    return (
        <>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <div style={{ fontSize: "22px", fontWeight: "800", letterSpacing: "-0.02em" }}>🛍️ Tienda Nube</div>
                    <div style={{ fontFamily: "monospace", fontSize: "11px", color: "#5a5a78", marginTop: "2px" }}>
                        {tnStore ? `${tnStore.name || "Mi Tienda"} · ID ${TN_STORE_ID}` : `ID ${TN_STORE_ID}`}
                    </div>
                </div>
                <button
                    onClick={fetchTiendaNube}
                    disabled={tnLoading}
                    style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px", background: "transparent", border: "1px solid #252538", borderRadius: "6px", color: tnLoading ? "#5a5a78" : "#f0f0f8", fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: "12px", cursor: tnLoading ? "wait" : "pointer", transition: "all 0.15s" }}
                >
                    {tnLoading ? "⟳ Actualizando…" : "↻ Actualizar"}
                </button>
            </div>

            {/* Error */}
            {tnError && (
                <div style={{ padding: "14px 18px", background: "rgba(255,107,71,0.08)", border: "1px solid rgba(255,107,71,0.3)", borderRadius: "8px", fontFamily: "monospace", fontSize: "12px", color: "#ff6b47" }}>
                    ⚠ Error al conectar con la API: {tnError}
                </div>
            )}

            {/* Loading skeleton */}
            {tnLoading && !tnFetched && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px" }}>
                    {[0, 1, 2, 3].map(i => (
                        <div key={i} style={{ background: "#13131f", border: "1px solid #1c1c2e", borderRadius: "8px", padding: "16px 18px", height: "80px", animation: "pulse 1.5s ease-in-out infinite" }} />
                    ))}
                </div>
            )}

            {/* ── KPI SUMMARY ── */}
            {(tnFetched || !tnLoading) && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px" }}>
                    {[
                        { label: "ÓRDENES TOTALES", value: tnFetched ? String(totalOrders) : "—", color: "#e8ff47" },
                        { label: "REVENUE TOTAL", value: tnFetched ? fmtARS(totalRevenue) : "—", color: "#47ffc8" },
                        { label: "TICKET PROMEDIO", value: tnFetched ? fmtARS(avgOrderValue) : "—", color: "#c47bff" },
                        { label: "SALUD DE TIENDA", value: tnFetched ? `${Math.round(healthScore)}/100` : "—", color: healthColor },
                    ].map((s, i) => (
                        <div key={i} style={{ background: "#13131f", border: "1px solid #1c1c2e", borderRadius: "8px", padding: "16px 18px", borderTop: `2px solid ${s.color}` }}>
                            <div style={{ fontFamily: "monospace", fontSize: "10px", color: "#5a5a78", marginBottom: "8px" }}>{s.label}</div>
                            <div style={{ fontSize: "26px", fontWeight: "800", letterSpacing: "-0.03em", color: s.color, marginBottom: "4px" }}>
                                {tnLoading && !tnFetched ? <span style={{ opacity: 0.3 }}>…</span> : s.value}
                            </div>
                            {i === 3 && tnFetched && <div style={{ fontFamily: "monospace", fontSize: "11px", color: healthColor }}>{healthLabel}</div>}
                        </div>
                    ))}
                </div>
            )}

            {/* ── HEALTH SCORE BAR ── */}
            {tnFetched && (
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
                            { label: "Stock saludable", value: `${productsWithStock.filter(p => !p.isLowStock).length} productos`, icon: "📦", color: "#47ffc8" },
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
            {tnFetched && productsWithStock.length > 0 && (
                <div style={{ background: "#0e0e1a", border: "1px solid #1c1c2e", borderRadius: "8px", padding: "20px" }}>
                    <div style={{ fontSize: "13px", fontWeight: "700", color: "#f0f0f8", marginBottom: "16px" }}>📦 Productos ({productsWithStock.length})</div>
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr>{["PRODUCTO", "PRECIO", "STOCK", "ESTADO"].map(h => (
                                    <th key={h} style={{ fontFamily: "monospace", fontSize: "10px", letterSpacing: "0.1em", color: "#5a5a78", textAlign: "left", padding: "8px 12px", borderBottom: "1px solid #1c1c2e" }}>{h}</th>
                                ))}</tr>
                            </thead>
                            <tbody>
                                {productsWithStock.slice(0, 20).map((p, i) => (
                                    <tr key={p.id} style={{ background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}>
                                        <td style={{ padding: "11px 12px", fontSize: "13px", fontWeight: "500", borderBottom: "1px solid #1c1c2e", maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</td>
                                        <td style={{ padding: "11px 12px", fontFamily: "monospace", fontSize: "12px", color: "#47ffc8", borderBottom: "1px solid #1c1c2e" }}>{fmtARS(p.price)}</td>
                                        <td style={{ padding: "11px 12px", fontFamily: "monospace", fontSize: "12px", borderBottom: "1px solid #1c1c2e", color: p.isLowStock ? "#ff6b47" : "#f0f0f8" }}>{p.stock}</td>
                                        <td style={{ padding: "11px 12px", borderBottom: "1px solid #1c1c2e" }}>
                                            {p.isLowStock
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
            {tnFetched && tnOrders.length > 0 && (
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
                                {tnOrders.slice(0, 15).map((o, i) => {
                                    const payStatus = o.payment_status || "pending"
                                    const payColor = payStatus === "paid" ? "#47ffc8" : payStatus === "pending" ? "#e8ff47" : "#ff6b47"
                                    const payLabel = payStatus === "paid" ? "✓ PAGADO" : payStatus === "pending" ? "⏳ PENDIENTE" : payStatus.toUpperCase()
                                    const customer = o.customer ? `${o.customer.name || o.customer.email || "—"}` : "—"
                                    const orderDate = o.created_at ? new Date(o.created_at).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—"
                                    return (
                                        <tr key={o.id} style={{ background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}>
                                            <td style={{ padding: "11px 12px", fontFamily: "monospace", fontSize: "12px", color: "#e8ff47", borderBottom: "1px solid #1c1c2e" }}>#{o.number || o.id}</td>
                                            <td style={{ padding: "11px 12px", fontSize: "13px", borderBottom: "1px solid #1c1c2e", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{customer}</td>
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

            {/* Empty state */}
            {tnFetched && tnOrders.length === 0 && !tnLoading && (
                <div style={{ padding: "40px", textAlign: "center", background: "#0e0e1a", border: "1px solid #1c1c2e", borderRadius: "8px" }}>
                    <div style={{ fontSize: "32px", marginBottom: "12px" }}>🛍️</div>
                    <div style={{ fontWeight: "700", marginBottom: "6px" }}>Sin órdenes recientes</div>
                    <div style={{ fontFamily: "monospace", fontSize: "11px", color: "#5a5a78" }}>No se encontraron órdenes en el período seleccionado.</div>
                </div>
            )}
        </>
    )
}
