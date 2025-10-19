import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { StorybookList } from '../StorybookList';
import { Storybook } from '@/types/models';
import * as storybookService from '@/lib/services/storybookService';

// Mock the storybook service
jest.mock('@/lib/services/storybookService');
const mockStorybookService = storybookService as jest.Mocked<typeof storybookService>;

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage({ src, alt, onLoad, onError, fill, priority, ...props }: any) {
    return (
      <img
        src={src}
        alt={alt}
        onLoad={onLoad}
        onError={onError}
        data-fill={fill}
        data-priority={priority}
        {...props}
      />
    );
  };
});

const mockStorybooks: Storybook[] = [
  {
    id: 'storybook-1',
    userId: 'user-1',
    title: '1月の成長記録',
    month: '2024-01',
    pages: [
      {
        id: 'page-1',
        text: 'テストページ1',
        imageUrl: 'https://example.com/image1.jpg',
        pageNumber: 1
      }
    ],
    createdAt: new Date('2024-01-15'),
    isShared: false
  },
  {
    id: 'storybook-2',
    userId: 'user-1',
    title: '2月の成長記録',
    month: '2024-02',
    pages: [
      {
        id: 'page-1',
        text: 'テストページ1',
        imageUrl: 'https://example.com/image2.jpg',
        pageNumber: 1
      },
      {
        id: 'page-2',
        text: 'テストページ2',
        imageUrl: 'https://example.com/image3.jpg',
        pageNumber: 2
      }
    ],
    createdAt: new Date('2024-02-15'),
    isShared: false
  }
];

