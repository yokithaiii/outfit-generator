import { defineEventHandler, readBody, setResponseStatus } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event) as { prompt?: string; reference_images?: string[] }
  const config = useRuntimeConfig()
  const key = config.freepikApiKey

  if (!key) {
    setResponseStatus(event, 500)
    return { error: 'FREEPIK_API_KEY not configured on server' }
  }
  if (!Array.isArray(body?.reference_images) || body.reference_images.length === 0) {
    setResponseStatus(event, 400)
    return { error: 'reference_images required' }
  }

  const url = 'https://api.freepik.com/v1/ai/gemini-2-5-flash-image-preview'
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'x-freepik-api-key': key,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: body.prompt || 'Combine provided images; background #FFFFFF.',
        reference_images: body.reference_images
      })
    })

    const text = await res.text()
    if (!res.ok) {
      setResponseStatus(event, res.status)
      return { error: text }
    }

    // вернём то, что вернул Freepik (например task_id или сразу image)
    try {
      return JSON.parse(text)
    } catch {
      return { result: text }
    }
  } catch (err) {
    setResponseStatus(event, 502)
    return { error: String(err) }
  }
})