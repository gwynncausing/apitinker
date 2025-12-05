import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

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

  // Computed
  const hasResponse = computed(() => response.value !== null)
  
  // Actions
  async function sendRequest() {
    loading.value = true
    response.value = null
    
    try {
      const headers = {}
      currentRequest.value.headers.forEach(header => {
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
        addToHistory(requestData, result.response)
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      response.value = {
        error: true,
        message: error.message
      }
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
    
    history.value.unshift(historyItem)
    
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
  }
  
  function clearHistory() {
    history.value = []
    saveHistory()
  }
  
  function addHeader() {
    currentRequest.value.headers.push({ name: '', value: '' })
  }
  
  function removeHeader(index) {
    currentRequest.value.headers.splice(index, 1)
  }
  
  async function saveHistory() {
    await chrome.storage.local.set({ apiHistory: history.value })
  }
  
  async function saveFavorites() {
    await chrome.storage.local.set({ apiFavorites: favorites.value })
  }
  
  async function loadData() {
    const data = await chrome.storage.local.get(['apiHistory', 'apiFavorites'])
    
    // Ensure history is always an array
    if (data.apiHistory && Array.isArray(data.apiHistory)) {
      history.value = data.apiHistory
    } else {
      history.value = []
    }
    
    // Ensure favorites is always an array
    if (data.apiFavorites && Array.isArray(data.apiFavorites)) {
      favorites.value = data.apiFavorites
    } else {
      favorites.value = []
    }
  }
  
  return {
    requests,
    currentRequest,
    response,
    loading,
    history,
    favorites,
    hasResponse,
    sendRequest,
    addToHistory,
    addToFavorites,
    removeFromFavorites,
    loadRequest,
    clearHistory,
    addHeader,
    removeHeader,
    loadData
  }
})
