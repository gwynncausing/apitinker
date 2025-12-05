import { defineStore } from 'pinia'
import { ref } from 'vue'
import SwaggerParser from 'swagger-parser'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'

const ajv = new Ajv({ allErrors: true, strict: false })
addFormats(ajv)

export const useContractStore = defineStore('contract', () => {
  // State
  const contracts = ref([])
  const activeContract = ref(null)

  // Actions
  function addContract(contract) {
    const newContract = {
      id: Date.now(),
      name: contract.name || 'Untitled Contract',
      type: contract.type || 'openapi',
      content: contract.content || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    contracts.value.push(newContract)
    saveContracts()
    return newContract
  }
  
  function updateContract(id, updates) {
    const index = contracts.value.findIndex(c => c.id === id)
    if (index !== -1) {
      contracts.value[index] = {
        ...contracts.value[index],
        ...updates,
        updatedAt: new Date().toISOString()
      }
      saveContracts()
    }
  }
  
  function deleteContract(id) {
    contracts.value = contracts.value.filter(c => c.id !== id)
    if (activeContract.value?.id === id) {
      activeContract.value = null
    }
    saveContracts()
  }
  
  function setActiveContract(id) {
    activeContract.value = contracts.value.find(c => c.id === id) || null
  }
  
  async function validateContract(contract) {
    try {
      if (contract.type === 'openapi') {
        await SwaggerParser.validate(contract.content)
        return { valid: true, errors: [] }
      } else if (contract.type === 'jsonschema') {
        const validate = ajv.compile(contract.content)
        // Just validate the schema itself
        return { valid: true, errors: [] }
      }
      return { valid: false, errors: ['Unknown contract type'] }
    } catch (error) {
      return {
        valid: false,
        errors: [error.message]
      }
    }
  }
  
  async function validateAgainstContract(contractId, data) {
    const contract = contracts.value.find(c => c.id === contractId)
    if (!contract) {
      return { valid: false, errors: ['Contract not found'] }
    }
    
    try {
      if (contract.type === 'jsonschema') {
        const validate = ajv.compile(contract.content)
        const valid = validate(data)
        return {
          valid,
          errors: valid ? [] : validate.errors.map(e => `${e.instancePath} ${e.message}`)
        }
      } else if (contract.type === 'openapi') {
        // Basic OpenAPI validation
        const api = await SwaggerParser.dereference(contract.content)
        // TODO: Implement full OpenAPI validation
        return { valid: true, errors: [] }
      }
      return { valid: false, errors: ['Validation not supported for this contract type'] }
    } catch (error) {
      return {
        valid: false,
        errors: [error.message]
      }
    }
  }
  
  function exportContract(id) {
    const contract = contracts.value.find(c => c.id === id)
    if (!contract) return null
    
    return JSON.stringify(contract.content, null, 2)
  }
  
  function importContract(name, type, jsonString) {
    try {
      const content = JSON.parse(jsonString)
      return addContract({ name, type, content })
    } catch (error) {
      console.error('Failed to import contract:', error)
      return null
    }
  }
  
  async function saveContracts() {
    await chrome.storage.local.set({ contracts: contracts.value })
  }
  
  async function loadData() {
    const data = await chrome.storage.local.get(['contracts'])
    if (data.contracts) {
      contracts.value = data.contracts
    }
  }
  
  function diffContracts(contract1Id, contract2Id) {
    const c1 = contracts.value.find(c => c.id === contract1Id)
    const c2 = contracts.value.find(c => c.id === contract2Id)
    
    if (!c1 || !c2) return null
    
    // Simple string-based diff
    const str1 = JSON.stringify(c1.content, null, 2)
    const str2 = JSON.stringify(c2.content, null, 2)
    
    return {
      contract1: c1.name,
      contract2: c2.name,
      identical: str1 === str2,
      diff: {
        // TODO: Implement proper diff algorithm
        message: str1 === str2 ? 'Contracts are identical' : 'Contracts differ'
      }
    }
  }
  
  return {
    contracts,
    activeContract,
    addContract,
    updateContract,
    deleteContract,
    setActiveContract,
    validateContract,
    validateAgainstContract,
    exportContract,
    importContract,
    diffContracts,
    loadData
  }
})
