// Client-side caching utilities for better performance

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class MemoryCache {
  private cache = new Map<string, CacheItem<any>>();
  private maxSize: number;

  constructor(maxSize = 100) {
    this.maxSize = maxSize;
  }

  set<T>(key: string, data: T, ttlMs = 5 * 60 * 1000): void {
    // Remove oldest items if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttlMs,
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if expired
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    
    if (!item) {
      return false;
    }

    // Check if expired
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  // Clean up expired items
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

// Global cache instances
export const memoryCache = new MemoryCache(200);
export const imageCache = new MemoryCache(50);
export const apiCache = new MemoryCache(100);

// Cleanup expired items every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    memoryCache.cleanup();
    imageCache.cleanup();
    apiCache.cleanup();
  }, 5 * 60 * 1000);
}

// Cache key generators
export const cacheKeys = {
  userRecords: (userId: string, page = 0) => `user_records_${userId}_${page}`,
  userStorybooks: (userId: string) => `user_storybooks_${userId}`,
  storybook: (storybookId: string) => `storybook_${storybookId}`,
  record: (recordId: string) => `record_${recordId}`,
  sharedContent: (shareId: string) => `shared_${shareId}`,
  imageAnalysis: (imageUrl: string) => `analysis_${btoa(imageUrl).slice(0, 20)}`,
  generatedComment: (photoId: string) => `comment_${photoId}`,
  audioUrl: (text: string) => `audio_${btoa(text).slice(0, 20)}`,
};

// Cached API wrapper
export async function cachedApiCall<T>(
  key: string,
  apiCall: () => Promise<T>,
  ttlMs = 5 * 60 * 1000,
  cache = apiCache
): Promise<T> {
  // Try to get from cache first
  const cached = cache.get<T>(key);
  if (cached) {
    return cached;
  }

  // Make API call and cache result
  try {
    const result = await apiCall();
    cache.set(key, result, ttlMs);
    return result;
  } catch (error) {
    // Don't cache errors
    throw error;
  }
}

// Image preloading with caching
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if already cached
    if (imageCache.has(src)) {
      resolve();
      return;
    }

    const img = new Image();
    img.onload = () => {
      imageCache.set(src, true, 30 * 60 * 1000); // Cache for 30 minutes
      resolve();
    };
    img.onerror = reject;
    img.src = src;
  });
}

// Batch image preloading
export async function preloadImages(urls: string[]): Promise<void> {
  const promises = urls.map(url => preloadImage(url).catch(() => {})); // Ignore individual failures
  await Promise.all(promises);
}

// Local storage cache with expiration
export class LocalStorageCache {
  private prefix: string;

  constructor(prefix = 'omoide_cache_') {
    this.prefix = prefix;
  }

  set<T>(key: string, data: T, ttlMs = 24 * 60 * 60 * 1000): void {
    if (typeof window === 'undefined') return;

    try {
      const item: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + ttlMs,
      };
      
      localStorage.setItem(this.prefix + key, JSON.stringify(item));
    } catch (error) {
      // Handle localStorage quota exceeded
      console.warn('LocalStorage cache write failed:', error);
    }
  }

  get<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;

    try {
      const itemStr = localStorage.getItem(this.prefix + key);
      if (!itemStr) return null;

      const item: CacheItem<T> = JSON.parse(itemStr);
      
      // Check if expired
      if (Date.now() > item.expiresAt) {
        localStorage.removeItem(this.prefix + key);
        return null;
      }

      return item.data;
    } catch (error) {
      // Handle JSON parse errors
      localStorage.removeItem(this.prefix + key);
      return null;
    }
  }

  delete(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.prefix + key);
  }

  clear(): void {
    if (typeof window === 'undefined') return;
    
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    });
  }

  cleanup(): void {
    if (typeof window === 'undefined') return;

    const keys = Object.keys(localStorage);
    const now = Date.now();
    
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        try {
          const itemStr = localStorage.getItem(key);
          if (itemStr) {
            const item = JSON.parse(itemStr);
            if (now > item.expiresAt) {
              localStorage.removeItem(key);
            }
          }
        } catch (error) {
          // Remove corrupted items
          localStorage.removeItem(key);
        }
      }
    });
  }
}

export const localStorageCache = new LocalStorageCache();

// Cleanup localStorage cache on page load
if (typeof window !== 'undefined') {
  // Cleanup on load
  localStorageCache.cleanup();
  
  // Cleanup every hour
  setInterval(() => {
    localStorageCache.cleanup();
  }, 60 * 60 * 1000);
}