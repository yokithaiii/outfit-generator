import { defineEventHandler, setResponseStatus } from 'h3'

export default defineEventHandler(async (event) => {
  const params = (event.context as any)?.params || {}
  const taskId = params.taskId
  const config = useRuntimeConfig()
  const key = config.freepikApiKey

  if (!key) {
    setResponseStatus(event, 500)
    return { error: 'FREEPIK_API_KEY not configured on server' }
  }
  if (!taskId) {
    setResponseStatus(event, 400)
    return { error: 'taskId required' }
  }

  const url = `https://api.freepik.com/v1/ai/gemini-2-5-flash-image-preview/${encodeURIComponent(taskId)}`
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'x-freepik-api-key': key,
        'Content-Type': 'application/json'
      }
    })

    const text = await res.text()
    if (!res.ok) {
      setResponseStatus(event, res.status)
      return { error: text }
    }

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