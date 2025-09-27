import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import App from './App.vue'
import { folderService } from './services/folderService'

vi.mock('./services/folderService', () => ({
  folderService: {
    getFolderTree: vi.fn(),
    getFolderChildren: vi.fn()
  }
}))

vi.mock('./components/FolderTree.vue', () => ({
  default: {
    name: 'FolderTree',
    template: '<div data-testid="folder-tree">Folder Tree</div>',
    props: ['folders', 'loading', 'error', 'selectedFolderId'],
    emits: ['select-folder', 'retry']
  }
}))

vi.mock('./components/SearchBar.vue', () => ({
  default: {
    name: 'SearchBar',
    template: '<div data-testid="search-bar">Search Bar</div>',
    emits: ['select-folder', 'select-file']
  }
}))

vi.mock('./components/FileItem.vue', () => ({
  default: {
    name: 'FileItem',
    template: '<div data-testid="file-item">File Item</div>',
    props: ['file', 'isSelected'],
    emits: ['select-file', 'open-file', 'download-file']
  }
}))

describe('App.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the main structure', () => {
    const mockFolderService = vi.mocked(folderService)
    mockFolderService.getFolderTree.mockResolvedValue({
      success: true,
      data: []
    })

    const wrapper = mount(App)

    expect(wrapper.find('h1').text()).toContain('File Explorer')
    expect(wrapper.find('[data-testid="folder-tree"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="search-bar"]').exists()).toBe(true)
  })

  it('loads folder tree on mount', async () => {
    const mockFolderService = vi.mocked(folderService)
    mockFolderService.getFolderTree.mockResolvedValue({
      success: true,
      data: [
        {
          id: 1,
          name: 'Root Folder',
          parentId: null,
          createdAt: '2023-01-01',
          updatedAt: '2023-01-01',
          children: []
        }
      ]
    })

    mount(App)

    expect(mockFolderService.getFolderTree).toHaveBeenCalledTimes(1)
  })

  it('handles folder tree loading error', async () => {
    const mockFolderService = vi.mocked(folderService)
    mockFolderService.getFolderTree.mockResolvedValue({
      success: false,
      error: 'Failed to load folders'
    })

    const wrapper = mount(App)
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.error).toBe('Failed to load folders')
  })

  it('shows placeholder when no folder is selected', () => {
    const mockFolderService = vi.mocked(folderService)
    mockFolderService.getFolderTree.mockResolvedValue({
      success: true,
      data: []
    })

    const wrapper = mount(App)

    expect(wrapper.find('.placeholder').text()).toContain('Select a folder to view its contents')
  })

  it('loads folder children when folder is selected', async () => {
    const mockFolderService = vi.mocked(folderService)
    mockFolderService.getFolderTree.mockResolvedValue({
      success: true,
      data: []
    })
    mockFolderService.getFolderChildren.mockResolvedValue({
      success: true,
      data: {
        folder: {
          id: 1,
          name: 'Test Folder',
          parentId: null,
          createdAt: '2023-01-01',
          updatedAt: '2023-01-01'
        },
        children: [],
        files: [],
        stats: { childrenCount: 0, filesCount: 0 }
      }
    })

    const wrapper = mount(App)
    const folderTree = {
      id: 1,
      name: 'Test Folder',
      parentId: null,
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01',
      children: []
    }

    await wrapper.vm.onFolderSelect(folderTree)

    expect(mockFolderService.getFolderChildren).toHaveBeenCalledWith(1)
    expect(wrapper.vm.selectedFolder).toEqual(folderTree)
  })

  it('shows loading state when loading children', async () => {
    const mockFolderService = vi.mocked(folderService)
    mockFolderService.getFolderTree.mockResolvedValue({
      success: true,
      data: []
    })
    mockFolderService.getFolderChildren.mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve({
        success: true,
        data: {
          folder: { id: 1, name: 'Test', parentId: null, createdAt: '2023-01-01', updatedAt: '2023-01-01' },
          children: [],
          files: [],
          stats: { childrenCount: 0, filesCount: 0 }
        }
      }), 100))
    )

    const wrapper = mount(App)
    const folderTree = {
      id: 1,
      name: 'Test Folder',
      parentId: null,
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01',
      children: []
    }

    wrapper.vm.onFolderSelect(folderTree)
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.loading').exists()).toBe(true)
    expect(wrapper.find('.loading').text()).toContain('Loading contents')
  })

  it('formats dates correctly', () => {
    const mockFolderService = vi.mocked(folderService)
    mockFolderService.getFolderTree.mockResolvedValue({
      success: true,
      data: []
    })

    const wrapper = mount(App)
    const formatted = wrapper.vm.formatDate('2023-01-15T10:30:00Z')

    expect(formatted).toMatch(/Jan 15, 2023/)
  })

  it('handles search folder selection', async () => {
    const mockFolderService = vi.mocked(folderService)
    mockFolderService.getFolderTree.mockResolvedValue({
      success: true,
      data: [
        {
          id: 1,
          name: 'Root Folder',
          parentId: null,
          createdAt: '2023-01-01',
          updatedAt: '2023-01-01',
          children: []
        }
      ]
    })
    mockFolderService.getFolderChildren.mockResolvedValue({
      success: true,
      data: {
        folder: { id: 1, name: 'Root Folder', parentId: null, createdAt: '2023-01-01', updatedAt: '2023-01-01' },
        children: [],
        files: [],
        stats: { childrenCount: 0, filesCount: 0 }
      }
    })

    const wrapper = mount(App)
    await wrapper.vm.$nextTick()

    const searchFolder = {
      id: 1,
      name: 'Root Folder',
      parentId: null,
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01'
    }

    await wrapper.vm.onSearchFolderSelect(searchFolder)

    expect(mockFolderService.getFolderChildren).toHaveBeenCalledWith(1)
  })

  it('handles file selection', () => {
    const mockFolderService = vi.mocked(folderService)
    mockFolderService.getFolderTree.mockResolvedValue({
      success: true,
      data: []
    })

    const wrapper = mount(App)
    const file = {
      id: 1,
      name: 'test.txt',
      folderId: 1,
      sizeBytes: 100,
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01'
    }

    wrapper.vm.onFileSelect(file)

    expect(wrapper.vm.selectedFile).toEqual(file)
  })

  it('shows empty state when folder has no children or files', async () => {
    const mockFolderService = vi.mocked(folderService)
    mockFolderService.getFolderTree.mockResolvedValue({
      success: true,
      data: []
    })
    mockFolderService.getFolderChildren.mockResolvedValue({
      success: true,
      data: {
        folder: { id: 1, name: 'Empty Folder', parentId: null, createdAt: '2023-01-01', updatedAt: '2023-01-01' },
        children: [],
        files: [],
        stats: { childrenCount: 0, filesCount: 0 }
      }
    })

    const wrapper = mount(App)
    const folderTree = {
      id: 1,
      name: 'Empty Folder',
      parentId: null,
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01',
      children: []
    }

    await wrapper.vm.onFolderSelect(folderTree)
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.empty').exists()).toBe(true)
    expect(wrapper.find('.empty').text()).toContain('This folder is empty')
  })
})