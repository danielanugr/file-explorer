# File Explorer Web Application

A Windows Explorer-like web application built with modern technologies, featuring hierarchical folder navigation and file management capabilities.

## Technology Stack

- **Runtime**: Bun
- **Backend**: Elysia.js
- **Database**: PostgreSQL with Drizzle ORM
- **Frontend**: Vue 3 with TypeScript
- **Build Tool**: Vite
- **Container**: Docker (for PostgreSQL)

## Project Structure

```
file-explorer/
├── packages/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── db/
│   │   │   │   ├── migrate.ts      # Database migration runner
│   │   │   │   └── seed.ts         # Database seeding
│   │   │   ├── routes/
│   │   │   │   └── folders.ts      # API endpoints
│   │   │   ├── schema/
│   │   │   │   └── folders.ts      # Drizzle ORM schema
│   │   │   └── index.ts           # Server entry point
│   │   ├── drizzle.config.ts      # Drizzle configuration
│   │   └── package.json
│   └── frontend/
│       ├── src/
│       │   ├── components/
│       │   │   ├── FileItem.vue    # File display component
│       │   │   └── FolderTree.vue  # Folder tree component
│       │   ├── services/
│       │   │   └── folderService.ts # API client
│       │   ├── types/
│       │   │   └── folder.ts       # TypeScript interfaces
│       │   └── App.vue             # Main application
│       ├── vite.config.ts
│       └── package.json
├── package.json                    # Root package with workspaces
├── tsconfig.json                   # Root TypeScript config
└── README.md
```

## Prerequisites

- **Bun**: JavaScript runtime and package manager
- **Docker**: For running PostgreSQL database
- **Git**: Version control

### Installing Bun

```bash
curl -fsSL https://bun.sh/install | bash
```

### Installing Docker (WSL2/Ubuntu)

```bash
# Update package list
sudo apt update

# Install required packages
sudo apt install apt-transport-https ca-certificates curl software-properties-common

# Add Docker GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

# Add Docker repository
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"

# Install Docker
sudo apt update
sudo apt install docker-ce

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Add user to docker group (optional, to run without sudo)
sudo usermod -aG docker $USER
```

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd file-explorer
bun install
```

### 2. Database Setup

Start PostgreSQL using Docker:

```bash
docker run --name postgres-fileexplorer \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=fileexplorer \
  -p 5432:5432 \
  -d postgres:15
```

Run database migrations and seeding:

```bash
bun db:setup
```

### 3. Environment Configuration

The application uses the following default database configuration:

- **Host**: localhost
- **Port**: 5432
- **Database**: fileexplorer
- **Username**: postgres
- **Password**: password

### 4. Run the Application

Start both backend and frontend in development mode:

```bash
# Start both services
bun dev

# Or start them separately:
bun dev:backend  # Backend on http://localhost:3000
bun dev:frontend # Frontend on http://localhost:5174
```

## API Documentation

### Base URL

`http://localhost:3000/api`

### Endpoints

#### Get Folder Tree

```http
GET /folders/tree
```

