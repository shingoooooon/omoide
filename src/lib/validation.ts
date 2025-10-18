// Validation functions for data models

import { 
  User, 
  Photo, 
  GrowthComment, 
  GrowthRecord, 
  Storybook, 
  StorybookPage, 
  ShareLink 
} from '@/types/models';

// Validation error types
export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// URL validation regex
const URL_REGEX = /^https?:\/\/.+/;

// Month format validation (YYYY-MM)
const MONTH_REGEX = /^\d{4}-\d{2}$/;

// User validation
export function validateUser(user: Partial<User>): void {
  if (!user.id || typeof user.id !== 'string' || user.id.trim() === '') {
    throw new ValidationError('User ID is required and must be a non-empty string', 'id');
  }

  if (!user.email || typeof user.email !== 'string' || !EMAIL_REGEX.test(user.email)) {
    throw new ValidationError('Valid email is required', 'email');
  }

  if (!user.displayName || typeof user.displayName !== 'string' || user.displayName.trim() === '') {
    throw new ValidationError('Display name is required and must be a non-empty string', 'displayName');
  }

  if (user.photoURL && (typeof user.photoURL !== 'string' || !URL_REGEX.test(user.photoURL))) {
    throw new ValidationError('Photo URL must be a valid URL', 'photoURL');
  }

  if (!user.createdAt || !(user.createdAt instanceof Date)) {
    throw new ValidationError('Created date is required and must be a Date', 'createdAt');
  }

  if (!user.lastLoginAt || !(user.lastLoginAt instanceof Date)) {
    throw new ValidationError('Last login date is required and must be a Date', 'lastLoginAt');
  }
}

// Photo validation
export function validatePhoto(photo: Partial<Photo>): void {
  if (!photo.id || typeof photo.id !== 'string' || photo.id.trim() === '') {
    throw new ValidationError('Photo ID is required and must be a non-empty string', 'id');
  }

  if (!photo.url || typeof photo.url !== 'string' || !URL_REGEX.test(photo.url)) {
    throw new ValidationError('Photo URL is required and must be a valid URL', 'url');
  }

  if (!photo.fileName || typeof photo.fileName !== 'string' || photo.fileName.trim() === '') {
    throw new ValidationError('File name is required and must be a non-empty string', 'fileName');
  }

  if (!photo.uploadedAt || !(photo.uploadedAt instanceof Date)) {
    throw new ValidationError('Upload date is required and must be a Date', 'uploadedAt');
  }

  if (typeof photo.faceDetected !== 'boolean') {
    throw new ValidationError('Face detected must be a boolean', 'faceDetected');
  }
}

// Growth comment validation
export function validateGrowthComment(comment: Partial<GrowthComment>): void {
  if (!comment.id || typeof comment.id !== 'string' || comment.id.trim() === '') {
    throw new ValidationError('Comment ID is required and must be a non-empty string', 'id');
  }

  if (!comment.photoId || typeof comment.photoId !== 'string' || comment.photoId.trim() === '') {
    throw new ValidationError('Photo ID is required and must be a non-empty string', 'photoId');
  }

  if (!comment.content || typeof comment.content !== 'string' || comment.content.trim() === '') {
    throw new ValidationError('Comment content is required and must be a non-empty string', 'content');
  }

  if (comment.content.length > 1000) {
    throw new ValidationError('Comment content must be 1000 characters or less', 'content');
  }

  if (!comment.generatedAt || !(comment.generatedAt instanceof Date)) {
    throw new ValidationError('Generated date is required and must be a Date', 'generatedAt');
  }

  if (typeof comment.isEdited !== 'boolean') {
    throw new ValidationError('Is edited must be a boolean', 'isEdited');
  }
}

