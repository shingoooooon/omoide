# Authentication System

This directory contains the authentication system for the Omoide app, implementing Firebase Authentication with Google and email/password sign-in options.

## Components

### AuthContext (`AuthContext.tsx`)
- Provides authentication state management using React Context
- Handles Firebase Auth state changes
- Provides methods for sign-in, sign-up, and logout
- Supports both Google OAuth and email/password authentication

### ProtectedRoute (`ProtectedRoute.tsx`)
- Wrapper component that protects routes requiring authentication
- Shows loading spinner while checking auth state
- Redirects to login form if user is not authenticated
- Renders children if user is authenticated

### LoginForm (`LoginForm.tsx`)
- Complete login/signup form with email/password and Google OAuth
- Handles form validation and error states
- Provides user-friendly error messages in English
- Responsive design with pastel color scheme

### UserProfile (`UserProfile.tsx`)
- Displays logged-in user information
- Provides logout functionality
- Shows user avatar and display name

## Usage

### Setting up Authentication

1. Wrap your app with `AuthProvider`:
```tsx
import { AuthProvider } from '@/contexts/AuthContext'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
```

2. Protect routes with `ProtectedRoute`:
```tsx
import ProtectedRoute from '@/components/auth/ProtectedRoute'

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <div>Protected content here</div>
    </ProtectedRoute>
  )
}
```

3. Use authentication state in components:
```tsx
import { useAuth } from '@/contexts/AuthContext'

export default function MyComponent() {
  const { user, loading, logout } = useAuth()
  
  if (loading) return <div>Loading...</div>
  if (!user) return <div>Please log in</div>
  
  return (
    <div>
      Welcome, {user.displayName}!
      <button onClick={logout}>Logout</button>
    </div>
  )
}
```

## Features

- ✅ Google OAuth authentication
- ✅ Email/password authentication
- ✅ User registration with display name
- ✅ Protected routes
- ✅ Loading states
- ✅ Error handling with user-friendly messages
- ✅ Responsive design
- ✅ English localization
- ✅ TypeScript support
- ✅ Unit tests

## Requirements Satisfied

This implementation satisfies **Requirement 6.4** from the specifications:
- Firebase Authentication setup and provider configuration
- Login/logout functionality implementation
- Authentication state management with Context
- Protected route implementation