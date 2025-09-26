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
```

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

### Logs and Debugging

Backend logs show:

- Database connection status
- Available API endpoints
- Request/response information

Frontend development server provides:

- Hot module replacement
- Build errors and warnings
- Network access information
