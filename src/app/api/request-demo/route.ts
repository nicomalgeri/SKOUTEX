import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, company, email, date, time } = body;

    // Validate required fields
    if (!name || !company || !email || !date || !time) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Format date and time for display
    const dateObj = new Date(date + "T12:00:00");
    const formattedDate = dateObj.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const [hours, minutes] = time.split(":").map(Number);
    const timeDate = new Date();
    timeDate.setHours(hours, minutes);
    const formattedTime = timeDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    // Create confirm URL with encoded data
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://skoutex.com";
    const confirmData = Buffer.from(JSON.stringify({ name, company, email, date, time })).toString("base64");
    const confirmUrl = `${baseUrl}/api/confirm-demo?data=${encodeURIComponent(confirmData)}`;

    // Create transporter using SMTP
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Send notification email to team
    await transporter.sendMail({
      from: `"SKOUTEX Bookings" <team@skoutex.com>`,
      to: "team@skoutex.com",
      subject: `New Demo Request - ${name} from ${company}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f6f6f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f6f6; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">

                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%); padding: 40px 40px 30px 40px; text-align: center;">
                      <img src="https://skoutex.com/skoutex-logo.svg" alt="SKOUTEX" width="140" style="display: block; margin: 0 auto 20px auto;">
                      <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0; letter-spacing: -0.5px;">New Demo Request</h1>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <!-- Contact Info -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 12px; margin-bottom: 24px;">
                        <tr>
                          <td style="padding: 24px;">
                            <p style="margin: 0 0 4px 0; color: #888888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Contact</p>
                            <p style="margin: 0 0 8px 0; color: #2C2C2C; font-size: 20px; font-weight: 600;">${name}</p>
                            <p style="margin: 0 0 4px 0; color: #666666; font-size: 15px;">${company}</p>
                            <a href="mailto:${email}" style="color: #0031FF; font-size: 15px; text-decoration: none;">${email}</a>
                          </td>
                        </tr>
                      </table>

                      <!-- Requested Time -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="border: 2px solid #0031FF; border-radius: 12px; margin-bottom: 30px;">
                        <tr>
                          <td style="padding: 24px; background: linear-gradient(135deg, rgba(0, 49, 255, 0.05) 0%, rgba(0, 80, 255, 0.02) 100%);">
                            <p style="margin: 0 0 4px 0; color: #0031FF; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Requested Time</p>
                            <p style="margin: 0 0 4px 0; color: #2C2C2C; font-size: 18px; font-weight: 600;">${formattedDate}</p>
                            <p style="margin: 0; color: #666666; font-size: 16px;">${formattedTime} (Europe/Madrid) - 25 min</p>
                          </td>
                        </tr>
                      </table>

                      <!-- Accept Button -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center">
                            <a href="${confirmUrl}" style="display: inline-block; background: linear-gradient(135deg, #0031FF 0%, #0050FF 100%); color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 16px 48px; border-radius: 12px; box-shadow: 0 4px 14px rgba(0, 49, 255, 0.3);">
                              Accept & Confirm Demo
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p style="color: #888888; font-size: 13px; text-align: center; margin: 24px 0 0 0;">
                        Clicking accept will create a Google Calendar event and send a confirmation email to the lead.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 24px 40px; text-align: center; border-top: 1px solid #e9ecef;">
                      <p style="color: #888888; font-size: 12px; margin: 0;">
                        SKOUTEX | AI Agents for Football Intelligence
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    return NextResponse.json(
      { message: "Demo request sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending demo request:", error);
    return NextResponse.json(
      { error: "Failed to send demo request" },
      { status: 500 }
    );
  }
}
