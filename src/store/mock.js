import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMockStore = defineStore('mock', () => {
  // State
  const rules = ref([])
  const activeEnvironment = ref('default')
  const environments = ref(['default', 'development', 'staging', 'production'])

  // Actions
  function addRule(rule) {
    const newRule = {
      id: Date.now(),
      enabled: true,
      environment: activeEnvironment.value,
      ...rule
    }
    
    rules.value.push(newRule)
    saveRules()
    updateBackgroundRules()
  }
  
  function updateRule(id, updates) {
    const index = rules.value.findIndex(r => r.id === id)
    if (index !== -1) {
      rules.value[index] = { ...rules.value[index], ...updates }
      saveRules()
      updateBackgroundRules()
    }
  }
  
  function deleteRule(id) {
    rules.value = rules.value.filter(r => r.id !== id)
    saveRules()
    updateBackgroundRules()
  }
  
  function toggleRule(id) {
    const rule = rules.value.find(r => r.id === id)
    if (rule) {
      rule.enabled = !rule.enabled
      saveRules()
      updateBackgroundRules()
    }
  }
  
  function getActiveRules() {
    // Ensure rules.value is always an array
    if (!Array.isArray(rules.value)) {
      rules.value = []
    }
    return rules.value.filter(r => 
      r.enabled && r.environment === activeEnvironment.value
    )
  }
  
  function setEnvironment(env) {
    activeEnvironment.value = env
    saveEnvironment()
    updateBackgroundRules()
  }
  
  function addEnvironment(name) {
    if (!environments.value.includes(name)) {
      environments.value.push(name)
      saveEnvironments()
    }
  }
  
  async function updateBackgroundRules() {
    const activeRules = getActiveRules()
    await chrome.runtime.sendMessage({
      type: 'UPDATE_MOCK_RULES',
      rules: activeRules
    })
  }
  
  async function saveRules() {
    await chrome.storage.local.set({ mockRules: rules.value })
  }
  
  async function saveEnvironment() {
    await chrome.storage.local.set({ activeEnvironment: activeEnvironment.value })
  }
  
  async function saveEnvironments() {
    await chrome.storage.local.set({ environments: environments.value })
  }
  
  async function loadData() {
    const data = await chrome.storage.local.get([
      'mockRules',
      'activeEnvironment',
      'environments'
    ])
    
    // Ensure rules is always an array
    if (data.mockRules && Array.isArray(data.mockRules)) {
      rules.value = data.mockRules
    } else {
      rules.value = []
    }
    
    if (data.activeEnvironment) {
      activeEnvironment.value = data.activeEnvironment
    }
    if (data.environments && Array.isArray(data.environments)) {
      environments.value = data.environments
    }
    
    updateBackgroundRules()
  }
  
  function exportRules() {
    return JSON.stringify({
      rules: rules.value,
      environments: environments.value,
      exportedAt: new Date().toISOString()
    }, null, 2)
  }
  
  function importRules(jsonString) {
    try {
      const data = JSON.parse(jsonString)
      if (data.rules) {
        rules.value = data.rules
      }
      if (data.environments) {
        environments.value = [...new Set([...environments.value, ...data.environments])]
      }
      saveRules()
      saveEnvironments()
      updateBackgroundRules()
      return true
    } catch (error) {
      console.error('Failed to import rules:', error)
      return false
    }
  }
  
  return {
    rules,
    activeEnvironment,
    environments,
    addRule,
    updateRule,
    deleteRule,
    toggleRule,
    getActiveRules,
    setEnvironment,
    addEnvironment,
    updateBackgroundRules,
    loadData,
    exportRules,
    importRules
  }
})
