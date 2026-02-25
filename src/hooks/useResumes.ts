'use client';

import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { ResumeData } from '@/types/hydranhunt';

export function useResumes() {
  const { data: session } = useSession();
  const [resumes, setResumes] = useState<ResumeData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userId = (session?.user as any)?.id || 'demo-user';

  const fetchResumes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/resumes?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch resumes');
      const data = await response.json();
      setResumes(data);
      return data;
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const createResume = useCallback(async (resumeData: Partial<ResumeData>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/resumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...resumeData, userId }),
      });
      if (!response.ok) throw new Error('Failed to create resume');
      const data = await response.json();
      setResumes(prev => [data, ...prev]);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const updateResume = useCallback(async (id: string, updates: Partial<ResumeData>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/resumes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update resume');
      const data = await response.json();
      setResumes(prev => prev.map(r => r.id === id ? data : r));
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteResume = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/resumes/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete resume');
      setResumes(prev => prev.filter(r => r.id !== id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadResume = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/resumes/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to upload resume');
      }
      
      const data = await response.json();
      setResumes(prev => [data, ...prev]);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    resumes,
    loading,
    error,
    fetchResumes,
    createResume,
    updateResume,
    deleteResume,
    uploadResume,
    setResumes,
  };
}
