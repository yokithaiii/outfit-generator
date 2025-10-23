<script setup lang="ts">
import { GoogleGenAI } from '@google/genai'
import { computed } from 'vue'

const generatedImage = ref<string | null>(null)
const loading = ref(false)

const tops = ref([
	'/img/tshirt.jpg',
	'/img/tshirt2.jpg',
	'/img/jacket.webp',
	'/img/psycho.jpeg',
	'/img/dress.jpg',
	'/img/dress2.jpg',
	'/img/dress3.jpg',
	'/img/dress4.jpg',
])

const bottoms = ref([
	'/img/pants.jpg',
	'/img/pants2.jpg',
	'/img/pants3.jpg'
])

const shoes = ref([
	'/img/shoes.jpg',
	'/img/shoes2.jpg'
])

const model = ref('/img/model3.jpg')

const currentTopIndex = ref(0)
const currentBottomIndex = ref(0)
const currentShoesIndex = ref(0)

const nextImage = (array: string[], index: number): number => {
	const arr = array || []
	if (!arr.length) return index
	return (index + 1) % arr.length
}

const prevImage = (array: string[], index: number): number => {
	const arr = array || []
	if (!arr.length) return index
	return (index - 1 + arr.length) % arr.length
}


const generateOutfit = async () => {
	const modelUrl = model.value
	const topUrl = topSrc.value
	const bottomUrl = bottomSrc.value
	const shoesUrl = shoesSrc.value

	if (!modelUrl || !topUrl || !bottomUrl || !shoesUrl) {
		alert('Не удалось найти изображения для генерации')
		return
	}

	loading.value = true

	try {
		const [modelBase64, topBase64, bottomBase64, shoesBase64] = await Promise.all([
			urlToBase64(modelUrl),
			urlToBase64(topUrl),
			urlToBase64(bottomUrl),
			urlToBase64(shoesUrl)
		])

		const res = await fetch('/api/generate-outfit', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				prompt: 'Create a new image by combining the elements from the provided images. Fit garments naturally, background white (#FFFFFF).',
				reference_images: [
					modelBase64.split(',')[1],
					topBase64.split(',')[1],
					bottomBase64.split(',')[1],
					// shoesBase64.split(',')[1]
				]
			})
		})

		const data = await res.json()
		const taskId = data?.task_id || data?.data?.task_id

		if (taskId) {
			await pollTask(taskId)
		} else if (data.image) {
			generatedImage.value = `data:image/png;base64,${data.image}`
		} else if (data.error) {
			throw new Error(String(data.error))
		} else {
			throw new Error('No image or task id returned')
		}
	} catch (err) {
		console.error('Error generating outfit:', err)
		alert('Error generating outfit')
	} finally {
		loading.value = false
	}
}

const urlToBase64 = async (url: string): Promise<string> => {
	const response = await fetch(url)
	const blob = await response.blob()
	return await new Promise((resolve, reject) => {
		const reader = new FileReader()
		reader.onloadend = () => resolve(reader.result as string)
		reader.onerror = reject
		reader.readAsDataURL(blob)
	})
}

async function pollTask(taskId: string) {
	const timeoutMs = 120000 // 2 минуты максимум
	const intervalMs = 2000
	const started = Date.now()

	while (Date.now() - started < timeoutMs) {
		await new Promise(r => setTimeout(r, intervalMs))
		try {
			const res = await fetch(`/api/generate-outfit/${encodeURIComponent(taskId)}`)
			if (!res.ok) {
				const txt = await res.text()
				throw new Error(txt || `Status ${res.status}`)
			}
			const data = await res.json()
			// Пример ответа: { data: { status: 'COMPLETED', generated: ['https://...'] , task_id: '...' } }
			const status = data?.data?.status || data?.status
			if (status === 'COMPLETED') {
				const generated = data?.data?.generated || data?.generated
				const imageUrl = Array.isArray(generated) && generated.length ? generated[0] : null
				if (imageUrl) {
					// если возвращён URL — можно вставить его в src
					generatedImage.value = imageUrl
					return
				}
				// либо API может вернуть base64 in data.image
				if (data.image) {
					generatedImage.value = `data:image/png;base64,${data.image}`
					return
				}
				// иначе вернул COMPLETED но без image — завершаем с ошибкой
				throw new Error('Completed but no image returned')
			} else if (status === 'FAILED' || status === 'ERROR') {
				throw new Error('Generation failed: ' + JSON.stringify(data))
			}
			// пока CREATED / IN_PROGRESS — продолжаем polling
		} catch (err) {
			console.error('Polling error:', err)
			// если сетевые ошибки — пробуем ещё, до таймаута
		}
	}
	throw new Error('Polling timed out')
}

