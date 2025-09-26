import { ICacheService } from '../../domain/interfaces/ICacheService'

interface CacheItem<T> {
  value: T
  expiresAt: number
}

export class MemoryCacheService implements ICacheService {
  private cache = new Map<string, CacheItem<any>>()
  private defaultTTL = 300

  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key)

    if (!item) {
      return null
    }

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return item.value as T
  }

  async set<T>(key: string, value: T, ttlSeconds: number = this.defaultTTL): Promise<void> {
    const expiresAt = Date.now() + (ttlSeconds * 1000)
    this.cache.set(key, { value, expiresAt })
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key)
  }

  async deletePattern(pattern: string): Promise<void> {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'))
    const keysToDelete = Array.from(this.cache.keys()).filter(key => regex.test(key))
    keysToDelete.forEach(key => this.cache.delete(key))
  }

  async exists(key: string): Promise<boolean> {
    const item = this.cache.get(key)
    if (!item) return false

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  async increment(key: string, amount: number = 1): Promise<number> {
    const current = await this.get<number>(key) || 0
    const newValue = current + amount
    await this.set(key, newValue)
    return newValue
  }

  async expire(key: string, ttlSeconds: number): Promise<void> {
    const item = this.cache.get(key)
    if (item) {
      item.expiresAt = Date.now() + (ttlSeconds * 1000)
    }
  }

  cleanup(): void {
    const now = Date.now()
    const expiredKeys = Array.from(this.cache.entries())
      .filter(([_, item]) => now > item.expiresAt)
      .map(([key]) => key)

    expiredKeys.forEach(key => this.cache.delete(key))
  }

  startCleanupInterval(intervalMs: number = 60000): void {
    setInterval(() => this.cleanup(), intervalMs)
  }
}