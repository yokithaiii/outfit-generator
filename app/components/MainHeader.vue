<script setup lang="ts">
import { useModalStore } from '~/composables/useModalStore'
import {
	ItemsModal,
	ModelModal,
	HelpModal
} from '#components';

const openModal = (type: 'items' | 'model' | 'help') => {
	useModalStore().openModal(type);
};
</script>

<template>
  <header>
    <div class="title-bar">
      <div class="title-bar-text">Outfit Generator</div>
      <div class="title-bar-controls">
        <button aria-label="Minimize"></button>
        <button aria-label="Restore"></button>
        <button aria-label="Close"></button>
      </div>
    </div>

    <UContainer>
      <div class="flex align-center gap-3 mt-4">
        <a class="underline text-[#222]" @click="openModal('items')">
          Items
        </a>
        <a class="underline text-[#222]" @click="openModal('model')">
          Model
        </a>
        <a class="underline text-[#222]" @click="openModal('help')">
          Help
        </a>
      </div>
    </UContainer>
  </header>
</template>

<style scoped>
a {
  cursor: pointer;
  font-size: 12px;
  color: #222;
}
a:hover {
  text-decoration: underline;
}
</style>
