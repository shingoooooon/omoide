// User CRUD operations service

import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  User, 
  UserDoc 
} from '@/types/models';
import { 
  userDocToUser, 
  userToUserDoc 
} from '@/lib/modelConverters';
import { validateUser } from '@/lib/validation';

const COLLECTION_NAME = 'users';

// Create or update user profile
export async function createOrUpdateUser(user: User): Promise<void> {
  // Validate the user
  validateUser(user);

  try {
    const docRef = doc(db, COLLECTION_NAME, user.id);
    const docData = userToUserDoc(user);
    
    // Use setDoc to create or update
    await setDoc(docRef, docData, { merge: true });
  } catch (error) {
    console.error('Error creating/updating user:', error);
    throw new Error('Failed to create or update user');
  }
}

// Get user by ID
export async function getUser(id: string): Promise<User | null> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    const data = docSnap.data() as UserDoc;
    return userDocToUser(id, data);
  } catch (error) {
    console.error('Error getting user:', error);
    throw new Error('Failed to get user');
  }
}

// Update user profile
export async function updateUser(
  id: string, 
  updates: Partial<Omit<User, 'id' | 'createdAt'>>
): Promise<void> {
  try {
    // Get the existing user to validate the update
    const existingUser = await getUser(id);
    if (!existingUser) {
      throw new Error('User not found');
    }
    
    // Create the updated user for validation
    const updatedUser: User = {
      ...existingUser,
      ...updates,
      lastLoginAt: new Date() // Always update last login when updating user
    };
    
    // Validate the updated user
    validateUser(updatedUser);
    
    // Convert to document format and update
    const docRef = doc(db, COLLECTION_NAME, id);
    const updateData = userToUserDoc(updatedUser);
    
    await updateDoc(docRef, updateData as any);
  } catch (error) {
    console.error('Error updating user:', error);
    throw new Error('Failed to update user');
  }
}

// Update last login time
export async function updateLastLogin(id: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      lastLoginAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating last login:', error);
    throw new Error('Failed to update last login');
  }
}

// Delete user (soft delete - mark as inactive)
export async function deleteUser(id: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting user:', error);
    throw new Error('Failed to delete user');
  }
}

// Update child information
export async function updateChildInfo(
  userId: string,
  childInfo: import('@/types/models').ChildInfo
): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, userId);
    
    // Use setDoc with merge to create or update the document
    await setDoc(docRef, {
      childInfo: {
        name: childInfo.name,
        birthDate: childInfo.birthDate,
        photoURL: childInfo.photoURL || null
      }
    }, { merge: true });
    
  } catch (error) {
    console.error('Error updating child info:', error);
    throw new Error('Failed to update child information');
  }
}

// Initialize user from Firebase Auth
export async function initializeUserFromAuth(
  uid: string,
  email: string,
  displayName: string,
  photoURL?: string
): Promise<User> {
  const now = new Date();
  
  const user: User = {
    id: uid,
    email,
    displayName,
    photoURL,
    createdAt: now,
    lastLoginAt: now
  };
  
  // Check if user already exists
  const existingUser = await getUser(uid);
  
  if (existingUser) {
    // Update last login and any changed profile info
    await updateUser(uid, {
      email,
      displayName,
      photoURL,
      lastLoginAt: now
    });
    
    return {
      ...existingUser,
      email,
      displayName,
      photoURL,
      lastLoginAt: now
    };
  } else {
    // Create new user
    await createOrUpdateUser(user);
    return user;
  }
}