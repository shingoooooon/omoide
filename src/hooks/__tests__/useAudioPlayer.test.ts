import { renderHook, act } from '@testing-library/react';
import { useAudioPlayer } from '../useAudioPlayer';

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

describe('useAudioPlayer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAudio.play.mockClear();
    mockAudio.pause.mockClear();
    mockAudio.addEventListener.mockClear();
    mockAudio.removeEventListener.mockClear();
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useAudioPlayer());

    expect(result.current.isPlaying).toBe(false);
    expect(result.current.currentPageId).toBe(null);
    expect(result.current.currentAudioUrl).toBe(null);
    expect(typeof result.current.playAudio).toBe('function');
    expect(typeof result.current.pauseAudio).toBe('function');
    expect(typeof result.current.stopAudio).toBe('function');
  });

  it('should play audio and update state', async () => {
    const { result } = renderHook(() => useAudioPlayer());

    await act(async () => {
      result.current.playAudio('https://example.com/audio.mp3', 'page-1');
      // Wait for the play promise to resolve
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(Audio).toHaveBeenCalledWith('https://example.com/audio.mp3');
    expect(mockAudio.play).toHaveBeenCalled();
    expect(mockAudio.addEventListener).toHaveBeenCalledWith('ended', expect.any(Function));
    expect(mockAudio.addEventListener).toHaveBeenCalledWith('error', expect.any(Function));
    
    expect(result.current.isPlaying).toBe(true);
    expect(result.current.currentPageId).toBe('page-1');
    expect(result.current.currentAudioUrl).toBe('https://example.com/audio.mp3');
  });

  it('should pause audio when pauseAudio is called', async () => {
    const { result } = renderHook(() => useAudioPlayer());

    // First play audio and wait for state update
    await act(async () => {
      result.current.playAudio('https://example.com/audio.mp3', 'page-1');
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Verify playing state
    expect(result.current.isPlaying).toBe(true);

    // Then pause
    act(() => {
      result.current.pauseAudio();
    });

    expect(mockAudio.pause).toHaveBeenCalled();
    expect(result.current.isPlaying).toBe(false);
    expect(result.current.currentPageId).toBe('page-1'); // Should keep page ID
    expect(result.current.currentAudioUrl).toBe('https://example.com/audio.mp3'); // Should keep URL
  });

  it('should stop audio and reset state when stopAudio is called', () => {
    const { result } = renderHook(() => useAudioPlayer());

    // First play audio
    act(() => {
      result.current.playAudio('https://example.com/audio.mp3', 'page-1');
    });

    // Then stop
    act(() => {
      result.current.stopAudio();
    });

    expect(mockAudio.pause).toHaveBeenCalled();
    expect(mockAudio.currentTime).toBe(0);
    expect(result.current.isPlaying).toBe(false);
    expect(result.current.currentPageId).toBe(null);
    expect(result.current.currentAudioUrl).toBe(null);
  });

  it('should stop current audio when playing new audio', async () => {
    const { result } = renderHook(() => useAudioPlayer());

    // Play first audio
    await act(async () => {
      result.current.playAudio('https://example.com/audio1.mp3', 'page-1');
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    const firstAudio = mockAudio;
    
    // Create new mock for second audio
    const secondMockAudio = {
      play: jest.fn().mockResolvedValue(undefined),
      pause: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      currentTime: 0,
      duration: 100,
    };

    // Reset mock to simulate new Audio instance
    (Audio as jest.Mock).mockImplementation(() => secondMockAudio);

    // Play second audio
    await act(async () => {
      result.current.playAudio('https://example.com/audio2.mp3', 'page-2');
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(firstAudio.pause).toHaveBeenCalled();
    expect(result.current.currentPageId).toBe('page-2');
    expect(result.current.currentAudioUrl).toBe('https://example.com/audio2.mp3');
  });

  it('should handle audio ended event', () => {
    const { result } = renderHook(() => useAudioPlayer());

    act(() => {
      result.current.playAudio('https://example.com/audio.mp3', 'page-1');
    });

    // Simulate ended event
    const endedCallback = mockAudio.addEventListener.mock.calls.find(
      call => call[0] === 'ended'
    )?.[1];

    act(() => {
      endedCallback?.();
    });

    expect(result.current.isPlaying).toBe(false);
  });

  it('should handle audio error event', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const { result } = renderHook(() => useAudioPlayer());

    act(() => {
      result.current.playAudio('https://example.com/audio.mp3', 'page-1');
    });

    // Simulate error event
    const errorCallback = mockAudio.addEventListener.mock.calls.find(
      call => call[0] === 'error'
    )?.[1];

    act(() => {
      errorCallback?.('Audio error');
    });

    expect(result.current.isPlaying).toBe(false);
    expect(consoleSpy).toHaveBeenCalledWith('Audio playback error:', 'Audio error');
    
    consoleSpy.mockRestore();
  });

  it('should handle play promise rejection', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    mockAudio.play.mockRejectedValueOnce(new Error('Play failed'));

    const { result } = renderHook(() => useAudioPlayer());

    await act(async () => {
      result.current.playAudio('https://example.com/audio.mp3', 'page-1');
    });

    expect(consoleSpy).toHaveBeenCalledWith('Failed to play audio:', expect.any(Error));
    expect(result.current.isPlaying).toBe(false);
    
    consoleSpy.mockRestore();
  });

  it('should not pause if not currently playing', () => {
    const { result } = renderHook(() => useAudioPlayer());

    act(() => {
      result.current.pauseAudio();
    });

    expect(mockAudio.pause).not.toHaveBeenCalled();
  });

  it('should cleanup audio on unmount', async () => {
    const { result, unmount } = renderHook(() => useAudioPlayer());

    await act(async () => {
      result.current.playAudio('https://example.com/audio.mp3', 'page-1');
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    unmount();

    expect(mockAudio.pause).toHaveBeenCalled();
  });
});