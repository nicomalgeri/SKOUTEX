import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import nodemailer from "nodemailer";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

const calendar = google.calendar({ version: "v3", auth: oauth2Client });

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const encodedData = searchParams.get("data");

    if (!encodedData) {
      return new NextResponse(generateErrorPage("Missing booking data"), {
        status: 400,
        headers: { "Content-Type": "text/html" },
      });
    }

    // Decode the booking data
    let bookingData;
    try {
      bookingData = JSON.parse(Buffer.from(encodedData, "base64").toString());
    } catch {
      return new NextResponse(generateErrorPage("Invalid booking data"), {
        status: 400,
        headers: { "Content-Type": "text/html" },
      });
    }

    const { name, company, email, date, time } = bookingData;

    if (!name || !company || !email || !date || !time) {
      return new NextResponse(generateErrorPage("Incomplete booking data"), {
        status: 400,
        headers: { "Content-Type": "text/html" },
      });
    }

    // Parse date and time
    const [year, month, day] = date.split("-").map(Number);
    const [hours, minutes] = time.split(":").map(Number);

    const startDateTime = new Date(year, month - 1, day, hours, minutes);
    const endDateTime = new Date(startDateTime.getTime() + 25 * 60 * 1000); // 25 minutes

    // Create calendar event
    const event = {
      summary: `SKOUTEX Demo - ${company}`,
      description: `Demo call with ${name} from ${company}\n\nContact: ${email}`,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: "Europe/Madrid",
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: "Europe/Madrid",
      },
      attendees: [
        { email: email },
        { email: "team@skoutex.com" },
      ],
      conferenceData: {
        createRequest: {
          requestId: `skoutex-demo-${Date.now()}`,
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 60 },
          { method: "popup", minutes: 10 },
        ],
      },
    };

    const calendarEvent = await calendar.events.insert({
      calendarId: "primary",
      requestBody: event,
      conferenceDataVersion: 1,
      sendUpdates: "all",
    });

    const meetLink = calendarEvent.data.conferenceData?.entryPoints?.[0]?.uri || "";

    // Format date and time for emails
    const formattedDate = startDateTime.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const formattedTime = startDateTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

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

    // Send confirmation email to the customer
    await transporter.sendMail({
      from: `"SKOUTEX" <team@skoutex.com>`,
      to: email,
      subject: `Your SKOUTEX Demo is Confirmed - ${formattedDate}`,
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
                      <img src="https://skoutex.com/skoutex-logo.svg" alt="SKOUTEX" width="160" style="display: block; margin: 0 auto 20px auto;">
                      <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 0; letter-spacing: -0.5px;">Demo Confirmed!</h1>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <p style="color: #2C2C2C; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                        Hi <strong>${name}</strong>,
                      </p>
                      <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                        Great news! Your demo with SKOUTEX has been confirmed. We're excited to show you how our AI agents can transform your football intelligence operations.
                      </p>

                      <!-- Meeting Details Card -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 12px; margin-bottom: 30px;">
                        <tr>
                          <td style="padding: 24px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="padding: 8px 0;">
                                  <span style="color: #888888; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Date</span><br>
                                  <span style="color: #2C2C2C; font-size: 16px; font-weight: 600;">${formattedDate}</span>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0; border-top: 1px solid #e9ecef;">
                                  <span style="color: #888888; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Time</span><br>
                                  <span style="color: #2C2C2C; font-size: 16px; font-weight: 600;">${formattedTime} (Europe/Madrid)</span>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0; border-top: 1px solid #e9ecef;">
                                  <span style="color: #888888; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Duration</span><br>
                                  <span style="color: #2C2C2C; font-size: 16px; font-weight: 600;">25 minutes</span>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>

                      ${meetLink ? `
                      <!-- Join Button -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                        <tr>
                          <td align="center">
                            <a href="${meetLink}" style="display: inline-block; background: linear-gradient(135deg, #0031FF 0%, #0050FF 100%); color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 16px 40px; border-radius: 12px; box-shadow: 0 4px 14px rgba(0, 49, 255, 0.3);">
                              Join Video Call
                            </a>
                          </td>
                        </tr>
                      </table>
                      ` : ""}

                      <p style="color: #888888; font-size: 14px; line-height: 1.6; margin: 0;">
                        A calendar invite has been sent to your email. If you need to reschedule, simply reply to this email.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 30px 40px; text-align: center; border-top: 1px solid #e9ecef;">
                      <p style="color: #888888; font-size: 13px; margin: 0 0 10px 0;">
                        AI Agents for Football Intelligence
                      </p>
                      <p style="color: #aaaaaa; font-size: 12px; margin: 0;">
                        <a href="https://skoutex.com" style="color: #0031FF; text-decoration: none;">skoutex.com</a>
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

    // Return success page
    return new NextResponse(generateSuccessPage(name, company, formattedDate, formattedTime, meetLink), {
      status: 200,
      headers: { "Content-Type": "text/html" },
    });
  } catch (error) {
    console.error("Error confirming demo:", error);
    return new NextResponse(generateErrorPage("Failed to confirm demo. Please try again or contact support."), {
      status: 500,
      headers: { "Content-Type": "text/html" },
    });
  }
}

