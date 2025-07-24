import React from 'react';
import { Link as RouterLink, LinkProps as RouterLinkProps, useNavigate } from 'react-router-dom';
import { useWorkoutSession } from '../../App';

interface SafeNavigationLinkProps extends Omit<RouterLinkProps, 'to'> {
  to: string;
  children: React.ReactNode;
  onNavigate?: () => void; // Optional callback after navigation
}

/**
 * A wrapper around react-router's Link component that adds navigation
 * protection when a workout session is active.
 */
const SafeNavigationLink: React.FC<SafeNavigationLinkProps> = ({ to, children, onNavigate, ...props }) => {
  const navigate = useNavigate();
  const { isWorkoutActive, confirmNavigation } = useWorkoutSession();
  
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    
    if (isWorkoutActive) {
      // Use the confirm navigation handler from context
      confirmNavigation(() => {
        navigate(to);
        // Call the onNavigate callback if provided
        if (onNavigate) {
          onNavigate();
        }
      });
    } else {
      // If no active workout, navigate normally
      navigate(to);
      // Call the onNavigate callback if provided
      if (onNavigate) {
        onNavigate();
      }
    }
  };
  
  return (
    <RouterLink 
      to={to} 
      onClick={handleClick} 
      {...props}
    >
      {children}
    </RouterLink>
  );
};

export default SafeNavigationLink; 