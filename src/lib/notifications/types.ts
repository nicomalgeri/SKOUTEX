/**
 * Notification Types and Interfaces
 */

export type NotificationType =
  | "watchlist_price_change"
  | "watchlist_contract_update"
  | "watchlist_transfer_news"
  | "watchlist_performance_update"
  | "target_status_change"
  | "transfer_window_alert"
  | "system_announcement";

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message?: string | null;
  data: Record<string, any>;
  related_player_id?: number | null;
  related_target_id?: string | null;
  read: boolean;
  created_at: string;
  read_at?: string | null;
}

export interface NotificationPreferences {
  user_id: string;
  email_digest_enabled: boolean;
  email_digest_frequency: "daily" | "weekly" | "never";
  email_digest_daily: boolean;
  email_digest_weekly: boolean;
  email_instant_enabled: boolean;
  watchlist_price_change: boolean;
  watchlist_contract_update: boolean;
  watchlist_transfer_news: boolean;
  watchlist_performance_update: boolean;
  target_status_change: boolean;
  transfer_window_alert: boolean;
  last_digest_sent_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateNotificationInput {
  user_id: string;
  type: NotificationType;
  title: string;
  message?: string;
  data?: Record<string, any>;
  related_player_id?: number;
  related_target_id?: string;
}

export interface NotificationData {
  // For price changes
  old_price?: number;
  new_price?: number;
  change_percent?: number;

  // For contract updates
  contract_expires?: string;
  days_until_expiry?: number;

  // For transfer news
  from_club?: string;
  to_club?: string;
  transfer_fee?: number;

  // For performance updates
  goals?: number;
  assists?: number;
  rating?: number;

  // General
  player_name?: string;
  player_id?: number;
  link?: string;
}

/**
 * Notification display helpers
 */
export function getNotificationIcon(type: NotificationType): string {
  const icons: Record<NotificationType, string> = {
    watchlist_price_change: "💰",
    watchlist_contract_update: "📝",
    watchlist_transfer_news: "🔄",
    watchlist_performance_update: "⚡",
    target_status_change: "🎯",
    transfer_window_alert: "⏰",
    system_announcement: "📢",
  };
  return icons[type];
}

export function getNotificationColor(type: NotificationType): string {
  const colors: Record<NotificationType, string> = {
    watchlist_price_change: "text-green-600",
    watchlist_contract_update: "text-blue-600",
    watchlist_transfer_news: "text-purple-600",
    watchlist_performance_update: "text-yellow-600",
    target_status_change: "text-orange-600",
    transfer_window_alert: "text-red-600",
    system_announcement: "text-gray-600",
  };
  return colors[type];
}
