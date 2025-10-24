import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StorybookGenerator } from '../StorybookGenerator';
import { AuthProvider } from '@/contexts/AuthContext';
import { LocaleProvider } from '@/contexts/LocaleContext';

// Mock the storybook generation hook
jest.mock('@/hooks/useStorybookGeneration', () => ({
  useStorybookGeneration: () => ({
    state: {
      isGenerating: false,
      progress: 0,
      currentStep: '',
      error: null,
      storybook: null
    },
    generateStorybook: jest.fn(),
    reset: jest.fn()
  })
}));

// Mock the growth record service
jest.mock('@/lib/services/growthRecordService', () => ({
  getMonthlyGrowthRecords: jest.fn()
}));

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

describe('StorybookGenerator', () => {
  const mockOnStorybookGenerated = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders month selection correctly', () => {
    render(
      <MockProviders>
        <StorybookGenerator onStorybookGenerated={mockOnStorybookGenerated} />
      </MockProviders>
    );

    expect(screen.getByText('絵本を作成')).toBeInTheDocument();
    expect(screen.getByText('月を選択してください')).toBeInTheDocument();
  });

  it('shows current month by default', () => {
    render(
      <MockProviders>
        <StorybookGenerator onStorybookGenerated={mockOnStorybookGenerated} />
      </MockProviders>
    );

    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthInput = screen.getByDisplayValue(currentMonth);
    expect(monthInput).toBeInTheDocument();
  });

  it('enables generate button when month is selected', async () => {
    const { getMonthlyGrowthRecords } = require('@/lib/services/growthRecordService');
    getMonthlyGrowthRecords.mockResolvedValue([
      {
        id: '1',
        photos: [{ id: 'photo1', url: 'test.jpg' }],
        comments: [{ id: 'comment1', content: 'Test comment' }]
      }
    ]);

    const user = userEvent.setup();
    
    render(
      <MockProviders>
        <StorybookGenerator onStorybookGenerated={mockOnStorybookGenerated} />
      </MockProviders>
    );

    const monthInput = screen.getByDisplayValue(/\d{4}-\d{2}/);
    await user.clear(monthInput);
    await user.type(monthInput, '2024-01');

    await waitFor(() => {
      const generateButton = screen.getByText('絵本を生成');
      expect(generateButton).not.toBeDisabled();
    });
  });

  it('shows no records message when month has no data', async () => {
    const { getMonthlyGrowthRecords } = require('@/lib/services/growthRecordService');
    getMonthlyGrowthRecords.mockResolvedValue([]);

    const user = userEvent.setup();
    
    render(
      <MockProviders>
        <StorybookGenerator onStorybookGenerated={mockOnStorybookGenerated} />
      </MockProviders>
    );

    const monthInput = screen.getByDisplayValue(/\d{4}-\d{2}/);
    await user.clear(monthInput);
    await user.type(monthInput, '2024-01');

    await waitFor(() => {
      expect(screen.getByText('選択した月には記録がありません')).toBeInTheDocument();
    });
  });

  it('calls generateStorybook when generate button is clicked', async () => {
    const { getMonthlyGrowthRecords } = require('@/lib/services/growthRecordService');
    const { useStorybookGeneration } = require('@/hooks/useStorybookGeneration');
    
    const mockGenerateStorybook = jest.fn();
    useStorybookGeneration.mockReturnValue({
      state: {
        isGenerating: false,
        progress: 0,
        currentStep: '',
        error: null,
        storybook: null
      },
      generateStorybook: mockGenerateStorybook,
      reset: jest.fn()
    });

    getMonthlyGrowthRecords.mockResolvedValue([
      {
        id: '1',
        photos: [{ id: 'photo1', url: 'test.jpg' }],
        comments: [{ id: 'comment1', content: 'Test comment' }]
      }
    ]);

    const user = userEvent.setup();
    
    render(
      <MockProviders>
        <StorybookGenerator onStorybookGenerated={mockOnStorybookGenerated} />
      </MockProviders>
    );

    await waitFor(() => {
      const generateButton = screen.getByText('絵本を生成');
      expect(generateButton).not.toBeDisabled();
    });

    const generateButton = screen.getByText('絵本を生成');
    await user.click(generateButton);

    expect(mockGenerateStorybook).toHaveBeenCalledWith('test-user-id', expect.any(String));
  });

  it('shows generation progress', () => {
    const { useStorybookGeneration } = require('@/hooks/useStorybookGeneration');
    
    useStorybookGeneration.mockReturnValue({
      state: {
        isGenerating: true,
        progress: 50,
        currentStep: '物語を生成中...',
        error: null,
        storybook: null
      },
      generateStorybook: jest.fn(),
      reset: jest.fn()
    });

    render(
      <MockProviders>
        <StorybookGenerator onStorybookGenerated={mockOnStorybookGenerated} />
      </MockProviders>
    );

    expect(screen.getByText('物語を生成中...')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('shows error message when generation fails', () => {
    const { useStorybookGeneration } = require('@/hooks/useStorybookGeneration');
    
    useStorybookGeneration.mockReturnValue({
      state: {
        isGenerating: false,
        progress: 0,
        currentStep: '',
        error: '絵本の生成に失敗しました',
        storybook: null
      },
      generateStorybook: jest.fn(),
      reset: jest.fn()
    });

    render(
      <MockProviders>
        <StorybookGenerator onStorybookGenerated={mockOnStorybookGenerated} />
      </MockProviders>
    );

    expect(screen.getByText('絵本の生成に失敗しました')).toBeInTheDocument();
  });
});