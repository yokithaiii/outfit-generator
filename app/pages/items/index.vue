<script setup lang="ts">
import { onMounted, computed } from 'vue'
import CategoryItems from '@/components/CategoryItems.vue'
import { useItems } from '@/composables/useItems'
import type { Item, ItemTypes } from '@/types'

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

const { items, fetchItems, loading } = useItems()

onMounted(fetchItems)

const categories = Object.entries(categoryLabels).map(([type, label]) => ({
	label,
	type: type as ItemTypes,
}))

const categorizedItems = computed(() => {
	const map: Record<ItemTypes, Item[]> = {
		head: [],
		top: [],
		outwear: [],
		bottom: [],
		foot: [],
		full: [],
		bag: [],
		jewelry: [],
		accessory: [],
	}

	items.value?.forEach((i) => {
		if (map[i.type]) map[i.type].push(i)
	})

  	return map
})
</script>

<template>
	<div class="h-full pb-[40px]">
        <h1 class="text-center">YOUR ITEMS</h1>
		<CategoryItems
			v-for="category in categories"
			:key="category.type"
			:label="`${category.label} (${categorizedItems[category.type]?.length || 0})`"
			:type="category.type"
			:items="categorizedItems[category.type]"
			:loading="loading"
		/>
	</div>
</template>
