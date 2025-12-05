<template>
  <div class="contract-editor">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-4">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">API Contracts</h2>
        
        <div class="flex gap-2">
          <button 
            @click="showAddContract = true"
            class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
          >
            + New Contract
          </button>
          
          <button 
            @click="showImport = true"
            class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
          >
            Import
          </button>
        </div>
      </div>
      
      <!-- Contracts List -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
        <div 
          v-for="contract in contracts" 
          :key="contract.id"
          class="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
          @click="viewContract(contract)"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h3 class="font-medium text-gray-900 dark:text-white mb-1">{{ contract.name }}</h3>
              <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span class="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded">
                  {{ contract.type }}
                </span>
                <span>{{ formatDate(contract.updatedAt) }}</span>
              </div>
            </div>
            
            <div class="flex gap-2">
              <button 
                @click.stop="exportContract(contract.id)"
                class="p-2 text-green-500 hover:bg-green-50 dark:hover:bg-green-900 rounded"
                title="Export"
              >
                ⬇
              </button>
              
              <button 
                @click.stop="deleteContract(contract.id)"
                class="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900 rounded"
                title="Delete"
              >
                ×
              </button>
            </div>
          </div>
        </div>
        
        <div v-if="contracts.length === 0" class="col-span-2 text-center text-gray-500 py-8">
          No contracts yet. Create one to get started.
        </div>
      </div>
    </div>
    
    <!-- Contract Viewer/Editor -->
    <div v-if="activeContract" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ activeContract.name }}</h3>
        
        <div class="flex gap-2">
          <button 
            @click="validateCurrentContract"
            class="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm"
          >
            Validate
          </button>
          
          <button 
            @click="saveActiveContract"
            class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
          >
            Save
          </button>
          
          <button 
            @click="activeContract = null"
            class="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors text-sm"
          >
            Close
          </button>
        </div>
      </div>
      
      <textarea 
        v-model="contractContent"
        rows="20"
        class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
      ></textarea>
      
      <!-- Validation Results -->
      <div v-if="validationResult" class="mt-4">
        <div 
          v-if="validationResult.valid"
          class="p-4 bg-green-50 dark:bg-green-900 rounded-lg"
        >
          <p class="text-green-800 dark:text-green-200 font-medium">✓ Contract is valid</p>
        </div>
        
        <div 
          v-else
          class="p-4 bg-red-50 dark:bg-red-900 rounded-lg"
        >
          <p class="text-red-800 dark:text-red-200 font-medium mb-2">✗ Validation errors:</p>
          <ul class="list-disc list-inside text-red-700 dark:text-red-300 text-sm">
            <li v-for="(error, index) in validationResult.errors" :key="index">{{ error }}</li>
          </ul>
        </div>
      </div>
    </div>
    
    <!-- Add Contract Modal -->
    <div 
      v-if="showAddContract" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="showAddContract = false"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">New Contract</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contract Name</label>
            <input 
              v-model="newContract.name"
              type="text"
              placeholder="My API Contract"
              class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
            <select 
              v-model="newContract.type"
              class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="openapi">OpenAPI 3</option>
              <option value="jsonschema">JSON Schema</option>
            </select>
          </div>
          
          <div class="flex gap-4 mt-6">
            <button 
              @click="createContract"
              class="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Create
            </button>
            
            <button 
              @click="showAddContract = false"
              class="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>
          </div>
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
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Import Contract</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contract Name</label>
            <input 
              v-model="importForm.name"
              type="text"
              placeholder="Imported Contract"
              class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
            <select 
              v-model="importForm.type"
              class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="openapi">OpenAPI 3</option>
              <option value="jsonschema">JSON Schema</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contract Content</label>
            <textarea 
              v-model="importForm.content"
              rows="12"
              placeholder="Paste contract JSON here..."
              class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
            ></textarea>
          </div>
          
          <div class="flex gap-4">
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
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useContractStore } from '@/store/contract'

const contractStore = useContractStore()
const { contracts, activeContract } = storeToRefs(contractStore)
const {
  addContract,
  updateContract,
  deleteContract,
  setActiveContract,
  validateContract,
  exportContract: exportContractData,
  importContract
} = contractStore

const showAddContract = ref(false)
const showImport = ref(false)
const validationResult = ref(null)
const contractContent = ref('')

const newContract = ref({
  name: '',
  type: 'openapi'
})

const importForm = ref({
  name: '',
  type: 'openapi',
  content: ''
})

watch(activeContract, (contract) => {
  if (contract) {
    contractContent.value = JSON.stringify(contract.content, null, 2)
    validationResult.value = null
  }
})

function viewContract(contract) {
  setActiveContract(contract.id)
}

function createContract() {
  const template = newContract.value.type === 'openapi' 
    ? getOpenAPITemplate() 
    : getJSONSchemaTemplate()
  
  const contract = addContract({
    name: newContract.value.name,
    type: newContract.value.type,
    content: template
  })
  
  setActiveContract(contract.id)
  showAddContract.value = false
  newContract.value = { name: '', type: 'openapi' }
}

async function validateCurrentContract() {
  if (activeContract.value) {
    try {
      const content = JSON.parse(contractContent.value)
      validationResult.value = await validateContract({
        ...activeContract.value,
        content
      })
    } catch (error) {
      validationResult.value = {
        valid: false,
        errors: ['Invalid JSON: ' + error.message]
      }
    }
  }
}

function saveActiveContract() {
  if (activeContract.value) {
    try {
      const content = JSON.parse(contractContent.value)
      updateContract(activeContract.value.id, { content })
      alert('Contract saved successfully!')
    } catch (error) {
      alert('Invalid JSON: ' + error.message)
    }
  }
}

function exportContract(id) {
  const data = exportContractData(id)
  if (data) {
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `contract-${id}.json`
    a.click()
    URL.revokeObjectURL(url)
  }
}

function doImport() {
  const contract = importContract(
    importForm.value.name,
    importForm.value.type,
    importForm.value.content
  )
  
  if (contract) {
    setActiveContract(contract.id)
    showImport.value = false
    importForm.value = { name: '', type: 'openapi', content: '' }
    alert('Contract imported successfully!')
  } else {
    alert('Failed to import contract. Please check the format.')
  }
}

function getOpenAPITemplate() {
  return {
    openapi: '3.0.0',
    info: {
      title: 'Sample API',
      version: '1.0.0',
      description: 'A sample API'
    },
    paths: {
      '/example': {
        get: {
          summary: 'Example endpoint',
          responses: {
            '200': {
              description: 'Successful response',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string'
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

function getJSONSchemaTemplate() {
  return {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    properties: {
      name: {
        type: 'string'
      },
      age: {
        type: 'number'
      }
    },
    required: ['name']
  }
}

function formatDate(timestamp) {
  const date = new Date(timestamp)
  return date.toLocaleDateString()
}
</script>
