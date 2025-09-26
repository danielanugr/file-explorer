import { DrizzleFolderRepository } from '../../repositories/drizzleFolderRepository'
import { FolderService } from '../../domain/services/FolderService'
import { MemoryCacheService } from '../cache/MemoryCacheService'
import { RateLimiter } from '../rate-limiting/RateLimiter'
import { FolderController } from '../../api/controllers/FolderController'
import { IFolderRepository } from '../../domain/interfaces/IFolderRepository'
import { ICacheService } from '../../domain/interfaces/ICacheService'
import { IFolderService } from '../../domain/services/IFolderService'

export class Container {
  private static instance: Container
  private services = new Map<string, any>()

  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container()
    }
    return Container.instance
  }

  private constructor() {
    this.setupServices()
  }

  private setupServices() {
    const cacheService = new MemoryCacheService()
    cacheService.startCleanupInterval()

    const folderRepository: IFolderRepository = new DrizzleFolderRepository()

    const folderService: IFolderService = new FolderService(
      folderRepository,
      cacheService
    )

    const rateLimiter = new RateLimiter(cacheService, {
      windowMs: 60 * 1000,
      maxRequests: 100,
      skipSuccessfulRequests: false
    })

    const folderController = new FolderController(folderService, rateLimiter)

    this.services.set('cacheService', cacheService)
    this.services.set('folderRepository', folderRepository)
    this.services.set('folderService', folderService)
    this.services.set('rateLimiter', rateLimiter)
    this.services.set('folderController', folderController)
  }

  get<T>(serviceName: string): T {
    const service = this.services.get(serviceName)
    if (!service) {
      throw new Error(`Service ${serviceName} not found`)
    }
    return service
  }

  getCacheService(): ICacheService {
    return this.get<ICacheService>('cacheService')
  }

  getFolderRepository(): IFolderRepository {
    return this.get<IFolderRepository>('folderRepository')
  }

  getFolderService(): IFolderService {
    return this.get<IFolderService>('folderService')
  }

  getRateLimiter(): RateLimiter {
    return this.get<RateLimiter>('rateLimiter')
  }

  getFolderController(): FolderController {
    return this.get<FolderController>('folderController')
  }
}