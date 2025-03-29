import { useState, useEffect } from 'react';

import { GoogleDriveService } from '@/services/googleDrive';

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
      const service = GoogleDriveService.getInstance();
      await service.initialize();
      const sheetData = await service.readData();
      setData(sheetData);
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
      const service = GoogleDriveService.getInstance();
      await service.appendData(values);
      await fetchData(); // Refresh data after append
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
      const service = GoogleDriveService.getInstance();
      await service.updateData(range, values);
      await fetchData(); // Refresh data after update
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
