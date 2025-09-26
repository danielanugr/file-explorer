import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { createFoldersRouter } from './api/routes/folders'
import { testDrizzleConnection } from './config/drizzle'
import { Container } from './infrastructure/di/Container'

Container.getInstance()

const app = new Elysia()
  .use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }))
  .get('/', () => ({
    message: 'File Explorer Backend API - Enterprise Edition',
    version: '2.0.0',
    features: [
      'Pagination support',
      'Caching layer',
      'Rate limiting',
      'Hexagonal architecture',
      'SOLID principles'
    ],
    endpoints: [
      'GET /api/folders/tree - Get complete folder tree',
      'GET /api/folders/:id/children?page=1&limit=50 - Get paginated children',
      'GET /api/folders/root?page=1&limit=50 - Get paginated root folders',
      'GET /api/folders/search?q=term&page=1&limit=50 - Search with pagination'
    ]
  }))
  .use(createFoldersRouter())
  .listen(3000)

testDrizzleConnection().then(connected => {
  if (connected) {
    console.log(`🚀 Backend server running at http://localhost:3000`)
    console.log(`📁 API endpoints available:`)
    console.log(`   GET /api/folders/tree`)
    console.log(`   GET /api/folders/:id/children`)
    console.log(`   GET /api/folders/root`)
  } else {
    console.log('⚠️  Server started but database connection failed')
    console.log('   Make sure PostgreSQL is running with the correct configuration')
  }
})