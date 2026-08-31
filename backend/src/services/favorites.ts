import { fork, type ChildProcess } from "node:child_process";
import { fileURLToPath } from "node:url";
import process from "node:process";

export type FavoriteTarget = "post" | "comment";
export type FavoriteEvent = { target: FavoriteTarget; targetId: string; userId: string; favorited: boolean };
export interface AggregationStatus { processing: boolean; pendingEvents: number; currentBatchSize: number; currentBatchProgress: number; processedEventCount: number; lastStartedAt: string | null; lastCompletedAt: string | null; lastError: string | null; }
type WorkerMessage = { type: "status"; status: AggregationStatus };

let worker: ChildProcess | undefined;
let status: AggregationStatus = { processing: false, pendingEvents: 0, currentBatchSize: 0, currentBatchProgress: 0, processedEventCount: 0, lastStartedAt: null, lastCompletedAt: null, lastError: null };

export function getAggregationStatus(): AggregationStatus { return { ...status }; }

export function startAggregationWorker(): void {
  if (worker && !worker.killed) return;
  const workerPath = fileURLToPath(new URL("./favorites-worker.ts", import.meta.url));
  worker = fork(workerPath, [], { execArgv: process.execArgv, stdio: ["ignore", "inherit", "inherit", "ipc"] });
  worker.on("message", (message: WorkerMessage) => { if (message?.type === "status") status = message.status; });
  worker.on("exit", (code, signal) => { console.log(`[aggregation] worker exited code=${code ?? "none"} signal=${signal ?? "none"}`); worker = undefined; });
  if (worker.pid !== undefined) {
    try { (process as typeof process & { setPriority: (pid: number, priority: number) => void }).setPriority(worker.pid, 10); } catch (error) { console.log("[aggregation] unable to lower worker priority", error); }
  }
  console.log(`[aggregation] background child process started pid=${worker.pid ?? "unknown"}`);
}

export function queueFavoriteEvent(event: FavoriteEvent): void {
  if (!worker || worker.killed) startAggregationWorker();
  worker?.send({ type: "favorite", event });
}

export function flushFavoriteEvents(): Promise<void> {
  if (!worker || worker.killed) startAggregationWorker();
  return new Promise((resolve) => { worker?.send({ type: "flush" }, () => resolve()); });
}
