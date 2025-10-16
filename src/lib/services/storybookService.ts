// Storybook CRUD operations service

import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter, 
  DocumentSnapshot,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  Storybook, 
  StorybookDoc 
} from '@/types/models';
import { 
  storybookDocToStorybook, 
  storybookToStorybookDoc,
  generatePageId
} from '@/lib/modelConverters';
import { validateStorybook } from '@/lib/validation';

const COLLECTION_NAME = 'storybooks';

export interface PaginationOptions {
  pageSize?: number;
  lastDoc?: DocumentSnapshot;
}

export interface StorybookListResult {
  storybooks: Storybook[];
  lastDoc?: QueryDocumentSnapshot;
  hasMore: boolean;
}

// Create a new storybook
export async function createStorybook(storybook: Omit<Storybook, 'id'>): Promise<string> {
  // Generate IDs for pages
  const storybookWithIds: Storybook = {
    ...storybook,
    id: '', // Will be set by Firestore
    pages: storybook.pages.map((page, index) => ({
      ...page,
      id: generatePageId('temp', page.pageNumber)
    }))
  };

  // Validate the storybook
  validateStorybook(storybookWithIds);

  try {
    const docData = storybookToStorybookDoc(storybookWithIds);
    const docRef = await addDoc(collection(db, COLLECTION_NAME), docData);
    
    // Update the storybook with proper IDs
    const finalStorybook: Storybook = {
      ...storybookWithIds,
      id: docRef.id,
      pages: storybookWithIds.pages.map((page) => ({
        ...page,
        id: generatePageId(docRef.id, page.pageNumber)
      }))
    };

    // Update the document with proper IDs
    await updateDoc(docRef, storybookToStorybookDoc(finalStorybook));
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating storybook:', error);
    throw new Error('Failed to create storybook');
  }
}

// Get a storybook by ID
export async function getStorybook(id: string): Promise<Storybook | null> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    const data = docSnap.data() as StorybookDoc;
    return storybookDocToStorybook(id, data);
  } catch (error) {
    console.error('Error getting storybook:', error);
    throw new Error('Failed to get storybook');
  }
}

// Get storybooks for a user with pagination
export async function getUserStorybooks(
  userId: string, 
  options: PaginationOptions = {}
): Promise<StorybookListResult> {
  const { pageSize = 10, lastDoc } = options;
  
  try {
    let q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(pageSize + 1) // Get one extra to check if there are more
    );
    
    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }
    
    const querySnapshot = await getDocs(q);
    const docs = querySnapshot.docs;
    
    // Check if there are more storybooks
    const hasMore = docs.length > pageSize;
    const storybookDocs = hasMore ? docs.slice(0, pageSize) : docs;
    
    const storybooks = storybookDocs.map(doc => {
      const data = doc.data() as StorybookDoc;
      return storybookDocToStorybook(doc.id, data);
    });
    
    return {
      storybooks,
      lastDoc: storybookDocs.length > 0 ? storybookDocs[storybookDocs.length - 1] : undefined,
      hasMore
    };
  } catch (error) {
    console.error('Error getting user storybooks:', error);
    throw new Error('Failed to get user storybooks');
  }
}

// Get storybook for a specific month
export async function getMonthlyStorybook(
  userId: string, 
  month: string
): Promise<Storybook | null> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId),
      where('month', '==', month),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    const data = doc.data() as StorybookDoc;
    return storybookDocToStorybook(doc.id, data);
  } catch (error) {
    console.error('Error getting monthly storybook:', error);
    throw new Error('Failed to get monthly storybook');
  }
}

// Update a storybook
export async function updateStorybook(
  id: string, 
  updates: Partial<Omit<Storybook, 'id' | 'userId' | 'createdAt'>>
): Promise<void> {
  try {
    // Get the existing storybook to validate the update
    const existingStorybook = await getStorybook(id);
    if (!existingStorybook) {
      throw new Error('Storybook not found');
    }
    
    // Create the updated storybook for validation
    const updatedStorybook: Storybook = {
      ...existingStorybook,
      ...updates
    };
    
    // Validate the updated storybook
    validateStorybook(updatedStorybook);
    
    // Convert to document format and update
    const docRef = doc(db, COLLECTION_NAME, id);
    const updateData = storybookToStorybookDoc(updatedStorybook);
    
    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error('Error updating storybook:', error);
    throw new Error('Failed to update storybook');
  }
}

// Delete a storybook
export async function deleteStorybook(id: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting storybook:', error);
    throw new Error('Failed to delete storybook');
  }
}

// Update sharing status
export async function updateStorybookSharing(
  id: string, 
  isShared: boolean, 
  sharedLink?: string
): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      isShared,
      sharedLink: sharedLink || null
    });
  } catch (error) {
    console.error('Error updating storybook sharing:', error);
    throw new Error('Failed to update storybook sharing');
  }
}

// Get shared storybook (for public access)
export async function getSharedStorybook(shareId: string): Promise<Storybook | null> {
  try {
    // First, find the storybook with this share link
    const q = query(
      collection(db, COLLECTION_NAME),
      where('sharedLink', '==', shareId),
      where('isShared', '==', true),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    const data = doc.data() as StorybookDoc;
    return storybookDocToStorybook(doc.id, data);
  } catch (error) {
    console.error('Error getting shared storybook:', error);
    throw new Error('Failed to get shared storybook');
  }
}

// Update storybook page audio URL
export async function updateStorybookPageAudio(
  storybookId: string, 
  pageNumber: number, 
  audioUrl: string
): Promise<void> {
  try {
    const storybook = await getStorybook(storybookId);
    if (!storybook) {
      throw new Error('Storybook not found');
    }
    
    const updatedPages = storybook.pages.map(page => 
      page.pageNumber === pageNumber 
        ? { ...page, audioUrl }
        : page
    );
    
    await updateStorybook(storybookId, { pages: updatedPages });
  } catch (error) {
    console.error('Error updating storybook page audio:', error);
    throw new Error('Failed to update storybook page audio');
  }
}