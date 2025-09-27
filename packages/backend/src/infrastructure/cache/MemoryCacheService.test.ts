import { describe, it, expect, beforeEach } from 'bun:test';
import { MemoryCacheService } from './MemoryCacheService';

describe('MemoryCacheService', () => {
  let cacheService: MemoryCacheService;

  beforeEach(() => {
    cacheService = new MemoryCacheService();
  });

  describe('set and get', () => {
    it('should store and retrieve values', async () => {
      await cacheService.set('test-key', 'test-value');
      const result = await cacheService.get('test-key');
      expect(result).toBe('test-value');
    });

    it('should store and retrieve complex objects', async () => {
      const testObject = { id: 1, name: 'Test', items: [1, 2, 3] };
      await cacheService.set('test-object', testObject);
      const result = await cacheService.get('test-object');
      expect(result).toEqual(testObject);
    });

    it('should return null for non-existent keys', async () => {
      const result = await cacheService.get('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('TTL (Time To Live)', () => {
    it('should expire items after TTL', async () => {
      await cacheService.set('expire-test', 'value', 0.01); // 0.01 seconds

      await new Promise((resolve) => setTimeout(resolve, 20));

      const result = await cacheService.get('expire-test');
      expect(result).toBeNull();
    });

    it('should not expire items before TTL', async () => {
      await cacheService.set('no-expire-test', 'value', 1); // 1 second
      const result = await cacheService.get('no-expire-test');
      expect(result).toBe('value');
    });
  });

  describe('delete', () => {
    it('should delete specific keys', async () => {
      await cacheService.set('delete-test', 'value');
      await cacheService.delete('delete-test');
      const result = await cacheService.get('delete-test');
      expect(result).toBeNull();
    });
  });

  describe('deletePattern', () => {
    it('should delete keys matching pattern', async () => {
      await cacheService.set('user:1', 'user1');
      await cacheService.set('user:2', 'user2');
      await cacheService.set('folder:1', 'folder1');

      await cacheService.deletePattern('user:*');

      expect(await cacheService.get('user:1')).toBeNull();
      expect(await cacheService.get('user:2')).toBeNull();
      const folder1Result = await cacheService.get('folder:1');
      expect(folder1Result).not.toBeNull();
      expect(folder1Result).toEqual('folder1');
    });

    it('should handle complex patterns', async () => {
      await cacheService.set('folder_children:1:page1', 'data1');
      await cacheService.set('folder_children:1:page2', 'data2');
      await cacheService.set('folder_children:2:page1', 'data3');
      await cacheService.set('folder_stats:1', 'stats1');

      await cacheService.deletePattern('folder_children:1:*');

      expect(await cacheService.get('folder_children:1:page1')).toBeNull();
      expect(await cacheService.get('folder_children:1:page2')).toBeNull();
      const data3Result = await cacheService.get('folder_children:2:page1');
      expect(data3Result).not.toBeNull();
      expect(data3Result).toEqual('data3');
      const stats1Result = await cacheService.get('folder_stats:1');
      expect(stats1Result).not.toBeNull();
      expect(stats1Result).toEqual('stats1');
    });
  });

  describe('exists', () => {
    it('should return true for existing keys', async () => {
      await cacheService.set('exists-test', 'value');
      const exists = await cacheService.exists('exists-test');
      expect(exists).toBe(true);
    });

    it('should return false for non-existent keys', async () => {
      const exists = await cacheService.exists('non-existent');
      expect(exists).toBe(false);
    });

    it('should return false for expired keys', async () => {
      await cacheService.set('expire-exists-test', 'value', 0.01);
      await new Promise((resolve) => setTimeout(resolve, 20));
      const exists = await cacheService.exists('expire-exists-test');
      expect(exists).toBe(false);
    });
  });

  describe('increment', () => {
    it('should increment numeric values', async () => {
      await cacheService.set('counter', 5);
      const result = await cacheService.increment('counter', 3);
      expect(result).toEqual(8);
      const counterResult = await cacheService.get('counter');
      expect(counterResult).not.toBeNull();
      expect(counterResult).toBe(8);
    });

    it('should start from 0 for non-existent keys', async () => {
      const result = await cacheService.increment('new-counter', 1);
      expect(result).toEqual(1);
      const newCounterResult = await cacheService.get('new-counter');
      expect(newCounterResult).not.toBeNull();
      expect(newCounterResult).toBe(1);
    });

    it('should default to increment by 1', async () => {
      await cacheService.set('default-counter', 10);
      const result = await cacheService.increment('default-counter');
      expect(result).toBe(11);
    });
  });

  describe('expire', () => {
    it('should update TTL for existing keys', async () => {
      await cacheService.set('expire-update-test', 'value', 10);
      await cacheService.expire('expire-update-test', 0.01);

      await new Promise((resolve) => setTimeout(resolve, 20));

      const result = await cacheService.get('expire-update-test');
      expect(result).toBeNull();
    });
  });

  describe('cleanup', () => {
    it('should remove expired items', async () => {
      await cacheService.set('cleanup-test-1', 'value1', 0.01);
      await cacheService.set('cleanup-test-2', 'value2', 10);

      await new Promise((resolve) => setTimeout(resolve, 20));

      cacheService.cleanup();

      expect(await cacheService.get('cleanup-test-1')).toBeNull();
      const cleanupResult = await cacheService.get('cleanup-test-2');
      expect(cleanupResult).not.toBeNull();
      expect(cleanupResult).toEqual('value2');
    });
  });
});