function generateSuccessPage(name: string, company: string, date: string, time: string, meetLink: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Demo Confirmed - SKOUTEX</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f6f6f6; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .card { background: white; border-radius: 24px; padding: 48px; max-width: 500px; width: 100%; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
        .logo { width: 160px; margin-bottom: 32px; }
        .success-icon { width: 64px; height: 64px; background: linear-gradient(135deg, #10B981, #059669); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; }
        .success-icon svg { width: 32px; height: 32px; color: white; }
        h1 { font-size: 28px; color: #2C2C2C; margin-bottom: 16px; }
        .details { background: #f8f9fa; border-radius: 16px; padding: 24px; margin: 24px 0; text-align: left; }
        .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { color: #888; font-size: 14px; }
        .detail-value { color: #2C2C2C; font-weight: 600; font-size: 14px; }
        .message { color: #666; font-size: 15px; line-height: 1.6; margin-bottom: 24px; }
        .btn { display: inline-block; background: linear-gradient(135deg, #0031FF, #0050FF); color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 15px; }
        .btn:hover { opacity: 0.9; }
      </style>
    </head>
    <body>
      <div class="card">
        <img src="https://skoutex.com/skoutex-logo-blue.svg" alt="SKOUTEX" class="logo">
        <div class="success-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
        </div>
        <h1>Demo Confirmed!</h1>
        <p class="message">The demo with <strong>${name}</strong> from <strong>${company}</strong> has been confirmed. A calendar invite and confirmation email have been sent.</p>
        <div class="details">
          <div class="detail-row">
            <span class="detail-label">Date</span>
            <span class="detail-value">${date}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Time</span>
            <span class="detail-value">${time} (Europe/Madrid)</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Duration</span>
            <span class="detail-value">25 minutes</span>
          </div>
        </div>
        ${meetLink ? `<a href="${meetLink}" class="btn">Open Google Meet</a>` : ""}
      </div>
    </body>
    </html>
  `;
}

function generateErrorPage(message: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Error - SKOUTEX</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f6f6f6; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .card { background: white; border-radius: 24px; padding: 48px; max-width: 500px; width: 100%; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
        .logo { width: 160px; margin-bottom: 32px; }
        .error-icon { width: 64px; height: 64px; background: linear-gradient(135deg, #EF4444, #DC2626); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; }
        .error-icon svg { width: 32px; height: 32px; color: white; }
        h1 { font-size: 28px; color: #2C2C2C; margin-bottom: 16px; }
        .message { color: #666; font-size: 15px; line-height: 1.6; }
      </style>
    </head>
    <body>
      <div class="card">
        <img src="https://skoutex.com/skoutex-logo-blue.svg" alt="SKOUTEX" class="logo">
        <div class="error-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </div>
        <h1>Something went wrong</h1>
        <p class="message">${message}</p>
      </div>
    </body>
    </html>
  `;
}
