import { ref, computed } from 'vue'
import type { Item, ItemTypes } from '@/types'

export function useCategorySelection(items: Ref<Item[] | null>) {
    const categoryLabels: Record<ItemTypes, string> = {
        head: 'Head',
        top: 'Tops',
        outwear: 'Outerwear',
        bottom: 'Bottoms',
        foot: 'Shoes',
        full: 'Fulls',
        bag: 'Bags',
        jewelry: 'Jewelry',
        accessory: 'Accessories',
    }

    const categorizedItems = computed(() => {
        const map: Record<ItemTypes, Item[]> = {
            head: [], top: [], outwear: [], bottom: [], foot: [], full: [], bag: [], jewelry: [], accessory: []
        }
        items.value?.forEach(i => {
            if (map[i.type]) map[i.type].push(i)
        })
        return map
    })

    const categories = computed(() =>
        Object.entries(categoryLabels).map(([type, label]) => ({
            type: type as ItemTypes,
            label,
            items: categorizedItems.value[type as ItemTypes] || [],
            count: categorizedItems.value[type as ItemTypes]?.length || 0
        }))
    )

    const nonEmptyCategories = computed(() => categories.value.filter(c => c.items.length > 0))

    const selectedItems = ref<Record<ItemTypes, Item | null>>({
        head: null, top: null, outwear: null, bottom: null, foot: null,
        full: null, bag: null, jewelry: null, accessory: null
    })

    const selectedCategories = ref<Record<ItemTypes, boolean>>({
        head: false, top: false, outwear: false, bottom: false, foot: false,
        full: false, bag: false, jewelry: false, accessory: false
    })

    const carouselIndexes = ref<Record<ItemTypes, number>>({
        head: 0, top: 0, outwear: 0, bottom: 0, foot: 0,
        full: 0, bag: 0, jewelry: 0, accessory: 0
    })

    const getActiveItemsForGeneration = () => {
        const result: Record<ItemTypes, Item | null> = {
            head: null, top: null, outwear: null, bottom: null, foot: null,
            full: null, bag: null, jewelry: null, accessory: null
        }
        Object.entries(selectedCategories.value).forEach(([type, isSelected]) => {
            if (isSelected) {
                const idx = carouselIndexes.value[type as ItemTypes] || 0
                const arr = categorizedItems.value[type as ItemTypes] || []
                result[type as ItemTypes] = arr[idx] || null
            }
        })
        return result
    }

    return {
        categories, nonEmptyCategories, selectedItems, selectedCategories, carouselIndexes, getActiveItemsForGeneration
    }
}
