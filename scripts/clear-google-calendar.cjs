const { google } = require("googleapis");

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing env var: ${name}`);
  }
  return value;
}

async function listAllEvents(calendar, calendarId) {
  const events = [];
  let pageToken;

  do {
    const response = await calendar.events.list({
      calendarId,
      maxResults: 2500,
      pageToken,
      singleEvents: true,
      showDeleted: false,
    });
    events.push(...(response.data.items || []));
    pageToken = response.data.nextPageToken;
  } while (pageToken);

  return events;
}

async function main() {
  if (process.env.CLEAR_CALENDAR_CONFIRM !== "YES") {
    console.error(
      "Refusing to delete events. Set CLEAR_CALENDAR_CONFIRM=YES to continue."
    );
    process.exit(1);
  }

  const clientId = requiredEnv("GOOGLE_CLIENT_ID");
  const clientSecret = requiredEnv("GOOGLE_CLIENT_SECRET");
  const redirectUri = requiredEnv("GOOGLE_REDIRECT_URI");
  const refreshToken = requiredEnv("GOOGLE_REFRESH_TOKEN");

  const calendarId = process.env.CALENDAR_ID || "primary";

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri
  );
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  const events = await listAllEvents(calendar, calendarId);

  if (events.length === 0) {
    console.log(`No events found in calendar: ${calendarId}`);
    return;
  }

  let deleted = 0;
  for (const event of events) {
    if (!event.id) continue;
    await calendar.events.delete({ calendarId, eventId: event.id });
    deleted += 1;
  }

  console.log(`Deleted ${deleted} events from calendar: ${calendarId}`);
}

main().catch((error) => {
  console.error("Failed to clear calendar:", error);
  process.exit(1);
});
