export default defineAppConfig({
  ui: {
    header: {
      slots: {
        title: 'font-light'
      }
    },
    container: {
      base: 'w-full max-w-(--ui-container) mx-auto px-0 lg:px-0 sm:px-0'
    },
    carousel: {
      slots: {
        dots: 'absolute inset-x-0 -bottom-3 flex flex-wrap items-center justify-center gap-1',
        dot: [
          'size-1 bg-accented rounded-full',
          'transition'
        ]
      }
    }
  }
})