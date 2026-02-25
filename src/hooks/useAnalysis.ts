'use client';

import { useState, useCallback } from 'react';
import { ResumeData } from '@/types/hydranhunt';

interface AnalysisResult {
  success: boolean;
  analysisType: string;
  result: any;
}

interface TransitionResult {
  success: boolean;
  targetCareer: string;
  result: any;
}

export function useAnalysis() {
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeResume = useCallback(async (
    resume: ResumeData | null,
    resumeId: string | null,
    analysisType: 'ats' | 'general' | 'beautify' | 'optimize',
    targetJob?: string,
    improvements?: any[]
  ): Promise<AnalysisResult> => {
    setAnalyzing(true);
    setError(null);
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume,
          resumeId,
          analysisType,
          targetJob,
          improvements,
        }),
      });
      
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Analysis failed');
      }
      
      return await response.json();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setAnalyzing(false);
    }
  }, []);

  const analyzeCareerTransition = useCallback(async (
    resume: ResumeData | null,
    resumeId: string | null,
    targetCareer: string
  ): Promise<TransitionResult> => {
    setAnalyzing(true);
    setError(null);
    
    try {
      const response = await fetch('/api/analyze/transition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume,
          resumeId,
          targetCareer,
        }),
      });
      
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Career transition analysis failed');
      }
      
      return await response.json();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setAnalyzing(false);
    }
  }, []);

  return {
    analyzing,
    error,
    analyzeResume,
    analyzeCareerTransition,
  };
}
