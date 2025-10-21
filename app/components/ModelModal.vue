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
                <h3 class="text-xl font-semibold">Select Model</h3>
                <UButton icon="i-heroicons-x-mark" color="gray" variant="ghost" @click="closeAllModals()" />
            </div>

            <div class="p-4">
                <UFileUpload label="Upload model image" v-model="modelImage" accept="image/*" />
            </div>
		</template>
	</UModal>
</template>