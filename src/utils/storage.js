/**
 * Storage utility for managing Chrome extension storage
 */

/**
 * Save data to Chrome storage
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 * @param {boolean} sync - Use sync storage instead of local
 */
export async function saveToStorage(key, value, sync = false) {
  const storage = sync ? chrome.storage.sync : chrome.storage.local
  await storage.set({ [key]: value })
}

/**
 * Load data from Chrome storage
 * @param {string|string[]} keys - Storage key(s)
 * @param {boolean} sync - Use sync storage instead of local
 * @returns {Promise<any>}
 */
export async function loadFromStorage(keys, sync = false) {
  const storage = sync ? chrome.storage.sync : chrome.storage.local
  const data = await storage.get(keys)
  return data
}

/**
 * Remove data from Chrome storage
 * @param {string|string[]} keys - Storage key(s) to remove
 * @param {boolean} sync - Use sync storage instead of local
 */
export async function removeFromStorage(keys, sync = false) {
  const storage = sync ? chrome.storage.sync : chrome.storage.local
  await storage.remove(keys)
}

/**
 * Clear all data from Chrome storage
 * @param {boolean} sync - Clear sync storage instead of local
 */
export async function clearStorage(sync = false) {
  const storage = sync ? chrome.storage.sync : chrome.storage.local
  await storage.clear()
}

/**
 * Get all data from Chrome storage
 * @param {boolean} sync - Use sync storage instead of local
 * @returns {Promise<Object>}
 */
export async function getAllStorage(sync = false) {
  const storage = sync ? chrome.storage.sync : chrome.storage.local
  const data = await storage.get(null)
  return data
}

/**
 * Watch for storage changes
 * @param {Function} callback - Callback function(changes, areaName)
 */
export function watchStorage(callback) {
  chrome.storage.onChanged.addListener(callback)
}

/**
 * Export all extension data
 * @returns {Promise<Object>}
 */
export async function exportAllData() {
  const [localData, syncData] = await Promise.all([
    getAllStorage(false),
    getAllStorage(true)
  ])
  
  return {
    local: localData,
    sync: syncData,
    exportedAt: new Date().toISOString(),
    version: chrome.runtime.getManifest().version
  }
}

/**
 * Import extension data
 * @param {Object} data - Data object to import
 * @returns {Promise<boolean>}
 */
export async function importAllData(data) {
  try {
    if (data.local) {
      await chrome.storage.local.set(data.local)
    }
    if (data.sync) {
      await chrome.storage.sync.set(data.sync)
    }
    return true
  } catch (error) {
    console.error('Failed to import data:', error)
    return false
  }
}
