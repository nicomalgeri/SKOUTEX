type WhatsAppProvider = {
  sendMessage: (to: string, text: string) => Promise<void>;
};

function createMockProvider(): WhatsAppProvider {
  return {
    async sendMessage(to: string, text: string) {
      if (process.env.NODE_ENV !== "production") {
        console.log("[whatsapp:mock] sendMessage", { to, text });
      }
    },
  };
}

function getWhatsAppProvider(): WhatsAppProvider {
  const provider = process.env.WHATSAPP_PROVIDER ?? "mock";

  if (provider === "mock") {
    return createMockProvider();
  }

  // Implemented in STEP 8.
  return createMockProvider();
}

export async function sendMessage(to: string, text: string) {
  const provider = getWhatsAppProvider();
  await provider.sendMessage(to, text);
}
