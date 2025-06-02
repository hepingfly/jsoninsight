'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useAIResponse, AIResponseData, UseAIResponseResult } from '@/hooks/useAIResponse';

interface AIContextType extends UseAIResponseResult {}

const AIContext = createContext<AIContextType | undefined>(undefined);

export function AIProvider({ children }: { children: ReactNode }) {
  const aiResponse = useAIResponse();

  return (
    <AIContext.Provider value={aiResponse}>
      {children}
    </AIContext.Provider>
  );
}

export function useAI() {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
} 