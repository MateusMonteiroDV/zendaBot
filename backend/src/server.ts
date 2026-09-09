import "dotenv/config";
import { app } from "./app.js";
import { runDatabaseMigrations } from "./infrastructure/database/migrations.js";
import { appContainer } from "./container.js";

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  console.log("🚀 Initializing zendaBot server in Clean Architecture standard...");

  // Run Postgres migrations
  await runDatabaseMigrations();

  // Conditionally start default WhatsApp session
  if (process.env.AUTO_START_WHATSAPP === "true") {
    appContainer.whatsAppSessionManager
      .startSession("default_tenant")
      .catch((err) => console.warn("⚠️  WhatsApp start warning:", err.message));
  }

  app.listen(PORT, () => {
    console.log(`✅ [Server] Running at http://localhost:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error("❌ Fatal startup error:", err);
  process.exit(1);
});
