import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",").map(o => o.trim()) || [
  "http://localhost:5173",
  "http://localhost:3000",
  // Also accept loopback IP variants in case the browser resolves localhost to 127.0.0.1 or ::1
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000",
  "http://[::1]:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
        // Log incoming origin for debugging
        console.log(`CORS: incoming origin -> ${origin}`);

        // Allow requests with no origin (mobile apps, Postman, or same-origin requests from curl)
        if (!origin) return callback(null, true);

        // Check exact match first
        if (allowedOrigins.includes(origin)) {
          console.log(`CORS: allowing origin -> ${origin}`);
          return callback(null, true);
        }

        // Allow any Vercel preview/production domain
        if (origin.endsWith(".vercel.app")) {
          console.log(`CORS: allowing vercel origin -> ${origin}`);
          return callback(null, true);
        }

        console.warn(`CORS: rejecting origin -> ${origin}`);
        callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error("Internal Server Error:", err);

    if (res.headersSent) {
      return next(err);
    }

    return res.status(status).json({ message });
  });

  // Health check endpoint
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Debug endpoint to inspect incoming origin and headers (useful for CORS troubleshooting)
  app.get("/api/debug/origin", (req, res) => {
    const origin = req.header("origin") || null;
    return res.json({ origin, headers: req.headers });
  });

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  const port = parseInt(process.env.PORT || "5000", 10);
  // Prefer listening on IPv6 '::' which accepts both IPv6 and IPv4 connections on many systems.
  // Fall back to 0.0.0.0 if binding to '::' fails for any reason.
  const tryListen = (host: string) =>
    new Promise<void>((resolve, reject) => {
      httpServer.once("error", reject);
      httpServer.listen({ port, host, reusePort: true }, () => {
        httpServer.removeAllListeners("error");
        resolve();
      });
    });

  try {
    await tryListen("::");
    log(`🚀 Server running on port ${port} (listening on ::)`);
    log(`Environment: ${process.env.NODE_ENV || "development"}`);
  } catch (err) {
    log("Failed to bind to IPv6 ::, falling back to 0.0.0.0", "express");
    await tryListen("0.0.0.0");
    log(`🚀 Server running on port ${port} (listening on 0.0.0.0)`);
    log(`Environment: ${process.env.NODE_ENV || "development"}`);
  }
})();
