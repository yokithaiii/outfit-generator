import { computed } from 'vue'

export const useModalStore = () => {
  const modalState = useState<string>('modalState', () => '')

  const openModal = (type: 'items' | 'model' | 'help') => {
    modalState.value = type
  }

  const closeAllModals = () => {
    modalState.value = ''
  }

  const isModalOpen = computed({
    get: () => modalState.value !== '',
    set: (val: boolean) => {
      if (!val) closeAllModals()
    }
  })

  return {
    modalState,
    isModalOpen,
    openModal,
    closeAllModals
  }
}
