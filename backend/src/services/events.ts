import { fork, type ChildProcess } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import type { EventQueue } from "../types.ts";

export interface EventWorkerStatus {
  processing: boolean;
  pendingEvents: number;
  processedEventCount: number;
  lastStartedAt: string | null;
  lastCompletedAt: string | null;
  lastError: string | null;
}

let workerProcess: ChildProcess | null = null;
let currentStatus: EventWorkerStatus = {
  processing: false,
  pendingEvents: 0,
  processedEventCount: 0,
  lastStartedAt: null,
  lastCompletedAt: null,
  lastError: null,
};

export function getEventWorkerStatus(): EventWorkerStatus {
  return currentStatus;
}

export function startEventWorker(): void {
  if (workerProcess) return;

  const workerPath = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "event-worker.ts",
  );

  const execArgv = process.execArgv.includes("--experimental-strip-types")
    ? process.execArgv
    : [...process.execArgv, "--experimental-strip-types"];

  const child = fork(workerPath, {
    execArgv,
    stdio: ["inherit", "inherit", "inherit", "ipc"],
  });

  child.on("message", (message: { type?: string; status?: EventWorkerStatus }) => {
    if (message.type === "status" && message.status) {
      currentStatus = message.status;
    }
  });

  child.on("error", (error) => {
    console.error("[event-worker] child process error:", error);
  });

  child.on("exit", (code, signal) => {
    console.warn(`[event-worker] child process exited (code=${code}, signal=${signal})`);
    workerProcess = null;
  });

  workerProcess = child;
  console.log(`[event-worker] started child process pid=${child.pid}`);
}

export function sendEvent(event: EventQueue): void {
  if (workerProcess && workerProcess.connected) {
    workerProcess.send({ type: "event", event });
  } else {
    console.warn("[event-worker] worker not connected, dropped event:", event.content_type, event.action, event.content_id);
  }
}
