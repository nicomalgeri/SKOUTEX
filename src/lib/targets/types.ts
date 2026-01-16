/**
 * Transfer targets types and enums
 */

export type TargetPriority = 'high' | 'medium' | 'low';

export type TargetStatus =
  | 'scouting'
  | 'interested'
  | 'negotiating'
  | 'offer_made'
  | 'agreed'
  | 'completed'
  | 'rejected'
  | 'abandoned';

export interface TransferTarget {
  id: string;
  club_id: string;
  user_id: string;

  // Player info
  player_id: number;
  player_name: string;
  current_club: string | null;
  position: string | null;
  age: number | null;
  nationality: string | null;
  market_value_eur: number | null;

  // Target details
  priority: TargetPriority;
  target_price_eur: number | null;
  max_price_eur: number | null;
  notes: string | null;

  // Status
  status: TargetStatus;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface CreateTargetInput {
  player_id: number;
  player_name: string;
  current_club?: string;
  position?: string;
  age?: number;
  nationality?: string;
  market_value_eur?: number;
  priority: TargetPriority;
  target_price_eur?: number;
  max_price_eur?: number;
  notes?: string;
  status?: TargetStatus;
}

export interface UpdateTargetInput {
  priority?: TargetPriority;
  target_price_eur?: number;
  max_price_eur?: number;
  notes?: string;
  status?: TargetStatus;
}

export const TARGET_PRIORITIES: { value: TargetPriority; label: string; color: string }[] = [
  { value: 'high', label: 'High Priority', color: 'text-red-600 bg-red-50' },
  { value: 'medium', label: 'Medium Priority', color: 'text-amber-600 bg-amber-50' },
  { value: 'low', label: 'Low Priority', color: 'text-gray-600 bg-gray-50' },
];

export const TARGET_STATUSES: { value: TargetStatus; label: string; color: string }[] = [
  { value: 'scouting', label: 'Scouting', color: 'text-blue-600 bg-blue-50' },
  { value: 'interested', label: 'Interested', color: 'text-purple-600 bg-purple-50' },
  { value: 'negotiating', label: 'Negotiating', color: 'text-orange-600 bg-orange-50' },
  { value: 'offer_made', label: 'Offer Made', color: 'text-yellow-600 bg-yellow-50' },
  { value: 'agreed', label: 'Agreed', color: 'text-green-600 bg-green-50' },
  { value: 'completed', label: 'Completed', color: 'text-green-700 bg-green-100' },
  { value: 'rejected', label: 'Rejected', color: 'text-red-600 bg-red-50' },
  { value: 'abandoned', label: 'Abandoned', color: 'text-gray-600 bg-gray-50' },
];

export function getTargetPriorityInfo(priority: TargetPriority) {
  return TARGET_PRIORITIES.find((p) => p.value === priority) || TARGET_PRIORITIES[1];
}

export function getTargetStatusInfo(status: TargetStatus) {
  return TARGET_STATUSES.find((s) => s.value === status) || TARGET_STATUSES[0];
}
