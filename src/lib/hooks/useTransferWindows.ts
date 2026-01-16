import { useEffect, useState } from 'react';
import { TransferWindow } from '@/lib/transfer-windows/config';
import { getActiveWindow } from '@/lib/transfer-windows/calculator';

interface UseTransferWindowsResult {
  windows: TransferWindow[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch all transfer windows
 */
export function useTransferWindows(league?: string): UseTransferWindowsResult {
  const [windows, setWindows] = useState<TransferWindow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchWindows = async () => {
    try {
      setLoading(true);
      setError(null);

      const url = league
        ? `/api/transfer-windows?league=${encodeURIComponent(league)}`
        : '/api/transfer-windows';

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch transfer windows: ${response.statusText}`);
      }

      const data = await response.json();
      setWindows(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setWindows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWindows();
  }, [league]);

  return {
    windows,
    loading,
    error,
    refetch: fetchWindows,
  };
}

/**
 * Hook to get the active transfer window for a specific league
 */
export function useActiveTransferWindow(league: string) {
  const { windows, loading, error, refetch } = useTransferWindows(league);
  const [activeWindow, setActiveWindow] = useState<TransferWindow | null>(null);

  useEffect(() => {
    if (windows.length > 0) {
      const active = getActiveWindow(windows, league);
      setActiveWindow(active);
    } else {
      setActiveWindow(null);
    }
  }, [windows, league]);

  return {
    window: activeWindow,
    allWindows: windows,
    loading,
    error,
    refetch,
  };
}
