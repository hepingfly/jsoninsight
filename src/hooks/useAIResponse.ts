import { useState, useCallback } from 'react';
import { aiService } from '@/services/aiService';

export interface AIResponseData {
  summary: string;
  fields: Array<{
    path: string;
    type: string;
    description: string;
  }>;
  typescript: string;
  doc: string;
}

export interface UseAIResponseResult {
  data: AIResponseData | null;
  isLoading: boolean;
  error: string | null;
  analyzeJson: (jsonInput: string) => Promise<void>;
  reset: () => void;
  duration: number | null;
}

export function useAIResponse(): UseAIResponseResult {
  const [data, setData] = useState<AIResponseData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | null>(null);

  const analyzeJson = useCallback(async (jsonInput: string) => {
    if (!jsonInput.trim()) {
      setError('请输入 JSON 数据');
      return;
    }

    // 验证 JSON 格式
    try {
      JSON.parse(jsonInput);
    } catch (e) {
      setError('JSON 格式不正确，请检查后重试');
      return;
    }

    setIsLoading(true);
    setError(null);
    setData(null);
    
    const startTime = performance.now();

    try {
      const result = await aiService.analyzeJsonStructure(jsonInput);
      const endTime = performance.now();
      const analysisTime = Number((endTime - startTime).toFixed(0));
      
      setData(result);
      setDuration(analysisTime);
    } catch (err) {
      const endTime = performance.now();
      const analysisTime = Number((endTime - startTime).toFixed(0));
      setDuration(analysisTime);
      
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('分析失败，请稍后重试');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setDuration(null);
    setIsLoading(false);
  }, []);

  return {
    data,
    isLoading,
    error,
    analyzeJson,
    reset,
    duration
  };
} 