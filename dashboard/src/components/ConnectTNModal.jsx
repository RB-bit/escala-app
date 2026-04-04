import { useState, useEffect, useRef } from "react"
import { exchangeTNCode, fetchStoreInfo } from "../lib/tnService"
import { saveTNConnection } from "../lib/brandsService"

const TN_APP_ID = import.meta.env.VITE_TN_APP_ID || '27024'
const TN_AUTHORIZE_URL = `https://www.tiendanube.com/apps/${TN_APP_ID}/authorize`

// status: 'idle' | 'waiting' | 'exchanging' | 'verified' | 'saving' | 'error'

export default function ConnectTNModal({ brand, onClose, onConnected }) {
  const [status,    setStatus]    = useState('idle')
  const [storeInfo, setStoreInfo] = useState(null) // { storeName, storeId, accessToken }
  const [error,     setError]     = useState(null)

  const popupRef    = useRef(null)
  const listenerRef = useRef(null)
  const statusRef   = useRef('idle')

  const updateStatus = (s) => { setStatus(s); statusRef.current = s }

  const brandColor = brand.color || '#e8ff47'

  // ── Open TN OAuth popup ──
  const handleConnect = () => {
    setError(null)
    updateStatus('waiting')

    const popup = window.open(
      TN_AUTHORIZE_URL,
      'tn_oauth',
      'width=540,height=720,scrollbars=yes,resizable=yes'
    )
    popupRef.current = popup

    if (!popup) {
      setError('No se pudo abrir la ventana de autorización. Permitý los popups para este sitio.')
      updateStatus('error')
      return
    }

    // Listen for postMessage from /auth/callback
    const handleMessage = async (e) => {
      if (e.origin !== window.location.origin) return
      if (e.data?.type !== 'TN_OAUTH_CALLBACK') return

      window.removeEventListener('message', handleMessage)
      listenerRef.current = null

      if (e.data.error) {
        setError(`Autorización rechazada: ${e.data.error}`)
        updateStatus('error')
        return
      }
      if (!e.data.code) {
        setError('No se recibió el código de autorización.')
        updateStatus('error')
        return
      }

      updateStatus('exchanging')
      try {
        const { access_token, user_id } = await exchangeTNCode(e.data.code)
        const storeId = String(user_id)
        const info = { storeName: `Tienda ${storeId}`, storeId, accessToken: access_token }
        setStoreInfo(info)
        // Auto-guardar sin requerir segundo click
        updateStatus('saving')
        await saveTNConnection(brand.id, {
          storeId:     info.storeId,
          accessToken: info.accessToken,
          storeName:   info.storeName,
        })
        onConnected(brand.id, { storeId: info.storeId, storeName: info.storeName })
      } catch (err) {
        setError(err.message)
        updateStatus('error')
      }
    }

    window.addEventListener('message', handleMessage)
    listenerRef.current = handleMessage

    // Detect if user closes the popup manually
    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkClosed)
        if (listenerRef.current) {
          window.removeEventListener('message', listenerRef.current)
          listenerRef.current = null
        }
        if (statusRef.current === 'waiting') {
          updateStatus('idle')
        }
      }
    }, 600)
  }

  // ── Save to Supabase ──
  const handleSave = async () => {
    if (!storeInfo) return
    updateStatus('saving')
    try {
      await saveTNConnection(brand.id, {
        storeId:     storeInfo.storeId,
        accessToken: storeInfo.accessToken,
        storeName:   storeInfo.storeName,
      })
      onConnected(brand.id, { storeId: storeInfo.storeId, storeName: storeInfo.storeName })
    } catch (err) {
      setError(err.message)
      updateStatus('error')
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (listenerRef.current) window.removeEventListener('message', listenerRef.current)
      if (popupRef.current && !popupRef.current.closed) popupRef.current.close()
    }
  }, [])

  // ── Styles ──
  const s = {
    overlay: {
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    },
    modal: {
      background: '#13131f', border: '1px solid #1c1c2e', borderRadius: '14px',
      padding: '28px', width: '420px',
      boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
      display: 'flex', flexDirection: 'column', gap: '20px',
    },
    btnPrimary: (disabled) => ({
      flex: 2, padding: '12px', background: disabled ? '#1c1c2e' : '#e8ff47',
      border: 'none', borderRadius: '8px',
      color: disabled ? '#5a5a78' : '#000',
      fontSize: '13px', fontWeight: '800',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all .15s',
    }),
    btnSecondary: {
      flex: 1, padding: '12px', background: 'transparent',
      border: '1px solid #1c1c2e', borderRadius: '8px',
      color: '#5a5a78', fontSize: '13px', cursor: 'pointer',
    },
  }

  const isLoading = status === 'waiting' || status === 'exchanging' || status === 'saving'

  return (
    <div style={s.overlay} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={s.modal}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '20px' }}>🛍️</span>
              <span style={{ fontSize: '17px', fontWeight: '800' }}>Conectar Tienda Nube</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '18px', height: '18px', borderRadius: '4px',
                background: `${brandColor}18`, border: `1px solid ${brandColor}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px',
              }}>{brand.emoji || '🚀'}</div>
              <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#5a5a78' }}>{brand.name}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#5a5a78', fontSize: '20px', cursor: 'pointer' }}>×</button>
        </div>

        {/* Status area */}
        {status === 'idle' && (
          <div style={{
            background: 'rgba(232,255,71,0.04)', border: '1px solid rgba(232,255,71,0.12)',
            borderRadius: '10px', padding: '16px',
            fontFamily: 'monospace', fontSize: '12px', color: '#8a8a6a', lineHeight: 1.8,
          }}>
            <strong style={{ color: '#e8ff47' }}>¿Cómo funciona?</strong><br />
            Hacé click en el botón → se abre una ventana de Tienda Nube → autorizás ESCALA → listo.<br />
            <span style={{ color: '#5a5a78' }}>No hace falta copiar tokens manualmente.</span>
          </div>
        )}

        {status === 'waiting' && (
          <div style={{
            background: 'rgba(232,255,71,0.04)', border: '1px solid rgba(232,255,71,0.2)',
            borderRadius: '10px', padding: '20px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '28px', marginBottom: '10px' }}>🪟</div>
            <div style={{ fontWeight: '700', fontSize: '14px', marginBottom: '6px' }}>Esperando autorización...</div>
            <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#5a5a78' }}>
              Autorizá ESCALA en la ventana de Tienda Nube que se abrió.
            </div>
          </div>
        )}

        {status === 'exchanging' && (
          <div style={{
            background: 'rgba(71,200,255,0.05)', border: '1px solid rgba(71,200,255,0.15)',
            borderRadius: '10px', padding: '20px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '28px', marginBottom: '10px' }}>⚡</div>
            <div style={{ fontWeight: '700', fontSize: '14px', marginBottom: '6px' }}>Obteniendo credenciales...</div>
            <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#5a5a78' }}>
              Intercambiando código de autorización con Tienda Nube
            </div>
          </div>
        )}

        {status === 'verified' && storeInfo && (
          <div style={{
            background: 'rgba(71,255,200,0.08)', border: '1px solid rgba(71,255,200,0.25)',
            borderRadius: '10px', padding: '16px',
            display: 'flex', alignItems: 'center', gap: '12px',
          }}>
            <span style={{ fontSize: '24px' }}>✅</span>
            <div>
              <div style={{ fontWeight: '800', fontSize: '14px', color: '#47ffc8' }}>{storeInfo.storeName}</div>
              <div style={{ fontFamily: 'monospace', fontSize: '10px', color: '#5a5a78', marginTop: '2px' }}>
                Store ID {storeInfo.storeId} · Conexión verificada
              </div>
            </div>
          </div>
        )}

        {(status === 'error' || error) && (
          <div style={{
            background: 'rgba(255,107,71,0.08)', border: '1px solid rgba(255,107,71,0.25)',
            borderRadius: '8px', padding: '12px 14px',
            fontFamily: 'monospace', fontSize: '11px', color: '#ff6b47', lineHeight: 1.5,
          }}>
            ⚠️ {error}
          </div>
        )}

        {status === 'saving' && (
          <div style={{
            background: 'rgba(232,255,71,0.04)', border: '1px solid rgba(232,255,71,0.12)',
            borderRadius: '8px', padding: '12px 14px',
            fontFamily: 'monospace', fontSize: '11px', color: '#8a8a6a', textAlign: 'center',
          }}>
            Guardando conexión en Supabase...
          </div>
        )}

        {/* Footer buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onClose} style={s.btnSecondary} disabled={isLoading}>
            Cancelar
          </button>

          {status !== 'verified' ? (
            <button
              onClick={handleConnect}
              disabled={isLoading}
              style={s.btnPrimary(isLoading)}
            >
              {status === 'waiting'   ? '⏳ Esperando...'       :
               status === 'exchanging'? '⚡ Conectando...'      :
               status === 'error'     ? '🔄 Reintentar'          :
               '🛍️ Conectar con Tienda Nube'}
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={status === 'saving'}
              style={s.btnPrimary(status === 'saving')}
            >
              {status === 'saving' ? 'Guardando...' : `Guardar "${storeInfo?.storeName}"`}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
