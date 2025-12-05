import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useBugReportStore = defineStore('bugReport', () => {
  // State
  const reports = ref([])
  const currentReport = ref(null)

  // Actions
  async function createReport(title, description) {
    // Ensure reports is always an array
    if (!Array.isArray(reports.value)) {
      reports.value = []
    }
    
    const [consoleLogs, errorLogs, apiLogs] = await Promise.all([
      getConsoleLogs(),
      getErrorLogs(),
      getApiLogs()
    ])
    
    const report = {
      id: Date.now(),
      title,
      description,
      consoleLogs,
      errorLogs,
      apiLogs,
      timestamp: new Date().toISOString(),
      url: window.location?.href || 'N/A'
    }
    
    reports.value.unshift(report)
    currentReport.value = report
    saveReports()
    
    return report
  }
  
  async function getConsoleLogs() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (!tab) return []
      
      const response = await chrome.tabs.sendMessage(tab.id, { type: 'GET_CONSOLE_LOGS' })
      return response.logs || []
    } catch (error) {
      console.error('Failed to get console logs:', error)
      return []
    }
  }
  
  async function getErrorLogs() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (!tab) return []
      
      const response = await chrome.tabs.sendMessage(tab.id, { type: 'GET_ERROR_LOGS' })
      return response.errors || []
    } catch (error) {
      console.error('Failed to get error logs:', error)
      return []
    }
  }
  
  async function getApiLogs() {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_LOGS' })
      return response.logs || []
    } catch (error) {
      console.error('Failed to get API logs:', error)
      return []
    }
  }
  
  function deleteReport(id) {
    reports.value = reports.value.filter(r => r.id !== id)
    if (currentReport.value?.id === id) {
      currentReport.value = null
    }
    saveReports()
  }
  
  function setCurrentReport(id) {
    currentReport.value = reports.value.find(r => r.id === id) || null
  }
  
  function exportAsJson(report) {
    return JSON.stringify(report, null, 2)
  }
  
  function exportAsMarkdown(report) {
    let markdown = `# Bug Report: ${report.title}\n\n`
    markdown += `**Date:** ${new Date(report.timestamp).toLocaleString()}\n\n`
    markdown += `**URL:** ${report.url}\n\n`
    markdown += `## Description\n\n${report.description}\n\n`
    
    if (report.errorLogs && report.errorLogs.length > 0) {
      markdown += `## Errors\n\n`
      report.errorLogs.forEach(error => {
        markdown += `- **${error.timestamp}**: ${error.message}\n`
        if (error.stack) {
          markdown += `  \`\`\`\n  ${error.stack}\n  \`\`\`\n`
        }
      })
      markdown += `\n`
    }
    
    if (report.consoleLogs && report.consoleLogs.length > 0) {
      markdown += `## Console Logs\n\n`
      report.consoleLogs.slice(-10).forEach(log => {
        markdown += `- **[${log.type}]** ${log.timestamp}: ${log.message}\n`
      })
      markdown += `\n`
    }
    
    if (report.apiLogs && report.apiLogs.length > 0) {
      markdown += `## API Requests\n\n`
      report.apiLogs.slice(-10).forEach(log => {
        markdown += `- **${log.method}** ${log.url} - ${log.timestamp}\n`
      })
    }
    
    return markdown
  }
  
  async function saveReports() {
    await chrome.storage.local.set({ bugReports: reports.value })
  }
  
  async function loadData() {
    const data = await chrome.storage.local.get(['bugReports'])
    
    // Ensure reports is always an array
    if (data.bugReports && Array.isArray(data.bugReports)) {
      reports.value = data.bugReports
    } else {
      reports.value = []
    }
  }
  
  return {
    reports,
    currentReport,
    createReport,
    deleteReport,
    setCurrentReport,
    exportAsJson,
    exportAsMarkdown,
    loadData
  }
})
