<script setup lang="ts">
import { onMounted, computed } from 'vue'
import CategoryItems from '@/components/CategoryItems.vue'
import { useItems } from '@/composables/useItems'

const { items, loading, fetchItems } = useItems()

onMounted(fetchItems)

const tops = computed(() => items.value?.filter(i => i.type === 'top') ?? [])
const bottoms = computed(() => items.value?.filter(i => i.type === 'bottom') ?? [])
const shoes = computed(() => items.value?.filter(i => i.type === 'shoes') ?? [])
const full = computed(() => items.value?.filter(i => i.type === 'full') ?? [])
</script>

<template>
  <div class="h-full pb-[40px]">
    <div v-if="loading" class="text-center py-10 text-gray-500">Загрузка...</div>
    <div v-else>
      <CategoryItems label="Tops" type="top" :items="tops" />
      <CategoryItems label="Bottoms" type="bottom" :items="bottoms" />
      <CategoryItems label="Shoes" type="shoes" :items="shoes" />
      <CategoryItems label="Fulls" type="full" :items="full" />
    </div>
  </div>
</template>
