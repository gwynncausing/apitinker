<template>
  <div class="mock-manager">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-2 xs:p-4 mb-2 xs:mb-4">
      <div class="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 xs:gap-0 mb-2 xs:mb-4">
        <h2 class="text-base xs:text-lg font-semibold text-gray-900 dark:text-white">Mock Rules</h2>
        
        <div class="flex flex-wrap gap-2 w-full xs:w-auto">
          <select 
            v-model="activeEnvironment"
            @change="setEnvironment(activeEnvironment)"
            class="flex-1 xs:flex-none px-2 xs:px-3 py-1.5 xs:py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs xs:text-sm"
          >
            <option v-for="env in environments" :key="env" :value="env">
              {{ env }}
            </option>
          </select>
          
          <button 
            @click="showAddRule = true"
            class="px-2 xs:px-4 py-1.5 xs:py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-xs xs:text-sm"
          >
            + Add
          </button>
          
          <button 
            @click="showExport = true"
            class="px-2 xs:px-4 py-1.5 xs:py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-xs xs:text-sm"
          >
            Export
          </button>
          
          <button 
            @click="showImport = true"
            class="px-2 xs:px-4 py-1.5 xs:py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-xs xs:text-sm"
          >
            Import
          </button>
        </div>
      </div>
      
      <!-- Rules List -->
      <div class="space-y-2 max-h-96 overflow-y-auto">
        <div 
          v-for="rule in getActiveRules().filter(rule => rule && rule.id)" 
          :key="rule.id"
          class="p-2 xs:p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
        >
          <div class="flex flex-col xs:flex-row items-start justify-between gap-2">
            <div class="flex-1 w-full xs:w-auto">
              <div class="flex items-center gap-2 mb-2 flex-wrap">
                <input 
                  type="checkbox" 
                  :checked="rule.enabled"
                  @change="toggleRule(rule.id)"
                  class="w-4 h-4 xs:w-5 xs:h-5 rounded shrink-0"
                />
                <span class="text-xs xs:text-sm font-medium text-gray-900 dark:text-white break-all">{{ rule.name || 'Unnamed Rule' }}</span>
                <span class="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded shrink-0">
                  {{ rule.action || 'Unknown' }}
                </span>
              </div>
              
              <div class="ml-0 xs:ml-7 space-y-1 text-xs xs:text-sm text-gray-600 dark:text-gray-400">
                <div class="break-all"><span class="font-medium">URL:</span> {{ rule.urlPattern }}</div>
                <div v-if="rule.method"><span class="font-medium">Method:</span> {{ rule.method }}</div>
                <div v-if="rule.delay"><span class="font-medium">Delay:</span> {{ rule.delay }}ms</div>
              </div>
            </div>
            
            <div class="flex gap-2 w-full xs:w-auto">
              <button 
                @click="editRule(rule)"
                class="flex-1 xs:flex-none px-3 py-1.5 xs:p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900 rounded text-sm xs:text-base"
                title="Edit"
              >
                Edit
              </button>
              
              <button 
                @click="deleteRule(rule.id)"
                class="flex-1 xs:flex-none px-3 py-1.5 xs:p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900 rounded text-sm xs:text-base"
                title="Delete"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
        
        <div v-if="getActiveRules().length === 0" class="text-center text-gray-500 py-8 text-sm">
          No rules for {{ activeEnvironment }} environment
        </div>
      </div>
    </div>
    
    <!-- Add/Edit Rule Modal -->
    <div 
      v-if="showAddRule || editingRule" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 xs:p-4"
      @click.self="closeModal"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-3 xs:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 class="text-base xs:text-xl font-semibold text-gray-900 dark:text-white mb-3 xs:mb-4">
          {{ editingRule ? 'Edit Rule' : 'Add Rule' }}
        </h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rule Name</label>
            <input 
              v-model="ruleForm.name"
              type="text"
              placeholder="My Rule"
              class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL Pattern</label>
            <input 
              v-model="ruleForm.urlPattern"
              type="text"
              placeholder="*://api.example.com/*"
              class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Action</label>
            <select 
              v-model="ruleForm.action"
              class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="modifyResponse">Modify Response</option>
              <option value="modifyHeaders">Modify Headers</option>
              <option value="block">Block</option>
              <option value="redirect">Redirect</option>
            </select>
          </div>
          
          <div v-if="ruleForm.action === 'redirect'">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Redirect URL</label>
            <input 
              v-model="ruleForm.redirectUrl"
              type="text"
              placeholder="https://mock.example.com/response"
              class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <!-- Modify Response Options -->
          <div v-if="ruleForm.action === 'modifyResponse'" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Modification Type</label>
              <select 
                v-model="ruleForm.modificationType"
                class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="replace">Replace Entire Response</option>
                <option value="merge">Merge with Response</option>
                <option value="set">Set Property</option>
                <option value="delete">Delete Property</option>
              </select>
            </div>
            
            <div v-if="ruleForm.modificationType === 'replace' || ruleForm.modificationType === 'merge'">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Response Data (JSON)</label>
              <textarea 
                v-model="ruleForm.responseData"
                rows="10"
                placeholder='{"status": "success", "data": {...}}'
                class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
              ></textarea>
              <p class="text-xs text-gray-500 mt-1">Enter valid JSON to modify the API response</p>
            </div>
            
            <div v-if="ruleForm.modificationType === 'set' || ruleForm.modificationType === 'delete'">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Property Path</label>
              <input 
                v-model="ruleForm.propertyPath"
                type="text"
                placeholder="data.user.email"
                class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <p class="text-xs text-gray-500 mt-1">Use dot notation for nested properties</p>
            </div>
            
            <div v-if="ruleForm.modificationType === 'set'">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Value</label>
              <input 
                v-model="ruleForm.propertyValue"
                type="text"
                placeholder='"new value" or 123 or true'
                class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Response Status (optional)</label>
              <input 
                v-model.number="ruleForm.responseStatus"
                type="number"
                placeholder="200"
                class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Delay (ms)</label>
              <input 
                v-model.number="ruleForm.delay"
                type="number"
                placeholder="0"
                class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          
          <div v-if="ruleForm.action === 'modifyHeaders'">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Response Headers</label>
            <div class="space-y-2">
              <div 
                v-for="(header, index) in ruleForm.modifyResponseHeaders" 
                :key="index"
                class="flex gap-2"
              >
                <input 
                  v-model="header.name"
                  type="text"
                  placeholder="Header name"
                  class="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
                <input 
                  v-model="header.value"
                  type="text"
                  placeholder="Value"
                  class="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
                <button 
                  @click="removeHeader(index)"
                  class="px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900 rounded"
                >
                  ×
                </button>
              </div>
              
              <button 
                @click="addResponseHeader"
                class="text-sm text-blue-500 hover:text-blue-600"
              >
                + Add Header
              </button>
            </div>
          </div>
          
          <div class="flex gap-4 mt-6">
            <button 
              @click="saveRule"
              class="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              {{ editingRule ? 'Update' : 'Add' }} Rule
            </button>
            
            <button 
              @click="closeModal"
              class="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Export Modal -->
    <div 
      v-if="showExport" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="showExport = false"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Export Rules</h3>
        
        <textarea 
          :value="exportRules()"
          readonly
          rows="15"
          class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm"
        ></textarea>
        
        <div class="flex gap-4 mt-4">
          <button 
            @click="copyExport"
            class="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Copy to Clipboard
          </button>
          
          <button 
            @click="showExport = false"
            class="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
    
    <!-- Import Modal -->
    <div 
      v-if="showImport" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="showImport = false"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Import Rules</h3>
        
        <textarea 
          v-model="importData"
          rows="15"
          placeholder="Paste exported rules JSON here..."
          class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
        ></textarea>
        
        <div class="flex gap-4 mt-4">
          <button 
            @click="doImport"
            class="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Import
          </button>
          
          <button 
            @click="showImport = false"
            class="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useMockStore } from '@/store/mock'

