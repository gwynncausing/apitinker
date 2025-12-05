<template>
  <div class="settings">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">Settings</h2>
      
      <div class="space-y-6">
        <div>
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-3">Appearance</h3>
          <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
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
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-3">API Client</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <label class="text-gray-700 dark:text-gray-300">Auto-save History</label>
              <input 
                type="checkbox" 
                v-model="autoSaveHistory"
                @change="saveSettings"
                class="w-5 h-5 rounded"
              />
            </div>
            
            <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
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
            
            <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
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
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-3">About</h3>
          <div class="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <p class="text-sm text-gray-700 dark:text-gray-300 mb-2">
              <span class="font-semibold">ApiTinker</span> v1.0.0
            </p>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              API Mocking, Testing, Debugging & Contract Management Tool
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useSettingsStore } from '@/store/settings'

const settingsStore = useSettingsStore()
const { theme, autoSaveHistory, maxHistoryItems, requestTimeout } = storeToRefs(settingsStore)
const { setTheme } = settingsStore

function saveSettings() {
  settingsStore.updateSettings({
    autoSaveHistory: autoSaveHistory.value,
    maxHistoryItems: maxHistoryItems.value,
    requestTimeout: requestTimeout.value
  })
}
</script>
