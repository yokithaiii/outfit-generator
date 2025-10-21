<script setup lang="ts">
import { GoogleGenAI } from '@google/genai'
import { computed } from 'vue'

const configEnv = useRuntimeConfig()

const modelImage = ref<File | null>(null)
const topImage = ref<File | null>(null)
const bottomImage = ref<File | null>(null)
const shoesImage = ref<File | null>(null)
const generatedImage = ref<string | null>(null)
const loading = ref(false)

const tops = ref([
	'/img/tshirt.jpg',
	'/img/tshirt2.jpg'
])

const bottoms = ref([
	'/img/pants.jpg',
	'/img/pants2.jpg'
])

const shoes = ref([
	'/img/shoes.jpg',
	'/img/shoes2.jpg'
])

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
	const modelUrl = '/img/model-women.jpg'
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

	// try {
	// 	const ai = new GoogleGenAI({
	// 		apiKey: configEnv.public.GEMINI_API_KEY,
	// 	})

	// 	const model = 'gemini-2.5-flash-image-preview'

	// 	const modelBase64 = await fileToBase64(modelImage.value)
	// 	const topBase64 = await fileToBase64(topImage.value)
	// 	const bottomBase64 = await fileToBase64(bottomImage.value)

	// 	const prompt = [
	// 		{ text: 'Create a new image by combining the elements from the provided images. Take the top clothing item from image 1 and the bottom clothing item from image 2, and place them naturally onto the body in image 3 so it looks like the person is wearing the selected outfit. Fit to body shape and pose, preserve garment proportions and textures, match lighting and shadows, handle occlusion by hair and arms. CRITICAL: The background must be completely white (#FFFFFF) - do not use black, transparent, or any other background color. Replace any existing background with solid white. Do not change the person identity or add accessories.' },
	// 		{ inlineData: { mimeType: "image/png", data: modelBase64.split(',')[1]} }, // image 1 model
	// 		{ inlineData: { mimeType: "image/png", data: topBase64.split(',')[1]} }, // image 2 top
	// 		{ inlineData: { mimeType: "image/png", data: bottomBase64.split(',')[1]} }, // image 3 bottom
	// 	];

	// 	console.log('Contents prepared for generation.', prompt)

	// 	const response = await ai.models.generateContent({
	// 		model: model,
	// 		contents: prompt,
	// 	})

	// 	const part = response.candidates?.[0]?.content?.parts?.[0]
	// 	if (part && part.inlineData) {
	// 		generatedImage.value = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`
	// 	}

	// } catch (error) {
	// 	console.error('Error generating outfit:', error)
	// 	alert('Error generating outfit')
	// } finally {
	// 	loading.value = false
	// }
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
		{{ }}
		<div class="flex flex-col align-center gap-2 w-full h-[100%]">
			<div class="l-left w-full">
				<div class="l-grid flex flex-col align-center justify-center gap-2 w-full h-full">
					<fieldset class="w-full">
						<legend>Tops</legend>
						<div class="field-row flex flex-col gap-2">
							<div class="field-border w-full h-[150px]" style="padding: 8px">
								<img :src="topSrc" alt="" class="w-full h-full object-contain">
							</div>
							<div class="flex align-center gap-2">
								<button class="default"
									@click="currentTopIndex = prevImage(tops, currentTopIndex)">Пред.</button>
								<button class="default"
									@click="currentTopIndex = nextImage(tops, currentTopIndex)">След.</button>
							</div>
						</div>
					</fieldset>

					<fieldset>
						<legend>Bottoms</legend>
						<div class="field-row flex flex-col gap-2">
							<div class="field-border w-full h-[150px]" style="padding: 8px">
								<img :src="bottomSrc" alt="" class="w-full h-full object-contain">
							</div>
							<div class="flex align-center gap-2">
								<button class="default"
									@click="currentBottomIndex = prevImage(bottoms, currentBottomIndex)">Пред.</button>
								<button class="default"
									@click="currentBottomIndex = nextImage(bottoms, currentBottomIndex)">След.</button>
							</div>
						</div>
					</fieldset>

					<fieldset>
						<legend>Shoes</legend>
						<div class="field-row flex flex-col gap-2">
							<div class="field-border w-full h-[150px]" style="padding: 8px">
								<img :src="shoesSrc" alt="" class="w-full h-full object-contain">
							</div>
							<div class="flex align-center gap-2">
								<button class="default"
									@click="currentShoesIndex = prevImage(shoes, currentShoesIndex)">Пред.</button>
								<button class="default"
									@click="currentShoesIndex = nextImage(shoes, currentShoesIndex)">След.</button>
							</div>
						</div>
					</fieldset>
				</div>
			</div>

			<div class="l-right w-full">
				<div class="flex flex-col align-center justify-start w-full h-full">
					<button class="default mb-2 h-[60px] cursor-pointer" :disabled="loading" @click="generateOutfit">
						{{ loading ? 'Генерация...' : 'Сгенерировать' }}
					</button>
					<div class="field-border w-full h-auto" style="padding: 8px">
						<img src="/img/model-women.jpg" alt="" class="w-full h-[400px] object-contain">
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
fieldset {
	padding: 15px;
	border-width: 2px;
	border-style: groove;
	border-color: threedface;
}

button {
	cursor: pointer;
}

.l-grid {
	display: grid;
	grid-template-columns: 1fr 1fr 1fr;
}

@media screen and (max-width: 600px) {
	.l-grid {
		grid-template-columns: 1fr 1fr;
	}
}
</style>