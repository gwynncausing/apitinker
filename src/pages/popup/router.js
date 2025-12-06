import { createRouter, createMemoryHistory } from 'vue-router'
import ApiClient from '@/components/ApiClient.vue'
import MockManager from '@/components/MockManager.vue'
import BugReporter from '@/components/BugReporter.vue'
import Settings from '@/components/Settings.vue'

const routes = [
  { path: '/', name: 'ApiClient', component: ApiClient },
  { path: '/mocks', name: 'Mocks', component: MockManager },
  { path: '/bugs', name: 'Bugs', component: BugReporter },
  { path: '/settings', name: 'Settings', component: Settings }
]

const router = createRouter({
  history: createMemoryHistory(),
  routes
})

// Save current route to storage
router.afterEach((to) => {
  chrome.storage.local.set({ lastRoute: to.path })
})

// Load last route from storage
chrome.storage.local.get(['lastRoute']).then((data) => {
  if (data.lastRoute && data.lastRoute !== '/') {
    router.push(data.lastRoute)
  }
})

export default router
