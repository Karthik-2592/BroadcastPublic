import type { NextFunction, Request, Response } from "express";

export const ok = (
  res: Response,
  data: unknown,
  message = "Operation completed successfully.",
  status = 200,
) => res.status(status).json({ success: true, message, data });
export const logFailure = (
  req: Request,
  status: number,
  message: string,
) => {
  console.log(`[http] ${req.method} ${req.originalUrl}: ${status} ${message}`);
};
export const fail = (res: Response, status: number, message: string) => {
  logFailure(res.req, status, message);
  return res.status(status).json({ success: false, message });
};
export const id = (req: Request, name = "id") => String(req.params[name] ?? "");
export const required = (
  body: Record<string, unknown> = {},
  fields: string[],
) =>
  fields.filter(
    (field) =>
      body[field] === undefined || body[field] === null || body[field] === "",
  );
export const asyncHandler = (
  handler: (req: Request, res: Response, next: NextFunction) => unknown,
) => handler;
