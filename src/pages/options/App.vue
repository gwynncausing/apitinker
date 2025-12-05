<template>
  <div class="options-page min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-8">ApiTinker Settings</h1>
      
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-6">
        <div>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Appearance</h2>
          <div class="flex items-center justify-between">
            <label class="text-gray-700 dark:text-gray-300">Theme</label>
            <select 
              v-model="theme" 
              @change="setTheme(theme)"
              class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
        </div>
        
        <div>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">API Client</h2>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <label class="text-gray-700 dark:text-gray-300">Auto-save History</label>
              <input 
                type="checkbox" 
                v-model="autoSaveHistory"
                @change="saveSettings"
                class="w-5 h-5 rounded"
              />
            </div>
            
            <div class="flex items-center justify-between">
              <label class="text-gray-700 dark:text-gray-300">Max History Items</label>
              <input 
                type="number" 
                v-model.number="maxHistoryItems"
                @change="saveSettings"
                min="10"
                max="200"
                class="w-24 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <div class="flex items-center justify-between">
              <label class="text-gray-700 dark:text-gray-300">Request Timeout (ms)</label>
              <input 
                type="number" 
                v-model.number="requestTimeout"
                @change="saveSettings"
                min="1000"
                max="120000"
                step="1000"
                class="w-32 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>
        
        <div>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Data Management</h2>
          <div class="space-y-3">
            <button 
              @click="exportData"
              class="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Export All Data
            </button>
            
            <button 
              @click="importData"
              class="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Import Data
            </button>
            
            <button 
              @click="clearAllData"
              class="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Clear All Data
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useSettingsStore } from '@/store/settings'
import { useApiStore } from '@/store/api'
import { useMockStore } from '@/store/mock'
import { useContractStore } from '@/store/contract'

const settingsStore = useSettingsStore()
const apiStore = useApiStore()
const mockStore = useMockStore()
const contractStore = useContractStore()

const { theme, autoSaveHistory, maxHistoryItems, requestTimeout } = storeToRefs(settingsStore)
const { setTheme } = settingsStore

function saveSettings() {
  settingsStore.updateSettings({
    autoSaveHistory: autoSaveHistory.value,
    maxHistoryItems: maxHistoryItems.value,
    requestTimeout: requestTimeout.value
  })
}

async function exportData() {
  const data = {
    history: apiStore.history,
    favorites: apiStore.favorites,
    mockRules: mockStore.rules,
    contracts: contractStore.contracts,
    exportedAt: new Date().toISOString()
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `apitinker-export-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function importData() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = async (e) => {
    const file = e.target.files[0]
    if (file) {
      const text = await file.text()
      try {
        const data = JSON.parse(text)
        // Import data to stores
        if (data.mockRules) {
          mockStore.importRules(JSON.stringify({ rules: data.mockRules }))
        }
        alert('Data imported successfully!')
      } catch (error) {
        alert('Failed to import data: ' + error.message)
      }
    }
  }
  input.click()
}

async function clearAllData() {
  if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
    await chrome.storage.local.clear()
    await chrome.storage.sync.clear()
    alert('All data cleared. Please reload the extension.')
  }
}

onMounted(async () => {
  await settingsStore.loadData()
})
</script>
