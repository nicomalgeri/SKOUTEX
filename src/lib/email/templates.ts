/**
 * Email Templates
 * HTML templates for notification emails
 */

import type { Notification } from "../notifications/types";

/**
 * Generate the email header HTML
 */
function getEmailHeader(): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>SKOUTEX Notifications</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          background-color: #f5f5f5;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
        }
        .header {
          background-color: #0031FF;
          padding: 32px 24px;
          text-align: center;
        }
        .logo {
          color: #ffffff;
          font-size: 24px;
          font-weight: 700;
          margin: 0;
        }
        .content {
          padding: 32px 24px;
        }
        .greeting {
          font-size: 18px;
          color: #2C2C2C;
          margin: 0 0 16px 0;
        }
        .intro {
          font-size: 14px;
          color: #666666;
          margin: 0 0 24px 0;
          line-height: 1.5;
        }
        .notification {
          background-color: #f9f9f9;
          border-left: 4px solid #0031FF;
          padding: 16px;
          margin-bottom: 16px;
          border-radius: 4px;
        }
        .notification-icon {
          font-size: 20px;
          margin-bottom: 8px;
        }
        .notification-title {
          font-size: 16px;
          font-weight: 600;
          color: #2C2C2C;
          margin: 0 0 8px 0;
        }
        .notification-message {
          font-size: 14px;
          color: #666666;
          margin: 0 0 8px 0;
          line-height: 1.5;
        }
        .notification-time {
          font-size: 12px;
          color: #999999;
          margin: 0;
        }
        .notification-link {
          display: inline-block;
          margin-top: 12px;
          padding: 8px 16px;
          background-color: #0031FF;
          color: #ffffff;
          text-decoration: none;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 500;
        }
        .footer {
          padding: 24px;
          text-align: center;
          background-color: #f9f9f9;
          border-top: 1px solid #e0e0e0;
        }
        .footer-text {
          font-size: 12px;
          color: #999999;
          margin: 0 0 8px 0;
        }
        .footer-link {
          color: #0031FF;
          text-decoration: none;
        }
        .cta-button {
          display: inline-block;
          margin: 24px 0;
          padding: 12px 32px;
          background-color: #0031FF;
          color: #ffffff;
          text-decoration: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
        }
        .unread-badge {
          display: inline-block;
          background-color: #0031FF;
          color: #ffffff;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          margin-left: 8px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="logo">SKOUTEX</h1>
        </div>
        <div class="content">
  `;
}

/**
 * Generate the email footer HTML
 */
function getEmailFooter(unsubscribeLink: string): string {
  return `
        </div>
        <div class="footer">
          <p class="footer-text">
            You're receiving this email because you have notifications enabled in your SKOUTEX account.
          </p>
          <p class="footer-text">
            <a href="${unsubscribeLink}" class="footer-link">Manage notification preferences</a>
          </p>
          <p class="footer-text">
            © ${new Date().getFullYear()} SKOUTEX. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Get icon emoji for notification type
 */
function getNotificationIconEmoji(type: string): string {
  const icons: Record<string, string> = {
    watchlist_price_change: "💰",
    watchlist_contract_update: "📝",
    watchlist_transfer_news: "🔄",
    watchlist_performance_update: "⚡",
    target_status_change: "🎯",
    transfer_window_alert: "⏰",
    system_announcement: "📢",
  };
  return icons[type] || "🔔";
}

/**
 * Format notification time for email
 */
function formatNotificationTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return "Less than 1 hour ago";
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
  if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Generate notification HTML
 */
function renderNotification(notification: Notification, baseUrl: string): string {
  const icon = getNotificationIconEmoji(notification.type);
  const time = formatNotificationTime(notification.created_at);
  const link = notification.data?.link || `/dashboard/notifications`;
  const fullLink = `${baseUrl}${link}`;

  return `
    <div class="notification">
      <div class="notification-icon">${icon}</div>
      <h3 class="notification-title">${notification.title}</h3>
      ${notification.message ? `<p class="notification-message">${notification.message}</p>` : ""}
      <p class="notification-time">${time}</p>
      <a href="${fullLink}" class="notification-link">View Details</a>
    </div>
  `;
}

/**
 * Generate daily digest email
 */
export function generateDailyDigestEmail(
  notifications: Notification[],
  unreadCount: number,
  baseUrl: string,
  unsubscribeLink: string
): string {
  const header = getEmailHeader();
  const footer = getEmailFooter(unsubscribeLink);

  const greeting = `<h2 class="greeting">Your Daily Digest</h2>`;

  const intro = `
    <p class="intro">
      You have <strong>${unreadCount}</strong> unread notification${unreadCount === 1 ? "" : "s"}
      from the last 24 hours. Here's what you missed:
    </p>
  `;

  const notificationsHtml = notifications
    .map((notification) => renderNotification(notification, baseUrl))
    .join("");

  const cta = `
    <div style="text-align: center;">
      <a href="${baseUrl}/dashboard/notifications" class="cta-button">
        View All Notifications
      </a>
    </div>
  `;

  return header + greeting + intro + notificationsHtml + cta + footer;
}

/**
 * Generate weekly digest email
 */
export function generateWeeklyDigestEmail(
  notifications: Notification[],
  unreadCount: number,
  baseUrl: string,
  unsubscribeLink: string
): string {
  const header = getEmailHeader();
  const footer = getEmailFooter(unsubscribeLink);

  const greeting = `<h2 class="greeting">Your Weekly Digest</h2>`;

  const intro = `
    <p class="intro">
      Here's your weekly summary with <strong>${unreadCount}</strong> unread notification${unreadCount === 1 ? "" : "s"}
      from the last 7 days:
    </p>
  `;

  // Group notifications by type
  const groupedNotifications = notifications.reduce((acc, notification) => {
    if (!acc[notification.type]) {
      acc[notification.type] = [];
    }
    acc[notification.type].push(notification);
    return acc;
  }, {} as Record<string, Notification[]>);

  const summaryHtml = Object.entries(groupedNotifications)
    .map(([type, notifs]) => {
      const icon = getNotificationIconEmoji(type);
      const typeTitle = type
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      return `
        <div style="margin-bottom: 24px;">
          <h3 style="color: #2C2C2C; font-size: 16px; margin: 0 0 12px 0;">
            ${icon} ${typeTitle} <span class="unread-badge">${notifs.length}</span>
          </h3>
          ${notifs.slice(0, 3).map((n) => renderNotification(n, baseUrl)).join("")}
          ${notifs.length > 3 ? `<p style="font-size: 12px; color: #999999; margin-top: 8px;">...and ${notifs.length - 3} more</p>` : ""}
        </div>
      `;
    })
    .join("");

  const cta = `
    <div style="text-align: center;">
      <a href="${baseUrl}/dashboard/notifications" class="cta-button">
        View All Notifications
      </a>
    </div>
  `;

  return header + greeting + intro + summaryHtml + cta + footer;
}

/**
 * Generate instant notification email
 */
export function generateInstantNotificationEmail(
  notification: Notification,
  baseUrl: string,
  unsubscribeLink: string
): string {
  const header = getEmailHeader();
  const footer = getEmailFooter(unsubscribeLink);

  const greeting = `<h2 class="greeting">New Notification</h2>`;

  const notificationHtml = renderNotification(notification, baseUrl);

  const cta = `
    <div style="text-align: center;">
      <a href="${baseUrl}/dashboard/notifications" class="cta-button">
        View All Notifications
      </a>
    </div>
  `;

  return header + greeting + notificationHtml + cta + footer;
}
