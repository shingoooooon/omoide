import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ShareButton } from '../ShareButton';
import { AuthProvider } from '@/contexts/AuthContext';
import { LocaleProvider } from '@/contexts/LocaleContext';

// Mock the share link service
jest.mock('@/lib/services/shareLinkService', () => ({
  createShareLink: jest.fn(),
  updateShareLinkStatus: jest.fn()
}));

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn()
  }
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

describe('ShareButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders share button correctly', () => {
    render(
      <MockProviders>
        <ShareButton 
          contentId="test-content-id" 
          contentType="record" 
          isShared={false}
        />
      </MockProviders>
    );

    expect(screen.getByText('共有')).toBeInTheDocument();
  });

  it('shows shared state when content is already shared', () => {
    render(
      <MockProviders>
        <ShareButton 
          contentId="test-content-id" 
          contentType="record" 
          isShared={true}
          shareLink="https://example.com/share/abc123"
        />
      </MockProviders>
    );

    expect(screen.getByText('共有中')).toBeInTheDocument();
  });

  it('creates share link when clicked', async () => {
    const { createShareLink } = require('@/lib/services/shareLinkService');
    createShareLink.mockResolvedValue({
      shareLink: 'https://example.com/share/abc123'
    });

    const user = userEvent.setup();
    
    render(
      <MockProviders>
        <ShareButton 
          contentId="test-content-id" 
          contentType="record" 
          isShared={false}
        />
      </MockProviders>
    );

    const shareButton = screen.getByText('共有');
    await user.click(shareButton);

    expect(createShareLink).toHaveBeenCalledWith('test-content-id', 'record');
  });

  it('copies share link to clipboard', async () => {
    const { createShareLink } = require('@/lib/services/shareLinkService');
    createShareLink.mockResolvedValue({
      shareLink: 'https://example.com/share/abc123'
    });

    const user = userEvent.setup();
    
    render(
      <MockProviders>
        <ShareButton 
          contentId="test-content-id" 
          contentType="record" 
          isShared={false}
        />
      </MockProviders>
    );

    const shareButton = screen.getByText('共有');
    await user.click(shareButton);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('https://example.com/share/abc123');
    });
  });

  it('shows success message after copying', async () => {
    const { createShareLink } = require('@/lib/services/shareLinkService');
    createShareLink.mockResolvedValue({
      shareLink: 'https://example.com/share/abc123'
    });

    const user = userEvent.setup();
    
    render(
      <MockProviders>
        <ShareButton 
          contentId="test-content-id" 
          contentType="record" 
          isShared={false}
        />
      </MockProviders>
    );

    const shareButton = screen.getByText('共有');
    await user.click(shareButton);

    await waitFor(() => {
      expect(screen.getByText('リンクをコピーしました')).toBeInTheDocument();
    });
  });

  it('handles share creation errors', async () => {
    const { createShareLink } = require('@/lib/services/shareLinkService');
    createShareLink.mockRejectedValue(new Error('Share creation failed'));

    const user = userEvent.setup();
    
    render(
      <MockProviders>
        <ShareButton 
          contentId="test-content-id" 
          contentType="record" 
          isShared={false}
        />
      </MockProviders>
    );

    const shareButton = screen.getByText('共有');
    await user.click(shareButton);

    await waitFor(() => {
      expect(screen.getByText('共有リンクの作成に失敗しました')).toBeInTheDocument();
    });
  });

  it('allows disabling share when already shared', async () => {
    const { updateShareLinkStatus } = require('@/lib/services/shareLinkService');
    updateShareLinkStatus.mockResolvedValue({});

    const user = userEvent.setup();
    
    render(
      <MockProviders>
        <ShareButton 
          contentId="test-content-id" 
          contentType="record" 
          isShared={true}
          shareLink="https://example.com/share/abc123"
        />
      </MockProviders>
    );

    const disableButton = screen.getByText('共有を停止');
    await user.click(disableButton);

    expect(updateShareLinkStatus).toHaveBeenCalledWith('test-content-id', false);
  });
});