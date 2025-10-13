import { validatePhotoFile, validatePhotoFiles, sanitizeFileName, formatValidationErrors } from '../photoValidation'

// Mock File constructor for testing
class MockFile extends File {
  constructor(
    bits: BlobPart[],
    name: string,
    options?: FilePropertyBag & { size?: number }
  ) {
    super(bits, name, options)
    if (options?.size !== undefined) {
      Object.defineProperty(this, 'size', { value: options.size })
    }
  }
}

// Mock Image for testing
global.Image = class {
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  naturalWidth = 1920
  naturalHeight = 1080
  
  set src(value: string) {
    setTimeout(() => {
      if (this.onload) this.onload()
    }, 0)
  }
} as any

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-url')
global.URL.revokeObjectURL = jest.fn()

describe('photoValidation', () => {
  describe('validatePhotoFile', () => {
    it('should validate a correct JPEG file', async () => {
      const file = new MockFile([''], 'test.jpg', { 
        type: 'image/jpeg',
        size: 1024 * 1024 // 1MB
      })
      
      const result = await validatePhotoFile(file)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject unsupported file format', async () => {
      const file = new MockFile([''], 'test.gif', { 
        type: 'image/gif',
        size: 1024 * 1024
      })
      
      const result = await validatePhotoFile(file)
      expect(result.isValid).toBe(false)
      expect(result.errors[0]).toContain('サポートされていないファイル形式')
    })

    it('should reject file that is too large', async () => {
      const file = new MockFile([''], 'test.jpg', { 
        type: 'image/jpeg',
        size: 15 * 1024 * 1024 // 15MB
      })
      
      const result = await validatePhotoFile(file, { maxFileSize: 10 })
      expect(result.isValid).toBe(false)
      expect(result.errors[0]).toContain('ファイルサイズが大きすぎます')
    })

    it('should reject file that is too small', async () => {
      const file = new MockFile([''], 'test.jpg', { 
        type: 'image/jpeg',
        size: 1024 // 1KB
      })
      
      const result = await validatePhotoFile(file, { minFileSize: 0.1 })
      expect(result.isValid).toBe(false)
      expect(result.errors[0]).toContain('ファイルサイズが小さすぎます')
    })
  })

  describe('validatePhotoFiles', () => {
    it('should validate multiple correct files', async () => {
      const files = [
        new MockFile([''], 'test1.jpg', { type: 'image/jpeg', size: 1024 * 1024 }),
        new MockFile([''], 'test2.png', { type: 'image/png', size: 2 * 1024 * 1024 })
      ]
      
      const result = await validatePhotoFiles(files)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject when too many files', async () => {
      const files = Array.from({ length: 15 }, (_, i) => 
        new MockFile([''], `test${i}.jpg`, { type: 'image/jpeg', size: 1024 * 1024 })
      )
      
      const result = await validatePhotoFiles(files, { maxTotalFiles: 10 })
      expect(result.isValid).toBe(false)
      expect(result.errors[0]).toContain('最大10枚まで')
    })

    it('should warn about duplicate filenames', async () => {
      const files = [
        new MockFile([''], 'test.jpg', { type: 'image/jpeg', size: 1024 * 1024 }),
        new MockFile([''], 'test.jpg', { type: 'image/jpeg', size: 1024 * 1024 })
      ]
      
      const result = await validatePhotoFiles(files)
      expect(result.isValid).toBe(true)
      expect(result.warnings).toBeDefined()
      expect(result.warnings![0]).toContain('重複するファイル名')
    })
  })

  describe('sanitizeFileName', () => {
    it('should sanitize unsafe characters', () => {
      const result = sanitizeFileName('test file@#$%.jpg')
      expect(result).toBe('test_file_.jpg')
    })

    it('should handle multiple underscores', () => {
      const result = sanitizeFileName('test___file.jpg')
      expect(result).toBe('test_file.jpg')
    })

    it('should remove leading and trailing underscores', () => {
      const result = sanitizeFileName('_test_file_.jpg')
      expect(result).toBe('test_file_.jpg')
    })

    it('should convert to lowercase', () => {
      const result = sanitizeFileName('TEST_FILE.JPG')
      expect(result).toBe('test_file.jpg')
    })
  })

  describe('formatValidationErrors', () => {
    it('should add emoji to file format errors', () => {
      const errors = ['サポートされていないファイル形式です']
      const result = formatValidationErrors(errors)
      expect(result[0]).toContain('📷')
    })

    it('should add emoji to file size errors', () => {
      const errors = ['ファイルサイズが大きすぎます']
      const result = formatValidationErrors(errors)
      expect(result[0]).toContain('💾')
    })

    it('should add emoji to image size errors', () => {
      const errors = ['画像サイズが大きすぎます']
      const result = formatValidationErrors(errors)
      expect(result[0]).toContain('📐')
    })

    it('should add emoji to image loading errors', () => {
      const errors = ['画像ファイルの読み込みに失敗']
      const result = formatValidationErrors(errors)
      expect(result[0]).toContain('❌')
    })

    it('should return original error if no match', () => {
      const errors = ['Some other error']
      const result = formatValidationErrors(errors)
      expect(result[0]).toBe('Some other error')
    })
  })
})