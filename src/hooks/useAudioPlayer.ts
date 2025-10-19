import { useState, useCallback, useRef, useEffect } from 'react';

export interface AudioPlayerState {
  currentAudioUrl: string | null;
  isPlaying: boolean;
  currentPageId: string | null;
}

export interface UseAudioPlayerReturn {
  playAudio: (audioUrl: string, pageId: string) => void;
  pauseAudio: () => void;
  stopAudio: () => void;
  isPlaying: boolean;
  currentPageId: string | null;
  currentAudioUrl: string | null;
}

export function useAudioPlayer(): UseAudioPlayerReturn {
  const [state, setState] = useState<AudioPlayerState>({
    currentAudioUrl: null,
    isPlaying: false,
    currentPageId: null,
  });
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Cleanup audio when component unmounts
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const playAudio = useCallback((audioUrl: string, pageId: string) => {
    console.log('🎵 Attempting to play audio:', { audioUrl: audioUrl.substring(0, 50) + '...', pageId });
    
    // Stop current audio if playing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    try {
      // Create new audio element
      const audio = new Audio();
      audioRef.current = audio;

      // Set up event listeners before setting src
      audio.addEventListener('loadstart', () => {
        console.log('🔄 Audio loading started');
      });

      audio.addEventListener('canplay', () => {
        console.log('✅ Audio can play');
      });

      audio.addEventListener('ended', () => {
        console.log('🏁 Audio playback ended');
        setState(prev => ({
          ...prev,
          isPlaying: false,
        }));
      });

      audio.addEventListener('error', (event) => {
        console.error('❌ Audio playback error:', event);
        console.error('Audio error details:', {
          error: audio.error,
          networkState: audio.networkState,
          readyState: audio.readyState,
          src: audio.src.substring(0, 100) + '...'
        });
        setState(prev => ({
          ...prev,
          isPlaying: false,
        }));
      });

      // Set the audio source
      audio.src = audioUrl;
      audio.load(); // Explicitly load the audio

      // Play the audio
      audio.play().then(() => {
        console.log('▶️ Audio playback started successfully');
        setState({
          currentAudioUrl: audioUrl,
          isPlaying: true,
          currentPageId: pageId,
        });
      }).catch((error) => {
        console.error('❌ Failed to play audio:', error);
        console.error('Play error details:', {
          name: error.name,
          message: error.message,
          audioSrc: audio.src.substring(0, 100) + '...',
          readyState: audio.readyState,
          networkState: audio.networkState
        });
      });
    } catch (error) {
      console.error('❌ Error creating audio element:', error);
    }
  }, []);

  const pauseAudio = useCallback(() => {
    if (audioRef.current && state.isPlaying) {
      audioRef.current.pause();
      setState(prev => ({
        ...prev,
        isPlaying: false,
      }));
    }
  }, [state.isPlaying]);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    
    setState({
      currentAudioUrl: null,
      isPlaying: false,
      currentPageId: null,
    });
  }, []);

  return {
    playAudio,
    pauseAudio,
    stopAudio,
    isPlaying: state.isPlaying,
    currentPageId: state.currentPageId,
    currentAudioUrl: state.currentAudioUrl,
  };
}