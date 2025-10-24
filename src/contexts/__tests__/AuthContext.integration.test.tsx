// Integration tests for AuthContext
// These tests verify the authentication flow integration

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../AuthContext';

// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  onAuthStateChanged: jest.fn(),
  signInWithPopup: jest.fn(),
  signOut: jest.fn(),
  GoogleAuthProvider: jest.fn()
}));

// Test component that uses the auth context
const TestComponent = () => {
  const { user, loading, signIn, signOut } = useAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {user ? (
        <div>
          <span>Welcome {user.displayName}</span>
          <button onClick={signOut}>Sign Out</button>
        </div>
      ) : (
        <div>
          <span>Not signed in</span>
          <button onClick={signIn}>Sign In</button>
        </div>
      )}
    </div>
  );
};

describe('AuthContext Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle authentication state changes', async () => {
    const { onAuthStateChanged } = require('firebase/auth');
    let authStateCallback: (user: any) => void;
    
    onAuthStateChanged.mockImplementation((auth, callback) => {
      authStateCallback = callback;
      return () => {}; // unsubscribe function
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Initially loading
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // Simulate no user signed in
    act(() => {
      authStateCallback(null);
    });

    await waitFor(() => {
      expect(screen.getByText('Not signed in')).toBeInTheDocument();
    });

    // Simulate user sign in
    const mockUser = {
      uid: 'test-uid',
      displayName: 'Test User',
      email: 'test@example.com'
    };

    act(() => {
      authStateCallback(mockUser);
    });

    await waitFor(() => {
      expect(screen.getByText('Welcome Test User')).toBeInTheDocument();
    });
  });

  it('should handle sign in flow', async () => {
    const { onAuthStateChanged, signInWithPopup } = require('firebase/auth');
    let authStateCallback: (user: any) => void;
    
    onAuthStateChanged.mockImplementation((auth, callback) => {
      authStateCallback = callback;
      return () => {};
    });

    const mockUser = {
      uid: 'test-uid',
      displayName: 'Test User',
      email: 'test@example.com'
    };

    signInWithPopup.mockResolvedValue({
      user: mockUser
    });

    const user = userEvent.setup();

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Start with no user
    act(() => {
      authStateCallback(null);
    });

    await waitFor(() => {
      expect(screen.getByText('Not signed in')).toBeInTheDocument();
    });

    // Click sign in
    const signInButton = screen.getByText('Sign In');
    await user.click(signInButton);

    expect(signInWithPopup).toHaveBeenCalled();

    // Simulate successful sign in
    act(() => {
      authStateCallback(mockUser);
    });

    await waitFor(() => {
      expect(screen.getByText('Welcome Test User')).toBeInTheDocument();
    });
  });

  it('should handle sign out flow', async () => {
    const { onAuthStateChanged, signOut } = require('firebase/auth');
    let authStateCallback: (user: any) => void;
    
    onAuthStateChanged.mockImplementation((auth, callback) => {
      authStateCallback = callback;
      return () => {};
    });

    signOut.mockResolvedValue(undefined);

    const user = userEvent.setup();

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Start with user signed in
    const mockUser = {
      uid: 'test-uid',
      displayName: 'Test User',
      email: 'test@example.com'
    };

    act(() => {
      authStateCallback(mockUser);
    });

    await waitFor(() => {
      expect(screen.getByText('Welcome Test User')).toBeInTheDocument();
    });

    // Click sign out
    const signOutButton = screen.getByText('Sign Out');
    await user.click(signOutButton);

    expect(signOut).toHaveBeenCalled();

    // Simulate successful sign out
    act(() => {
      authStateCallback(null);
    });

    await waitFor(() => {
      expect(screen.getByText('Not signed in')).toBeInTheDocument();
    });
  });

  it('should handle sign in errors', async () => {
    const { onAuthStateChanged, signInWithPopup } = require('firebase/auth');
    let authStateCallback: (user: any) => void;
    
    onAuthStateChanged.mockImplementation((auth, callback) => {
      authStateCallback = callback;
      return () => {};
    });

    signInWithPopup.mockRejectedValue(new Error('Sign in failed'));

    // Mock console.error to avoid test output noise
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const user = userEvent.setup();

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Start with no user
    act(() => {
      authStateCallback(null);
    });

    await waitFor(() => {
      expect(screen.getByText('Not signed in')).toBeInTheDocument();
    });

    // Click sign in (should fail)
    const signInButton = screen.getByText('Sign In');
    await user.click(signInButton);

    expect(signInWithPopup).toHaveBeenCalled();
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Sign in error:', expect.any(Error));
    });

    // Should still show not signed in
    expect(screen.getByText('Not signed in')).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('should provide user context to child components', async () => {
    const { onAuthStateChanged } = require('firebase/auth');
    let authStateCallback: (user: any) => void;
    
    onAuthStateChanged.mockImplementation((auth, callback) => {
      authStateCallback = callback;
      return () => {};
    });

    const ChildComponent = () => {
      const { user } = useAuth();
      return <div>{user ? `User ID: ${user.uid}` : 'No user'}</div>;
    };

    render(
      <AuthProvider>
        <ChildComponent />
      </AuthProvider>
    );

    // Start with no user
    act(() => {
      authStateCallback(null);
    });

    await waitFor(() => {
      expect(screen.getByText('No user')).toBeInTheDocument();
    });

    // Add user
    const mockUser = {
      uid: 'test-uid-123',
      displayName: 'Test User',
      email: 'test@example.com'
    };

    act(() => {
      authStateCallback(mockUser);
    });

    await waitFor(() => {
      expect(screen.getByText('User ID: test-uid-123')).toBeInTheDocument();
    });
  });
});