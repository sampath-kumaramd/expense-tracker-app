import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';

interface SheetData {
  spreadsheetId: string;
  title: string;
  url: string;
}

export function GoogleSheetsConnect() {
  const [sheets, setSheets] = useState<SheetData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSheets();
  }, []);

  const loadSheets = async () => {
    const accessToken = localStorage.getItem('google_access_token');
    if (accessToken) {
      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/sheets?action=list&accessToken=${accessToken}`
        );
        if (!response.ok) {
          throw new Error('Failed to load sheets');
        }
        const data = await response.json();
        setSheets(data.sheets);
      } catch (error) {
        console.error('Error loading sheets:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleConnect = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/auth/google');
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Redirect to Google's auth page
      window.location.href = data.url;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to connect to Google Sheets'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSheet = async () => {
    const accessToken = localStorage.getItem('google_access_token');
    if (!accessToken) return;

    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/sheets?action=create&accessToken=${accessToken}`
      );
      if (!response.ok) {
        throw new Error('Failed to create sheet');
      }
      const data = await response.json();
      setSheets([...sheets, data]);
    } catch (error) {
      console.error('Error creating sheet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Button
          onClick={handleConnect}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isLoading ? 'Connecting...' : 'Connect Google Sheets'}
        </Button>
        {localStorage.getItem('google_access_token') && (
          <Button
            onClick={handleCreateSheet}
            disabled={isLoading}
            variant="outline"
          >
            Create New Sheet
          </Button>
        )}
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {sheets && sheets.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Your Sheets</h3>
          <ul className="space-y-2">
            {sheets.map((sheet) => (
              <li
                key={sheet.spreadsheetId}
                className="flex items-center justify-between p-2 border rounded"
              >
                <span>{sheet.title}</span>
                <a
                  href={sheet.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  Open in Google Sheets
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
