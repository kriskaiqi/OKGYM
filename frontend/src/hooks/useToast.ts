/**
 * Simple toast notification hook
 */
export const useToast = () => {
  return {
    /**
     * Shows a toast notification with the given message and severity
     * @param message - The message to display
     * @param severity - The severity level of the toast
     */
    showToast: (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
      console.log(`Toast: ${message} (${severity})`);
      // In a real implementation, this would use a toast library
    }
  };
}; 