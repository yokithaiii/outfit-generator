<script setup lang="ts">

const { closeAllModals } = useModalStore();

const props = withDefaults(defineProps<{ title: string; descr?: string; state?: string }>(), {
	descr: 'Для начала напишите ваш email:',
	state: 'base',
});

const states = reactive({
	email: '',
	loading: false,
	errorText: null as null | string,
});

const isNotValidEmail = computed(() => {
	const email = states.email.trim();
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	return !emailRegex.test(email);
});

</script>

<template>
	<UModal
		:title="props.title"
		:close="{
			color: 'neutral',
			variant: 'solid',
		}"
	>
		<template #body>
			<div class="flex justify-between items-center mb-2">
                <h3 class="text-xl font-semibold">Help</h3>
                <UButton icon="i-heroicons-x-mark" color="gray" variant="ghost" @click="closeAllModals()" />
            </div>

            <div class="p-4">
                <h4 class="font-semibold mb-2">How to use:</h4>
                <ol class="list-decimal pl-4 space-y-2">
                    <li>Click "Model" to upload a photo of yourself</li>
                    <li>Browse available items in "Items" section</li>
                    <li>Use arrows to select top and bottom clothing</li>
                    <li>Click "Generate" to create your outfit</li>
                </ol>
            </div>
		</template>
	</UModal>
</template>