Returns the complete hierarchical folder structure.

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Documents",
      "parent_id": null,
      "created_at": "2025-09-26T06:35:18.746Z",
      "updated_at": "2025-09-26T06:35:18.746Z",
      "children": [...]
    }
  ]
}
```

#### Get Folder Children

```http
GET /folders/:id/children
```

Returns the children folders and files for a specific folder.

**Response:**

```json
{
  "success": true,
  "data": {
    "folder": {
      "id": 1,
      "name": "Documents",
      "parent_id": null,
      "created_at": "2025-09-26T06:35:18.746Z",
      "updated_at": "2025-09-26T06:35:18.746Z"
    },
    "children": [],
    "files": [
      {
        "id": 1,
        "name": "document.pdf",
        "folderId": 1,
        "sizeBytes": 1024,
        "createdAt": "2025-09-26T06:35:18.746Z",
        "updatedAt": "2025-09-26T06:35:18.746Z"
      }
    ],
    "stats": {
      "childrenCount": 0,
      "filesCount": 1
    }
  }
}
```

#### Get Root Folder

```http
GET /folders/root
```

Returns the root folder information.

## Features

### Implemented

- ✅ Hierarchical folder tree navigation
- ✅ Two-panel layout (folder tree + content view)
- ✅ File display with type-based icons
- ✅ File size and date formatting
- ✅ Folder statistics (file and folder counts)
- ✅ Responsive design with hover effects
- ✅ PostgreSQL database with proper relationships
- ✅ Type-safe API with Drizzle ORM
- ✅ CORS-enabled backend

### File Type Support

The application recognizes and displays appropriate icons for:

- **Images**: jpg, jpeg, png, gif, webp, svg
- **Code files**: js, ts, vue, jsx, tsx, css, scss, html
- **Documents**: pdf, doc, docx, txt, md
- **JSON files**: json
- **Generic files**: Default file icon

## Development

### Database Operations

```bash
# Run migrations
bun run --filter 'backend' db:migrate

# Seed database
bun run --filter 'backend' db:seed

# Reset and setup database
bun db:setup
```

### Project Scripts

```bash
# Development
bun dev                 # Start both frontend and backend
bun dev:frontend        # Start frontend only
bun dev:backend         # Start backend only

# Database
bun db:setup           # Reset, migrate, and seed database

# Build
bun build              # Build both packages
bun build:frontend     # Build frontend only
bun build:backend      # Build backend only

# Testing
bun test               # Run all tests
bun test:unit          # Run unit tests for frontend
bun test:backend       # Run backend unit and integration tests
bun test:e2e           # Run end-to-end tests
bun test:api           # Run API tests
```

## Testing

The project includes comprehensive testing coverage with unit tests, integration tests, and end-to-end tests.

### Test Types

- **Unit Tests**: Test individual components and functions in isolation
- **Integration Tests**: Test API endpoints and service interactions
- **End-to-End Tests**: Test complete user workflows in a real browser

### Prerequisites for Testing

1. **Playwright Browsers** (for e2e tests):
   ```bash
   npx playwright install chromium
   ```

2. **Running Application** (for e2e and API tests):
   - Database must be running and seeded
   - Backend server must be running on port 3000
   - Frontend server must be running on port 5174

### Test Setup

#### 1. Database Setup for Testing

Ensure your PostgreSQL database is running and populated with test data:

```bash
# Start PostgreSQL container
docker run --name postgres-fileexplorer \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=fileexplorer \
  -p 5432:5432 \
  -d postgres:15

# Setup database with test data
bun db:setup
```

#### 2. Application Setup for E2E Tests

For end-to-end tests, both backend and frontend must be running:

```bash
# Terminal 1: Start backend
bun dev:backend

