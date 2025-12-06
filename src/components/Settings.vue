<template>
  <div class="settings">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 xs:p-6">
      <h2 class="text-base xs:text-xl font-semibold text-gray-900 dark:text-white mb-4 xs:mb-6">Settings</h2>
      
      <div class="space-y-4 xs:space-y-6">
        <div>
          <h3 class="text-sm xs:text-lg font-medium text-gray-900 dark:text-white mb-2 xs:mb-3">Appearance</h3>
          <div class="flex items-center justify-between p-2 xs:p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <label class="text-sm xs:text-base text-gray-700 dark:text-gray-300">Theme</label>
            <select 
              v-model="theme" 
              @change="setTheme(theme)"
              class="px-2 xs:px-4 py-1.5 xs:py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
        </div>
        
        <div>
          <h3 class="text-sm xs:text-lg font-medium text-gray-900 dark:text-white mb-2 xs:mb-3">API Client</h3>
          <div class="space-y-2 xs:space-y-3">
            <div class="flex items-center justify-between p-2 xs:p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <label class="text-sm xs:text-base text-gray-700 dark:text-gray-300">Auto-save History</label>
              <input 
                type="checkbox" 
                v-model="autoSaveHistory"
                @change="saveSettings"
                class="w-4 h-4 xs:w-5 xs:h-5 rounded"
              />
            </div>
            
            <div class="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 p-2 xs:p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <label class="text-sm xs:text-base text-gray-700 dark:text-gray-300">Max History Items</label>
              <input 
                type="number" 
                v-model.number="maxHistoryItems"
                @change="saveSettings"
                min="10"
                max="200"
                class="w-full xs:w-24 px-2 xs:px-3 py-1.5 xs:py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
            </div>
            
            <div class="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 p-2 xs:p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <label class="text-sm xs:text-base text-gray-700 dark:text-gray-300">Request Timeout (ms)</label>
              <input 
                type="number" 
                v-model.number="requestTimeout"
                @change="saveSettings"
                min="1000"
                max="120000"
                step="1000"
                class="w-full xs:w-32 px-2 xs:px-3 py-1.5 xs:py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
            </div>
          </div>
        </div>
        
        <div>
          <h3 class="text-sm xs:text-lg font-medium text-gray-900 dark:text-white mb-2 xs:mb-3">Data Management</h3>
          <div class="space-y-2 xs:space-y-3">
            <button 
              @click="exportData"
              class="w-full px-3 xs:px-4 py-2 xs:py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-xs xs:text-sm font-medium"
            >
              📥 Export All Data
            </button>
            
            <button 
              @click="triggerImport"
              class="w-full px-3 xs:px-4 py-2 xs:py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-xs xs:text-sm font-medium"
            >
              📤 Import Data
            </button>
            <input 
              ref="fileInput"
              type="file"
              accept=".json"
              @change="importData"
              class="hidden"
            />
            
            <button 
              @click="clearAllData"
              class="w-full px-3 xs:px-4 py-2 xs:py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-xs xs:text-sm font-medium"
            >
              🗑️ Clear All Data
            </button>
          </div>
        </div>
        
        <div>
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-3">About</h3>
          <div class="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <p class="text-sm text-gray-700 dark:text-gray-300 mb-2">
              <span class="font-semibold">ApiTinker</span> v1.0.0
            </p>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              API Mocking, Testing, and Debugging Tool
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useSettingsStore } from '@/store/settings'
import { exportAllData, importAllData, clearStorage } from '@/utils/storage'

const settingsStore = useSettingsStore()
const { theme, autoSaveHistory, maxHistoryItems, requestTimeout } = storeToRefs(settingsStore)
const { setTheme } = settingsStore

const fileInput = ref(null)

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

function triggerImport() {
  fileInput.value?.click()
}

async function importData(event) {
  try {
    const file = event.target.files[0]
    if (!file) return
    
    const text = await file.text()
    const data = JSON.parse(text)
    
    const success = await importAllData(data)
    if (success) {
      alert('Data imported successfully! Please reload the extension.')
      // Reload the extension
      chrome.runtime.reload()
    } else {
      alert('Failed to import data')
    }
  } catch (error) {
    console.error('Import failed:', error)
    alert('Failed to import data: ' + error.message)
  } finally {
    // Reset file input
    event.target.value = ''
  }
}

async function clearAllData() {
  if (!confirm('Are you sure you want to clear all data? This cannot be undone!')) {
    return
  }
  
  try {
    await Promise.all([
      clearStorage(false), // local storage
      clearStorage(true)   // sync storage
    ])
    alert('All data cleared successfully! The extension will reload.')
    chrome.runtime.reload()
  } catch (error) {
    console.error('Clear failed:', error)
    alert('Failed to clear data: ' + error.message)
  }
}
</script>
