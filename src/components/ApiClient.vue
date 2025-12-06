<template>
  <div class="api-client">
    <div class="grid grid-cols-1 gap-2 xs:gap-4">
      <!-- Request Builder -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-2 xs:p-4">
        <h2 class="text-base xs:text-lg font-semibold text-gray-900 dark:text-white mb-2 xs:mb-4">Request</h2>
        
        <div class="space-y-2 xs:space-y-3">
          <div class="flex flex-col gap-2">
            <div class="flex gap-2">
              <select 
                v-model="currentRequest.method"
                class="w-24 shrink-0 px-2 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option>GET</option>
                <option>POST</option>
                <option>PUT</option>
                <option>PATCH</option>
                <option>DELETE</option>
                <option>HEAD</option>
                <option>OPTIONS</option>
              </select>
              
              <input 
                v-model="currentRequest.url"
                type="text"
                placeholder="Enter URL..."
                class="flex-1 min-w-0 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 text-sm"
              />
            </div>
            
            <button 
              @click="sendRequest"
              :disabled="loading || !currentRequest.url"
              class="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              {{ loading ? 'Sending...' : 'Send' }}
            </button>
          </div>
          
          <!-- Headers -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="text-xs xs:text-sm font-medium text-gray-700 dark:text-gray-300">Headers</label>
              <button 
                @click="addHeader"
                class="text-xs xs:text-sm text-blue-500 hover:text-blue-600"
              >
                + Add
              </button>
            </div>
            
            <div class="space-y-2">
              <div 
                v-for="(header, index) in currentRequest.headers" 
                :key="index"
                class="flex flex-col xs:flex-row gap-2"
              >
                <input 
                  v-model="header.name"
                  type="text"
                  placeholder="Header name"
                  class="flex-1 px-2 xs:px-3 py-1.5 xs:py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 text-xs xs:text-sm"
                />
                <input 
                  v-model="header.value"
                  type="text"
                  placeholder="Value"
                  class="flex-1 px-2 xs:px-3 py-1.5 xs:py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 text-xs xs:text-sm"
                />
                <button 
                  @click="removeHeader(index)"
                  class="w-full xs:w-auto px-2 xs:px-3 py-1.5 xs:py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg text-sm"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
          
          <!-- Body -->
          <div v-if="['POST', 'PUT', 'PATCH'].includes(currentRequest.method)">
            <label class="text-xs xs:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Body</label>
            <select 
              v-model="currentRequest.bodyType"
              class="w-full mb-2 px-2 xs:px-3 py-1.5 xs:py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs xs:text-sm"
            >
              <option value="json">JSON</option>
              <option value="text">Text</option>
              <option value="form">Form Data</option>
            </select>
            
            <textarea 
              v-model="currentRequest.body"
              rows="6"
              placeholder="Enter request body..."
              class="w-full px-2 xs:px-3 py-1.5 xs:py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 font-mono text-xs xs:text-sm"
            ></textarea>
          </div>
        </div>
      </div>
      
      <!-- Response -->
      <div v-if="hasResponse" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-2 xs:p-4">
        <div class="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 mb-2 xs:mb-4">
          <h2 class="text-base xs:text-lg font-semibold text-gray-900 dark:text-white">Response</h2>
          <div v-if="response && !response.error" class="flex items-center gap-2 flex-wrap">
            <span :class="[
              'px-2 py-1 rounded text-xs xs:text-sm font-medium',
              response.status >= 200 && response.status < 300 ? 'bg-green-100 text-green-800' :
              response.status >= 400 ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            ]">
              {{ response.status }} {{ response.statusText }}
            </span>
            <span class="text-xs xs:text-sm text-gray-600 dark:text-gray-400">{{ response.timing }}ms</span>
          </div>
        </div>
        
        <div v-if="response.error" class="p-2 xs:p-4 bg-red-50 dark:bg-red-900 rounded-lg">
          <p class="text-sm text-red-800 dark:text-red-200 break-words">{{ response.message }}</p>
        </div>
        
        <div v-else class="space-y-2 xs:space-y-3">
          <!-- Response Headers -->
          <div>
            <label class="text-xs xs:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Headers</label>
            <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-2 xs:p-3 max-h-32 overflow-y-auto">
              <div 
                v-for="(value, key) in response.headers" 
                :key="key"
                class="text-xs xs:text-sm font-mono text-gray-700 dark:text-gray-300 break-all"
              >
                <span class="font-semibold">{{ key }}:</span> {{ value }}
              </div>
            </div>
          </div>
          
          <!-- Response Body -->
          <div>
            <label class="text-xs xs:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Body</label>
            <pre class="bg-gray-50 dark:bg-gray-900 rounded-lg p-2 xs:p-3 text-xs xs:text-sm font-mono text-gray-700 dark:text-gray-300 overflow-x-auto max-h-96 overflow-y-auto">{{ formatBody(response.body) }}</pre>
          </div>
        </div>
      </div>
      
      <!-- History & Favorites -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-2 xs:p-4">
        <div class="flex flex-wrap gap-2 xs:gap-4 mb-2 xs:mb-4">
          <button 
            @click="activeTab = 'history'"
            :class="[
              'px-2 xs:px-4 py-1.5 xs:py-2 rounded-lg text-xs xs:text-sm font-medium transition-colors',
              activeTab === 'history' 
                ? 'bg-blue-500 text-white' 
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            ]"
          >
            History ({{ history.length }})
          </button>
          
          <button 
            @click="activeTab = 'favorites'"
            :class="[
              'px-2 xs:px-4 py-1.5 xs:py-2 rounded-lg text-xs xs:text-sm font-medium transition-colors',
              activeTab === 'favorites' 
                ? 'bg-blue-500 text-white' 
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            ]"
          >
            Favorites ({{ favorites.length }})
          </button>
          
          <button 
            v-if="activeTab === 'history'"
            @click="clearHistory"
            class="ml-auto text-xs xs:text-sm text-red-500 hover:text-red-600"
          >
            Clear
          </button>
        </div>
        
        <div v-if="activeTab === 'history'" class="space-y-2 max-h-64 overflow-y-auto">
          <div 
            v-for="item in history.filter(item => item && item.id)" 
            :key="item.id"
            class="flex items-center justify-between p-2 xs:p-3 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
            @click="loadRequest(item.request)"
          >
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span class="text-xs font-medium text-gray-500 shrink-0">{{ item.request?.method || 'GET' }}</span>
                <span class="text-xs xs:text-sm text-gray-900 dark:text-white truncate">{{ item.request?.url || 'No URL' }}</span>
              </div>
              <span class="text-xs text-gray-500">{{ formatDate(item.timestamp) }}</span>
            </div>
            
            <button 
              @click.stop="addToFavorites(item.request)"
              class="p-1.5 xs:p-2 text-gray-400 hover:text-yellow-500 shrink-0"
              title="Add to favorites"
            >
              ★
            </button>
          </div>
          
          <div v-if="history.length === 0" class="text-center text-gray-500 py-8 text-sm">
            No history yet
          </div>
        </div>
        
        <div v-if="activeTab === 'favorites'" class="space-y-2 max-h-64 overflow-y-auto">
          <div 
            v-for="item in favorites.filter(item => item && item.id)" 
            :key="item.id"
            class="flex items-center justify-between p-2 xs:p-3 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <div 
              class="flex-1 cursor-pointer min-w-0"
              @click="loadRequest(item.request)"
            >
              <div class="flex items-center gap-2">
                <span class="text-xs font-medium text-gray-500 shrink-0">{{ item.request?.method || 'GET' }}</span>
                <span class="text-xs xs:text-sm text-gray-900 dark:text-white truncate">{{ item.request?.url || 'No URL' }}</span>
              </div>
            </div>
            
            <button 
              @click="removeFromFavorites(item.id)"
              class="p-1.5 xs:p-2 text-red-500 hover:text-red-600 shrink-0"
              title="Remove from favorites"
            >
              ×
            </button>
          </div>
          
          <div v-if="favorites.length === 0" class="text-center text-gray-500 py-8 text-sm">
            No favorites yet
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useApiStore } from '@/store/api'

const apiStore = useApiStore()
const {
  currentRequest,
  response,
  loading,
  history,
  favorites,
  hasResponse
} = storeToRefs(apiStore)

const {
  sendRequest,
  addToFavorites,
  removeFromFavorites,
  loadRequest,
  clearHistory,
  addHeader,
  removeHeader
} = apiStore

const activeTab = ref('history')

function formatBody(body) {
  if (typeof body === 'object') {
    return JSON.stringify(body, null, 2)
  }
  return body
}

function formatDate(timestamp) {
  const date = new Date(timestamp)
  return date.toLocaleString()
}

onMounted(() => {
  if (currentRequest.value.headers.length === 0) {
    addHeader()
  }
})
</script>
