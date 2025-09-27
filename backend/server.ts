import "dotenv/config";

import makeWASocket, {
  Browsers,
  useMultiFileAuthState,
  DisconnectReason,
  WAMessage,
  fetchLatestWaWebVersion,
} from "baileys";

import QRCode from "qrcode";

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import userRouter from "./router/user/index.js";
import whatRouter from "./router/whatssap/index.js";
console.log(process.env.JWT_SECRET_KEY, process.env.USER_DATABASE_DEV);

const app = express();

const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? process.env.CLIENT_URL
      : "http://localhost:5000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
// @ts-ignore

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
  if (qr) {
    console.log(await QRCode.toString(qr, { type: "terminal" }));
  }
});

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", userRouter);
app.use("/", whatRouter);

app.listen(5000, () => {
  console.log("✅ Listening on port 5000");
});
