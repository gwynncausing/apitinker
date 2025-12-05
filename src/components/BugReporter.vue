<template>
  <div class="bug-reporter">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-4">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Bug Reports</h2>
        
        <button 
          @click="showCreateReport = true"
          class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
        >
          + New Report
        </button>
      </div>
      
      <!-- Reports List -->
      <div class="space-y-2 max-h-96 overflow-y-auto">
        <div 
          v-for="report in reports" 
          :key="report.id"
          class="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
          @click="viewReport(report)"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h3 class="font-medium text-gray-900 dark:text-white mb-1">{{ report.title }}</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">{{ report.description }}</p>
              <div class="flex items-center gap-4 text-xs text-gray-500">
                <span>{{ formatDate(report.timestamp) }}</span>
                <span>{{ report.errorLogs?.length || 0 }} errors</span>
                <span>{{ report.apiLogs?.length || 0 }} API calls</span>
              </div>
            </div>
            
            <div class="flex gap-2">
              <button 
                @click.stop="exportReportJson(report)"
                class="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900 rounded"
                title="Export as JSON"
              >
                JSON
              </button>
              
              <button 
                @click.stop="exportReportMarkdown(report)"
                class="p-2 text-green-500 hover:bg-green-50 dark:hover:bg-green-900 rounded"
                title="Export as Markdown"
              >
                MD
              </button>
              
              <button 
                @click.stop="deleteReport(report.id)"
                class="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900 rounded"
                title="Delete"
              >
                ×
              </button>
            </div>
          </div>
        </div>
        
        <div v-if="reports.length === 0" class="text-center text-gray-500 py-8">
          No bug reports yet
        </div>
      </div>
    </div>
    
    <!-- Report Viewer -->
    <div v-if="currentReport" class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ currentReport.title }}</h3>
        
        <button 
          @click="currentReport = null"
          class="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors text-sm"
        >
          Close
        </button>
      </div>
      
      <div class="space-y-4">
        <div>
          <h4 class="text-sm font-semibold text-gray-900 dark:text-white mb-2">Description</h4>
          <p class="text-sm text-gray-700 dark:text-gray-300">{{ currentReport.description }}</p>
        </div>
        
        <div>
          <h4 class="text-sm font-semibold text-gray-900 dark:text-white mb-2">Details</h4>
          <div class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <p><span class="font-medium">Date:</span> {{ formatDate(currentReport.timestamp) }}</p>
            <p><span class="font-medium">URL:</span> {{ currentReport.url }}</p>
          </div>
        </div>
        
        <div v-if="currentReport.errorLogs && currentReport.errorLogs.length > 0">
          <h4 class="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Errors ({{ currentReport.errorLogs.length }})
          </h4>
          <div class="space-y-2 max-h-64 overflow-y-auto">
            <div 
              v-for="(error, index) in currentReport.errorLogs" 
              :key="index"
              class="p-3 bg-red-50 dark:bg-red-900 rounded-lg"
            >
              <p class="text-sm text-red-800 dark:text-red-200 font-medium">{{ error.message }}</p>
              <p class="text-xs text-red-600 dark:text-red-300 mt-1">{{ error.timestamp }}</p>
              <pre v-if="error.stack" class="text-xs text-red-700 dark:text-red-300 mt-2 overflow-x-auto">{{ error.stack }}</pre>
            </div>
          </div>
        </div>
        
        <div v-if="currentReport.consoleLogs && currentReport.consoleLogs.length > 0">
          <h4 class="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Console Logs ({{ currentReport.consoleLogs.length }})
          </h4>
          <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 max-h-64 overflow-y-auto">
            <div 
              v-for="(log, index) in currentReport.consoleLogs" 
              :key="index"
              class="text-sm font-mono mb-1"
              :class="{
                'text-gray-700 dark:text-gray-300': log.type === 'log',
                'text-yellow-600 dark:text-yellow-400': log.type === 'warn',
                'text-red-600 dark:text-red-400': log.type === 'error',
                'text-blue-600 dark:text-blue-400': log.type === 'info'
              }"
            >
              [{{ log.type }}] {{ log.timestamp }}: {{ log.message }}
            </div>
          </div>
        </div>
        
        <div v-if="currentReport.apiLogs && currentReport.apiLogs.length > 0">
          <h4 class="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            API Requests ({{ currentReport.apiLogs.length }})
          </h4>
          <div class="space-y-2 max-h-64 overflow-y-auto">
            <div 
              v-for="(log, index) in currentReport.apiLogs" 
              :key="index"
              class="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
            >
              <div class="flex items-center gap-2 text-sm">
                <span class="font-medium text-blue-600 dark:text-blue-400">{{ log.method }}</span>
                <span class="text-gray-700 dark:text-gray-300 truncate">{{ log.url }}</span>
              </div>
              <p class="text-xs text-gray-500 mt-1">{{ log.timestamp }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Create Report Modal -->
    <div 
      v-if="showCreateReport" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="showCreateReport = false"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">New Bug Report</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
            <input 
              v-model="newReport.title"
              type="text"
              placeholder="Bug title"
              class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea 
              v-model="newReport.description"
              rows="5"
              placeholder="Describe the bug..."
              class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            ></textarea>
          </div>
          
          <div class="flex gap-4">
            <button 
              @click="createReport"
              class="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Create Report
            </button>
            
            <button 
              @click="showCreateReport = false"
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
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useBugReportStore } from '@/store/bugReport'

const bugReportStore = useBugReportStore()
const { reports, currentReport } = storeToRefs(bugReportStore)
const {
  createReport: createBugReport,
  deleteReport,
  setCurrentReport,
  exportAsJson,
  exportAsMarkdown
} = bugReportStore

const showCreateReport = ref(false)
const newReport = ref({
  title: '',
  description: ''
})

function viewReport(report) {
  setCurrentReport(report.id)
}

async function createReport() {
  if (newReport.value.title && newReport.value.description) {
    await createBugReport(newReport.value.title, newReport.value.description)
    showCreateReport.value = false
    newReport.value = { title: '', description: '' }
  }
}

function exportReportJson(report) {
  const data = exportAsJson(report)
  downloadFile(data, `bug-report-${report.id}.json`, 'application/json')
}

function exportReportMarkdown(report) {
  const data = exportAsMarkdown(report)
  downloadFile(data, `bug-report-${report.id}.md`, 'text/markdown')
}

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function formatDate(timestamp) {
  const date = new Date(timestamp)
  return date.toLocaleString()
}
</script>
