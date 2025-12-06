<template>
  <div class="app-container min-h-screen bg-gray-50 dark:bg-gray-900">
    <nav class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div class="px-2 xs:px-4 py-2 xs:py-3">
        <div class="flex items-center justify-between">
          <h1 class="text-base xs:text-xl font-bold text-gray-900 dark:text-white">ApiTinker</h1>
          <button 
            @click="toggleTheme"
            class="p-1.5 xs:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg v-if="theme === 'light'" class="w-4 h-4 xs:w-5 xs:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
            <svg v-else class="w-4 h-4 xs:w-5 xs:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </button>
        </div>
        <div class="flex flex-wrap gap-1 mt-2 xs:mt-3">
          <router-link 
            v-for="route in routes" 
            :key="route.path"
            :to="route.path"
            class="px-2 xs:px-4 py-1.5 xs:py-2 rounded-lg text-xs xs:text-sm font-medium transition-colors whitespace-nowrap"
            :class="$route.path === route.path 
              ? 'bg-blue-500 text-white' 
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'"
          >
            {{ route.name }}
          </router-link>
        </div>
      </div>
    </nav>
    
    <main class="p-2 xs:p-4">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useSettingsStore } from '@/store/settings'
import { useApiStore } from '@/store/api'
import { useMockStore } from '@/store/mock'
import { useBugReportStore } from '@/store/bugReport'

const settingsStore = useSettingsStore()
const apiStore = useApiStore()
const mockStore = useMockStore()
const bugReportStore = useBugReportStore()

const { theme } = storeToRefs(settingsStore)
const { toggleTheme } = settingsStore

const routes = [
  { path: '/', name: 'API' },
  { path: '/mocks', name: 'Mocks' },
  { path: '/bugs', name: 'Bugs' },
  { path: '/settings', name: 'Settings' }
]

onMounted(async () => {
  await Promise.all([
    settingsStore.loadData(),
    apiStore.loadData(),
    mockStore.loadData(),
    bugReportStore.loadData()
  ])
})
</script>

<style scoped>
.app-container {
  /* Side panel takes full width/height automatically */
  width: 100%;
  min-height: 100vh;
}
</style>
