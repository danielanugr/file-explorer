import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { foldersRouter } from './routes/folders'
import { testDrizzleConnection } from './config/drizzle'

const app = new Elysia()
  .use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }))
  .get('/', () => ({
    message: 'File Explorer Backend API',
    version: '1.0.0',
    endpoints: [
      'GET /api/folders/tree - Get complete folder tree',
      'GET /api/folders/:id/children - Get direct children of folder',
      'GET /api/folders/root - Get root folders'
    ]
  }))
  .use(foldersRouter)
  .listen(3000)

// Test database connection on startup
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