const mockStore = useMockStore()
const { activeEnvironment, environments } = storeToRefs(mockStore)
const {
  addRule,
  updateRule,
  deleteRule,
  toggleRule,
  getActiveRules,
  setEnvironment,
  exportRules,
  importRules
} = mockStore

const showAddRule = ref(false)
const showExport = ref(false)
const showImport = ref(false)
const editingRule = ref(null)
const importData = ref('')

const ruleForm = ref({
  name: '',
  urlPattern: '',
  action: 'modifyResponse',
  modificationType: 'replace',
  responseData: '',
  propertyPath: '',
  propertyValue: '',
  responseStatus: null,
  delay: 0,
  redirectUrl: '',
  modifyResponseHeaders: []
})

function editRule(rule) {
  editingRule.value = rule
  ruleForm.value = {
    name: rule.name,
    urlPattern: rule.urlPattern,
    action: rule.action,
    modificationType: rule.modificationType || 'replace',
    responseData: rule.responseData || '',
    propertyPath: rule.propertyPath || '',
    propertyValue: rule.propertyValue || '',
    responseStatus: rule.responseStatus || null,
    delay: rule.delay || 0,
    redirectUrl: rule.redirectUrl || '',
    modifyResponseHeaders: rule.modifyResponseHeaders ? [...rule.modifyResponseHeaders] : []
  }
}

