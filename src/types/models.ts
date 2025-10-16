// Core data models for the Omoide application

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Date;
  lastLoginAt: Date;
}

export interface Photo {
  id: string;
  url: string;
  fileName: string;
  uploadedAt: Date;
  faceDetected: boolean;
  storageRef?: string;
}

export interface GrowthComment {
  id: string;
  photoId: string;
  content: string;
  generatedAt: Date;
  isEdited: boolean;
  originalContent?: string;
}

export interface GrowthRecord {
  id: string;
  userId: string;
  photos: Photo[];
  comments: GrowthComment[];
  createdAt: Date;
  updatedAt: Date;
  sharedLink?: string;
  isShared: boolean;
}

export interface StorybookPage {
  id: string;
  text: string;
  imageUrl: string;
  audioUrl?: string;
  pageNumber: number;
}

export interface Storybook {
  id: string;
  userId: string;
  title: string;
  month: string; // YYYY-MM format
  pages: StorybookPage[];
  coverImageUrl?: string;
  createdAt: Date;
  sharedLink?: string;
  isShared: boolean;
}

export interface ShareLink {
  id: string;
  contentId: string;
  contentType: 'record' | 'storybook';
  createdBy: string; // userId
  createdAt: Date;
  isActive: boolean;
  expiresAt?: Date;
}

// Firestore document data types (without Firestore Timestamp conversion)
export interface UserDoc {
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: FirebaseFirestore.Timestamp;
  lastLoginAt: FirebaseFirestore.Timestamp;
}

export interface PhotoDoc {
  url: string;
  fileName: string;
  uploadedAt: FirebaseFirestore.Timestamp;
  faceDetected: boolean;
  storageRef?: string;
}

export interface GrowthCommentDoc {
  photoId: string;
  content: string;
  generatedAt: FirebaseFirestore.Timestamp;
  isEdited: boolean;
  originalContent?: string;
}

export interface GrowthRecordDoc {
  userId: string;
  photos: PhotoDoc[];
  comments: GrowthCommentDoc[];
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
  sharedLink?: string;
  isShared: boolean;
}

export interface StorybookPageDoc {
  text: string;
  imageUrl: string;
  audioUrl?: string;
  pageNumber: number;
}

export interface StorybookDoc {
  userId: string;
  title: string;
  month: string;
  pages: StorybookPageDoc[];
  coverImageUrl?: string;
  createdAt: FirebaseFirestore.Timestamp;
  sharedLink?: string;
  isShared: boolean;
}

export interface ShareLinkDoc {
  contentId: string;
  contentType: 'record' | 'storybook';
  createdBy: string;
  createdAt: FirebaseFirestore.Timestamp;
  isActive: boolean;
  expiresAt?: FirebaseFirestore.Timestamp;
}