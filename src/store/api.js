import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export const useApiStore = defineStore('api', () => {
  // State
  const requests = ref([])
  const currentRequest = ref({
    url: '',
    method: 'GET',
    headers: [],
    body: '',
    bodyType: 'json'
  })
  const response = ref(null)
  const loading = ref(false)
  const history = ref([])
  const favorites = ref([])
  const lastResponse = ref(null)

  // Computed
  const hasResponse = computed(() => response.value !== null)
  
  // Watch for changes in currentRequest to auto-save
  watch(
    () => currentRequest.value,
    () => {
      saveCurrentRequest()
    },
    { deep: true }
  )
  
  // Actions
  async function sendRequest() {
    loading.value = true
    response.value = null
    
    try {
      const headers = {}
      // Ensure headers is an array before iterating
      const headersList = Array.isArray(currentRequest.value.headers) 
        ? currentRequest.value.headers 
        : []
      
      headersList.forEach(header => {
        if (header.name && header.value) {
          headers[header.name] = header.value
        }
      })
      
      const requestData = {
        url: currentRequest.value.url,
        method: currentRequest.value.method,
        headers,
        body: currentRequest.value.body
      }
      
      const result = await chrome.runtime.sendMessage({
        type: 'MAKE_REQUEST',
        request: requestData
      })
      
      if (result.success) {
        response.value = result.response
        lastResponse.value = result.response
        addToHistory(requestData, result.response)
        saveResponse()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      response.value = {
        error: true,
        message: error.message
      }
      lastResponse.value = response.value
      saveResponse()
    } finally {
      loading.value = false
    }
  }
  
  function addToHistory(request, response) {
    // Ensure history is always an array
    if (!Array.isArray(history.value)) {
      history.value = []
    }
    
    const historyItem = {
      id: Date.now(),
      request,
      response,
      timestamp: new Date().toISOString()
    }
    
    console.log('Adding to history:', historyItem)
    history.value.unshift(historyItem)
    console.log('History now has:', history.value.length, 'items')
    console.log('History now has value:', history.value, 'items')
    
    // Keep only last 50 items
    if (history.value.length > 50) {
      history.value.pop()
    }
    
    saveHistory()
  }
  
  function addToFavorites(request) {
    const favorite = {
      id: Date.now(),
      name: `${request.method} ${request.url}`,
      request
    }
    
    favorites.value.push(favorite)
    saveFavorites()
  }
  
  function removeFromFavorites(id) {
    favorites.value = favorites.value.filter(f => f.id !== id)
    saveFavorites()
  }
  
  function loadRequest(request) {
    currentRequest.value = {
      ...request,
      headers: request.headers ? Object.entries(request.headers).map(([name, value]) => ({ name, value })) : []
    }
    saveCurrentRequest()
  }
  
  function clearHistory() {
    history.value = []
    saveHistory()
  }
  
  function addHeader() {
    // Ensure headers is an array
    if (!Array.isArray(currentRequest.value.headers)) {
      currentRequest.value.headers = []
    }
    currentRequest.value.headers.push({ name: '', value: '' })
    saveCurrentRequest()
  }
  
  function removeHeader(index) {
    // Ensure headers is an array
    if (!Array.isArray(currentRequest.value.headers)) {
      currentRequest.value.headers = []
      return
    }
    currentRequest.value.headers.splice(index, 1)
    saveCurrentRequest()
  }
  
  async function saveCurrentRequest() {
    await chrome.storage.local.set({ currentRequest: currentRequest.value })
  }
  
  async function saveHistory() {
    console.log('Saving history:', history.value.length, 'items')
    // Ensure we're saving a proper array by spreading it
    const historyArray = Array.isArray(history.value) ? [...history.value] : []
    await chrome.storage.local.set({ apiHistory: historyArray })
    // log here apiHistory
    const savedHistory = await chrome.storage.local.get('apiHistory')
    console.log('Saved history to storage:', savedHistory)
    console.log('Is saved history an array?', Array.isArray(savedHistory.apiHistory))
  }
  
  async function saveFavorites() {
    // Ensure we're saving a proper array by spreading it
    const favoritesArray = Array.isArray(favorites.value) ? [...favorites.value] : []
    await chrome.storage.local.set({ apiFavorites: favoritesArray })
  }
  
  async function saveResponse() {
    await chrome.storage.local.set({ lastResponse: lastResponse.value })
  }
  
  async function loadData() {
    const data = await chrome.storage.local.get([
      'apiHistory', 
      'apiFavorites', 
      'currentRequest',
      'lastResponse'
    ])
    
    console.log('Loading data from storage:', data)
    
    // Ensure history is always an array and filter out null/undefined items
    if (data.apiHistory) {
      // Convert object with numeric keys back to array if needed
      if (Array.isArray(data.apiHistory)) {
        history.value = data.apiHistory.filter(item => item && item.id)
      } else if (typeof data.apiHistory === 'object') {
        // Convert object with numeric keys to array
        history.value = Object.values(data.apiHistory).filter(item => item && item.id)
      } else {
        history.value = []
      }
      console.log('Loaded history:', history.value.length, 'items')
    } else {
      history.value = []
      console.log('No history found, initializing empty array')
    }
    
    // Ensure favorites is always an array and filter out null/undefined items
    if (data.apiFavorites) {
      // Convert object with numeric keys back to array if needed
      if (Array.isArray(data.apiFavorites)) {
        favorites.value = data.apiFavorites.filter(item => item && item.id)
      } else if (typeof data.apiFavorites === 'object') {
        favorites.value = Object.values(data.apiFavorites).filter(item => item && item.id)
      } else {
        favorites.value = []
      }
    } else {
      favorites.value = []
    }
    
    // Load current request state
    if (data.currentRequest) {
      currentRequest.value = {
        ...data.currentRequest,
        // Ensure headers is always an array
        headers: Array.isArray(data.currentRequest.headers) 
          ? data.currentRequest.headers 
          : []
      }
    }
    
    // Load last response
    if (data.lastResponse) {
      lastResponse.value = data.lastResponse
      response.value = lastResponse.value
    }
  }
  
  return {
    requests,
    currentRequest,
    response,
    loading,
    history,
    favorites,
    lastResponse,
    hasResponse,
    sendRequest,
    addToHistory,
    addToFavorites,
    removeFromFavorites,
    loadRequest,
    clearHistory,
    addHeader,
    removeHeader,
    saveCurrentRequest,
    loadData
  }
})
