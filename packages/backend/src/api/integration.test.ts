import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { createFoldersRouter } from './routes/folders';
import { Container } from '../infrastructure/di/Container';

describe('API Integration Tests', () => {
  let app: Elysia;

  beforeAll(async () => {
    Container.getInstance();

    app = new Elysia()
      .use(
        cors({
          origin: true,
          methods: ['GET', 'POST', 'PUT', 'DELETE'],
          allowedHeaders: ['Content-Type', 'Authorization'],
        })
      )
      .use(createFoldersRouter());
  });

  describe('GET /api/v1/folders/tree', () => {
    it('should return folder tree structure', async () => {
      const response = await app.handle(
        new Request('http://localhost/api/v1/folders/tree')
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });
  });

  describe('GET /api/v1/folders/root', () => {
    it('should return root folders', async () => {
      const response = await app.handle(
        new Request('http://localhost/api/v1/folders/root')
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
    });

    it('should support pagination parameters', async () => {
      const response = await app.handle(
        new Request('http://localhost/api/v1/folders/root?page=1&limit=5')
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
    });
  });

  describe('GET /api/v1/folders/:id/children', () => {
    it('should return 404 for non-existent folder', async () => {
      const response = await app.handle(
        new Request('http://localhost/api/v1/folders/99999/children')
      );
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
    });

    it('should return folder children for valid folder ID', async () => {
      const treeResponse = await app.handle(
        new Request('http://localhost/api/v1/folders/tree')
      );
      const treeData = await treeResponse.json();

      if (treeData.data && treeData.data.length > 0) {
        const folderId = treeData.data[0].id;
        const response = await app.handle(
          new Request(`http://localhost/api/v1/folders/${folderId}/children`)
        );
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data).toBeDefined();
        expect(data.data.folder).toBeDefined();
        expect(Array.isArray(data.data.children)).toBe(true);
        expect(Array.isArray(data.data.files)).toBe(true);
        expect(data.data.stats).toBeDefined();
      }
    });
  });

  describe('GET /api/v1/folders/search', () => {
    it('should return search results', async () => {
      const response = await app.handle(
        new Request('http://localhost/api/v1/folders/search?q=test')
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(Array.isArray(data.data.folders)).toBe(true);
      expect(Array.isArray(data.data.files)).toBe(true);
    });

    it('should handle empty search query', async () => {
      const response = await app.handle(
        new Request('http://localhost/api/v1/folders/search?q=')
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should support pagination in search', async () => {
      const response = await app.handle(
        new Request(
          'http://localhost/api/v1/folders/search?q=test&page=1&limit=10'
        )
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  describe('CORS Headers', () => {
    it('should include proper CORS headers', async () => {
      const response = await app.handle(
        new Request('http://localhost/api/v1/folders/tree', {
          method: 'OPTIONS',
        })
      );

      expect(response.headers.get('access-control-allow-origin')).toBeDefined();
      expect(
        response.headers.get('access-control-allow-methods')
      ).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid endpoints gracefully', async () => {
      const response = await app.handle(
        new Request('http://localhost/api/v1/folders/invalid')
      );

      expect(response.status).toBe(404);
    });

    it('should handle malformed folder IDs', async () => {
      const response = await app.handle(
        new Request('http://localhost/api/v1/folders/invalid-id/children')
      );

      expect(response.status).toBe(400);
    });
  });
});
