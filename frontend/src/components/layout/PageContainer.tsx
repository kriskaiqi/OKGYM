import React from 'react';
import { Box, styled } from '@mui/material';
import { PageTitle, BodyText } from '../ui/Typography';

interface PageContainerProps {
  children: React.ReactNode;
  maxWidth?: string | number;
  noPadding?: boolean;
  pageTitle?: string;
  pageSubtitle?: string;
}

const StyledPageContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: '1600px',
  margin: '0 auto',
  padding: theme.spacing(3, 4),
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

const PageHeader = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

/**
 * PageContainer - Provides consistent width and padding for all pages
 * 
 * This component ensures that all pages in the application have consistent 
 * width, padding, and alignment for a uniform user experience.
 */
const PageContainer: React.FC<PageContainerProps> = ({ 
  children, 
  maxWidth = '1600px',
  noPadding = false,
  pageTitle,
  pageSubtitle
}) => {
  return (
    <StyledPageContainer
      sx={{ 
        maxWidth,
        padding: noPadding ? 0 : undefined 
      }}
    >
      {(pageTitle || pageSubtitle) && (
        <PageHeader>
          {pageTitle && (
            <PageTitle>
              {pageTitle}
            </PageTitle>
          )}
          {pageSubtitle && (
            <BodyText muted>
              {pageSubtitle}
            </BodyText>
          )}
        </PageHeader>
      )}
      {children}
    </StyledPageContainer>
  );
};

export default PageContainer; 