<script setup lang="ts">
import { ref } from 'vue'
import type { Props } from '@/types/index'
import { useItems } from '@/composables/useItems'

const props = defineProps<Props>()
const uploading = ref(false)

const { uploadFile, createItem } = useItems()

async function handleUpload(file: File | File[] | null) {
    if (!file) return

    const selectedFile = Array.isArray(file) ? file[0] : file
    if (!selectedFile) return

    uploading.value = true
    try {
        const url = await uploadFile(selectedFile)

        const newItem = await createItem({
            image_url: url,
            type: props.type,
        })

        props.items.push(newItem)
    } catch (err) {
        console.error('Ошибка загрузки файла или создания item:', err)
    } finally {
        uploading.value = false
    }
}

</script>

<template>
    <UModal>
        <UFileUpload label="Drop your image here" class="w-full h-full cursor-pointer" @onChange="handleUpload" />
    </UModal>
</template>