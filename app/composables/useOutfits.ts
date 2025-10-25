import { ref } from 'vue'
import type { Item, ItemTypes } from '@/types'

export function useOutfit() {
    const generatedImage = ref<string | null>(null)
    const loading = ref(false)

    const urlToBase64 = async (url: string) => {
        const res = await fetch(url)
        const blob = await res.blob()
        return await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result as string)
            reader.onerror = reject
            reader.readAsDataURL(blob)
        })
    }

    const pollTask = async (taskId: string) => {
        const timeoutMs = 120000
        const intervalMs = 2000
        const started = Date.now()
        while (Date.now() - started < timeoutMs) {
            await new Promise(r => setTimeout(r, intervalMs))
            try {
                const res = await fetch(`/api/generate-outfit/${encodeURIComponent(taskId)}`)
                if (!res.ok) throw new Error(await res.text())
                const data = await res.json()
                const status = data?.data?.status || data?.status
                if (status === 'COMPLETED') {
                    const imageUrl = data?.data?.generated?.[0] || data?.generated?.[0]
                    if (imageUrl) {
                        generatedImage.value = imageUrl
                        return
                    }
                } else if (status === 'FAILED' || status === 'ERROR') {
                    throw new Error('Generation failed')
                }
            } catch (err) {
                console.error(err)
            }
        }
        throw new Error('Polling timed out')
    }

    const generateOutfit = async (model: string, items: Item[]) => {
        if (!model || !items.length) throw new Error('Не выбрана модель или элементы')
        loading.value = true

        try {
            const base64Images = await Promise.all([model, ...items.map(i => i.image_url)].map(urlToBase64))
            const res = await fetch('/api/generate-outfit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: 'Create a new image by combining the selected elements. Fit garments naturally, background white (#FFFFFF).',
                    reference_images: base64Images.map(b64 => b64.split(',')[1])
                })
            })

            const data = await res.json()
            const taskId = data?.task_id || data?.data?.task_id

            if (taskId) {
                await pollTask(taskId)
            } else if (data.image) {
                generatedImage.value = `data:image/png;base64,${data.image}`
            } else {
                throw new Error('No image returned')
            }

        } finally {
            loading.value = false
        }
    }

    return { generatedImage, loading, generateOutfit }
}
