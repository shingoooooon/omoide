// Share Link CRUD operations service

import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  setDoc,
  query, 
  where, 
  limit
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  ShareLink, 
  ShareLinkDoc 
} from '@/types/models';
import { 
  shareLinkDocToShareLink, 
  shareLinkToShareLinkDoc 
} from '@/lib/modelConverters';


const COLLECTION_NAME = 'shares';

// Generate a random share ID
function generateShareId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Create a new share link
export async function createShareLink(
  contentId: string,
  contentType: 'record' | 'storybook',
  createdBy: string,
  expiresAt?: Date
): Promise<string> {
  const shareId = generateShareId();
  
  const shareLink: ShareLink = {
    id: shareId,
    contentId,
    contentType,
    createdBy,
    createdAt: new Date(),
    isActive: true,
    expiresAt
  };

  // Note: ShareLink validation would go here if needed

  try {
    const docData = shareLinkToShareLinkDoc(shareLink);
    await setDoc(doc(db, COLLECTION_NAME, shareId), docData);
    
    return shareId;
  } catch (error) {
    console.error('Error creating share link:', error);
    throw new Error('Failed to create share link');
  }
}

// Get a share link by ID
export async function getShareLink(id: string): Promise<ShareLink | null> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    const data = docSnap.data() as ShareLinkDoc;
    const shareLink = shareLinkDocToShareLink(id, data);
    
    // Check if the link has expired
    if (shareLink.expiresAt && shareLink.expiresAt < new Date()) {
      // Automatically deactivate expired links
      await updateShareLinkStatus(id, false);
      return { ...shareLink, isActive: false };
    }
    
    return shareLink;
  } catch (error) {
    console.error('Error getting share link:', error);
    throw new Error('Failed to get share link');
  }
}

// Get share links for a specific content
export async function getContentShareLinks(
  contentId: string,
  contentType: 'record' | 'storybook'
): Promise<ShareLink[]> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('contentId', '==', contentId),
      where('contentType', '==', contentType),
      where('isActive', '==', true)
    );
    
    const querySnapshot = await getDocs(q);
    
    const shareLinks = querySnapshot.docs.map(doc => {
      const data = doc.data() as ShareLinkDoc;
      return shareLinkDocToShareLink(doc.id, data);
    });
    
    // Filter out expired links and deactivate them
    const activeLinks: ShareLink[] = [];
    const now = new Date();
    
    for (const link of shareLinks) {
      if (link.expiresAt && link.expiresAt < now) {
        // Deactivate expired link
        await updateShareLinkStatus(link.id, false);
      } else {
        activeLinks.push(link);
      }
    }
    
    return activeLinks;
  } catch (error) {
    console.error('Error getting content share links:', error);
    throw new Error('Failed to get content share links');
  }
}

// Get share links created by a user
export async function getUserShareLinks(createdBy: string): Promise<ShareLink[]> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('createdBy', '==', createdBy),
      where('isActive', '==', true)
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data() as ShareLinkDoc;
      return shareLinkDocToShareLink(doc.id, data);
    });
  } catch (error) {
    console.error('Error getting user share links:', error);
    throw new Error('Failed to get user share links');
  }
}

// Update share link status (activate/deactivate)
export async function updateShareLinkStatus(id: string, isActive: boolean): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, { isActive });
  } catch (error) {
    console.error('Error updating share link status:', error);
    throw new Error('Failed to update share link status');
  }
}

// Delete a share link
export async function deleteShareLink(id: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting share link:', error);
    throw new Error('Failed to delete share link');
  }
}

// Validate and get shared content
export async function validateShareLink(shareId: string): Promise<{
  isValid: boolean;
  shareLink?: ShareLink;
  reason?: string;
}> {
  try {
    const shareLink = await getShareLink(shareId);
    
    if (!shareLink) {
      return { isValid: false, reason: 'Share link not found' };
    }
    
    if (!shareLink.isActive) {
      return { isValid: false, reason: 'Share link is inactive' };
    }
    
    if (shareLink.expiresAt && shareLink.expiresAt < new Date()) {
      // Deactivate expired link
      await updateShareLinkStatus(shareId, false);
      return { isValid: false, reason: 'Share link has expired' };
    }
    
    return { isValid: true, shareLink };
  } catch (error) {
    console.error('Error validating share link:', error);
    return { isValid: false, reason: 'Error validating share link' };
  }
}

// Cleanup expired share links (utility function for maintenance)
export async function cleanupExpiredShareLinks(): Promise<number> {
  try {
    const now = new Date();
    const q = query(
      collection(db, COLLECTION_NAME),
      where('isActive', '==', true)
    );
    
    const querySnapshot = await getDocs(q);
    let cleanedCount = 0;
    
    for (const docSnap of querySnapshot.docs) {
      const data = docSnap.data() as ShareLinkDoc;
      const shareLink = shareLinkDocToShareLink(docSnap.id, data);
      
      if (shareLink.expiresAt && shareLink.expiresAt < now) {
        await updateShareLinkStatus(docSnap.id, false);
        cleanedCount++;
      }
    }
    
    return cleanedCount;
  } catch (error) {
    console.error('Error cleaning up expired share links:', error);
    throw new Error('Failed to cleanup expired share links');
  }
}