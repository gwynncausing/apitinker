import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useApiStore } from '@/store/api'

describe('API Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes with default state', () => {
    const store = useApiStore()
    expect(store.requests).toEqual([])
    expect(store.history).toEqual([])
    expect(store.favorites).toEqual([])
    expect(store.loading).toBe(false)
    expect(store.response).toBe(null)
  })

  it('adds header to current request', () => {
    const store = useApiStore()
    store.addHeader()
    expect(store.currentRequest.headers.length).toBe(1)
    expect(store.currentRequest.headers[0]).toEqual({ name: '', value: '' })
  })

  it('removes header from current request', () => {
    const store = useApiStore()
    store.addHeader()
    store.addHeader()
    expect(store.currentRequest.headers.length).toBe(2)
    
    store.removeHeader(0)
    expect(store.currentRequest.headers.length).toBe(1)
  })

  it('adds request to favorites', () => {
    const store = useApiStore()
    const request = {
      url: 'https://api.example.com',
      method: 'GET',
      headers: {},
      body: ''
    }
    
    store.addToFavorites(request)
    expect(store.favorites.length).toBe(1)
    expect(store.favorites[0].request).toEqual(request)
  })

  it('removes request from favorites', () => {
    const store = useApiStore()
    const request = {
      url: 'https://api.example.com',
      method: 'GET',
      headers: {},
      body: ''
    }
    
    store.addToFavorites(request)
    const favoriteId = store.favorites[0].id
    
    store.removeFromFavorites(favoriteId)
    expect(store.favorites.length).toBe(0)
  })
})
