declare module "express-session" {
  interface SessionData {
    id?: string;
  }

  interface Session extends SessionData {
    destroy(callback: (error?: unknown) => void): void;
  }

  interface SessionOptions {
    secret: string;
    resave: boolean;
    saveUninitialized: boolean;
    cookie?: { httpOnly?: boolean };
  }

  const session: (options: SessionOptions) => import("express").RequestHandler;
  export default session;
}
