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
                <h3 class="text-xl font-semibold">Available Items</h3>
                <UButton icon="i-heroicons-x-mark" color="gray" variant="ghost" @click="closeAllModals()" />
            </div>

            <div class="p-4">
                <div class="grid grid-cols-2 gap-4">
                    <div v-for="(item, index) in tops" :key="'top' + index" class="border p-2">
                        <img :src="item" class="w-full h-32 object-contain" />
                    </div>
                    <div v-for="(item, index) in bottoms" :key="'bottom' + index" class="border p-2">
                        <img :src="item" class="w-full h-32 object-contain" />
                    </div>
                    <div v-for="(item, index) in shoes" :key="'shoe' + index" class="border p-2">
                        <img :src="item" class="w-full h-32 object-contain" />
                    </div>
                </div>
            </div>
		</template>
	</UModal>
</template>