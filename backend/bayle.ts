import makeWASocket, {
  Browsers,
  useMultiFileAuthState,
  DisconnectReason,
  WAMessage,
  fetchLatestWaWebVersion,
} from "baileys";
import { Boom } from "@hapi/boom";
import QRCode from "qrcode";

import qrcode from "qrcode-terminal";

//@ts-ignore

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
    if (
      connection === "close" &&
      (lastDisconnect?.error as Boom)?.output?.statusCode ===
        DisconnectReason.restartRequired
    ) {
      console.log("Restart required, restarting...");
      startEventWhatssap();
    }

    if (qr) {
      qrcode.generate(qr, { small: true });
    }
  });
}
