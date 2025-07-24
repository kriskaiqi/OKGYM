import React, { useState } from 'react';
import { Box, Button, Typography, CircularProgress } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import FullscreenIcon from '@mui/icons-material/Fullscreen';

interface VideoPlayerProps {
  url: string;
  title?: string;
  autoPlay?: boolean;
  width?: string | number;
  height?: string | number;
}

/**
 * Basic video player component
 */
const VideoPlayer: React.FC<VideoPlayerProps> = ({
  url,
  title = '',
  autoPlay = false,
  width = '100%',
  height = 'auto'
}) => {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Handle loading state
  const handleVideoLoad = () => {
    setIsLoading(false);
  };

  // Handle play/pause
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // Handle mute/unmute
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Handle fullscreen
  const toggleFullscreen = () => {
    const videoElement = document.getElementById('video-player') as HTMLVideoElement;
    if (videoElement) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoElement.requestFullscreen();
      }
    }
  };

  return (
    <Box sx={{ position: 'relative', width, height, bgcolor: 'black' }}>
      {isLoading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1
          }}
        >
          <CircularProgress color="primary" />
        </Box>
      )}
      
      <video
        id="video-player"
        src={url}
        style={{ width: '100%', height: '100%' }}
        autoPlay={autoPlay}
        playsInline
        muted={isMuted}
        onLoadedData={handleVideoLoad}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        controls={false}
      />
      
      {title && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            p: 1,
            bgcolor: 'rgba(0, 0, 0, 0.7)',
            color: 'white'
          }}
        >
          <Typography variant="subtitle1">{title}</Typography>
        </Box>
      )}
      
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          p: 1,
          display: 'flex',
          justifyContent: 'space-between',
          bgcolor: 'rgba(0, 0, 0, 0.7)',
          color: 'white'
        }}
      >
        <Button
          onClick={togglePlay}
          size="small"
          startIcon={isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
          sx={{ color: 'white' }}
        >
          {isPlaying ? 'Pause' : 'Play'}
        </Button>
        
        <Box>
          <Button
            onClick={toggleMute}
            size="small"
            sx={{ color: 'white', minWidth: 40 }}
          >
            {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
          </Button>
          
          <Button
            onClick={toggleFullscreen}
            size="small"
            sx={{ color: 'white', minWidth: 40 }}
          >
            <FullscreenIcon />
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default VideoPlayer; 