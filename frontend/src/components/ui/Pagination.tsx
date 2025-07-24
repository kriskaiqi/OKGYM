import React from 'react';
import { styled } from '@mui/system';
import { useThemeContext } from '../../contexts/ThemeContext';

// Types
type PaginationProps = {
  count: number;
  page: number;
  onChange: (page: number) => void;
  size?: 'small' | 'medium' | 'large';
  showFirstButton?: boolean;
  showLastButton?: boolean;
  disabled?: boolean;
  siblingCount?: number;
  boundaryCount?: number;
  className?: string;
};

// Styled Components
const PaginationContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexWrap: 'wrap',
  gap: '4px',
});

const PaginationButton = styled('button')<{ 
  size: string;
  isActive: boolean;
  isDark: boolean;
}>(({ theme, size, isActive, isDark }) => {
  const baseSize = size === 'small' ? 32 : size === 'medium' ? 40 : 48;
  
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    margin: 0,
    width: `${baseSize}px`,
    height: `${baseSize}px`,
    borderRadius: '50%',
    border: 'none',
    backgroundColor: isActive 
      ? isDark ? theme.palette.primary.main : theme.palette.primary.light
      : 'transparent',
    color: isActive 
      ? isDark ? theme.palette.primary.contrastText : theme.palette.primary.contrastText
      : isDark ? theme.palette.text.primary : theme.palette.text.primary,
    fontWeight: isActive ? 600 : 400,
    fontSize: size === 'small' ? '0.875rem' : size === 'medium' ? '1rem' : '1.125rem',
    cursor: 'pointer',
    outline: 'none',
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: isActive 
        ? isDark ? theme.palette.primary.dark : theme.palette.primary.main
        : isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
    },
    '&:disabled': {
      cursor: 'default',
      opacity: 0.5,
      pointerEvents: 'none',
    },
  };
});

const PaginationEllipsis = styled('div')<{ size: string }>(({ theme, size }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: size === 'small' ? '32px' : size === 'medium' ? '40px' : '48px',
  height: size === 'small' ? '32px' : size === 'medium' ? '40px' : '48px',
  color: theme.palette.text.secondary,
  fontSize: size === 'small' ? '0.875rem' : size === 'medium' ? '1rem' : '1.125rem',
}));

// Helper functions
const range = (start: number, end: number) => {
  const length = end - start + 1;
  return Array.from({ length }, (_, i) => start + i);
};

// Component
export const Pagination: React.FC<PaginationProps> = ({
  count,
  page,
  onChange,
  size = 'medium',
  showFirstButton = false,
  showLastButton = false,
  disabled = false,
  siblingCount = 1,
  boundaryCount = 1,
  className,
}) => {
  const { mode } = useThemeContext();
  const isDark = mode === 'dark';

  // Generate pagination range with ellipsis
  const generatePaginationItems = () => {
    const startPages = range(1, Math.min(boundaryCount, count));
    const endPages = range(Math.max(count - boundaryCount + 1, 1), count);

    const siblingsStart = Math.max(
      Math.min(
        page - siblingCount,
        count - boundaryCount - siblingCount * 2 - 1
      ),
      boundaryCount + 2
    );

    const siblingsEnd = Math.min(
      Math.max(
        page + siblingCount,
        boundaryCount + siblingCount * 2 + 2
      ),
      endPages.length > 0 ? endPages[0] - 2 : count - 1
    );

    // Determine if ellipses are needed
    const showStartEllipsis = siblingsStart > boundaryCount + 2;
    const showEndEllipsis = siblingsEnd < count - boundaryCount - 1;

    const items: (number | 'start-ellipsis' | 'end-ellipsis')[] = [];

    // Add start pages
    items.push(...startPages);

    // Add start ellipsis
    if (showStartEllipsis) {
      items.push('start-ellipsis');
    } else if (boundaryCount + 1 < siblingsStart) {
      items.push(boundaryCount + 1);
    }

    // Add sibling pages
    items.push(...range(siblingsStart, siblingsEnd));

    // Add end ellipsis
    if (showEndEllipsis) {
      items.push('end-ellipsis');
    } else if (siblingsEnd < count - boundaryCount) {
      items.push(count - boundaryCount);
    }

    // Add end pages
    items.push(...endPages);

    return items;
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= count && newPage !== page) {
      onChange(newPage);
    }
  };

  const paginationItems = generatePaginationItems();

  return (
    <PaginationContainer className={className}>
      {/* First page button */}
      {showFirstButton && (
        <PaginationButton
          size={size}
          isActive={false}
          isDark={isDark}
          onClick={() => handlePageChange(1)}
          disabled={disabled || page === 1}
          aria-label="Go to first page"
        >
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M18.41 16.59L13.82 12L18.41 7.41L17 6L11 12L17 18L18.41 16.59Z" 
              fill="currentColor"
            />
            <path 
              d="M7 6V18H9V6H7Z" 
              fill="currentColor"
            />
          </svg>
        </PaginationButton>
      )}

      {/* Previous page button */}
      <PaginationButton
        size={size}
        isActive={false}
        isDark={isDark}
        onClick={() => handlePageChange(page - 1)}
        disabled={disabled || page === 1}
        aria-label="Go to previous page"
      >
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M15.41 16.59L10.83 12L15.41 7.41L14 6L8 12L14 18L15.41 16.59Z" 
            fill="currentColor"
          />
        </svg>
      </PaginationButton>

      {/* Page numbers */}
      {paginationItems.map((item, index) => {
        if (item === 'start-ellipsis' || item === 'end-ellipsis') {
          return (
            <PaginationEllipsis key={`ellipsis-${index}`} size={size}>
              &#8230;
            </PaginationEllipsis>
          );
        }

        return (
          <PaginationButton
            key={item}
            size={size}
            isActive={page === item}
            isDark={isDark}
            onClick={() => handlePageChange(item as number)}
            disabled={disabled}
            aria-current={page === item ? 'page' : undefined}
            aria-label={`Go to page ${item}`}
          >
            {item}
          </PaginationButton>
        );
      })}

      {/* Next page button */}
      <PaginationButton
        size={size}
        isActive={false}
        isDark={isDark}
        onClick={() => handlePageChange(page + 1)}
        disabled={disabled || page === count}
        aria-label="Go to next page"
      >
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M8.59 16.59L13.17 12L8.59 7.41L10 6L16 12L10 18L8.59 16.59Z" 
            fill="currentColor"
          />
        </svg>
      </PaginationButton>

      {/* Last page button */}
      {showLastButton && (
        <PaginationButton
          size={size}
          isActive={false}
          isDark={isDark}
          onClick={() => handlePageChange(count)}
          disabled={disabled || page === count}
          aria-label="Go to last page"
        >
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M5.59 16.59L10.18 12L5.59 7.41L7 6L13 12L7 18L5.59 16.59Z" 
              fill="currentColor"
            />
            <path 
              d="M17 6V18H15V6H17Z" 
              fill="currentColor"
            />
          </svg>
        </PaginationButton>
      )}
    </PaginationContainer>
  );
}; 