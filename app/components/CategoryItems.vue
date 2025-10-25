<script setup lang="ts">
import type { Props, Item } from '@/types/index'
import { useItems } from '@/composables/useItems'

const props = defineProps<Props>()
const uploading = ref(false)
const image = ref<File | null>(null)
const modalsOpen = ref(false)
const modalsImgOpen = ref(false)
const collapseOpen = ref(true)
const selectedItem = ref<Item | null>(null)
const localItems = ref<Item[]>([])

localItems.value = props.items

const { uploadFile, loading, createItem, fetchItems, deleteItem, items, } = useItems()

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

async function handleDelete() {
    if (!selectedItem.value) return
    try {
        uploading.value = true
        await deleteItem(selectedItem.value.id)
        await updateItems()
        modalsImgOpen.value = false
        selectedItem.value = null
    } catch (err) {
        console.error('Ошибка при удалении item:', err)
    } finally {
        uploading.value = false
    }
}

const openModal = () => {
    modalsOpen.value = true
};

const openImgModal = (item: Item) => {
    selectedItem.value = item
    modalsImgOpen.value = !modalsImgOpen.value
};

const openCollapse = () => {
    collapseOpen.value = !collapseOpen.value
};
</script>

<template>
    <div>
        <USeparator :label="props.label" type="dashed" class="mt-4 mb-4 cursor-pointer" @click="openCollapse"/>
        <UCollapsible class="flex flex-col gap-2 w-full" v-model:open="collapseOpen">
            <template #content>
                <div>
                    <div class="l-items l-max-4 gap-4 mt-4">
                        <div class="h-full flex flex-col justify-center items-center">
                            <UModal v-model:open="modalsOpen" title="Загрузить изображение">
                                <div class="l-card h-full w-full flex justify-center items-center cursor-pointer min-h-[100px]"
                                    @click="openModal">
                                    <UIcon name="ant-design:cloud-upload-outlined" size="large" class="w-[40px] h-[40px]">
                                    </UIcon>
                                </div>
                                <template #body>
                                    <UFileUpload label="Drop your image here" class="w-full h-[200px] cursor-pointer"
                                        v-model="image" />
                                    <UButton :loading="uploading" :disabled="!image" class="mt-4 w-full cursor-pointer"
                                        label="Upload" color="primary" @click="handleUpload()">
                                        Upload
                                    </UButton>
                                </template>
                            </UModal>
                        </div>

                        <template v-if="props.loading">
                            <div class="grid grid-cols-2 gap-4 w-full">
                                <div class="l-card h-full w-full" v-for="n in 2" :key="n">
                                    <USkeleton class="h-[100px] w-full" style="border-radius: 0;" />
                                </div>
                            </div>
                        </template>
                        <UCarousel 
                            v-else 
                            v-slot="{ item }" 
                            :items="localItems" 
                            :ui="{ 
                                item: 'basis-1/2',
                            }"
                            :loading="loading" 
                            class="w-full mx-auto"
                        >
                            <div class="l-card" @click="openImgModal(item)">
                                <img :src="item.image_url" alt="" class="h-[100px] w-full object-cover" />
                            </div>
                        </UCarousel>
                    </div>

                    <UModal v-model:open="modalsImgOpen" title="Посмотреть изображение">
                        <template #body>
                            <div v-if="selectedItem" class="flex flex-col items-center">
                                <img :src="selectedItem.image_url" alt="" class="max-h-[500px] w-full object-contain" />
                                <UButton :loading="uploading" class="mt-4 w-full cursor-pointer" label="Удалить изображение"
                                    @click="handleDelete" color="error">
                                    Delete image
                                </UButton>
                            </div>
                        </template>
                    </UModal>

                </div>
            </template>
        </UCollapsible>

    </div>
</template>

<style scoped>
.l-items {
    display: grid;
    grid-template-columns: 1fr 2fr;
}

.l-card {
    border: 1px solid var(--ui-border);
    /* border-radius: 8px; */
    padding: 8px;
    background-color: var(--ui-bg-secondary);
    box-shadow: var(--ui-box-shadow);
    position: relative;
    cursor: pointer;
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
