import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import SearchBar from './SearchBar.vue'
import { folderService } from '../services/folderService'
import type { SearchResponse } from '../types/folder'

vi.mock('../services/folderService', () => ({
  folderService: {
    searchFoldersAndFiles: vi.fn()
  }
}))

vi.mock('../assets/icons/search.svg', () => ({
  default: {
    name: 'SearchIcon',
    template: '<svg data-testid="search-icon"></svg>'
  }
}))

vi.mock('../assets/icons/close.svg', () => ({
  default: {
    name: 'CloseIcon',
    template: '<svg data-testid="close-icon"></svg>'
  }
}))

const mockSearchResponse: SearchResponse = {
  query: 'test',
  results: {
    folders: [
      {
        id: 1,
        name: 'Test Folder',
        parentId: null,
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01'
      }
    ],
    files: [
      {
        id: 1,
        name: 'test.txt',
        folderId: 1,
        sizeBytes: 1024,
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01'
      }
    ]
  },
  counts: {
    folders: 1,
    files: 1,
    total: 2
  }
}

describe('SearchBar.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders search input with icons', () => {
    const wrapper = mount(SearchBar)

    expect(wrapper.find('.search-input').exists()).toBe(true)
    expect(wrapper.find('[data-testid="search-icon"]').exists()).toBe(true)
    expect(wrapper.find('.search-input').attributes('placeholder')).toBe('Search folders and files...')
  })

  it('shows clear button when search query exists', async () => {
    const wrapper = mount(SearchBar)

    expect(wrapper.find('.clear-button').exists()).toBe(false)

    await wrapper.find('.search-input').setValue('test')

    expect(wrapper.find('.clear-button').exists()).toBe(true)
    expect(wrapper.find('[data-testid="close-icon"]').exists()).toBe(true)
  })

  it('clears search when clear button is clicked', async () => {
    const wrapper = mount(SearchBar)

    await wrapper.find('.search-input').setValue('test')
    expect((wrapper.find('.search-input').element as HTMLInputElement).value).toBe('test')

    await wrapper.find('.clear-button').trigger('click')

    expect((wrapper.find('.search-input').element as HTMLInputElement).value).toBe('')
    expect(wrapper.find('.search-results').exists()).toBe(false)
  })

  it('performs search after debounce delay', async () => {
    const mockFolderService = vi.mocked(folderService)
    mockFolderService.searchFoldersAndFiles.mockResolvedValue({
      success: true,
      data: mockSearchResponse
    })

    const wrapper = mount(SearchBar)

    await wrapper.find('.search-input').setValue('test')
    wrapper.find('.search-input').trigger('input')

    expect(mockFolderService.searchFoldersAndFiles).not.toHaveBeenCalled()

    vi.advanceTimersByTime(300)
    await wrapper.vm.$nextTick()

    expect(mockFolderService.searchFoldersAndFiles).toHaveBeenCalledWith('test')
  })

  it('does not search for queries shorter than 2 characters', async () => {
    const mockFolderService = vi.mocked(folderService)
    const wrapper = mount(SearchBar)

    await wrapper.find('.search-input').setValue('a')
    wrapper.find('.search-input').trigger('input')

    vi.advanceTimersByTime(300)
    await wrapper.vm.$nextTick()

    expect(mockFolderService.searchFoldersAndFiles).not.toHaveBeenCalled()
    expect(wrapper.find('.search-results').exists()).toBe(false)
  })

  it('shows loading state during search', async () => {
    const mockFolderService = vi.mocked(folderService)
    mockFolderService.searchFoldersAndFiles.mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve({
        success: true,
        data: mockSearchResponse
      }), 100))
    )

    const wrapper = mount(SearchBar)

    await wrapper.find('.search-input').setValue('test')
    await wrapper.find('.search-input').trigger('keyup.enter')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.search-status').exists()).toBe(true)
    expect(wrapper.find('.loading-spinner').exists()).toBe(true)
    expect(wrapper.text()).toContain('Searching...')
  })

  it('displays search results correctly', async () => {
    const mockFolderService = vi.mocked(folderService)
    mockFolderService.searchFoldersAndFiles.mockResolvedValue({
      success: true,
      data: mockSearchResponse
    })

    const wrapper = mount(SearchBar)

    await wrapper.find('.search-input').setValue('test')
    await wrapper.find('.search-input').trigger('keyup.enter')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.results-container').exists()).toBe(true)
    expect(wrapper.text()).toContain('2 results for "test"')
    expect(wrapper.text()).toContain('📁 Folders (1)')
    expect(wrapper.text()).toContain('📄 Files (1)')
    expect(wrapper.text()).toContain('Test Folder')
    expect(wrapper.text()).toContain('test.txt')
  })

  it('shows no results message when no matches found', async () => {
    const mockFolderService = vi.mocked(folderService)
    mockFolderService.searchFoldersAndFiles.mockResolvedValue({
      success: true,
      data: {
        query: 'notfound',
        results: { folders: [], files: [] },
        counts: { folders: 0, files: 0, total: 0 }
      }
    })

    const wrapper = mount(SearchBar)

    await wrapper.find('.search-input').setValue('notfound')
    await wrapper.find('.search-input').trigger('keyup.enter')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.no-results').exists()).toBe(true)
    expect(wrapper.text()).toContain('No results found for "notfound"')
    expect(wrapper.text()).toContain('Try different keywords or check spelling')
  })

  it('handles search errors', async () => {
    const mockFolderService = vi.mocked(folderService)
    mockFolderService.searchFoldersAndFiles.mockResolvedValue({
      success: false,
      error: 'Search failed',
      data: null as any
    })

    const wrapper = mount(SearchBar)

    await wrapper.find('.search-input').setValue('test')
    await wrapper.find('.search-input').trigger('keyup.enter')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.search-error').exists()).toBe(true)
    expect(wrapper.text()).toContain('Search failed')
  })

  it('handles network errors', async () => {
    const mockFolderService = vi.mocked(folderService)
    mockFolderService.searchFoldersAndFiles.mockRejectedValue(new Error('Network error'))

    const wrapper = mount(SearchBar)

    await wrapper.find('.search-input').setValue('test')
    await wrapper.find('.search-input').trigger('keyup.enter')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.search-error').exists()).toBe(true)
    expect(wrapper.text()).toContain('Network error - make sure backend is running')
  })

  it('emits select-folder when folder result is clicked', async () => {
    const mockFolderService = vi.mocked(folderService)
    mockFolderService.searchFoldersAndFiles.mockResolvedValue({
      success: true,
      data: mockSearchResponse
    })

    const wrapper = mount(SearchBar)

    await wrapper.find('.search-input').setValue('test')
    await wrapper.find('.search-input').trigger('keyup.enter')
    await wrapper.vm.$nextTick()

    const folderResult = wrapper.find('.folder-result')
    await folderResult.trigger('click')

    expect(wrapper.emitted('select-folder')).toBeTruthy()
    expect(wrapper.emitted('select-folder')![0][0]).toEqual(mockSearchResponse.results.folders[0])
    expect(wrapper.find('.search-results').exists()).toBe(false)
  })

  it('emits select-file when file result is clicked', async () => {
    const mockFolderService = vi.mocked(folderService)
    mockFolderService.searchFoldersAndFiles.mockResolvedValue({
      success: true,
      data: mockSearchResponse
    })

    const wrapper = mount(SearchBar)

    await wrapper.find('.search-input').setValue('test')
    await wrapper.find('.search-input').trigger('keyup.enter')
    await wrapper.vm.$nextTick()

    const fileResult = wrapper.find('.file-result')
    await fileResult.trigger('click')

    expect(wrapper.emitted('select-file')).toBeTruthy()
    expect(wrapper.emitted('select-file')![0][0]).toEqual(mockSearchResponse.results.files[0])
    expect(wrapper.find('.search-results').exists()).toBe(false)
  })

  it('clears search on escape key', async () => {
    const wrapper = mount(SearchBar)

    await wrapper.find('.search-input').setValue('test')
    await wrapper.find('.search-input').trigger('keyup.escape')

    expect((wrapper.find('.search-input').element as HTMLInputElement).value).toBe('')
    expect(wrapper.find('.search-results').exists()).toBe(false)
  })

  it('performs search on enter key', async () => {
    const mockFolderService = vi.mocked(folderService)
    mockFolderService.searchFoldersAndFiles.mockResolvedValue({
      success: true,
      data: mockSearchResponse
    })

    const wrapper = mount(SearchBar)

    await wrapper.find('.search-input').setValue('test')
    await wrapper.find('.search-input').trigger('keyup.enter')

    expect(mockFolderService.searchFoldersAndFiles).toHaveBeenCalledWith('test')
  })

  it('displays file sizes correctly in results', async () => {
    const mockFolderService = vi.mocked(folderService)
    mockFolderService.searchFoldersAndFiles.mockResolvedValue({
      success: true,
      data: {
        query: 'test',
        results: {
          folders: [],
          files: [
            {
              id: 1,
              name: 'test.txt',
              folderId: 1,
              sizeBytes: 1024,
              createdAt: '2023-01-01',
              updatedAt: '2023-01-01'
            }
          ]
        },
        counts: { folders: 0, files: 1, total: 1 }
      }
    })

    const wrapper = mount(SearchBar)
    await wrapper.find('.search-input').setValue('test')
    await wrapper.find('.search-input').trigger('keyup.enter')
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('1.0 KB')
  })

  it('displays dates correctly in results', async () => {
    const mockFolderService = vi.mocked(folderService)
    mockFolderService.searchFoldersAndFiles.mockResolvedValue({
      success: true,
      data: {
        query: 'test',
        results: {
          folders: [{
            id: 1,
            name: 'Test Folder',
            parentId: null,
            createdAt: '2023-01-15T10:30:00Z',
            updatedAt: '2023-01-15T10:30:00Z'
          }],
          files: []
        },
        counts: { folders: 1, files: 0, total: 1 }
      }
    })

    const wrapper = mount(SearchBar)
    await wrapper.find('.search-input').setValue('test')
    await wrapper.find('.search-input').trigger('keyup.enter')
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toMatch(/Jan 15, 2023/)
  })

  it('hides results when clicking outside', async () => {
    const mockFolderService = vi.mocked(folderService)
    mockFolderService.searchFoldersAndFiles.mockResolvedValue({
      success: true,
      data: mockSearchResponse
    })

    const wrapper = mount(SearchBar, {
      attachTo: document.body
    })

    // Show results first
    await wrapper.find('.search-input').setValue('test')
    await wrapper.find('.search-input').trigger('keyup.enter')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.search-results').exists()).toBe(true)

    // Click outside
    document.body.click()
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.search-results').exists()).toBe(false)

    wrapper.unmount()
  })
})