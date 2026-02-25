'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { ResumeData } from '@/types/hydranhunt';
import { useResumes } from '@/hooks/useResumes';
import { MOCK_RESUME } from '@/constants/hydranhunt';

interface ResumeContextType {
  resumes: ResumeData[];
  currentResume: ResumeData | null;
  loading: boolean;
  error: string | null;
  setCurrentResume: (resume: ResumeData | null) => void;
  fetchResumes: () => Promise<ResumeData[]>;
  createResume: (data: Partial<ResumeData>) => Promise<ResumeData>;
  updateResume: (id: string, updates: Partial<ResumeData>) => Promise<ResumeData>;
  deleteResume: (id: string) => Promise<void>;
  uploadResume: (file: File) => Promise<ResumeData>;
}

const ResumeContext = createContext<ResumeContextType | null>(null);

export function ResumeProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const resumeHook = useResumes();
  const [currentResume, setCurrentResume] = useState<ResumeData | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Load resumes when session is ready
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!initialized) {
      resumeHook.fetchResumes().then((data) => {
        // If no resumes exist, use mock data for demo
        if (data.length === 0) {
          resumeHook.setResumes([MOCK_RESUME]);
          setCurrentResume(MOCK_RESUME);
        } else if (data.length > 0) {
          setCurrentResume(data[0]);
        }
        setInitialized(true);
      });
    }
  }, [status, initialized]);

  const value: ResumeContextType = {
    resumes: resumeHook.resumes,
    currentResume,
    loading: resumeHook.loading,
    error: resumeHook.error,
    setCurrentResume,
    fetchResumes: resumeHook.fetchResumes,
    createResume: resumeHook.createResume,
    updateResume: resumeHook.updateResume,
    deleteResume: resumeHook.deleteResume,
    uploadResume: resumeHook.uploadResume,
  };

  return (
    <ResumeContext.Provider value={value}>
      {children}
    </ResumeContext.Provider>
  );
}

export function useResumeContext() {
  const context = useContext(ResumeContext);
  if (!context) {
    throw new Error('useResumeContext must be used within a ResumeProvider');
  }
  return context;
}
