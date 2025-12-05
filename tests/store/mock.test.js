import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useMockStore } from '@/store/mock'

describe('Mock Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes with default state', () => {
    const store = useMockStore()
    expect(store.rules).toEqual([])
    expect(store.activeEnvironment).toBe('default')
    expect(store.environments).toContain('default')
  })

  it('adds a new rule', () => {
    const store = useMockStore()
    const rule = {
      name: 'Test Rule',
      urlPattern: '*://api.example.com/*',
      action: 'modifyHeaders'
    }
    
    store.addRule(rule)
    expect(store.rules.length).toBe(1)
    expect(store.rules[0].name).toBe('Test Rule')
    expect(store.rules[0].enabled).toBe(true)
  })

  it('toggles rule enabled state', () => {
    const store = useMockStore()
    const rule = {
      name: 'Test Rule',
      urlPattern: '*://api.example.com/*',
      action: 'block'
    }
    
    store.addRule(rule)
    const ruleId = store.rules[0].id
    
    expect(store.rules[0].enabled).toBe(true)
    store.toggleRule(ruleId)
    expect(store.rules[0].enabled).toBe(false)
  })

  it('deletes a rule', () => {
    const store = useMockStore()
    store.addRule({ name: 'Rule 1', urlPattern: '*://test1.com/*', action: 'block' })
    store.addRule({ name: 'Rule 2', urlPattern: '*://test2.com/*', action: 'block' })
    
    expect(store.rules.length).toBe(2)
    
    const ruleId = store.rules[0].id
    store.deleteRule(ruleId)
    
    expect(store.rules.length).toBe(1)
    expect(store.rules[0].name).toBe('Rule 2')
  })

  it('exports and imports rules', () => {
    const store = useMockStore()
    store.addRule({ name: 'Test Rule', urlPattern: '*://api.test.com/*', action: 'redirect' })
    
    const exported = store.exportRules()
    expect(exported).toContain('Test Rule')
    
    // Clear rules
    store.rules = []
    
    // Import back
    const success = store.importRules(exported)
    expect(success).toBe(true)
    expect(store.rules.length).toBe(1)
    expect(store.rules[0].name).toBe('Test Rule')
  })
})
