import { useState, useEffect } from 'react';

interface UseGoogleSheetsOptions {
  onError?: (error: Error) => void;
}

export function useGoogleSheets(options: UseGoogleSheetsOptions = {}) {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any[][]>([]);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/sheets');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch data');
      }

      setData(result.data);
      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      options.onError?.(error);

      // If not authenticated, redirect to auth
      if (error.message.includes('Authentication required')) {
        window.location.href = '/api/auth/google';
      }
    } finally {
      setIsLoading(false);
    }
  };

  const appendData = async (values: any[][]) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values, action: 'append' }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to append data');
      }

      setData(result.data);
      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      options.onError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateData = async (range: string, values: any[][]) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values, range, action: 'update' }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update data');
      }

      setData(result.data);
      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      options.onError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    data,
    isLoading,
    error,
    refreshData: fetchData,
    appendData,
    updateData,
  };
}
