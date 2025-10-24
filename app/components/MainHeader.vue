<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const route = useRoute()

const items = computed<NavigationMenuItem[]>(() => [
  {
    label: 'Home',
    to: '/',
    active: route.path === '/'
  },
  {
    label: 'Items',
    to: '/items',
    active: route.path.startsWith('/items')
  },
  {
    label: 'Models',
    to: '/models',
    active: route.path.startsWith('/models')
  },
  {
    label: 'Help',
    to: '/help',
    active: route.path.startsWith('/help')
  },
  {
    label: 'User',
    to: '/user',
    active: route.path.startsWith('/user')
  },
])
</script>

<template>
  <UHeader title="Outfit generator">

    <UNavigationMenu :items="items"/>

    <template #right>
      <UColorModeButton />
    </template>
  </UHeader>
</template>

<style scoped>

</style>
