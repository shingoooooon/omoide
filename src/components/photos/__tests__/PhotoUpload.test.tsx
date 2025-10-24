import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PhotoUpload } from '../PhotoUpload';
import { AuthProvider } from '@/contexts/AuthContext';
import { LocaleProvider } from '@/contexts/LocaleContext';

// Mock Firebase storage
jest.mock('@/lib/storage', () => ({
  uploadPhoto: jest.fn()
}));

// Mock face analysis
jest.mock('@/lib/faceAnalysisService', () => ({
  analyzeFaces: jest.fn()
}));

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage({ src, alt, ...props }: any) {
    return <img src={src} alt={alt} {...props} />;
  };
});

const MockProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      <LocaleProvider>
        {children}
      </LocaleProvider>
    </AuthProvider>
  );
};

// Mock the useAuth hook
jest.mock('@/contexts/AuthContext', () => ({
  ...jest.requireActual('@/contexts/AuthContext'),
  useAuth: () => ({
    user: { uid: 'test-user-id' },
    loading: false
  })
}));

describe('PhotoUpload', () => {
  const mockOnPhotosUploaded = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders upload area correctly', () => {
    render(
      <MockProviders>
        <PhotoUpload onPhotosUploaded={mockOnPhotosUploaded} />
      </MockProviders>
    );

    expect(screen.getByText('写真をアップロード')).toBeInTheDocument();
    expect(screen.getByText('ここに写真をドラッグ&ドロップするか、クリックして選択してください')).toBeInTheDocument();
  });

  it('handles file selection', async () => {
    const user = userEvent.setup();
    
    render(
      <MockProviders>
        <PhotoUpload onPhotosUploaded={mockOnPhotosUploaded} />
      </MockProviders>
    );

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByLabelText('写真をアップロード');
    
    await user.upload(input, file);

    expect(input).toHaveProperty('files', expect.arrayContaining([file]));
  });

  it('validates file types', async () => {
    const user = userEvent.setup();
    
    render(
      <MockProviders>
        <PhotoUpload onPhotosUploaded={mockOnPhotosUploaded} />
      </MockProviders>
    );

    const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByLabelText('写真をアップロード');
    
    await user.upload(input, invalidFile);

    await waitFor(() => {
      expect(screen.getByText(/サポートされていないファイル形式です/)).toBeInTheDocument();
    });
  });

  it('validates file size', async () => {
    const user = userEvent.setup();
    
    render(
      <MockProviders>
        <PhotoUpload onPhotosUploaded={mockOnPhotosUploaded} />
      </MockProviders>
    );

    // Create a large file (11MB)
    const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
    const input = screen.getByLabelText('写真をアップロード');
    
    await user.upload(input, largeFile);

    await waitFor(() => {
      expect(screen.getByText(/ファイルサイズが大きすぎます/)).toBeInTheDocument();
    });
  });

  it('shows upload progress', async () => {
    const { uploadPhoto } = require('@/lib/storage');
    const { analyzeFaces } = require('@/lib/faceAnalysisService');
    
    uploadPhoto.mockResolvedValue({
      url: 'https://example.com/photo.jpg',
      fileName: 'test.jpg'
    });
    
    analyzeFaces.mockResolvedValue({
      faceDetected: true,
      analysisData: {}
    });

    const user = userEvent.setup();
    
    render(
      <MockProviders>
        <PhotoUpload onPhotosUploaded={mockOnPhotosUploaded} />
      </MockProviders>
    );

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByLabelText('写真をアップロード');
    
    await user.upload(input, file);

    // Click upload button
    const uploadButton = screen.getByText('アップロード開始');
    await user.click(uploadButton);

    await waitFor(() => {
      expect(screen.getByText(/アップロード中/)).toBeInTheDocument();
    });
  });

  it('handles upload errors gracefully', async () => {
    const { uploadPhoto } = require('@/lib/storage');
    
    uploadPhoto.mockRejectedValue(new Error('Upload failed'));

    const user = userEvent.setup();
    
    render(
      <MockProviders>
        <PhotoUpload onPhotosUploaded={mockOnPhotosUploaded} />
      </MockProviders>
    );

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByLabelText('写真をアップロード');
    
    await user.upload(input, file);

    const uploadButton = screen.getByText('アップロード開始');
    await user.click(uploadButton);

    await waitFor(() => {
      expect(screen.getByText(/アップロードに失敗しました/)).toBeInTheDocument();
    });
  });
});