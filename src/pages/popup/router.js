import { createRouter, createMemoryHistory } from 'vue-router'
import ApiClient from '@/components/ApiClient.vue'
import MockManager from '@/components/MockManager.vue'
import ContractEditor from '@/components/ContractEditor.vue'
import BugReporter from '@/components/BugReporter.vue'
import Settings from '@/components/Settings.vue'

const routes = [
  { path: '/', name: 'ApiClient', component: ApiClient },
  { path: '/mocks', name: 'Mocks', component: MockManager },
  { path: '/contracts', name: 'Contracts', component: ContractEditor },
  { path: '/bugs', name: 'Bugs', component: BugReporter },
  { path: '/settings', name: 'Settings', component: Settings }
]

const router = createRouter({
  history: createMemoryHistory(),
  routes
})

export default router
