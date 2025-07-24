import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface NotFoundProps {
  message?: string;
  buttonText?: string;
  redirectPath?: string;
}

/**
 * NotFound component for displaying when content is not found
 */
export const NotFound: React.FC<NotFoundProps> = ({
  message = 'Not Found',
  buttonText = 'Go Back',
  redirectPath
}) => {
  const navigate = useNavigate();

  const handleNavigation = () => {
    if (redirectPath) {
      navigate(redirectPath);
    } else {
      navigate(-1);
    }
  };

  return (
    <Box
      sx={{
        p: 4,
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2
      }}
    >
      <Typography variant="h5" component="h2" gutterBottom>
        {message}
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        The requested content could not be found.
      </Typography>
      <Button variant="contained" onClick={handleNavigation}>
        {buttonText}
      </Button>
    </Box>
  );
}; 