import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Timeline } from '../Timeline';
import { AuthProvider } from '@/contexts/AuthContext';
import { LocaleProvider } from '@/contexts/LocaleContext';
import { GrowthRecord } from '@/types/models';

// Mock the auth context
const mockUser = {
  uid: 'test-user-id',
  email: 'test@example.com',
  displayName: 'Test User'
};

// Mock the growth record service
jest.mock('@/lib/services/growthRecordService', () => ({
  getUserGrowthRecords: jest.fn()
}));

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage({ src, alt, ...props }: any) {
    return <img src={src} alt={alt} {...props} />;
  };
});

// Mock date-fns
jest.mock('date-fns', () => ({
  formatDistanceToNow: jest.fn(() => '2時間前')
}));

const mockRecords: GrowthRecord[] = [
  {
    id: '1',
    userId: 'test-user-id',
    photos: [
      {
        id: 'photo-1',
        url: 'https://example.com/photo1.jpg',
        fileName: 'photo1.jpg',
        uploadedAt: new Date('2024-01-15'),
        faceDetected: true
      }
    ],
    comments: [
      {
        id: 'comment-1',
        photoId: 'photo-1',
        content: 'かわいい笑顔ですね！',
        generatedAt: new Date('2024-01-15'),
        isEdited: false
      }
    ],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    isShared: false
  }
];

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
    user: mockUser,
    loading: false
  })
}));

describe('Timeline', () => {
  const mockOnRecordClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays loading spinner initially', () => {
    const { getUserGrowthRecords } = require('@/lib/services/growthRecordService');
    getUserGrowthRecords.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(
      <MockProviders>
        <Timeline onRecordClick={mockOnRecordClick} />
      </MockProviders>
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('displays empty state when no records exist', async () => {
    const { getUserGrowthRecords } = require('@/lib/services/growthRecordService');
    getUserGrowthRecords.mockResolvedValue({
      records: [],
      hasMore: false,
      lastDoc: undefined
    });

    render(
      <MockProviders>
        <Timeline onRecordClick={mockOnRecordClick} />
      </MockProviders>
    );

    await waitFor(() => {
      expect(screen.getByText('まだ記録がありません')).toBeInTheDocument();
    });
  });

  it('displays timeline cards when records exist', async () => {
    const { getUserGrowthRecords } = require('@/lib/services/growthRecordService');
    getUserGrowthRecords.mockResolvedValue({
      records: mockRecords,
      hasMore: false,
      lastDoc: undefined
    });

    render(
      <MockProviders>
        <Timeline onRecordClick={mockOnRecordClick} />
      </MockProviders>
    );

    await waitFor(() => {
      expect(screen.getByText('成長の記録')).toBeInTheDocument();
      expect(screen.getByText('1件の思い出')).toBeInTheDocument();
      expect(screen.getByText('かわいい笑顔ですね！')).toBeInTheDocument();
    });
  });

  it('calls onRecordClick when a record is clicked', async () => {
    const { getUserGrowthRecords } = require('@/lib/services/growthRecordService');
    getUserGrowthRecords.mockResolvedValue({
      records: mockRecords,
      hasMore: false,
      lastDoc: undefined
    });

    const user = userEvent.setup();

    render(
      <MockProviders>
        <Timeline onRecordClick={mockOnRecordClick} />
      </MockProviders>
    );

    await waitFor(() => {
      expect(screen.getByText('詳細を見る')).toBeInTheDocument();
    });

    await user.click(screen.getByText('詳細を見る'));

    expect(mockOnRecordClick).toHaveBeenCalledWith(mockRecords[0]);
  });

  it('displays load more button when hasMore is true', async () => {
    const { getUserGrowthRecords } = require('@/lib/services/growthRecordService');
    getUserGrowthRecords.mockResolvedValue({
      records: mockRecords,
      hasMore: true,
      lastDoc: { id: 'last-doc' }
    });

    render(
      <MockProviders>
        <Timeline onRecordClick={mockOnRecordClick} />
      </MockProviders>
    );

    await waitFor(() => {
      expect(screen.getByText('もっと見る')).toBeInTheDocument();
    });
  });

  it('displays error message when loading fails', async () => {
    const { getUserGrowthRecords } = require('@/lib/services/growthRecordService');
    getUserGrowthRecords.mockRejectedValue(new Error('Network error'));

    render(
      <MockProviders>
        <Timeline onRecordClick={mockOnRecordClick} />
      </MockProviders>
    );

    await waitFor(() => {
      expect(screen.getByText('記録の読み込みに失敗しました。もう一度お試しください。')).toBeInTheDocument();
    });
  });
});