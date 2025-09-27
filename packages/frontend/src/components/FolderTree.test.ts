import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import FolderTree from './FolderTree.vue'
import type { FolderTree as FolderTreeType } from '../types/folder'

vi.mock('./FolderTreeNode.vue', () => ({
  default: {
    name: 'FolderTreeNode',
    template: '<div data-testid="folder-tree-node" @click="$emit(\'select-folder\', folder)">{{ folder.name }}</div>',
    props: ['folder', 'level', 'selectedFolderId', 'expandedFolders'],
    emits: ['select-folder', 'toggle-expand']
  }
}))

const mockFolders: FolderTreeType[] = [
  {
    id: 1,
    name: 'Root Folder 1',
    parentId: null,
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01',
    children: [
      {
        id: 2,
        name: 'Child Folder 1',
        parentId: 1,
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01',
        children: []
      }
    ]
  },
  {
    id: 3,
    name: 'Root Folder 2',
    parentId: null,
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01',
    children: []
  }
]

describe('FolderTree.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading state', () => {
    const wrapper = mount(FolderTree, {
      props: {
        folders: [],
        loading: true
      }
    })

    expect(wrapper.find('.loading').exists()).toBe(true)
    expect(wrapper.find('.loading-spinner').exists()).toBe(true)
    expect(wrapper.text()).toContain('Loading folder structure')
  })

  it('renders error state with retry button', async () => {
    const wrapper = mount(FolderTree, {
      props: {
        folders: [],
        error: 'Failed to load folders'
      }
    })

    expect(wrapper.find('.error').exists()).toBe(true)
    expect(wrapper.text()).toContain('Failed to load folders')
    expect(wrapper.find('.retry-button').exists()).toBe(true)

    await wrapper.find('.retry-button').trigger('click')
    expect(wrapper.emitted('retry')).toBeTruthy()
  })

  it('renders empty state when no folders', () => {
    const wrapper = mount(FolderTree, {
      props: {
        folders: []
      }
    })

    expect(wrapper.find('.empty').exists()).toBe(true)
    expect(wrapper.text()).toContain('No folders found')
  })

  it('renders folder tree with action buttons', () => {
    const wrapper = mount(FolderTree, {
      props: {
        folders: mockFolders
      }
    })

    expect(wrapper.find('.tree-container').exists()).toBe(true)
    expect(wrapper.find('.tree-actions').exists()).toBe(true)
    expect(wrapper.findAll('.action-button')).toHaveLength(2)
    expect(wrapper.text()).toContain('Expand All')
    expect(wrapper.text()).toContain('Collapse All')
  })

  it('renders folder tree nodes', () => {
    const wrapper = mount(FolderTree, {
      props: {
        folders: mockFolders
      }
    })

    const treeNodes = wrapper.findAll('[data-testid="folder-tree-node"]')
    expect(treeNodes).toHaveLength(2)
    expect(treeNodes[0].text()).toBe('Root Folder 1')
    expect(treeNodes[1].text()).toBe('Root Folder 2')
  })

  it('auto-expands root folders with children on load', async () => {
    const wrapper = mount(FolderTree, {
      props: {
        folders: mockFolders
      }
    })

    await wrapper.vm.$nextTick()

    // Check that folders with children have the proper props passed to child components
    const folderTreeNodes = wrapper.findAllComponents({ name: 'FolderTreeNode' })
    expect(folderTreeNodes).toHaveLength(2)

    // The expandedFolders Set should include folder 1 (which has children)
    const expandedFoldersSet = folderTreeNodes[0].props('expandedFolders')
    expect(expandedFoldersSet.has(1)).toBe(true)
    expect(expandedFoldersSet.has(3)).toBe(false)
  })

  it('toggles folder expansion through child component events', async () => {
    const wrapper = mount(FolderTree, {
      props: {
        folders: mockFolders
      }
    })

    const folderTreeNode = wrapper.findComponent({ name: 'FolderTreeNode' })

    // Initially folder 2 should not be expanded
    let expandedFoldersSet = folderTreeNode.props('expandedFolders')
    expect(expandedFoldersSet.has(2)).toBe(false)

    // Simulate toggle event from child component
    await folderTreeNode.vm.$emit('toggle-expand', 2)
    await wrapper.vm.$nextTick()

    // Check that the expanded folders prop has been updated
    expandedFoldersSet = wrapper.findComponent({ name: 'FolderTreeNode' }).props('expandedFolders')
    expect(expandedFoldersSet.has(2)).toBe(true)

    // Toggle again
    await folderTreeNode.vm.$emit('toggle-expand', 2)
    await wrapper.vm.$nextTick()

    expandedFoldersSet = wrapper.findComponent({ name: 'FolderTreeNode' }).props('expandedFolders')
    expect(expandedFoldersSet.has(2)).toBe(false)
  })

  it('expands all folders when expand all is clicked', async () => {
    const wrapper = mount(FolderTree, {
      props: {
        folders: mockFolders
      }
    })

    const expandAllButton = wrapper.findAll('.action-button')[0]
    await expandAllButton.trigger('click')

    // Check that the expanded folders prop includes all folders with children
    const folderTreeNode = wrapper.findComponent({ name: 'FolderTreeNode' })
    const expandedFoldersSet = folderTreeNode.props('expandedFolders')
    expect(expandedFoldersSet.has(1)).toBe(true)
    expect(expandedFoldersSet.has(2)).toBe(true)
  })

  it('collapses all folders when collapse all is clicked', async () => {
    const wrapper = mount(FolderTree, {
      props: {
        folders: mockFolders
      }
    })

    // First expand all by clicking expand all button
    const expandAllButton = wrapper.findAll('.action-button')[0]
    await expandAllButton.trigger('click')

    // Then collapse all
    const collapseAllButton = wrapper.findAll('.action-button')[1]
    await collapseAllButton.trigger('click')

    // Check that no folders are expanded
    const folderTreeNode = wrapper.findComponent({ name: 'FolderTreeNode' })
    const expandedFoldersSet = folderTreeNode.props('expandedFolders')
    expect(expandedFoldersSet.size).toBe(0)
  })

  it('emits select-folder when folder node is clicked', async () => {
    const wrapper = mount(FolderTree, {
      props: {
        folders: mockFolders
      }
    })

    const firstNode = wrapper.find('[data-testid="folder-tree-node"]')
    await firstNode.trigger('click')

    expect(wrapper.emitted('select-folder')).toBeTruthy()
  })

  it('passes correct props to folder tree nodes', () => {
    const wrapper = mount(FolderTree, {
      props: {
        folders: mockFolders,
        selectedFolderId: 1
      }
    })

    const folderTreeNode = wrapper.findComponent({ name: 'FolderTreeNode' })
    expect(folderTreeNode.props('folder')).toEqual(mockFolders[0])
    expect(folderTreeNode.props('level')).toBe(0)
    expect(folderTreeNode.props('selectedFolderId')).toBe(1)
    expect(folderTreeNode.props('expandedFolders')).toBeInstanceOf(Set)
  })

  it('updates expanded folders when folders prop changes', async () => {
    const wrapper = mount(FolderTree, {
      props: {
        folders: []
      }
    })

    // Initially no tree nodes should be rendered
    expect(wrapper.findAllComponents({ name: 'FolderTreeNode' })).toHaveLength(0)

    await wrapper.setProps({ folders: mockFolders })

    // After setting folders, check the expanded state through child component props
    const folderTreeNodes = wrapper.findAllComponents({ name: 'FolderTreeNode' })
    expect(folderTreeNodes).toHaveLength(2)

    const expandedFoldersSet = folderTreeNodes[0].props('expandedFolders')
    expect(expandedFoldersSet.has(1)).toBe(true)
    expect(expandedFoldersSet.has(3)).toBe(false)
  })

  it('handles empty children arrays', () => {
    const foldersWithEmptyChildren: FolderTreeType[] = [
      {
        id: 1,
        name: 'Empty Parent',
        parentId: null,
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01',
        children: []
      }
    ]

    const wrapper = mount(FolderTree, {
      props: {
        folders: foldersWithEmptyChildren
      }
    })

    // Check that folders with empty children are not auto-expanded
    const folderTreeNode = wrapper.findComponent({ name: 'FolderTreeNode' })
    const expandedFoldersSet = folderTreeNode.props('expandedFolders')
    expect(expandedFoldersSet.has(1)).toBe(false)
    expect(wrapper.find('[data-testid="folder-tree-node"]').exists()).toBe(true)
  })
})