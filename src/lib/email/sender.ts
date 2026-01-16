/**
 * Email Sender
 * Handles sending emails via nodemailer
 */

import nodemailer from "nodemailer";
import type { Notification } from "../notifications/types";
import {
  generateDailyDigestEmail,
  generateWeeklyDigestEmail,
  generateInstantNotificationEmail,
} from "./templates";

/**
 * Get email transporter
 */
function getTransporter() {
  // For production, use your email service (SendGrid, AWS SES, etc.)
  // For development, use Ethereal (test email service)
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction) {
    // Production configuration (example for SendGrid)
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.sendgrid.net",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  } else {
    // Development configuration (Ethereal)
    // In real dev, you'd create test account on first run
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: process.env.ETHEREAL_USER || "test@ethereal.email",
        pass: process.env.ETHEREAL_PASSWORD || "test",
      },
    });
  }
}

/**
 * Get base URL for links in emails
 */
function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

/**
 * Get unsubscribe link
 */
function getUnsubscribeLink(userId: string): string {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/settings/notifications?user=${userId}`;
}

/**
 * Send daily digest email
 */
export async function sendDailyDigest(
  userEmail: string,
  userId: string,
  notifications: Notification[],
  unreadCount: number
): Promise<boolean> {
  try {
    if (notifications.length === 0) {
      return true; // No notifications to send
    }

    const transporter = getTransporter();
    const baseUrl = getBaseUrl();
    const unsubscribeLink = getUnsubscribeLink(userId);

    const html = generateDailyDigestEmail(
      notifications,
      unreadCount,
      baseUrl,
      unsubscribeLink
    );

    const info = await transporter.sendMail({
      from: '"SKOUTEX" <notifications@skoutex.com>',
      to: userEmail,
      subject: `Daily Digest: ${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`,
      html,
    });

    console.log("Daily digest sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Failed to send daily digest:", error);
    return false;
  }
}

/**
 * Send weekly digest email
 */
export async function sendWeeklyDigest(
  userEmail: string,
  userId: string,
  notifications: Notification[],
  unreadCount: number
): Promise<boolean> {
  try {
    if (notifications.length === 0) {
      return true; // No notifications to send
    }

    const transporter = getTransporter();
    const baseUrl = getBaseUrl();
    const unsubscribeLink = getUnsubscribeLink(userId);

    const html = generateWeeklyDigestEmail(
      notifications,
      unreadCount,
      baseUrl,
      unsubscribeLink
    );

    const info = await transporter.sendMail({
      from: '"SKOUTEX" <notifications@skoutex.com>',
      to: userEmail,
      subject: `Weekly Digest: ${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`,
      html,
    });

    console.log("Weekly digest sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Failed to send weekly digest:", error);
    return false;
  }
}

/**
 * Send instant notification email
 */
export async function sendInstantNotification(
  userEmail: string,
  userId: string,
  notification: Notification
): Promise<boolean> {
  try {
    const transporter = getTransporter();
    const baseUrl = getBaseUrl();
    const unsubscribeLink = getUnsubscribeLink(userId);

    const html = generateInstantNotificationEmail(
      notification,
      baseUrl,
      unsubscribeLink
    );

    const info = await transporter.sendMail({
      from: '"SKOUTEX" <notifications@skoutex.com>',
      to: userEmail,
      subject: notification.title,
      html,
    });

    console.log("Instant notification sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Failed to send instant notification:", error);
    return false;
  }
}

/**
 * Send test email
 */
export async function sendTestEmail(userEmail: string): Promise<boolean> {
  try {
    const transporter = getTransporter();

    const info = await transporter.sendMail({
      from: '"SKOUTEX" <notifications@skoutex.com>',
      to: userEmail,
      subject: "Test Email from SKOUTEX",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #0031FF;">Test Email</h1>
          <p>This is a test email from SKOUTEX to verify email sending is working correctly.</p>
          <p>If you received this email, your email configuration is working properly.</p>
        </div>
      `,
    });

    console.log("Test email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Failed to send test email:", error);
    return false;
  }
}
