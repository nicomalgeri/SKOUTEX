import { useEffect, useState, useCallback } from 'react';
import {
  TransferTarget,
  CreateTargetInput,
  UpdateTargetInput,
  TargetStatus,
  TargetPriority,
} from '@/lib/targets/types';

interface UseTargetsResult {
  targets: TransferTarget[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  createTarget: (input: CreateTargetInput) => Promise<TransferTarget>;
  updateTarget: (id: string, input: UpdateTargetInput) => Promise<TransferTarget>;
  deleteTarget: (id: string) => Promise<void>;
}

/**
 * Hook to fetch and manage transfer targets
 */
export function useTargets(filters?: {
  status?: TargetStatus;
  priority?: TargetPriority;
}): UseTargetsResult {
  const [targets, setTargets] = useState<TransferTarget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTargets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query params
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.priority) params.append('priority', filters.priority);

      const url = `/api/targets${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch targets: ${response.statusText}`);
      }

      const data = await response.json();
      setTargets(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setTargets([]);
    } finally {
      setLoading(false);
    }
  }, [filters?.status, filters?.priority]);

  const createTarget = useCallback(
    async (input: CreateTargetInput): Promise<TransferTarget> => {
      const response = await fetch('/api/targets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create target');
      }

      const result = await response.json();
      await fetchTargets(); // Refresh list
      return result.data;
    },
    [fetchTargets]
  );

  const updateTarget = useCallback(
    async (id: string, input: UpdateTargetInput): Promise<TransferTarget> => {
      const response = await fetch(`/api/targets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update target');
      }

      const result = await response.json();
      await fetchTargets(); // Refresh list
      return result.data;
    },
    [fetchTargets]
  );

  const deleteTarget = useCallback(
    async (id: string): Promise<void> => {
      const response = await fetch(`/api/targets/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete target');
      }

      await fetchTargets(); // Refresh list
    },
    [fetchTargets]
  );

  useEffect(() => {
    fetchTargets();
  }, [fetchTargets]);

  return {
    targets,
    loading,
    error,
    refetch: fetchTargets,
    createTarget,
    updateTarget,
    deleteTarget,
  };
}

/**
 * Hook to fetch a single target by ID
 */
export function useTarget(id: string | null) {
  const [target, setTarget] = useState<TransferTarget | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setTarget(null);
      return;
    }

    const fetchTarget = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/targets/${id}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch target: ${response.statusText}`);
        }

        const data = await response.json();
        setTarget(data.data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setTarget(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTarget();
  }, [id]);

  return { target, loading, error };
}
