import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  Browsers,
} from "@whiskeysockets/baileys";

import qrcode from "qrcode-terminal";
import { Boom } from "@hapi/boom";
import fs from "fs-extra"; // npm install fs-extra

export async function startEventWhatssap() {
  const { state, saveCreds } = await useMultiFileAuthState("auth");

  const sock = makeWASocket({
    auth: state,
    browser: Browsers.ubuntu("Chrome"),
    printQRInTerminal: false,
    defaultQueryTimeoutMs: 0,
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (connection === "close") {
      const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;

      console.log("Connection closed, reason:", statusCode);

      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      if (statusCode === DisconnectReason.loggedOut) {
        console.log("Session logged out. Clearing saved auth...");

        await fs.remove("auth");

        startEventWhatssap();
      }

      if (shouldReconnect) {
        startEventWhatssap();
      }
    } else if (connection === "open") {
      console.log("✅ WhatsApp connection opened");
    }

    if (qr) {
      qrcode.generate(qr, { small: true });
    }
  });

  sock.ev.on("messages.upsert", (m) => {
    if (m.messages && m.messages.length > 0) {
      const msg = m.messages[0];
      console.log("Message Received: ", msg.message);
    }
  });
}
