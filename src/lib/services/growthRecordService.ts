// Growth Record CRUD operations service

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
  GrowthRecord, 
  GrowthRecordDoc 
} from '@/types/models';
import { 
  growthRecordDocToGrowthRecord, 
  growthRecordToGrowthRecordDoc,
  generatePhotoId,
  generateCommentId
} from '@/lib/modelConverters';
import { validateGrowthRecord } from '@/lib/validation';

const COLLECTION_NAME = 'records';

export interface PaginationOptions {
  pageSize?: number;
  lastDoc?: DocumentSnapshot;
}

export interface GrowthRecordListResult {
  records: GrowthRecord[];
  lastDoc?: QueryDocumentSnapshot;
  hasMore: boolean;
}

// Create a new growth record
export async function createGrowthRecord(record: Omit<GrowthRecord, 'id'>): Promise<string> {
  // Generate IDs for photos and comments
  const recordWithIds: GrowthRecord = {
    ...record,
    id: '', // Will be set by Firestore
    photos: record.photos.map((photo, index) => ({
      ...photo,
      id: generatePhotoId('temp', index)
    })),
    comments: record.comments.map((comment, index) => ({
      ...comment,
      id: generateCommentId('temp', index)
    }))
  };

  // Validate the record (skip ID validation since it's being created)
  validateGrowthRecord(recordWithIds, true);

  try {
    const docData = growthRecordToGrowthRecordDoc(recordWithIds);
    const docRef = await addDoc(collection(db, COLLECTION_NAME), docData);
    
    // Update the record with proper IDs
    const finalRecord: GrowthRecord = {
      ...recordWithIds,
      id: docRef.id,
      photos: recordWithIds.photos.map((photo, index) => ({
        ...photo,
        id: generatePhotoId(docRef.id, index)
      })),
      comments: recordWithIds.comments.map((comment, index) => ({
        ...comment,
        id: generateCommentId(docRef.id, index)
      }))
    };

    // Update the document with proper IDs
    await updateDoc(docRef, growthRecordToGrowthRecordDoc(finalRecord) as any);
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating growth record:', error);
    throw new Error('Failed to create growth record');
  }
}

// Get a growth record by ID
export async function getGrowthRecord(id: string): Promise<GrowthRecord | null> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    const data = docSnap.data() as GrowthRecordDoc;
    return growthRecordDocToGrowthRecord(id, data);
  } catch (error) {
    console.error('Error getting growth record:', error);
    throw new Error('Failed to get growth record');
  }
}

// Get growth records for a user with pagination
export async function getUserGrowthRecords(
  userId: string, 
  options: PaginationOptions = {}
): Promise<GrowthRecordListResult> {
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
    
    // Check if there are more records
    const hasMore = docs.length > pageSize;
    const recordDocs = hasMore ? docs.slice(0, pageSize) : docs;
    
    const records = recordDocs.map(doc => {
      const data = doc.data() as GrowthRecordDoc;
      return growthRecordDocToGrowthRecord(doc.id, data);
    });
    
    return {
      records,
      lastDoc: recordDocs.length > 0 ? recordDocs[recordDocs.length - 1] : undefined,
      hasMore
    };
  } catch (error) {
    console.error('Error getting user growth records:', error);
    throw new Error('Failed to get user growth records');
  }
}

// Get growth records for a specific month
export async function getMonthlyGrowthRecords(
  userId: string, 
  year: number, 
  month: number
): Promise<GrowthRecord[]> {
  try {
    // Create date range for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);
    
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId),
      where('createdAt', '>=', startDate),
      where('createdAt', '<=', endDate),
      orderBy('createdAt', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data() as GrowthRecordDoc;
      return growthRecordDocToGrowthRecord(doc.id, data);
    });
  } catch (error) {
    console.error('Error getting monthly growth records:', error);
    throw new Error('Failed to get monthly growth records');
  }
}

// Update a growth record
export async function updateGrowthRecord(
  id: string, 
  updates: Partial<Omit<GrowthRecord, 'id' | 'userId' | 'createdAt'>>
): Promise<void> {
  try {
    // Get the existing record to validate the update
    const existingRecord = await getGrowthRecord(id);
    if (!existingRecord) {
      throw new Error('Growth record not found');
    }
    
    // Create the updated record for validation
    const updatedRecord: GrowthRecord = {
      ...existingRecord,
      ...updates,
      updatedAt: new Date()
    };
    
    // Validate the updated record
    validateGrowthRecord(updatedRecord);
    
    // Convert to document format and update
    const docRef = doc(db, COLLECTION_NAME, id);
    const updateData = growthRecordToGrowthRecordDoc(updatedRecord);
    
    await updateDoc(docRef, updateData as any);
  } catch (error) {
    console.error('Error updating growth record:', error);
    throw new Error('Failed to update growth record');
  }
}

// Delete a growth record
export async function deleteGrowthRecord(id: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting growth record:', error);
    throw new Error('Failed to delete growth record');
  }
}

// Update sharing status
export async function updateGrowthRecordSharing(
  id: string, 
  isShared: boolean, 
  sharedLink?: string
): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      isShared,
      sharedLink: sharedLink || null,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating growth record sharing:', error);
    throw new Error('Failed to update growth record sharing');
  }
}

// Get shared growth record (for public access)
export async function getSharedGrowthRecord(shareId: string): Promise<GrowthRecord | null> {
  try {
    // First, find the record with this share link
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
    const data = doc.data() as GrowthRecordDoc;
    return growthRecordDocToGrowthRecord(doc.id, data);
  } catch (error) {
    console.error('Error getting shared growth record:', error);
    throw new Error('Failed to get shared growth record');
  }
}