// Growth record validation
export function validateGrowthRecord(record: Partial<GrowthRecord>, isCreating: boolean = false): void {
  // Only validate ID if not creating (ID is auto-generated during creation)
  if (!isCreating && (!record.id || typeof record.id !== 'string' || record.id.trim() === '')) {
    throw new ValidationError('Record ID is required and must be a non-empty string', 'id');
  }

  if (!record.userId || typeof record.userId !== 'string' || record.userId.trim() === '') {
    throw new ValidationError('User ID is required and must be a non-empty string', 'userId');
  }

  if (!Array.isArray(record.photos) || record.photos.length === 0) {
    throw new ValidationError('Photos array is required and must contain at least one photo', 'photos');
  }

  // Validate each photo
  record.photos.forEach((photo, index) => {
    try {
      validatePhoto(photo);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw new ValidationError(`Photo ${index}: ${error.message}`, `photos[${index}].${error.field}`);
      }
      throw error;
    }
  });

  if (!Array.isArray(record.comments)) {
    throw new ValidationError('Comments must be an array', 'comments');
  }

  // Validate each comment
  record.comments.forEach((comment, index) => {
    try {
      validateGrowthComment(comment);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw new ValidationError(`Comment ${index}: ${error.message}`, `comments[${index}].${error.field}`);
      }
      throw error;
    }
  });

  if (!record.createdAt || !(record.createdAt instanceof Date)) {
    throw new ValidationError('Created date is required and must be a Date', 'createdAt');
  }

  if (!record.updatedAt || !(record.updatedAt instanceof Date)) {
    throw new ValidationError('Updated date is required and must be a Date', 'updatedAt');
  }

  if (typeof record.isShared !== 'boolean') {
    throw new ValidationError('Is shared must be a boolean', 'isShared');
  }

  if (record.sharedLink && (typeof record.sharedLink !== 'string' || record.sharedLink.trim() === '')) {
    throw new ValidationError('Shared link must be a non-empty string if provided', 'sharedLink');
  }
}

// Storybook page validation
export function validateStorybookPage(page: Partial<StorybookPage>): void {
  if (!page.id || typeof page.id !== 'string' || page.id.trim() === '') {
    throw new ValidationError('Page ID is required and must be a non-empty string', 'id');
  }

  if (!page.text || typeof page.text !== 'string' || page.text.trim() === '') {
    throw new ValidationError('Page text is required and must be a non-empty string', 'text');
  }

  if (page.text.length > 500) {
    throw new ValidationError('Page text must be 500 characters or less', 'text');
  }

  if (!page.imageUrl || typeof page.imageUrl !== 'string' || !URL_REGEX.test(page.imageUrl)) {
    throw new ValidationError('Page image URL is required and must be a valid URL', 'imageUrl');
  }

  if (page.audioUrl && (typeof page.audioUrl !== 'string' || !URL_REGEX.test(page.audioUrl))) {
    throw new ValidationError('Audio URL must be a valid URL if provided', 'audioUrl');
  }

  if (typeof page.pageNumber !== 'number' || page.pageNumber < 1) {
    throw new ValidationError('Page number is required and must be a positive integer', 'pageNumber');
  }
}

