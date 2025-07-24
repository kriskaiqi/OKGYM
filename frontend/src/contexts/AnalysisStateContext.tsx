import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { logger } from '../utils/logger';

interface AnalysisStateContextType {
  isAnalyzing: boolean;
  setIsAnalyzing: (value: boolean) => void;
}

const AnalysisStateContext = createContext<AnalysisStateContextType | null>(null);

export const AnalysisStateProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Create wrapper to log state changes and force update
  const handleSetIsAnalyzing = useCallback((value: boolean) => {
    logger.info(`Analysis state changing: ${isAnalyzing} -> ${value}`);
    
    // Create an immediate effect
    if (value !== isAnalyzing) {
      setIsAnalyzing(value);
      
      // Force a synchronous DOM update to let children know state changed
      logger.info(`Broadcasting analysis state change: ${value}`);
      
      // Dispatch a custom event that components can listen for
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('analysis-state-change', { 
          detail: { isAnalyzing: value } 
        }));
      }
    }
  }, [isAnalyzing]);
  
  return (
    <AnalysisStateContext.Provider value={{ 
      isAnalyzing, 
      setIsAnalyzing: handleSetIsAnalyzing 
    }}>
      {children}
    </AnalysisStateContext.Provider>
  );
};

export const useAnalysisState = () => {
  const context = useContext(AnalysisStateContext);
  if (!context) {
    throw new Error('useAnalysisState must be used within an AnalysisStateProvider');
  }
  return context;
}; 