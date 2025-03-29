import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface GoogleSheetInputProps {
  onSheetUrlSubmit: (sheetId: string) => void;
}

export function GoogleSheetInput({ onSheetUrlSubmit }: GoogleSheetInputProps) {
  const [sheetUrl, setSheetUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    console.log('handleSubmit');
    try {
      // Extract spreadsheet ID from URL
      const url = new URL(sheetUrl);
      let sheetId = '';

      if (
        url.hostname === 'docs.google.com' &&
        url.pathname.includes('/spreadsheets/d/')
      ) {
        sheetId = url.pathname.split('/')[3];
        console.log('sheetId', sheetId);
      } else {
        throw new Error('Invalid Google Sheets URL');
      }

      if (!sheetId) {
        throw new Error('Could not find spreadsheet ID in the URL');
      }

      setError(null);
      onSheetUrlSubmit(sheetId);
    } catch (err) {
      setError('Please enter a valid Google Sheets URL');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          type="url"
          placeholder="Paste your Google Sheet URL here"
          value={sheetUrl}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSheetUrl(e.target.value)
          }
          className="flex-1"
        />
        <Button onClick={handleSubmit}>Connect Sheet</Button>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <p className="text-sm text-gray-500">
        Note: Make sure your Google Sheet is accessible (set to &ldquo;Anyone
        with the link can edit&rdquo;)
      </p>
    </div>
  );
}
