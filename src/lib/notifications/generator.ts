/**
 * Notification Generator
 * Creates notifications based on watchlist changes
 */

import { createClient } from "@/lib/supabase/server";
import { CreateNotificationInput, NotificationData, Notification } from "./types";
import { sendInstantNotification } from "@/lib/email/sender";

/**
 * Create a notification for a user
 */
export async function createNotification(input: CreateNotificationInput): Promise<boolean> {
  try {
    const supabase = await createClient();

    const { data: notification, error } = await supabase
      .from("notifications")
      .insert({
        user_id: input.user_id,
        type: input.type,
        title: input.title,
        message: input.message || null,
        data: input.data || {},
        related_player_id: input.related_player_id || null,
        related_target_id: input.related_target_id || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to create notification:", error);
      return false;
    }

    // Check if user wants instant email notifications
    const prefs = await getUserNotificationPreferences(input.user_id);
    if (prefs.email_instant_enabled) {
      // Get user email
      const { data: authUser } = await supabase.auth.admin.getUserById(input.user_id);

      if (authUser?.user?.email && notification) {
        // Send instant email notification (don't await - let it run in background)
        sendInstantNotification(
          authUser.user.email,
          input.user_id,
          notification as Notification
        ).catch((error) => {
          console.error("Failed to send instant email:", error);
        });
      }
    }

    return true;
  } catch (error) {
    console.error("Error creating notification:", error);
    return false;
  }
}

/**
 * Generate notification for price change
 */
export async function notifyPriceChange(
  userId: string,
  playerId: number,
  playerName: string,
  oldPrice: number,
  newPrice: number
): Promise<boolean> {
  const changePercent = ((newPrice - oldPrice) / oldPrice) * 100;
  const direction = changePercent > 0 ? "increased" : "decreased";
  const absPercent = Math.abs(changePercent).toFixed(1);

  const data: NotificationData = {
    old_price: oldPrice,
    new_price: newPrice,
    change_percent: changePercent,
    player_name: playerName,
    player_id: playerId,
    link: `/dashboard/players/${playerId}`,
  };

  return createNotification({
    user_id: userId,
    type: "watchlist_price_change",
    title: `${playerName}'s market value ${direction}`,
    message: `Market value ${direction} by ${absPercent}% from €${formatPrice(oldPrice)} to €${formatPrice(newPrice)}`,
    data,
    related_player_id: playerId,
  });
}

/**
 * Generate notification for contract update
 */
export async function notifyContractUpdate(
  userId: string,
  playerId: number,
  playerName: string,
  contractExpiry: string
): Promise<boolean> {
  const expiryDate = new Date(contractExpiry);
  const now = new Date();
  const daysUntil = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  const data: NotificationData = {
    contract_expires: contractExpiry,
    days_until_expiry: daysUntil,
    player_name: playerName,
    player_id: playerId,
    link: `/dashboard/players/${playerId}`,
  };

  let message = "";
  if (daysUntil <= 180) {
    message = `Contract expires in ${Math.floor(daysUntil / 30)} months - potential free agent`;
  } else {
    message = `Contract updated - expires ${expiryDate.toLocaleDateString()}`;
  }

  return createNotification({
    user_id: userId,
    type: "watchlist_contract_update",
    title: `${playerName}'s contract status updated`,
    message,
    data,
    related_player_id: playerId,
  });
}

/**
 * Generate notification for transfer news
 */
export async function notifyTransferNews(
  userId: string,
  playerId: number,
  playerName: string,
  fromClub: string,
  toClub: string,
  transferFee?: number
): Promise<boolean> {
  const data: NotificationData = {
    from_club: fromClub,
    to_club: toClub,
    transfer_fee: transferFee,
    player_name: playerName,
    player_id: playerId,
    link: `/dashboard/players/${playerId}`,
  };

  let message = `Transferred from ${fromClub} to ${toClub}`;
  if (transferFee) {
    message += ` for €${formatPrice(transferFee)}`;
  }

  return createNotification({
    user_id: userId,
    type: "watchlist_transfer_news",
    title: `${playerName} has transferred clubs`,
    message,
    data,
    related_player_id: playerId,
  });
}

/**
 * Generate notification for performance update
 */
export async function notifyPerformanceUpdate(
  userId: string,
  playerId: number,
  playerName: string,
  goals: number,
  assists: number,
  rating: number
): Promise<boolean> {
  const data: NotificationData = {
    goals,
    assists,
    rating,
    player_name: playerName,
    player_id: playerId,
    link: `/dashboard/players/${playerId}`,
  };

  return createNotification({
    user_id: userId,
    type: "watchlist_performance_update",
    title: `${playerName} - New performance stats`,
    message: `${goals} goals, ${assists} assists - Rating: ${rating.toFixed(1)}`,
    data,
    related_player_id: playerId,
  });
}

/**
 * Generate notification for transfer window alert
 */
export async function notifyTransferWindowAlert(
  userId: string,
  league: string,
  daysRemaining: number
): Promise<boolean> {
  const data = {
    league,
    days_remaining: daysRemaining,
    link: "/dashboard/targets",
  };

  let message = "";
  if (daysRemaining <= 3) {
    message = `Only ${daysRemaining} days left! Finalize your targets now.`;
  } else if (daysRemaining <= 7) {
    message = `${daysRemaining} days remaining. Time to make decisions.`;
  } else {
    message = `Transfer window for ${league} opens in ${daysRemaining} days.`;
  }

  return createNotification({
    user_id: userId,
    type: "transfer_window_alert",
    title: `${league} Transfer Window Alert`,
    message,
    data,
  });
}

/**
 * Helper to format price
 */
function formatPrice(price: number): string {
  if (price >= 1000000) {
    return `${(price / 1000000).toFixed(1)}M`;
  }
  if (price >= 1000) {
    return `${(price / 1000).toFixed(0)}K`;
  }
  return price.toFixed(0);
}

/**
 * Get user's notification preferences
 */
export async function getUserNotificationPreferences(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    // Return default preferences if not found
    return {
      email_digest_enabled: true,
      email_digest_frequency: "daily",
      email_digest_daily: true,
      email_digest_weekly: false,
      email_instant_enabled: false,
      watchlist_price_change: true,
      watchlist_contract_update: true,
      watchlist_transfer_news: true,
      watchlist_performance_update: true,
      target_status_change: true,
      transfer_window_alert: true,
    };
  }

  return data;
}
