<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useItems } from '@/composables/useItems'
import { useCategorySelection } from '@/composables/useCategorySelection'
import { useOutfit } from '@/composables/useOutfits'

const { items, fetchItems, loading: itemsLoading } = useItems()
onMounted(fetchItems)

const { nonEmptyCategories, selectedCategories, carouselIndexes, getActiveItemsForGeneration } = useCategorySelection(items)
const { generatedImage, loading, generateOutfit } = useOutfit()

const model = ref('/img/model3.jpg')

const onGenerate = () => {
  const activeItems = Object.values(getActiveItemsForGeneration()).filter(Boolean)
  generateOutfit(model.value, activeItems as any)
}
</script>

<template>
	<div class="h-full pb-[40px]">
		<div class="flex align-center justify-between gap-2 w-full h-[100%]">

			<div class="l-left w-[50%]">

				<UCarousel 
					v-slot="{ item: category }" 
					:items="nonEmptyCategories" 
					:ui="{  container: 'h-[600px] w-full gap-2', item: 'basis-1/4 w-full' }"
					orientation="vertical" 
					class="w-full items-end"
				>
					<div class="l-items__item w-full">
						<div class="l-items__label">
							<UCheckbox v-model="selectedCategories[category.type]" :ui="{
								indicator: 'focus-visible:outline-primary'
							}"/>
							<span class="text-white">{{ category.label }}</span>
						</div>
						<UCarousel
							v-slot="{ item: element }"
							:items="category.items"
							:ui="{
								container: 'flex items-start w-full',
								item: 'w-full',
							}"
							dots 
							class="w-full"
							v-model:currentIndex="carouselIndexes[category.type]"
						>
							<div class="l-card rounded-lg w-full overflow-hidden w-full">
								<img :src="element.image_url" alt="" class="object-cover w-full h-[160px]"/>
							</div>
						</UCarousel>
					</div>
				</UCarousel>
			</div>

			<div class="l-right w-[50%]">
				<div class="flex flex-col items-center justify-center w-full h-full gap-2">
					<div class="field-border w-full h-auto rounded-lg overflow-hidden">
						<img :src="model" alt="" class="w-full h-full object-contain">
					</div>
					<UButton 
						icon="i-lucide-rocket" 
						size="md" 
						color="primary" 
						variant="solid" 
						class="w-full justify-center cursor-pointer" 
						:disabled="loading" 
						@click="onGenerate()"
					>
						{{ loading ? 'Генерация...' : 'Сгенерировать' }}
					</UButton>
				</div>
			</div>
		</div>

		<div v-if="generatedImage" class="mt-4">
			<img :src="generatedImage" alt="Generated outfit" class="max-w-full" />
		</div>
	</div>

</template>

<style scoped>
.l-items__item {
	position: relative;
}
.l-items__label {
	width: auto;
	position: absolute;
	top: 3px;
	left: 3px;
	z-index: 100;
	color: #222;
	display: flex;
	align-items: center;
	gap: 5px;
	background: rgb(5 223 114 / 50%);
	backdrop-filter: blur(4px);
	-webkit-backdrop-filter: blur(8px);
	padding: 3px 5px;
	border-radius: 5px;
}
</style>