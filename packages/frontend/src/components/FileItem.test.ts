import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import FileItem from './FileItem.vue'
import type { File } from '../types/folder'

vi.mock('../assets/icons/file-image.svg', () => ({
  default: {
    name: 'FileImageIcon',
    template: '<svg data-testid="file-image-icon"></svg>'
  }
}))

vi.mock('../assets/icons/file-code.svg', () => ({
  default: {
    name: 'FileCodeIcon',
    template: '<svg data-testid="file-code-icon"></svg>'
  }
}))

vi.mock('../assets/icons/file-document.svg', () => ({
  default: {
    name: 'FileDocumentIcon',
    template: '<svg data-testid="file-document-icon"></svg>'
  }
}))

vi.mock('../assets/icons/file-json.svg', () => ({
  default: {
    name: 'FileJsonIcon',
    template: '<svg data-testid="file-json-icon"></svg>'
  }
}))

vi.mock('../assets/icons/file-default.svg', () => ({
  default: {
    name: 'FileDefaultIcon',
    template: '<svg data-testid="file-default-icon"></svg>'
  }
}))

vi.mock('../assets/icons/download.svg', () => ({
  default: {
    name: 'DownloadIcon',
    template: '<svg data-testid="download-icon"></svg>'
  }
}))

const mockFile: File = {
  id: 1,
  name: 'test-file.txt',
  folderId: 1,
  sizeBytes: 1024,
  createdAt: '2023-01-15T10:30:00Z',
  updatedAt: '2023-01-15T10:30:00Z'
}

