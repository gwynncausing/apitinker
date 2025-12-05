import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  // State
  const theme = ref('light')
  const autoSaveHistory = ref(true)
  const maxHistoryItems = ref(50)
  const requestTimeout = ref(30000)

  // Actions
  function setTheme(newTheme) {
    theme.value = newTheme
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
    saveSettings()
  }
  
  function toggleTheme() {
    setTheme(theme.value === 'light' ? 'dark' : 'light')
  }
  
  function updateSettings(settings) {
    if (settings.autoSaveHistory !== undefined) {
      autoSaveHistory.value = settings.autoSaveHistory
    }
    if (settings.maxHistoryItems !== undefined) {
      maxHistoryItems.value = settings.maxHistoryItems
    }
    if (settings.requestTimeout !== undefined) {
      requestTimeout.value = settings.requestTimeout
    }
    saveSettings()
  }
  
  async function saveSettings() {
    await chrome.storage.sync.set({
      theme: theme.value,
      autoSaveHistory: autoSaveHistory.value,
      maxHistoryItems: maxHistoryItems.value,
      requestTimeout: requestTimeout.value
    })
  }
  
  async function loadData() {
    const data = await chrome.storage.sync.get([
      'theme',
      'autoSaveHistory',
      'maxHistoryItems',
      'requestTimeout'
    ])
    
    if (data.theme) {
      theme.value = data.theme
      document.documentElement.classList.toggle('dark', data.theme === 'dark')
    }
    if (data.autoSaveHistory !== undefined) {
      autoSaveHistory.value = data.autoSaveHistory
    }
    if (data.maxHistoryItems !== undefined) {
      maxHistoryItems.value = data.maxHistoryItems
    }
    if (data.requestTimeout !== undefined) {
      requestTimeout.value = data.requestTimeout
    }
  }
  
  return {
    theme,
    autoSaveHistory,
    maxHistoryItems,
    requestTimeout,
    setTheme,
    toggleTheme,
    updateSettings,
    loadData
  }
})