// Storybook validation
export function validateStorybook(storybook: Partial<Storybook>): void {
  if (!storybook.id || typeof storybook.id !== 'string' || storybook.id.trim() === '') {
    throw new ValidationError('Storybook ID is required and must be a non-empty string', 'id');
  }

  if (!storybook.userId || typeof storybook.userId !== 'string' || storybook.userId.trim() === '') {
    throw new ValidationError('User ID is required and must be a non-empty string', 'userId');
  }

  if (!storybook.title || typeof storybook.title !== 'string' || storybook.title.trim() === '') {
    throw new ValidationError('Title is required and must be a non-empty string', 'title');
  }

  if (storybook.title.length > 100) {
    throw new ValidationError('Title must be 100 characters or less', 'title');
  }

  if (!storybook.month || typeof storybook.month !== 'string' || !MONTH_REGEX.test(storybook.month)) {
    throw new ValidationError('Month is required and must be in YYYY-MM format', 'month');
  }

  if (!Array.isArray(storybook.pages) || storybook.pages.length === 0) {
    throw new ValidationError('Pages array is required and must contain at least one page', 'pages');
  }

  if (storybook.pages.length > 20) {
    throw new ValidationError('Storybook cannot have more than 20 pages', 'pages');
  }

  // Validate each page
  storybook.pages.forEach((page, index) => {
    try {
      validateStorybookPage(page);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw new ValidationError(`Page ${index}: ${error.message}`, `pages[${index}].${error.field}`);
      }
      throw error;
    }
  });

  // Validate page numbers are sequential
  const pageNumbers = storybook.pages.map(p => p.pageNumber).sort((a, b) => a - b);
  for (let i = 0; i < pageNumbers.length; i++) {
    if (pageNumbers[i] !== i + 1) {
      throw new ValidationError('Page numbers must be sequential starting from 1', 'pages');
    }
  }

  if (storybook.coverImageUrl && (typeof storybook.coverImageUrl !== 'string' || !URL_REGEX.test(storybook.coverImageUrl))) {
    throw new ValidationError('Cover image URL must be a valid URL if provided', 'coverImageUrl');
  }

  if (!storybook.createdAt || !(storybook.createdAt instanceof Date)) {
    throw new ValidationError('Created date is required and must be a Date', 'createdAt');
  }

  if (typeof storybook.isShared !== 'boolean') {
    throw new ValidationError('Is shared must be a boolean', 'isShared');
  }

  if (storybook.sharedLink && (typeof storybook.sharedLink !== 'string' || storybook.sharedLink.trim() === '')) {
    throw new ValidationError('Shared link must be a non-empty string if provided', 'sharedLink');
  }
}

// Share link validation
export function validateShareLink(shareLink: Partial<ShareLink>): void {
  if (!shareLink.id || typeof shareLink.id !== 'string' || shareLink.id.trim() === '') {
    throw new ValidationError('Share link ID is required and must be a non-empty string', 'id');
  }

  if (!shareLink.contentId || typeof shareLink.contentId !== 'string' || shareLink.contentId.trim() === '') {
    throw new ValidationError('Content ID is required and must be a non-empty string', 'contentId');
  }

  if (!shareLink.contentType || !['record', 'storybook'].includes(shareLink.contentType)) {
    throw new ValidationError('Content type is required and must be either "record" or "storybook"', 'contentType');
  }

  if (!shareLink.createdBy || typeof shareLink.createdBy !== 'string' || shareLink.createdBy.trim() === '') {
    throw new ValidationError('Created by is required and must be a non-empty string', 'createdBy');
  }

  if (!shareLink.createdAt || !(shareLink.createdAt instanceof Date)) {
    throw new ValidationError('Created date is required and must be a Date', 'createdAt');
  }

  if (typeof shareLink.isActive !== 'boolean') {
    throw new ValidationError('Is active must be a boolean', 'isActive');
  }

  if (shareLink.expiresAt && !(shareLink.expiresAt instanceof Date)) {
    throw new ValidationError('Expires at must be a Date if provided', 'expiresAt');
  }

  if (shareLink.expiresAt && shareLink.expiresAt <= shareLink.createdAt) {
    throw new ValidationError('Expires at must be after created at', 'expiresAt');
  }
}

// Utility function to validate file upload
export function validateImageFile(file: File): void {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!allowedTypes.includes(file.type)) {
    throw new ValidationError('File must be a JPEG, PNG, or WebP image', 'type');
  }

  if (file.size > maxSize) {
    throw new ValidationError('File size must be less than 10MB', 'size');
  }

  if (file.name.length > 255) {
    throw new ValidationError('File name must be less than 255 characters', 'name');
  }
}

// Utility function to sanitize user input
export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

// Utility function to validate month format and ensure it's not in the future
export function validateMonth(month: string): void {
  if (!MONTH_REGEX.test(month)) {
    throw new ValidationError('Month must be in YYYY-MM format', 'month');
  }

  const [year, monthNum] = month.split('-').map(Number);
  const inputDate = new Date(year, monthNum - 1);
  const now = new Date();
  const currentMonth = new Date(now.getFullYear(), now.getMonth());

  if (inputDate > currentMonth) {
    throw new ValidationError('Month cannot be in the future', 'month');
  }

  if (year < 2020 || year > now.getFullYear()) {
    throw new ValidationError('Year must be between 2020 and current year', 'month');
  }
}