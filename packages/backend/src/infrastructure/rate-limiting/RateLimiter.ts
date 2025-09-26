import { ICacheService } from '../../domain/interfaces/ICacheService'

export interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
  total: number
}

export class RateLimiter {
  constructor(
    private cacheService: ICacheService,
    private config: RateLimitConfig
  ) {}

  async checkLimit(identifier: string): Promise<RateLimitResult> {
    const key = `rate_limit:${identifier}`
    const now = Date.now()
    const windowStart = now - this.config.windowMs

    const requests = await this.cacheService.get<number[]>(key) || []

    const validRequests = requests.filter(timestamp => timestamp > windowStart)

    const allowed = validRequests.length < this.config.maxRequests

    if (allowed) {
      validRequests.push(now)
      await this.cacheService.set(key, validRequests, Math.ceil(this.config.windowMs / 1000))
    }

    return {
      allowed,
      remaining: Math.max(0, this.config.maxRequests - validRequests.length - (allowed ? 1 : 0)),
      resetTime: windowStart + this.config.windowMs,
      total: this.config.maxRequests
    }
  }

  async reset(identifier: string): Promise<void> {
    const key = `rate_limit:${identifier}`
    await this.cacheService.delete(key)
  }
}