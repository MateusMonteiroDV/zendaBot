import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { appContainer } from "./container.js";
import { errorHandler } from "./presentation/http/middlewares/ErrorHandler.js";

export function createApp() {
  const app = express();

  const corsOptions = {
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.CLIENT_URL
        : "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  };

  app.use(cors(corsOptions));
  app.options("*", cors(corsOptions));

  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Mount API router
  app.use("/api", appContainer.apiRouter);

  // Global Error Handler
  app.use(errorHandler);

  return app;
}

export const app = createApp();
