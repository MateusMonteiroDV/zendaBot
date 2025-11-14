
import { container } from "./container.js";
import makeWASocket, { DisconnectReason, Browsers } from "@whiskeysockets/baileys";
import qrcode from "qrcode-terminal";
import { Boom } from "@hapi/boom";
import { useMongoAuthState } from "./infrastructure/MongoAuthState.js";

export async function createSocket(number: string) {
  const { state, saveCreds } = await useMongoAuthState(number);

  const sock = makeWASocket({
    auth: state,
    browser: Browsers.ubuntu("Chrome"),
    printQRInTerminal: false,
  });

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (connection === "close") {
      const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
      if (statusCode === DisconnectReason.loggedOut || statusCode !== DisconnectReason.loggedOut) {
        createSocket(number);
      }
    } else if (connection === "open") {
      console.log(`[${number}] ✅ WhatsApp connection opened`);
    }

    if (qr) qrcode.generate(qr, { small: true });
  });

sock.ev.on("messages.upsert", async (m) => {
  console.log("Received upsert:", m);

  if (!m.messages || m.messages.length === 0) {
    console.log("No messages found");
    return;
  }
  if (!sock || !sock.user) {
    console.log("Socket not ready or user not set");
    return;
  }

  const msg = m.messages[0];
  console.log("Processing message:", msg);

  const phoneNumber = sock.user.id.split(':')[0];
  console.log("Bot phone number:", phoneNumber);

  if (!msg.message) {
    console.log("No message content found");
    return;
  }

  try {
    await container.processIncomingMessage.execute(msg, phoneNumber);
    console.log("Message processed successfully");
  } catch (err) {
    console.error(`[${phoneNumber}] Failed to process message:`, err);
  }
});

  sock.ev.on("creds.update", saveCreds);
  return sock
}

