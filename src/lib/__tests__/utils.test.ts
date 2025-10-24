import { 
  cn, 
  formatDate,
  formatDateTime,
  generateId, 
  validateImageFile
} from '../utils';

describe('Utils Functions', () => {
  describe('cn (className utility)', () => {
    it('combines class names correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2');
    });

    it('handles conditional classes', () => {
      expect(cn('base', true && 'conditional', false && 'hidden')).toBe('base conditional');
    });

    it('handles undefined and null values', () => {
      expect(cn('base', undefined, null, 'end')).toBe('base end');
    });
  });

  describe('generateId', () => {
    it('generates a string', () => {
      const id = generateId();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });

    it('generates unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('formatDate', () => {
    it('formats date correctly', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const formatted = formatDate(date);
      expect(formatted).toMatch(/2024/);
      expect(formatted).toMatch(/January/);
      expect(formatted).toMatch(/15/);
    });

    it('handles valid date', () => {
      const date = new Date('2024-01-15');
      expect(() => formatDate(date)).not.toThrow();
    });
  });

  describe('formatDateTime', () => {
    it('formats date and time correctly', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const formatted = formatDateTime(date);
      expect(formatted).toMatch(/2024/);
      expect(formatted).toMatch(/January/);
      expect(formatted).toMatch(/15/);
      // Time format varies by timezone, just check it contains time
      expect(formatted).toMatch(/\d{1,2}:\d{2}/);
    });
  });

  describe('validateImageFile', () => {
    it('validates correct image files', () => {
      const jpegFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(jpegFile, 'size', { value: 1024 * 1024 }); // 1MB
      
      const result = validateImageFile(jpegFile);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('validates PNG files', () => {
      const pngFile = new File(['test'], 'test.png', { type: 'image/png' });
      Object.defineProperty(pngFile, 'size', { value: 1024 * 1024 }); // 1MB
      
      const result = validateImageFile(pngFile);
      expect(result.isValid).toBe(true);
    });

    it('validates WebP files', () => {
      const webpFile = new File(['test'], 'test.webp', { type: 'image/webp' });
      Object.defineProperty(webpFile, 'size', { value: 1024 * 1024 }); // 1MB
      
      const result = validateImageFile(webpFile);
      expect(result.isValid).toBe(true);
    });

    it('rejects invalid file types', () => {
      const textFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      Object.defineProperty(textFile, 'size', { value: 1024 }); // 1KB
      
      const result = validateImageFile(textFile);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Only JPEG, PNG, and WebP image files are allowed.');
    });

    it('rejects files that are too large', () => {
      const largeFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(largeFile, 'size', { value: 11 * 1024 * 1024 }); // 11MB
      
      const result = validateImageFile(largeFile);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('File size must be 10MB or less.');
    });

    it('accepts files at the size limit', () => {
      const maxSizeFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(maxSizeFile, 'size', { value: 10 * 1024 * 1024 }); // 10MB exactly
      
      const result = validateImageFile(maxSizeFile);
      expect(result.isValid).toBe(true);
    });
  });
});