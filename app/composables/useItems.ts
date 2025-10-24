import { ref } from 'vue'
import type { Item } from '@/types/index'

export function useItems() {
    const items = ref<Item[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    const API_BASE = 'http://localhost:8000/api'

    async function fetchItems(): Promise<Item[]> {
        loading.value = true
        error.value = null

        try {
            const res = await fetch(`${API_BASE}/items`)
            if (!res.ok) { 
                throw new Error('Failed to fetch items')
            }
            
            const json = await res.json()
            items.value = json.data
            return items.value
        } catch (err: any) {
            error.value = err.message
            console.error(err)
            return []
        } finally {
            loading.value = false
        }
    }

    async function uploadFile(file: File): Promise<string> {
        const formData = new FormData()
        formData.append('file', file)

        const res = await fetch(`${API_BASE}/upload`, { 
            method: 'POST', 
            body: formData 
        })
        if (!res.ok) {
            throw new Error('File upload failed')
        }

        const data = await res.json()
        return data.url
    }

    async function createItem(item: Partial<Item>) {
        const token = localStorage.getItem('auth_token') || ''
        const res = await fetch(`${API_BASE}/items`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(item),
        })

        if (!res.ok) {
            throw new Error('Failed to create item')
        }

        const newItem: Item = await res.json()
        items.value.push(newItem)
        return newItem
    }

    async function deleteItem(id: string) {
        const token = localStorage.getItem('auth_token') || ''
        const res = await fetch(`${API_BASE}/items/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        })

        if (!res.ok) {
            throw new Error('Failed to delete item')
        }

        items.value = items.value.filter(i => i.id !== id)
        return res
    }

    return { items, loading, error, fetchItems, uploadFile, createItem, deleteItem }
}