function closeModal() {
  showAddRule.value = false
  editingRule.value = null
  ruleForm.value = {
    name: '',
    urlPattern: '',
    action: 'modifyResponse',
    modificationType: 'replace',
    responseData: '',
    propertyPath: '',
    propertyValue: '',
    responseStatus: null,
    delay: 0,
    redirectUrl: '',
    modifyResponseHeaders: []
  }
}

function saveRule() {
  const ruleData = { ...ruleForm.value }
  
  // Build response modifications array for modifyResponse action
  if (ruleData.action === 'modifyResponse') {
    ruleData.responseModifications = []
    
    switch (ruleData.modificationType) {
      case 'replace':
      case 'merge':
        try {
          const parsedData = JSON.parse(ruleData.responseData)
          ruleData.responseModifications.push({
            type: ruleData.modificationType,
            value: parsedData
          })
        } catch (e) {
          alert('Invalid JSON in response data')
          return
        }
        break
      
      case 'set':
        if (!ruleData.propertyPath) {
          alert('Property path is required')
          return
        }
        try {
          const parsedValue = JSON.parse(ruleData.propertyValue)
          ruleData.responseModifications.push({
            type: 'set',
            path: ruleData.propertyPath,
            value: parsedValue
          })
        } catch (e) {
          // If not valid JSON, use as string
          ruleData.responseModifications.push({
            type: 'set',
            path: ruleData.propertyPath,
            value: ruleData.propertyValue
          })
        }
        break
      
      case 'delete':
        if (!ruleData.propertyPath) {
          alert('Property path is required')
          return
        }
        ruleData.responseModifications.push({
          type: 'delete',
          path: ruleData.propertyPath
        })
        break
    }
  }
  
  if (editingRule.value) {
    updateRule(editingRule.value.id, ruleData)
  } else {
    addRule(ruleData)
  }
  closeModal()
}

function addResponseHeader() {
  ruleForm.value.modifyResponseHeaders.push({ name: '', value: '', operation: 'set' })
}

function removeHeader(index) {
  ruleForm.value.modifyResponseHeaders.splice(index, 1)
}

function copyExport() {
  navigator.clipboard.writeText(exportRules())
  alert('Copied to clipboard!')
}

function doImport() {
  if (importRules(importData.value)) {
    alert('Rules imported successfully!')
    showImport.value = false
    importData.value = ''
  } else {
    alert('Failed to import rules. Please check the format.')
  }
}
</script>
