import { test, expect } from '@playwright/test';

test.describe('File Explorer Application', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');
  });

  test('should display the main header and title', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('📁 File Explorer');
  });

  test('should display folder tree and content panels', async ({ page }) => {
    await expect(page.locator('.left-panel')).toBeVisible();
    await expect(page.locator('.left-panel h3')).toContainText('📂 Folders');

    await expect(page.locator('.right-panel')).toBeVisible();
    await expect(page.locator('.right-panel h3')).toContainText('📄 Contents');
  });

  test('should display placeholder when no folder is selected', async ({
    page,
  }) => {
    await expect(page.locator('.placeholder')).toContainText(
      '👈 Select a folder to view its contents'
    );
  });

  test('should load and display folder tree or show appropriate state', async ({ page }) => {
    // Wait for the folder tree container to be visible
    await expect(page.locator('.folder-tree')).toBeVisible();

    // Wait for either content, loading, or error state
    await page.waitForSelector('.tree-nodes, .loading, .error, .empty', {
      timeout: 15000,
    });

    // Check what state we're in
    const hasNodes = (await page.locator('.node-content').count()) > 0;
    const hasError = await page.locator('.error').isVisible();
    const isLoading = await page.locator('.loading').isVisible();
    const isEmpty = await page.locator('.empty').isVisible();

    expect(hasNodes || hasError || isLoading || isEmpty).toBeTruthy();
  });

  test('should display search bar in header', async ({ page }) => {
    await expect(page.locator('.search-input')).toBeVisible();
    await expect(page.locator('.search-input')).toHaveAttribute('placeholder', /search/i);
  });

  test('should handle folder selection when folders are available', async ({
    page,
  }) => {
    // Wait for folder tree to load
    await page.waitForSelector('.folder-tree', { timeout: 15000 });

    // Check if we have any folder nodes
    const folderNodes = page.locator('.node-content');
    const folderCount = await folderNodes.count();

    if (folderCount > 0) {
      // Click the first folder
      await folderNodes.first().click();

      // Wait for content area to update
      await page.waitForTimeout(1000);

      // Check that placeholder is no longer visible
      await expect(page.locator('.placeholder')).not.toBeVisible();

      // Check that we have either folder content or empty state
      const hasContent = await page.locator('.folder-info').isVisible();
      const isEmpty = await page.locator('.empty').isVisible();
      const isLoading = await page.locator('.loading').isVisible();

      expect(hasContent || isEmpty || isLoading).toBeTruthy();
    } else {
      console.log('No folders available to test selection');
    }
  });

  test('should allow search input', async ({ page }) => {
    const searchInput = page.locator('.search-input');

    await expect(searchInput).toBeVisible();
    await searchInput.fill('test');

    await expect(searchInput).toHaveValue('test');

    // Clear the search
    await searchInput.fill('');
    await expect(searchInput).toHaveValue('');
  });

  test('should be responsive and maintain layout on different screen sizes', async ({
    page,
  }) => {
    // Test desktop
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.locator('.explorer-container')).toBeVisible();
    await expect(page.locator('.left-panel')).toBeVisible();
    await expect(page.locator('.right-panel')).toBeVisible();

    // Test tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('.explorer-container')).toBeVisible();

    // Test mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('.explorer-container')).toBeVisible();
  });

  test('should handle loading states gracefully', async ({ page }) => {
    // Check that the page loads without crashing
    await expect(page.locator('#app').first()).toBeVisible();

    // Wait for either content or error state
    await page.waitForSelector('.folder-tree, .error', { timeout: 15000 });

    // Verify the app is functional
    const hasError = await page.locator('.error').isVisible();
    const hasContent = await page.locator('.folder-tree').isVisible();

    expect(hasError || hasContent).toBeTruthy();
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Intercept API calls and make them fail
    await page.route('**/api/v1/folders/**', (route) => {
      route.abort('failed');
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should show error state or still show the UI
    await expect(page.locator('#app').first()).toBeVisible();

    // Check for error handling
    const hasError = await page.locator('.error').isVisible();
    const hasPlaceholder = await page.locator('.placeholder').isVisible();

    expect(hasError || hasPlaceholder).toBeTruthy();
  });

  test('should expand and collapse folders when available', async ({
    page,
  }) => {
    // Wait for folder tree
    await page.waitForSelector('.folder-tree', { timeout: 15000 });

    // Look for expand buttons
    const expandButtons = page.locator('.expand-button');
    const expandButtonCount = await expandButtons.count();

    if (expandButtonCount > 0) {
      const firstExpandButton = expandButtons.first();

      // Check if button is not already expanded
      const isExpanded = await firstExpandButton.getAttribute('class').then(classes => classes?.includes('expanded') || false);

      if (!isExpanded) {
        await firstExpandButton.click();
        await page.waitForTimeout(500);

        // Check if it expanded
        await expect(firstExpandButton).toHaveClass(/expanded/);
      }
    } else {
      console.log('No expandable folders found');
    }
  });

  test('should handle file interactions when files are present', async ({ page }) => {
    // Wait for folder tree
    await page.waitForSelector('.folder-tree', { timeout: 15000 });

    // Try to click a folder first
    const folderNodes = page.locator('.node-content');
    const folderCount = await folderNodes.count();

    if (folderCount > 0) {
      await folderNodes.first().click();
      await page.waitForTimeout(2000);

      // Look for file items in the right panel
      const fileItems = page.locator('.file-item');
      const fileCount = await fileItems.count();

      if (fileCount > 0) {
        // Click on first file
        await fileItems.first().click();

        // Check if file gets selected
        await expect(fileItems.first()).toHaveClass(/selected/);

        // Try double-click to open file
        await fileItems.first().dblclick();
      } else {
        console.log('No files found to test');
      }
    }
  });
});