describe('StorybookList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    mockStorybookService.getUserStorybooks.mockImplementation(() => 
      new Promise(() => {}) // Never resolves to keep loading state
    );

    render(<StorybookList userId="user-1" />);
    
    expect(screen.getByText('絵本を読み込み中...')).toBeInTheDocument();
  });

  it('renders storybooks when loaded successfully', async () => {
    mockStorybookService.getUserStorybooks.mockResolvedValue({
      storybooks: mockStorybooks,
      hasMore: false
    });

    render(<StorybookList userId="user-1" />);
    
    await waitFor(() => {
      expect(screen.getByText('作った絵本')).toBeInTheDocument();
      expect(screen.getByText('2冊の絵本があります')).toBeInTheDocument();
      expect(screen.getByText('1月の成長記録')).toBeInTheDocument();
      expect(screen.getByText('2月の成長記録')).toBeInTheDocument();
    });
  });

  it('renders empty state when no storybooks exist', async () => {
    mockStorybookService.getUserStorybooks.mockResolvedValue({
      storybooks: [],
      hasMore: false
    });

    render(<StorybookList userId="user-1" />);
    
    await waitFor(() => {
      expect(screen.getByText('まだ絵本がありません')).toBeInTheDocument();
      expect(screen.getByText('写真をアップロードして、最初の絵本を作ってみましょう')).toBeInTheDocument();
    });
  });

  it('renders error state when loading fails', async () => {
    mockStorybookService.getUserStorybooks.mockRejectedValue(new Error('Network error'));

    render(<StorybookList userId="user-1" />);
    
    await waitFor(() => {
      expect(screen.getByText('絵本の読み込みに失敗しました')).toBeInTheDocument();
      expect(screen.getByText('再試行')).toBeInTheDocument();
    });
  });

  it('calls onStorybookSelect when view button is clicked', async () => {
    const mockOnSelect = jest.fn();
    mockStorybookService.getUserStorybooks.mockResolvedValue({
      storybooks: mockStorybooks,
      hasMore: false
    });

    render(<StorybookList userId="user-1" onStorybookSelect={mockOnSelect} />);
    
    await waitFor(() => {
      expect(screen.getByText('1月の成長記録')).toBeInTheDocument();
    });

    const viewButtons = screen.getAllByText('見る');
    fireEvent.click(viewButtons[0]);
    
    expect(mockOnSelect).toHaveBeenCalledWith(mockStorybooks[0]);
  });

  it('calls onCreateNew when create button is clicked', async () => {
    const mockOnCreateNew = jest.fn();
    mockStorybookService.getUserStorybooks.mockResolvedValue({
      storybooks: mockStorybooks,
      hasMore: false
    });

    render(<StorybookList userId="user-1" onCreateNew={mockOnCreateNew} />);
    
    await waitFor(() => {
      expect(screen.getByText('新しい絵本を作る')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('新しい絵本を作る'));
    
    expect(mockOnCreateNew).toHaveBeenCalledTimes(1);
  });

  it('opens delete confirmation modal when delete button is clicked', async () => {
    mockStorybookService.getUserStorybooks.mockResolvedValue({
      storybooks: mockStorybooks,
      hasMore: false
    });

    render(<StorybookList userId="user-1" />);
    
    await waitFor(() => {
      expect(screen.getByText('1月の成長記録')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByLabelText('削除');
    fireEvent.click(deleteButtons[0]);
    
    expect(screen.getByText('本当に削除しますか？')).toBeInTheDocument();
    expect(screen.getByText('「1月の成長記録」を削除します')).toBeInTheDocument();
  });

  it('deletes storybook when confirmed', async () => {
    mockStorybookService.getUserStorybooks.mockResolvedValue({
      storybooks: mockStorybooks,
      hasMore: false
    });
    mockStorybookService.deleteStorybook.mockResolvedValue();

    render(<StorybookList userId="user-1" />);
    
    await waitFor(() => {
      expect(screen.getByText('1月の成長記録')).toBeInTheDocument();
    });

    // Open delete modal
    const deleteButtons = screen.getAllByLabelText('削除');
    fireEvent.click(deleteButtons[0]);
    
    // Confirm deletion
    fireEvent.click(screen.getByText('削除する'));
    
    await waitFor(() => {
      expect(mockStorybookService.deleteStorybook).toHaveBeenCalledWith('storybook-1');
    });
  });

  it('cancels deletion when cancel button is clicked', async () => {
    mockStorybookService.getUserStorybooks.mockResolvedValue({
      storybooks: mockStorybooks,
      hasMore: false
    });

    render(<StorybookList userId="user-1" />);
    
    await waitFor(() => {
      expect(screen.getByText('1月の成長記録')).toBeInTheDocument();
    });

    // Open delete modal
    const deleteButtons = screen.getAllByLabelText('削除');
    fireEvent.click(deleteButtons[0]);
    
    // Cancel deletion
    fireEvent.click(screen.getByText('キャンセル'));
    
    await waitFor(() => {
      expect(screen.queryByText('本当に削除しますか？')).not.toBeInTheDocument();
    });
  });

  it('loads more storybooks when "もっと見る" is clicked', async () => {
    // First load
    mockStorybookService.getUserStorybooks.mockResolvedValueOnce({
      storybooks: [mockStorybooks[0]],
      hasMore: true,
      lastDoc: {} as any
    });

    // Second load
    mockStorybookService.getUserStorybooks.mockResolvedValueOnce({
      storybooks: [mockStorybooks[1]],
      hasMore: false
    });

    render(<StorybookList userId="user-1" />);
    
    await waitFor(() => {
      expect(screen.getByText('1月の成長記録')).toBeInTheDocument();
      expect(screen.getByText('もっと見る')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('もっと見る'));
    
    await waitFor(() => {
      expect(screen.getByText('2月の成長記録')).toBeInTheDocument();
      expect(screen.queryByText('もっと見る')).not.toBeInTheDocument();
    });
  });

  it('displays correct page count for each storybook', async () => {
    mockStorybookService.getUserStorybooks.mockResolvedValue({
      storybooks: mockStorybooks,
      hasMore: false
    });

    render(<StorybookList userId="user-1" />);
    
    await waitFor(() => {
      expect(screen.getByText('1ページ')).toBeInTheDocument();
      expect(screen.getByText('2ページ')).toBeInTheDocument();
    });
  });

  it('formats month correctly', async () => {
    mockStorybookService.getUserStorybooks.mockResolvedValue({
      storybooks: mockStorybooks,
      hasMore: false
    });

    render(<StorybookList userId="user-1" />);
    
    await waitFor(() => {
      expect(screen.getByText('2024年1月')).toBeInTheDocument();
      expect(screen.getByText('2024年2月')).toBeInTheDocument();
    });
  });

  it('retries loading when retry button is clicked', async () => {
    // First call fails
    mockStorybookService.getUserStorybooks.mockRejectedValueOnce(new Error('Network error'));
    // Second call succeeds
    mockStorybookService.getUserStorybooks.mockResolvedValueOnce({
      storybooks: mockStorybooks,
      hasMore: false
    });

    render(<StorybookList userId="user-1" />);
    
    await waitFor(() => {
      expect(screen.getByText('絵本の読み込みに失敗しました')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('再試行'));
    
    await waitFor(() => {
      expect(screen.getByText('1月の成長記録')).toBeInTheDocument();
    });
  });
});