const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { storeId, accessToken, path, params } = await req.json()
    if (!storeId || !accessToken || !path) throw new Error('Faltan parámetros')

    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    const url = `https://api.tiendanube.com/v1/${storeId}/${path}${qs}`

    console.log('TN fetch URL:', url)

    const res = await fetch(url, {
      headers: {
        Authentication: `bearer ${accessToken}`,
        'User-Agent': 'ESCALA (rodrigo@mangotango.com.ar)',
        'Content-Type': 'application/json',
      },
    })

    const text = await res.text()
    console.log('TN status:', res.status, 'body:', text.slice(0, 500))

    if (!res.ok) {
      return new Response(JSON.stringify({ error: `TN API error ${res.status}`, detail: text }), {
        status: 200, // devolvemos 200 para que el cliente pueda leer el body
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(text, {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
