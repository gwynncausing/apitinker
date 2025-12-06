<template>
  <div class="options-page min-h-screen bg-gray-50 dark:bg-gray-900 p-2 xs:p-4 sm:p-8">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-xl xs:text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4 xs:mb-6 sm:mb-8">ApiTinker Settings</h1>
      
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 xs:p-4 sm:p-6 space-y-4 xs:space-y-6">
        <div>
          <h2 class="text-base xs:text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 xs:mb-3 sm:mb-4">Appearance</h2>
          <div class="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2">
            <label class="text-sm xs:text-base text-gray-700 dark:text-gray-300">Theme</label>
            <select 
              v-model="theme" 
              @change="setTheme(theme)"
              class="w-full xs:w-auto px-3 xs:px-4 py-1.5 xs:py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
        </div>
        
        <div>
          <h2 class="text-base xs:text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 xs:mb-3 sm:mb-4">API Client</h2>
          <div class="space-y-3 xs:space-y-4">
            <div class="flex items-center justify-between">
              <label class="text-sm xs:text-base text-gray-700 dark:text-gray-300">Auto-save History</label>
              <input 
                type="checkbox" 
                v-model="autoSaveHistory"
                @change="saveSettings"
                class="w-4 h-4 xs:w-5 xs:h-5 rounded"
              />
            </div>
            
            <div class="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2">
              <label class="text-sm xs:text-base text-gray-700 dark:text-gray-300">Max History Items</label>
              <input 
                type="number" 
                v-model.number="maxHistoryItems"
                @change="saveSettings"
                min="10"
                max="200"
                class="w-full xs:w-24 px-3 py-1.5 xs:py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
            </div>
            
            <div class="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2">
              <label class="text-sm xs:text-base text-gray-700 dark:text-gray-300">Request Timeout (ms)</label>
              <input 
                type="number" 
                v-model.number="requestTimeout"
                @change="saveSettings"
                min="1000"
                max="120000"
                step="1000"
                class="w-full xs:w-32 px-3 py-1.5 xs:py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
            </div>
          </div>
        </div>
        
        <div>
          <h2 class="text-base xs:text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 xs:mb-3 sm:mb-4">Data Management</h2>
          <div class="space-y-2 xs:space-y-3">
            <button 
              @click="exportData"
              class="w-full px-3 xs:px-4 py-2 xs:py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm xs:text-base"
            >
              Export All Data
            </button>
            
            <button 
              @click="importData"
              class="w-full px-3 xs:px-4 py-2 xs:py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm xs:text-base"
            >
              Import Data
            </button>
            
            <button 
              @click="clearAllData"
              class="w-full px-3 xs:px-4 py-2 xs:py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm xs:text-base"
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

import { exportAllData, importAllData, clearStorage } from '@/utils/storage'
import { useBugReportStore } from '@/store/bugReport'

const settingsStore = useSettingsStore()
const apiStore = useApiStore()
const mockStore = useMockStore()
const bugReportStore = useBugReportStore()

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
  try {
    const data = await exportAllData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `apitinker-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    alert('Data exported successfully!')
  } catch (error) {
    console.error('Export failed:', error)
    alert('Failed to export data: ' + error.message)
  }
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
        const success = await importAllData(data)
        if (success) {
          alert('Data imported successfully! Please reload the extension.')
          chrome.runtime.reload()
        } else {
          alert('Failed to import data')
        }
      } catch (error) {
        console.error('Import failed:', error)
        alert('Failed to import data: ' + error.message)
      }
    }
  }
  input.click()
}

async function clearAllData() {
  if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
    try {
      await Promise.all([
        clearStorage(false),
        clearStorage(true)
      ])
      alert('All data cleared. The extension will reload.')
      chrome.runtime.reload()
    } catch (error) {
      console.error('Clear failed:', error)
      alert('Failed to clear data: ' + error.message)
    }
  }
}

onMounted(async () => {
  await Promise.all([
    settingsStore.loadData(),
    apiStore.loadData(),
    mockStore.loadData(),
    bugReportStore.loadData()
  ])
})
</script>