const topSrc = computed(() => tops.value[currentTopIndex.value] ?? '')
const bottomSrc = computed(() => bottoms.value[currentBottomIndex.value] ?? '')
const shoesSrc = computed(() => shoes.value[currentShoesIndex.value] ?? '')
</script>

<template>
	<div class="h-full pb-[40px]">
		<div class="flex flex-col align-center gap-2 w-full h-[100%]">
			<div class="l-left w-full">
				<div class="l-grid flex flex-col align-center justify-center gap-2 w-full h-full">
					<UCard>
						<template #header>
							<span>Tops</span>
						</template>

						<div class="field-border w-full h-[150px]">
							<img :src="topSrc" alt="" class="w-full h-full object-contain">
						</div>
						
						<template #footer>
							<div class="flex align-center gap-2 justify-between">
								<button @click="currentTopIndex = prevImage(tops, currentTopIndex)"	class="cursor-pointer">
									<UIcon name="ant-design:arrow-left-outlined" class="size-5" />
								</button>
								<button @click="currentTopIndex = nextImage(tops, currentTopIndex)" class="cursor-pointer">
									<UIcon name="ant-design:arrow-right-outlined" class="size-5" />
								</button>
							</div>
						</template>
					</UCard>
					<UCard>
						<template #header>
							<span>Bottoms</span>
						</template>

						<div class="field-border w-full h-[150px]">
							<img :src="bottomSrc" alt="" class="w-full h-full object-contain">
						</div>
						
						<template #footer>
							<div class="flex align-center gap-2 justify-between">
								<button @click="currentBottomIndex = prevImage(bottoms, currentBottomIndex)" class="cursor-pointer">
									<UIcon name="ant-design:arrow-left-outlined" class="size-5" />
								</button>
								<button @click="currentBottomIndex = nextImage(bottoms, currentBottomIndex)" class="cursor-pointer">
									<UIcon name="ant-design:arrow-right-outlined" class="size-5" />
								</button>
							</div>
						</template>
					</UCard>
					<UCard>
						<template #header>
							<span>Shoes</span>
						</template>

						<div class="field-border w-full h-[150px]">
							<img :src="shoesSrc" alt="" class="w-full h-full object-contain">
						</div>
						
						<template #footer>
							<div class="flex align-center gap-2 justify-between">
								<button @click="currentShoesIndex = prevImage(shoes, currentShoesIndex)" class="cursor-pointer">
									<UIcon name="ant-design:arrow-left-outlined" class="size-5" />
								</button>
								<button @click="currentShoesIndex = nextImage(shoes, currentShoesIndex)" class="cursor-pointer">
									<UIcon name="ant-design:arrow-right-outlined" class="size-5" />
								</button>
							</div>
						</template>
					</UCard>
				</div>
			</div>

			<div class="l-right w-full mt-4">
				<div class="flex flex-col items-center justify-center w-full h-full gap-4">
					<UButton icon="i-lucide-rocket" size="md" color="primary" variant="solid" class="w-[200px] justify-center cursor-pointer" :disabled="loading" @click="generateOutfit">
						{{ loading ? 'Генерация...' : 'Сгенерировать' }}
					</UButton>
					<div class="field-border w-full h-auto">
						<img :src="model" alt="" class="w-full h-[400px] object-contain">
					</div>
				</div>
			</div>
		</div>

		<div v-if="generatedImage" class="mt-4">
			<img :src="generatedImage" alt="Generated outfit" class="max-w-full" />
		</div>
	</div>

</template>

<style scoped>
</style>