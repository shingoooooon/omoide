// Utility functions for converting between Firestore documents and application models

import { Timestamp } from 'firebase/firestore';
import { 
  User, 
  Photo, 
  GrowthComment, 
  GrowthRecord, 
  Storybook, 
  StorybookPage, 
  ShareLink,
  UserDoc,
  PhotoDoc,
  GrowthCommentDoc,
  GrowthRecordDoc,
  StorybookDoc,
  StorybookPageDoc,
  ShareLinkDoc
} from '@/types/models';

// Convert Firestore Timestamp to Date
function timestampToDate(timestamp: Timestamp): Date {
  return timestamp.toDate();
}

// Convert Date to Firestore Timestamp
function dateToTimestamp(date: Date): Timestamp {
  return Timestamp.fromDate(date);
}

// User converters
export function userDocToUser(id: string, doc: UserDoc): User {
  return {
    id,
    email: doc.email,
    displayName: doc.displayName,
    photoURL: doc.photoURL,
    createdAt: timestampToDate(doc.createdAt),
    lastLoginAt: timestampToDate(doc.lastLoginAt)
  };
}

export function userToUserDoc(user: User): UserDoc {
  return {
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    createdAt: dateToTimestamp(user.createdAt),
    lastLoginAt: dateToTimestamp(user.lastLoginAt)
  };
}

// Photo converters
export function photoDocToPhoto(id: string, doc: PhotoDoc): Photo {
  return {
    id,
    url: doc.url,
    fileName: doc.fileName,
    uploadedAt: timestampToDate(doc.uploadedAt),
    faceDetected: doc.faceDetected,
    storageRef: doc.storageRef
  };
}

export function photoToPhotoDoc(photo: Photo): PhotoDoc {
  const doc: PhotoDoc = {
    url: photo.url,
    fileName: photo.fileName,
    uploadedAt: dateToTimestamp(photo.uploadedAt),
    faceDetected: photo.faceDetected
  };
  
  // Only include storageRef if it's not undefined
  if (photo.storageRef !== undefined) {
    doc.storageRef = photo.storageRef;
  }
  
  return doc;
}

// Growth comment converters
export function growthCommentDocToGrowthComment(id: string, doc: GrowthCommentDoc): GrowthComment {
  return {
    id,
    photoId: doc.photoId,
    content: doc.content,
    generatedAt: timestampToDate(doc.generatedAt),
    isEdited: doc.isEdited,
    originalContent: doc.originalContent
  };
}

export function growthCommentToGrowthCommentDoc(comment: GrowthComment): GrowthCommentDoc {
  const doc: GrowthCommentDoc = {
    photoId: comment.photoId,
    content: comment.content,
    generatedAt: dateToTimestamp(comment.generatedAt),
    isEdited: comment.isEdited
  };
  
  // Only include originalContent if it's not undefined
  if (comment.originalContent !== undefined) {
    doc.originalContent = comment.originalContent;
  }
  
  return doc;
}

// Growth record converters
export function growthRecordDocToGrowthRecord(id: string, doc: GrowthRecordDoc): GrowthRecord {
  return {
    id,
    userId: doc.userId,
    photos: doc.photos.map((photoDoc, index) => 
      photoDocToPhoto(`${id}_photo_${index}`, photoDoc)
    ),
    comments: doc.comments.map((commentDoc, index) => 
      growthCommentDocToGrowthComment(`${id}_comment_${index}`, commentDoc)
    ),
    createdAt: timestampToDate(doc.createdAt),
    updatedAt: timestampToDate(doc.updatedAt),
    sharedLink: doc.sharedLink,
    isShared: doc.isShared
  };
}

export function growthRecordToGrowthRecordDoc(record: GrowthRecord): GrowthRecordDoc {
  const doc: GrowthRecordDoc = {
    userId: record.userId,
    photos: record.photos.map(photo => photoToPhotoDoc(photo)),
    comments: record.comments.map(comment => growthCommentToGrowthCommentDoc(comment)),
    createdAt: dateToTimestamp(record.createdAt),
    updatedAt: dateToTimestamp(record.updatedAt),
    isShared: record.isShared
  };
  
  // Only include sharedLink if it's not undefined
  if (record.sharedLink !== undefined) {
    doc.sharedLink = record.sharedLink;
  }
  
  return doc;
}

// Storybook page converters
export function storybookPageDocToStorybookPage(id: string, doc: StorybookPageDoc): StorybookPage {
  return {
    id,
    text: doc.text,
    imageUrl: doc.imageUrl,
    audioUrl: doc.audioUrl,
    pageNumber: doc.pageNumber
  };
}

export function storybookPageToStorybookPageDoc(page: StorybookPage): StorybookPageDoc {
  return {
    text: page.text,
    imageUrl: page.imageUrl,
    audioUrl: page.audioUrl,
    pageNumber: page.pageNumber
  };
}

// Storybook converters
export function storybookDocToStorybook(id: string, doc: StorybookDoc): Storybook {
  return {
    id,
    userId: doc.userId,
    title: doc.title,
    month: doc.month,
    pages: doc.pages.map((pageDoc, index) => 
      storybookPageDocToStorybookPage(`${id}_page_${index}`, pageDoc)
    ),
    coverImageUrl: doc.coverImageUrl,
    createdAt: timestampToDate(doc.createdAt),
    sharedLink: doc.sharedLink,
    isShared: doc.isShared
  };
}

export function storybookToStorybookDoc(storybook: Storybook): StorybookDoc {
  return {
    userId: storybook.userId,
    title: storybook.title,
    month: storybook.month,
    pages: storybook.pages.map(page => storybookPageToStorybookPageDoc(page)),
    coverImageUrl: storybook.coverImageUrl,
    createdAt: dateToTimestamp(storybook.createdAt),
    sharedLink: storybook.sharedLink,
    isShared: storybook.isShared
  };
}

// Share link converters
export function shareLinkDocToShareLink(id: string, doc: ShareLinkDoc): ShareLink {
  return {
    id,
    contentId: doc.contentId,
    contentType: doc.contentType,
    createdBy: doc.createdBy,
    createdAt: timestampToDate(doc.createdAt),
    isActive: doc.isActive,
    expiresAt: doc.expiresAt ? timestampToDate(doc.expiresAt) : undefined
  };
}

export function shareLinkToShareLinkDoc(shareLink: ShareLink): ShareLinkDoc {
  return {
    contentId: shareLink.contentId,
    contentType: shareLink.contentType,
    createdBy: shareLink.createdBy,
    createdAt: dateToTimestamp(shareLink.createdAt),
    isActive: shareLink.isActive,
    expiresAt: shareLink.expiresAt ? dateToTimestamp(shareLink.expiresAt) : undefined
  };
}

// Utility function to generate unique IDs for nested objects
export function generatePhotoId(recordId: string, index: number): string {
  return `${recordId}_photo_${index}_${Date.now()}`;
}

export function generateCommentId(recordId: string, index: number): string {
  return `${recordId}_comment_${index}_${Date.now()}`;
}

export function generatePageId(storybookId: string, pageNumber: number): string {
  return `${storybookId}_page_${pageNumber}_${Date.now()}`;
}