# Terminal 2: Start frontend
bun dev:frontend
```

### Running Tests

#### Run All Tests

```bash
bun test
```

#### Unit Tests (Frontend)

Test Vue components, services, and utilities:

```bash
bun test:unit
```

**Covered Components:**
- `App.vue` - Main application logic
- `FolderTree.vue` - Folder tree navigation
- `SearchBar.vue` - Search functionality with debouncing
- `FileItem.vue` - File display and interactions
- `folderService.ts` - API service methods

**Test Features:**
- Component rendering and props
- User interactions (clicks, input, keyboard events)
- Service mocking and API calls
- Error handling and loading states
- Search debouncing and results

#### Backend Tests

Test API endpoints, services, and database operations:

```bash
bun test:backend
```

**Covered Areas:**
- API integration tests with Elysia.js
- FolderService domain logic
- MemoryCacheService caching
- Database operations and error handling

#### End-to-End Tests

Test complete user workflows in a real browser:

```bash
bun test:e2e
```

**Test Scenarios:**
- Application loading and layout
- Folder tree navigation and expansion
- Search functionality
- File interactions and selection
- Error handling and network failures
- Responsive design on different screen sizes
- Loading states and user feedback

**Browser Requirements:**
- Chromium browser (auto-installed with Playwright)
- Tests run in headless mode by default

#### API Tests

Test API endpoints directly:

```bash
bun test:api
```

Tests the REST API endpoints for:
- Folder tree retrieval
- Folder children and files
- Search functionality
- Error responses

### Test Configuration

#### Frontend Tests (Vitest)

Configuration in `packages/frontend/vitest.config.ts`:

```typescript
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true
  },
  plugins: [vue()]
})
```

#### E2E Tests (Playwright)

Configuration in `playwright.config.ts`:

```typescript
export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  workers: 1,
  use: {
    baseURL: 'http://localhost:5174',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  webServer: [
    { command: 'bun dev:backend', port: 3000 },
    { command: 'bun dev:frontend', port: 5174 }
  ]
})
```

### Test Development

#### Writing Unit Tests

Example Vue component test:

```typescript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import FolderTree from './FolderTree.vue'

describe('FolderTree.vue', () => {
  it('renders folder tree correctly', () => {
    const wrapper = mount(FolderTree, {
      props: { folders: mockFolders }
    })
    expect(wrapper.find('.folder-tree').exists()).toBe(true)
  })
})
```

#### Writing E2E Tests

Example Playwright test:

```typescript
test('should navigate folder tree', async ({ page }) => {
  await page.goto('/')
  await page.waitForSelector('.folder-tree')

  const folderNode = page.locator('.node-content').first()
  await folderNode.click()

  await expect(page.locator('.placeholder')).not.toBeVisible()
})
```

### Continuous Integration

The test suite is designed to run in CI/CD environments:

1. **Database**: Use Docker for consistent PostgreSQL setup
2. **Browsers**: Playwright handles browser installation
3. **Parallelization**: Tests run in sequence for stability
4. **Artifacts**: Screenshots and videos saved on failure

### Test Reports

#### Vitest Reports
- Console output with coverage information
- HTML report available with `--reporter=html`

#### Playwright Reports
- HTML report with screenshots/videos: `npx playwright show-report`
- Test artifacts saved in `test-results/` directory

## Troubleshooting

### Common Issues

1. **Database Connection Error**

   - Ensure PostgreSQL Docker container is running
   - Check if port 5432 is available
   - Verify database credentials

2. **Port Already in Use**

   - Backend (3000): Check for other applications using the port
   - Frontend (5174): Vite will automatically find an available port

3. **Module Resolution Errors**

   - Run `bun install` in the root directory
   - Ensure all TypeScript configurations are properly set

4. **Docker Permission Issues**
   - Add your user to the docker group: `sudo usermod -aG docker $USER`
   - Log out and log back in for changes to take effect

### Testing Issues

1. **E2E Tests Failing - Browser Not Found**
   ```bash
   npx playwright install chromium
   ```

2. **E2E Tests Failing - Application Not Running**
   - Ensure backend is running on port 3000: `bun dev:backend`
   - Ensure frontend is running on port 5174: `bun dev:frontend`
   - Check that database is seeded with test data: `bun db:setup`

3. **Unit Tests Failing - Module Resolution**
   ```bash
   # Reinstall dependencies
   bun install

   # Clear cache
   bun --bun test:unit --run
   ```

4. **API Tests Failing - Network Errors**
   - Check backend server is running
   - Verify API endpoints are accessible: `curl http://localhost:3000/api/v1/folders/tree`
   - Ensure database has test data

5. **Test Timeouts**
   - Increase timeout in test configuration
   - Check system resources and database performance
   - For E2E tests, ensure applications are fully loaded before testing

### Logs and Debugging

Backend logs show:

- Database connection status
- Available API endpoints
- Request/response information

Frontend development server provides:

- Hot module replacement
- Build errors and warnings
- Network access information
