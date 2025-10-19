import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AudioPlayer } from '../AudioPlayer';

// Mock HTMLAudioElement methods
Object.defineProperty(window.HTMLMediaElement.prototype, 'play', {
  configurable: true,
  value: jest.fn().mockResolvedValue(undefined),
});

Object.defineProperty(window.HTMLMediaElement.prototype, 'pause', {
  configurable: true,
  value: jest.fn(),
});

Object.defineProperty(window.HTMLMediaElement.prototype, 'load', {
  configurable: true,
  value: jest.fn(),
});

// Mock Audio constructor
const mockAudio = {
  play: jest.fn().mockResolvedValue(undefined),
  pause: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  currentTime: 0,
  duration: 100,
};

global.Audio = jest.fn().mockImplementation(() => mockAudio);

describe('AudioPlayer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when no audioUrl is provided', () => {
    const { container } = render(<AudioPlayer />);
    expect(container.firstChild).toBeNull();
  });

  it('renders play button when audioUrl is provided', () => {
    render(<AudioPlayer audioUrl="test-audio.mp3" />);
    
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('再生')).toBeInTheDocument();
  });

  it('shows loading state initially', async () => {
    render(<AudioPlayer audioUrl="test-audio.mp3" />);
    
    // Initially should show loading
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    
    // Simulate canplay event to stop loading
    const audioElement = document.querySelector('audio');
    if (audioElement) {
      fireEvent.canPlay(audioElement);
    }
    
    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
  });

  it('calls onPlay callback when play button is clicked', async () => {
    const onPlay = jest.fn();
    render(<AudioPlayer audioUrl="test-audio.mp3" onPlay={onPlay} />);
    
    // Simulate canplay event to stop loading
    const audioElement = document.querySelector('audio');
    if (audioElement) {
      fireEvent.canPlay(audioElement);
    }
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByRole('button')).not.toBeDisabled();
    });

    const playButton = screen.getByRole('button');
    fireEvent.click(playButton);

    // Simulate play event
    if (audioElement) {
      fireEvent.play(audioElement);
    }

    await waitFor(() => {
      expect(onPlay).toHaveBeenCalled();
    });
  });

  it('shows progress bar when showProgress is true and duration > 0', () => {
    render(<AudioPlayer audioUrl="test-audio.mp3" showProgress={true} />);
    
    // Simulate loaded metadata
    const audioElement = document.querySelector('audio');
    if (audioElement) {
      Object.defineProperty(audioElement, 'duration', { value: 100, writable: true });
      fireEvent.loadedMetadata(audioElement);
    }

    // Should show progress elements
    expect(screen.getByText('0:00')).toBeInTheDocument();
    expect(screen.getByText('1:40')).toBeInTheDocument(); // 100 seconds = 1:40
  });

  it('hides progress bar when showProgress is false', () => {
    render(<AudioPlayer audioUrl="test-audio.mp3" showProgress={false} />);
    
    // Should not show time displays
    expect(screen.queryByText('0:00')).not.toBeInTheDocument();
  });

  it('formats time correctly', () => {
    render(<AudioPlayer audioUrl="test-audio.mp3" showProgress={true} />);
    
    const audioElement = document.querySelector('audio');
    if (audioElement) {
      // Set duration to 125 seconds (2:05)
      Object.defineProperty(audioElement, 'duration', { value: 125, writable: true });
      fireEvent.loadedMetadata(audioElement);
      
      expect(screen.getByText('2:05')).toBeInTheDocument();
    }
  });

  it('calls onPause callback when pause button is clicked during playback', async () => {
    const onPause = jest.fn();
    render(<AudioPlayer audioUrl="test-audio.mp3" onPause={onPause} />);
    
    const button = screen.getByRole('button');
    const audioElement = document.querySelector('audio');
    
    // Simulate canplay event to stop loading
    if (audioElement) {
      fireEvent.canPlay(audioElement);
    }
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });

    // Start playing
    fireEvent.click(button);
    
    // Simulate play event
    if (audioElement) {
      fireEvent.play(audioElement);
    }

    // Should show pause button
    await waitFor(() => {
      expect(screen.getByText('停止')).toBeInTheDocument();
    });

    // Click pause
    fireEvent.click(button);
    
    // Simulate pause event
    if (audioElement) {
      fireEvent.pause(audioElement);
    }

    await waitFor(() => {
      expect(onPause).toHaveBeenCalled();
    });
  });

  it('calls onEnded callback when audio ends', () => {
    const onEnded = jest.fn();
    render(<AudioPlayer audioUrl="test-audio.mp3" onEnded={onEnded} />);
    
    const audioElement = document.querySelector('audio');
    if (audioElement) {
      fireEvent.ended(audioElement);
    }

    expect(onEnded).toHaveBeenCalled();
  });

  it('updates progress when clicking on progress bar', () => {
    render(<AudioPlayer audioUrl="test-audio.mp3" showProgress={true} />);
    
    const audioElement = document.querySelector('audio');
    if (audioElement) {
      Object.defineProperty(audioElement, 'duration', { value: 100, writable: true });
      fireEvent.loadedMetadata(audioElement);
    }

    const progressBar = document.querySelector('.bg-gray-200');
    if (progressBar) {
      // Mock getBoundingClientRect
      jest.spyOn(progressBar, 'getBoundingClientRect').mockReturnValue({
        left: 0,
        width: 200,
        top: 0,
        right: 200,
        bottom: 20,
        height: 20,
        x: 0,
        y: 0,
        toJSON: () => {},
      });

      // Click at 50% position (100px from left)
      fireEvent.click(progressBar, { clientX: 100 });

      // Should set currentTime to 50 (50% of 100 seconds)
      expect(audioElement.currentTime).toBe(50);
    }
  });
});