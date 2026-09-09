import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  Browsers,
} from "@whiskeysockets/baileys";
import QRCodeTerminal from "qrcode-terminal";
import QRCode from "qrcode";
import { Boom } from "@hapi/boom";
import fs from "fs-extra";
import path from "path";
import { ProcessWhatsAppMessageUseCase } from "../../../application/use-cases/whatsapp/ProcessWhatsAppMessageUseCase.js";
import { IWhatsAppService } from "../../../domain/repositories/IWhatsAppService.js";

export interface TenantWhatsAppStatus {
  status: "disconnected" | "connecting" | "qr_ready" | "connected";
  qrCode?: string;
  qrImage?: string;
  updatedAt: string;
}

export class WhatsAppSessionManager {
  private sessions: Map<string, any> = new Map();
  private sessionStates: Map<string, TenantWhatsAppStatus> = new Map();
  private authBaseDir = "auth";

  constructor(
    private processMessageUseCase: ProcessWhatsAppMessageUseCase,
    private whatsAppService: IWhatsAppService
  ) {}

  getSessionStatus(tenantId: string): TenantWhatsAppStatus {
    return (
      this.sessionStates.get(tenantId) || {
        status: "disconnected",
        updatedAt: new Date().toISOString(),
      }
    );
  }

  async startSession(tenantId: string = "default_tenant"): Promise<any> {
    const sessionAuthDir = path.join(this.authBaseDir, `tenant_${tenantId}`);
    await fs.ensureDir(sessionAuthDir);

    this.sessionStates.set(tenantId, {
      status: "connecting",
      updatedAt: new Date().toISOString(),
    });

    const { state, saveCreds } = await useMultiFileAuthState(sessionAuthDir);

    const sock = makeWASocket({
      auth: state,
      browser: Browsers.ubuntu("Chrome"),
      printQRInTerminal: false,
    });

    this.sessions.set(tenantId, sock);
    this.whatsAppService.setSocket(sock, tenantId);

    sock.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        console.log(`📱 QR Code gerado para o Tenant: ${tenantId}`);
        QRCodeTerminal.generate(qr, { small: true });
        try {
          const qrImage = await QRCode.toDataURL(qr);
          this.sessionStates.set(tenantId, {
            status: "qr_ready",
            qrCode: qr,
            qrImage,
            updatedAt: new Date().toISOString(),
          });
        } catch {
          this.sessionStates.set(tenantId, {
            status: "qr_ready",
            qrCode: qr,
            updatedAt: new Date().toISOString(),
          });
        }
      }

      if (connection === "close") {
        const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
        console.log(`[WhatsApp - Tenant ${tenantId}] Conexão fechada, código:`, statusCode);

        this.sessionStates.set(tenantId, {
          status: "disconnected",
          updatedAt: new Date().toISOString(),
        });

        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

        if (statusCode === DisconnectReason.loggedOut) {
          console.log(`[WhatsApp - Tenant ${tenantId}] Sessão encerrada. Limpando credenciais.`);
          await fs.remove(sessionAuthDir);
          this.sessions.delete(tenantId);
          this.startSession(tenantId);
        } else if (shouldReconnect) {
          this.startSession(tenantId);
        }
      } else if (connection === "open") {
        console.log(`✅ [WhatsApp - Tenant ${tenantId}] Conexão estabelecida com sucesso`);
        this.sessionStates.set(tenantId, {
          status: "connected",
          updatedAt: new Date().toISOString(),
        });
      }
    });

    sock.ev.on("messages.upsert", async (m) => {
      if (!m.messages || m.messages.length === 0) return;
      const msg = m.messages[0];
      try {
        if (!msg.message) return;
        await this.processMessageUseCase.execute(msg, {
          tenantId,
          senderName: msg.pushName || undefined,
        });
      } catch (err: any) {
        console.error(`[WhatsApp - Tenant ${tenantId}] Erro ao processar mensagem:`, err.message);
      }
    });

    sock.ev.on("creds.update", saveCreds);

    console.log(`✅ [WhatsApp - Tenant ${tenantId}] Sessão inicializada.`);
    return sock;
  }

  getSession(tenantId: string) {
    return this.sessions.get(tenantId);
  }

  async closeSession(tenantId: string): Promise<void> {
    const sock = this.sessions.get(tenantId);
    if (sock) {
      try {
        sock.end(undefined);
      } catch {}
      this.sessions.delete(tenantId);
    }
    this.sessionStates.set(tenantId, {
      status: "disconnected",
      updatedAt: new Date().toISOString(),
    });
  }
}