describe('FileItem.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders file information correctly', () => {
    const wrapper = mount(FileItem, {
      props: {
        file: mockFile
      }
    })

    expect(wrapper.find('.file-name').text()).toBe('test-file.txt')
    expect(wrapper.find('.file-size').text()).toBe('1.0 KB')
    expect(wrapper.find('.file-date').text()).toMatch(/Jan 15, 2023/)
  })

  it('shows selected state when isSelected is true', () => {
    const wrapper = mount(FileItem, {
      props: {
        file: mockFile,
        isSelected: true
      }
    })

    expect(wrapper.find('.file-item').classes()).toContain('selected')
  })

  it('does not show selected state when isSelected is false', () => {
    const wrapper = mount(FileItem, {
      props: {
        file: mockFile,
        isSelected: false
      }
    })

    expect(wrapper.find('.file-item').classes()).not.toContain('selected')
  })

  it('emits select-file when clicked', async () => {
    const wrapper = mount(FileItem, {
      props: {
        file: mockFile
      }
    })

    await wrapper.find('.file-item').trigger('click')

    expect(wrapper.emitted('select-file')).toBeTruthy()
    expect(wrapper.emitted('select-file')![0][0]).toEqual(mockFile)
  })

  it('emits open-file when double-clicked', async () => {
    const wrapper = mount(FileItem, {
      props: {
        file: mockFile
      }
    })

    await wrapper.find('.file-item').trigger('dblclick')

    expect(wrapper.emitted('open-file')).toBeTruthy()
    expect(wrapper.emitted('open-file')![0][0]).toEqual(mockFile)
  })

  it('emits download-file when download button is clicked', async () => {
    const wrapper = mount(FileItem, {
      props: {
        file: mockFile
      }
    })

    await wrapper.find('.action-button').trigger('click')

    expect(wrapper.emitted('download-file')).toBeTruthy()
    expect(wrapper.emitted('download-file')![0][0]).toEqual(mockFile)
  })

  it('shows correct icon for image files', () => {
    const imageFile: File = {
      ...mockFile,
      name: 'image.jpg'
    }

    const wrapper = mount(FileItem, {
      props: {
        file: imageFile
      }
    })

    const imageIcon = wrapper.find('[data-testid="file-image-icon"]')
    expect(imageIcon.exists()).toBe(true)
  })

  it('shows correct icon for code files', () => {
    const codeFile: File = {
      ...mockFile,
      name: 'script.js'
    }

    const wrapper = mount(FileItem, {
      props: {
        file: codeFile
      }
    })

    const codeIcon = wrapper.find('[data-testid="file-code-icon"]')
    expect(codeIcon.exists()).toBe(true)
  })

  it('shows correct icon for document files', () => {
    const documentFile: File = {
      ...mockFile,
      name: 'document.pdf'
    }

    const wrapper = mount(FileItem, {
      props: {
        file: documentFile
      }
    })

    const documentIcon = wrapper.find('[data-testid="file-document-icon"]')
    expect(documentIcon.exists()).toBe(true)
  })

  it('shows correct icon for JSON files', () => {
    const jsonFile: File = {
      ...mockFile,
      name: 'data.json'
    }

    const wrapper = mount(FileItem, {
      props: {
        file: jsonFile
      }
    })

    expect(wrapper.find('[data-testid="file-json-icon"]').exists()).toBe(true)
  })

  it('shows default icon for unknown file types', () => {
    const unknownFile: File = {
      ...mockFile,
      name: 'unknown.xyz'
    }

    const wrapper = mount(FileItem, {
      props: {
        file: unknownFile
      }
    })

    expect(wrapper.find('[data-testid="file-default-icon"]').exists()).toBe(true)
  })

  it('formats file sizes correctly', () => {
    const testCases = [
      { bytes: 0, expected: '0 B' },
      { bytes: 512, expected: '512 B' },
      { bytes: 1024, expected: '1.0 KB' },
      { bytes: 1048576, expected: '1.0 MB' },
      { bytes: 1073741824, expected: '1.0 GB' }
    ]

    testCases.forEach(({ bytes, expected }) => {
      const file: File = {
        ...mockFile,
        sizeBytes: bytes
      }

      const wrapper = mount(FileItem, {
        props: { file }
      })

      expect(wrapper.find('.file-size').text()).toBe(expected)
    })
  })

  it('handles files without size information', () => {
    const fileWithoutSize: File = {
      ...mockFile,
      sizeBytes: undefined
    }

    const wrapper = mount(FileItem, {
      props: {
        file: fileWithoutSize
      }
    })

    expect(wrapper.find('.file-size').text()).toBe('0 B')
  })

  it('formats dates correctly', () => {
    const wrapper = mount(FileItem, {
      props: {
        file: mockFile
      }
    })

    expect(wrapper.find('.file-date').text()).toMatch(/Jan 15, 2023/)
  })

  it('shows download icon in action button', () => {
    const wrapper = mount(FileItem, {
      props: {
        file: mockFile
      }
    })

    expect(wrapper.find('[data-testid="download-icon"]').exists()).toBe(true)
  })

  it('shows correct icons for various file extensions', () => {
    const testCases = [
      { name: 'image.png', iconTestId: 'file-image-icon' },
      { name: 'script.ts', iconTestId: 'file-code-icon' },
      { name: 'doc.pdf', iconTestId: 'file-document-icon' },
      { name: 'config.json', iconTestId: 'file-json-icon' },
      { name: 'unknown.xyz', iconTestId: 'file-default-icon' }
    ]

    testCases.forEach(({ name, iconTestId }) => {
      const file: File = {
        ...mockFile,
        name
      }

      const wrapper = mount(FileItem, {
        props: { file }
      })

      const icon = wrapper.find(`[data-testid="${iconTestId}"]`)
      expect(icon.exists()).toBe(true)
    })
  })

  it('handles files without extension', () => {
    const fileWithoutExtension: File = {
      ...mockFile,
      name: 'README'
    }

    const wrapper = mount(FileItem, {
      props: {
        file: fileWithoutExtension
      }
    })

    const defaultIcon = wrapper.find('[data-testid="file-default-icon"]')
    expect(defaultIcon.exists()).toBe(true)
  })

  it('handles case insensitive file extensions', () => {
    const upperCaseFile: File = {
      ...mockFile,
      name: 'IMAGE.PNG'
    }

    const wrapper = mount(FileItem, {
      props: {
        file: upperCaseFile
      }
    })

    const imageIcon = wrapper.find('[data-testid="file-image-icon"]')
    expect(imageIcon.exists()).toBe(true)
  })

  it('prevents event propagation on download button click', async () => {
    const wrapper = mount(FileItem, {
      props: {
        file: mockFile
      }
    })

    const clickSpy = vi.fn()
    wrapper.find('.file-item').element.addEventListener('click', clickSpy)

    await wrapper.find('.action-button').trigger('click')

    expect(wrapper.emitted('download-file')).toBeTruthy()
    expect(clickSpy).not.toHaveBeenCalled()
  })
})