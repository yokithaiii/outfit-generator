<script setup lang="ts">
import type { Props, Item } from '@/types/index'
import { useItems } from '@/composables/useItems'

const props = defineProps<Props>()
const uploading = ref(false)
const image = ref<File | null>(null)
const modalsOpen = ref(false)
const localItems = ref<Item[]>([])

localItems.value = props.items

const { uploadFile, createItem, fetchItems, deleteItem, items } = useItems()

watch(
  () => props.items,
  (newItems) => {
    localItems.value = [...newItems]
  },
  { deep: true }
)

async function updateItems() {
    const updatedItems = await fetchItems()
    localItems.value = updatedItems.filter(i => i.type === props.type)
}

async function handleUpload() {
    if (!image.value) {
        return
    }

    uploading.value = true
    try {
        const url = await uploadFile(image.value)
        const newItem = await createItem({
            image_url: url,
            type: props.type,
        })
        
        await updateItems()
    } catch (err) {
        console.error('Ошибка загрузки файла или создания item:', err)
    } finally {
        uploading.value = false
        modalsOpen.value = false
        image.value = null
    }
}

async function deleteImage(id: string) {
    try {
        await deleteItem(id)
        await updateItems()
    } catch (err) {
        console.error('Ошибка при удалении item:', err)
    }
}

const openModal = () => {
    modalsOpen.value = true
};
</script>

<template>
    <div>
        <USeparator :label="props.label" type="dashed" class="mt-4 mb-4" />

        <div class="l-items l-max-4 gap-4 mt-4">
            <div class="h-full flex flex-col justify-center items-center">
                <UModal v-model:open="modalsOpen" title="Загрузить изображение">
                    <div class="l-card h-full w-full flex justify-center items-center cursor-pointer min-h-[200px]" @click="openModal">
                        <UIcon name="ant-design:cloud-upload-outlined" size="large" class="w-[40px] h-[40px]"></UIcon>
                    </div>
                    <template #body>
                        <UFileUpload label="Drop your image here" class="w-full h-[400px] cursor-pointer" v-model="image" />
                        <UButton :loading="uploading" :disabled="!image" class="mt-4 w-full cursor-pointer" label="Upload" color="primary" @click="handleUpload()">
                            Upload
                        </UButton>
                    </template>
                </UModal>
            </div>

            <UCarousel v-slot="{ item }" :items="localItems" :ui="{ item: 'basis-1/3' }" class="w-full mx-auto">
                <div class="l-card">
                    <img :src="item.image_url" alt="" class="rounded-lg h-[200px] w-full object-cover" />
                    <button class="l-card__delete" @click="deleteImage(item.id)">
                        <UIcon name="ant-design:delete-outlined" size="large" class="w-[40px] h-[40px]"></UIcon>
                    </button>
                </div>
            </UCarousel>
        </div>

    </div>
</template>

<style scoped>
.l-items {
    display: grid;
    grid-template-columns: 200px 1fr;
}

.l-card {
    border: 1px solid var(--ui-border);
    border-radius: 8px;
    padding: 8px;
    background-color: var(--ui-bg-secondary);
    box-shadow: var(--ui-box-shadow);
    position: relative;
}

.l-card__delete {
    display: flex;
    position: absolute;
    top: calc(50% - 40px);
    left: calc(50% - 40px);
    cursor: pointer;
    padding: 20px;
    background-color: #7d03037d;
    border-radius: 50%;
    transition: .3s;
    opacity: 0;
}

.l-card:hover .l-card__delete {
    opacity: 1;
}
</style>
