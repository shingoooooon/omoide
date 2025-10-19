import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { StorybookViewer } from '../StorybookViewer';
import { Storybook } from '@/types/models';

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

const mockStorybook: Storybook = {
  id: 'test-storybook-1',
  userId: 'user-1',
  title: 'テスト絵本',
  month: '2024-01',
  pages: [
    {
      id: 'page-1',
      text: 'これは最初のページです。',
      imageUrl: 'https://example.com/image1.jpg',
      pageNumber: 1
    },
    {
      id: 'page-2',
      text: 'これは2番目のページです。',
      imageUrl: 'https://example.com/image2.jpg',
      pageNumber: 2
    },
    {
      id: 'page-3',
      text: 'これは最後のページです。',
      imageUrl: 'https://example.com/image3.jpg',
      pageNumber: 3
    }
  ],
  createdAt: new Date('2024-01-15'),
  isShared: false
};

describe('StorybookViewer', () => {
  it('renders storybook title and first page', () => {
    render(<StorybookViewer storybook={mockStorybook} />);
    
    expect(screen.getByText('テスト絵本')).toBeInTheDocument();
    expect(screen.getByText(/2024年.*1.*月の絵本/)).toBeInTheDocument();
    expect(screen.getByText('これは最初のページです。')).toBeInTheDocument();
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });

  it('navigates to next page when next button is clicked', () => {
    render(<StorybookViewer storybook={mockStorybook} />);
    
    const nextButton = screen.getByLabelText('次のページ');
    fireEvent.click(nextButton);
    
    expect(screen.getByText('これは2番目のページです。')).toBeInTheDocument();
    expect(screen.getByText('2 / 3')).toBeInTheDocument();
  });

  it('navigates to previous page when previous button is clicked', () => {
    render(<StorybookViewer storybook={mockStorybook} />);
    
    // Go to second page first
    const nextButton = screen.getByLabelText('次のページ');
    fireEvent.click(nextButton);
    
    // Then go back
    const prevButton = screen.getByLabelText('前のページ');
    fireEvent.click(prevButton);
    
    expect(screen.getByText('これは最初のページです。')).toBeInTheDocument();
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });

  it('navigates using page indicators', () => {
    render(<StorybookViewer storybook={mockStorybook} />);
    
    const pageIndicators = screen.getAllByLabelText(/ページ \d+へ移動/);
    fireEvent.click(pageIndicators[2]); // Click third page indicator
    
    expect(screen.getByText('これは最後のページです。')).toBeInTheDocument();
    expect(screen.getByText('3 / 3')).toBeInTheDocument();
  });

  it('disables previous button on first page', () => {
    render(<StorybookViewer storybook={mockStorybook} />);
    
    const prevButton = screen.getByText('前のページ');
    expect(prevButton).toBeDisabled();
  });

  it('disables next button on last page', () => {
    render(<StorybookViewer storybook={mockStorybook} />);
    
    // Navigate to last page
    const pageIndicators = screen.getAllByLabelText(/ページ \d+へ移動/);
    fireEvent.click(pageIndicators[2]);
    
    const nextButton = screen.getByText('次のページ');
    expect(nextButton).toBeDisabled();
  });

  it('handles keyboard navigation', () => {
    render(<StorybookViewer storybook={mockStorybook} />);
    
    // Navigate right
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(screen.getByText('これは2番目のページです。')).toBeInTheDocument();
    
    // Navigate left
    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(screen.getByText('これは最初のページです。')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const mockOnClose = jest.fn();
    render(<StorybookViewer storybook={mockStorybook} onClose={mockOnClose} />);
    
    const closeButton = screen.getByText('閉じる');
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape key is pressed', () => {
    const mockOnClose = jest.fn();
    render(<StorybookViewer storybook={mockStorybook} onClose={mockOnClose} />);
    
    fireEvent.keyDown(window, { key: 'Escape' });
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('resets to first page when storybook changes', () => {
    const { rerender } = render(<StorybookViewer storybook={mockStorybook} />);
    
    // Navigate to second page
    const nextButton = screen.getByLabelText('次のページ');
    fireEvent.click(nextButton);
    expect(screen.getByText('2 / 3')).toBeInTheDocument();
    
    // Change storybook
    const newStorybook = { ...mockStorybook, id: 'different-id' };
    rerender(<StorybookViewer storybook={newStorybook} />);
    
    // Should be back to first page
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });

  it('handles empty storybook pages gracefully', () => {
    const emptyStorybook = { ...mockStorybook, pages: [] };
    render(<StorybookViewer storybook={emptyStorybook} />);
    
    expect(screen.getByText('絵本のページが見つかりません')).toBeInTheDocument();
  });

  it('shows loading state for images', async () => {
    render(<StorybookViewer storybook={mockStorybook} />);
    
    // Loading spinner should be visible initially
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    
    // Simulate image load
    const image = screen.getByAltText('絵本のページ 1');
    fireEvent.load(image);
    
    await waitFor(() => {
      expect(document.querySelector('.animate-spin')).not.toBeInTheDocument();
    });
  });
});