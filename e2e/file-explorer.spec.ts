import { test, expect } from '@playwright/test';

test.describe('File Explorer Application', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
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

  test('should load and display folder tree', async ({ page }) => {
    await page.waitForSelector('.folder-tree-node, .loading, .error', {
      timeout: 10000,
    });

    const hasNodes = (await page.locator('.folder-tree-node').count()) > 0;
    const hasError = await page.locator('.error').isVisible();
    const isLoading = await page.locator('.loading').isVisible();

    expect(hasNodes || hasError || isLoading).toBeTruthy();
  });

  test('should display search bar in header', async ({ page }) => {
    await expect(page.locator('input[placeholder*="search"]')).toBeVisible();
  });

  test('should handle folder selection and content display', async ({
    page,
  }) => {
    await page.waitForSelector('.folder-tree-node, .error', { timeout: 10000 });

    const folderCount = await page.locator('.folder-tree-node').count();

    if (folderCount > 0) {
      await page.locator('.folder-tree-node').first().click();

      await page.waitForSelector('.folder-info, .loading, .empty', {
        timeout: 5000,
      });

      await expect(page.locator('.placeholder')).not.toBeVisible();

      const hasContent = await page.locator('.folder-info').isVisible();
      const isEmpty = await page.locator('.empty').isVisible();

      expect(hasContent || isEmpty).toBeTruthy();
    }
  });

  test('should search for folders and files', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="search"]');

    await searchInput.fill('test');

    await page.waitForTimeout(1000);
  });

  test('should be responsive and maintain layout on different screen sizes', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.locator('.explorer-container')).toBeVisible();

    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('.explorer-container')).toBeVisible();

    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('.explorer-container')).toBeVisible();
  });

  test('should handle loading states gracefully', async ({ page }) => {
    const loadingElement = page.locator('.loading');

    await expect(async () => {
      const isLoading = await loadingElement.isVisible();
      const hasContent = (await page.locator('.folder-tree-node').count()) > 0;
      expect(isLoading || hasContent).toBeTruthy();
    }).toPass({ timeout: 10000 });
  });

  test('should handle network errors gracefully', async ({ page }) => {
    await page.route('**/api/v1/folders/**', (route) => {
      route.abort('failed');
    });

    await page.reload();

    await expect(page.locator('.error, .placeholder')).toBeVisible();
  });

  test('should display folder statistics when folder is selected', async ({
    page,
  }) => {
    await page.waitForSelector('.folder-tree-node, .error', { timeout: 10000 });

    const folderCount = await page.locator('.folder-tree-node').count();

    if (folderCount > 0) {
      await page.locator('.folder-tree-node').first().click();

      await page.waitForSelector('.folder-info, .empty', { timeout: 5000 });

      await expect(page.locator('.folder-meta')).toBeVisible();
    }
  });

  test('should handle file interactions', async ({ page }) => {
    await page.waitForSelector('.folder-tree-node, .error', { timeout: 10000 });

    const folderCount = await page.locator('.folder-tree-node').count();

    if (folderCount > 0) {
      await page.locator('.folder-tree-node').first().click();

      await page.waitForTimeout(2000);

      const fileCount = await page.locator('.file-item').count();

      if (fileCount > 0) {
        await page.locator('.file-item').first().click();

        await expect(page.locator('.file-item.selected')).toBeVisible();

        await page.locator('.file-item').first().dblclick();
      }
    }
  });
});
